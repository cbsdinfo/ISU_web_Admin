<template>
  <div class="flex-column product">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸商品、店家名稱'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <el-select size="mini" v-model="listQuery.State" placeholder="請選擇產品類別" @change="getList()">
          <el-option v-for="item in selectListState" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item tableWrap">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <!-- <el-table-column type="selection" width="55" align="center"> </el-table-column> -->
          <el-table-column min-width="100px" label="產品類別" prop="categoryName" align="center"></el-table-column>
          <el-table-column min-width="120px" label="商家名稱" prop="storeName" align="center"></el-table-column>
          <el-table-column width="120px" label="產品縮圖" prop="picture" align="center">
            <template slot-scope="scope">
              <div class="imgWrap"><img :src="`${imgUrl}${scope.row.picture}`" alt="" /></div>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" label="供應商代碼" prop="vendorCode" align="center"></el-table-column>
          <el-table-column min-width="120px" label="產品名稱" prop="productName" align="center"></el-table-column>
          <el-table-column min-width="120px" label="前台產品連結" prop="url" align="center"></el-table-column>
          <el-table-column width="120px" label="是否為精選產品" align="center"
            ><template slot-scope="scope"
              ><span>{{ scope.row.featured === 1 ? "是" : "否" }}</span></template
            ></el-table-column
          >
          <el-table-column width="90px" label="產品狀態" prop="state" align="center">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{statusText(scope.row.state)}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="100px" label="價格" prop="price" align="center"></el-table-column>
          <el-table-column width="150px" align="center" label="商品申請上架日期" prop="releaseDate">
            <template slot-scope="scope">
              <span>{{ $dayjs(scope.row.createDate).format("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <el-table-column width="150px" align="center" label="最後更新時間" prop="releaseDate">
            <template slot-scope="scope">
              <span>{{ $dayjs(scope.row.modifyDate).format("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column min-width="80px" label="產品類別ID" prop="categoryId" align="center"></el-table-column>
          <el-table-column min-width="50px" label="商城產品ID" prop="productId" align="center"></el-table-column> -->
          <el-table-column width="80px" label="排序" prop="sort" align="center"></el-table-column>
          <el-table-column width="200px" :label="'操作'" align="center">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handlePreview(scope.row)" type="primary" v-if="hasButton('preview')">查看</el-button>
                <el-button size="mini" @click="handleUpdate(scope.row)" type="primary" v-if="hasButton('btnEdit')">編輯</el-button>
                <!-- <el-button size="mini" @click="updateState(scope.row,'agree')" type="primary" v-if="hasButton('agree')">上架</el-button>
                <el-button size="mini" @click="updateState(scope.row,'reject')" type="danger" v-if="hasButton('reject')">未通過</el-button> -->
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <el-dialog class="dialog-mini preview-dialog" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <!-- 新增,編輯 -->
          <template v-if="dialogStatus==='add' || dialogStatus==='update'">   
            <!-- 商品類別 -->
            <el-form-item label="產品類別" prop="categoryId">
              <el-select class="itemWidth" v-model.trim="temp.categoryId" placeholder="請選擇產品類別" @blur="validateBlurSelect('categoryId')">
                <el-option v-for="item in selectListCategories" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
            <!-- 商家名稱 -->
            <el-col :span="24">
              <el-form-item label="商家名稱" prop="storeName">
                <el-input class="itemWidth" type="text" v-model.trim="temp.storeName" placeholder="請輸入商家名稱"></el-input>
              </el-form-item>
            </el-col>
            <!-- 產品名稱 -->
            <el-col :span="24">
              <el-form-item label="產品名稱" prop="productName">
                <el-input type="text" v-model.trim="temp.productName" placeholder="請輸入產品名稱"></el-input>
              </el-form-item>
            </el-col>
            <!-- 產品ID -->
            <el-col :span="24">
              <el-form-item label="產品ID" prop="productId">
                <el-input type="text" v-model.trim="temp.productId" placeholder="請輸入產品ID"></el-input>
              </el-form-item>
            </el-col>
            <!-- 圖片上傳 -->
            <el-col :span="24">
              <el-form-item label="產品圖片" prop="picture">
                <el-input v-show="false" type="text" v-model.trim="temp.picture"></el-input>
                <el-upload ref="upload" action="#" list-type="picture-card" :limit="2" :file-list="fileList" :on-success="fileSuccess" :http-request="uploadFile">
                  <i slot="default" class="el-icon-plus"></i>
                  <div slot="file" slot-scope="{ file }">
                    <img class="el-upload-list__item-thumbnail" :src="`${imgUrl}${file.path}`" alt="" />
                  </div>
                </el-upload>
              </el-form-item>
            </el-col>
            <!-- 價格 -->
            <el-col :span="24">
              <el-form-item label="價格" prop="price">
                <el-input v-model.number="temp.price" placeholder="請輸入價格" size="small"></el-input>
              </el-form-item>
            </el-col>
            <!-- 產品連結 -->
            <el-col :span="24">
              <el-form-item label="產品前台連結" prop="url">
                <el-input type="text" v-model.trim="temp.url" placeholder="請輸入產品連結"></el-input>
              </el-form-item>
            </el-col>
            <!-- 是否為精選產品 -->
            <el-col :span="24">
              <el-form-item label="是否為精選商品" prop="featured">
                <el-select class="itemWidth" v-model="temp.featured" placeholder="請選擇是否為精選商品" @blur="validateBlurSelect('featured')">
                  <el-option :value="true" label="是"></el-option>
                  <el-option :value="false" label="否"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <!-- 供應商代碼 -->
            <el-col :span="24">
              <el-form-item label="供應商代碼" prop="vendorCode">
                <el-input type="text" v-model.trim="temp.vendorCode" placeholder="請輸入供應商代碼"></el-input>
              </el-form-item>
            </el-col>
            <!-- 排序 -->
            <el-col :span="24">
              <el-form-item label="排序" prop="sort">
                <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small"></el-input-number>
              </el-form-item>
            </el-col>
            <!-- 產品狀態 -->
            <el-col :span="24">
              <el-form-item label="產品狀態" prop="state">
                <el-input-number class="itemProduct" v-model.number="temp.state"  :max="4" :min="1" size="small"></el-input-number>
                <span>{{statusText(temp.state)}}</span>
              </el-form-item>
            </el-col>
          </template>
           <!-- 檢視 -->
          <template v-if="dialogStatus==='preview'">
            <section>
              <div class="previewItem">
                <p class="title">商品類別</p>
                <p class="item">{{temp.categoryName}}</p>
              </div>
              <div class="previewItem">
                <p class="title">商家名稱</p>
                <p class="item">{{temp.storeName}}</p>
              </div>
               <div class="previewItem">
                <p class="title">產品縮圖</p>
                <div class="item">
                  <div class="imgWrap">
                    <img :src="`${imgUrl}${temp.picture}`">
                  </div>
                  <!-- {{temp.storeName}} -->
                </div>
              </div>
               <div class="previewItem">
                <p class="title">供應商代碼</p>
                <p class="item">{{temp.vendorCode}}</p>
              </div>
               <div class="previewItem">
                <p class="title">產品名稱</p>
                <p class="item">{{temp.productName}}</p>
              </div>
               <div class="previewItem">
                <p class="title">前台商品連結</p>
                <p class="item">{{temp.url}}</p>
              </div>
               <div class="previewItem">
                <p class="title">是否為精選商品</p>
                <p class="item">{{temp.featured?'是':'否'}}</p>
              </div>
               <div class="previewItem">
                <p class="title">狀態</p>
                <p class="item" :class="stateTextColor(temp.state)">{{statusText(temp.state)}}</p>
              </div>
              <div class="previewItem">
                <p class="title">商品申請上架日期</p>
                <p class="item">{{temp.createDate}}</p>
              </div>
              <div class="previewItem">
                <p class="title">價格</p>
                <p class="item">{{temp.price}}</p>
              </div>
              <div class="previewItem">
                <p class="title">排序</p>
                <p class="item">{{temp.sort}}</p>
              </div>
            </section>
          </template>
        </el-row>
      </el-form>
      <div slot="footer">
        <template v-if="dialogStatus==='add' || dialogStatus==='update'">
          <el-button size="mini" @click="closeDialog">取消</el-button>
          <el-button size="mini" type="primary" @click="submit">確認</el-button>
        </template>
        <template v-if="dialogStatus==='preview'">
          <el-button size="mini" @click="closeDialog">取消</el-button>
          <el-button size="mini" @click="updateState('agree')" type="primary" v-if="hasButton('agree')">上架</el-button>
          <el-button size="mini" @click="updateState('reject')" type="danger" v-if="hasButton('reject')">未通過</el-button>
        </template> 
      </div>
    </el-dialog>


  </div>
</template>
<script>
import pbMixins from "@/mixins/permissionBtn.js";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";

const formTemplate = {
  id: "",
  categoryId: "",//商品類別ID(資料帶入)
  categoryName: "",//商品類別名稱(資料帶入)
  storeName: "",//商家名稱(資料帶入)
  vendorCode: "",//供應商代碼(資料帶入)
  productId: "",//產品ID(資料帶入)
  productName: "",//產品名稱(資料帶入)
  price: 0,//產品價格(資料帶入)
  picture: "",//產品圖片路徑(資料帶入)
  url: "",//前台產品連結(資料帶入)
  featured:undefined,//是否為精選商品(資料帶入)
  sort:"0",
  state: 1,//狀態( 1 = 未審核/ 2 =上架/ 3 =未通過)(資料帶入預設是未審核)
};

export default {
  name: "product",
  components: { Sticky, permissionBtn, Pagination },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      selectListState:[
        {label:'全部',value:0},
        {label:'未審核',value:1},
        {label:'上架',value:2},
        {label:'未通過',value:3},
        {label:'補貨中',value:4},
      ],
      selectListCategories:[],
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      fileList: [],
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
        State:0//0 = 全部 1 = 未審核 2 = 上架 3 = 未通過 4 = 補貨中
      },
      temp: JSON.parse(JSON.stringify(formTemplate)),
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        add: "新增",
        preview:"查看"
      },
      rules: {
        categoryId: [{ required: true, message: "必填欄位", trigger: "change" }],
        // categoryName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        storeName: [{ required: true, message: "必填欄位", trigger: ["blur","change"] }],
        picture: [{ required: true, message: "圖片必填欄位" }],
        price: [
          { required: true, message: "必填欄位", trigger: ["blur","change"] },
          { type:'number',message:"價格必須是數字"}
        ],
        url: [{ required: true, message: "必填欄位", trigger:  ["blur","change"] }],
        featured: [{ required: true, message: "必填欄位", trigger: "change" }],
        productId: [{ required: true, message: "必填欄位", trigger:["blur","change"] }],
        productName: [{ required: true, message: "必填欄位", trigger: ["blur","change"] }],
        vendorCode: [{ required: true, message: "必填欄位", trigger:  ["blur","change"]  }],
        state: [{ required: true, message: "必填欄位", trigger:  ["blur","change"]  }],
      },
    };
  },
  mounted() {
    this.getList();
    this.selectData('')
  },
  computed:{
    statusText(){
      return (state)=>{
        let statusText ="";
        switch(state){
          case 1:
            statusText="未審核"
            break
          case 2:
            statusText="上架"
            break
          case 3:
            statusText="未通過"
            break
          case 4:
            statusText="補貨中"
            break
        }
        return statusText
      }
    },
    stateTextColor(){
      return (state)=>{
        return {
          agree: state===2,
          reject: state===1 || state===4 ||state===3
        }
      }
    }
  },
  methods: {
    updateState(actionType){     
      if(actionType==='agree'){
        this.temp.state = 2
      }
      if(actionType==='reject'){
        this.temp.state = 3
      }
      this.$api.products.update(this.temp).then(() => {
        this.$swal.fire({
          title: "操作成功",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        this.closeDialog()
        this.getList()
      });
    },
    validateBlurSelect(type) {
      this.$refs.ruleForm.validateField(type);
    },
    fileSuccess(res, file, fileList) {
      const { filePath } = res[0];
      fileList.forEach((item, index) => {
        if (file.uid !== item.uid) {
          fileList.splice(index, 1);
        }
      });
      fileList.forEach((item, index) => {
        if (file.uid === item.uid) {
          fileList[index].path = filePath;
        }
      });
    },
    uploadFile(item) {
      let imgFile = item.file;
      if (imgFile) {
        const formData = new FormData();
        formData.append("files", imgFile);
        this.$api.files.Upload(formData).then((res) => {
          const { code, result } = res;
          if (code === 200) {
            this.temp.picture = result[0].filePath;
            item.onSuccess(result);
          }
        });
      }
    },
    onBtnClicked: function (domId) {
      switch (domId) {
        case "btnAdd":
          this.handleCreate();
          break;
        case "btnEdit":
          if (this.multipleSelection.length !== 1) {
            this.$swal.fire({
              title: "只能選中一個進行編輯",
              icon: "error",
              timer: 2000,
              showConfirmButton: false,
            });
            return;
          }
          this.handleUpdate(this.multipleSelection[0]);
          break;
        case "btnDel":
          if (this.multipleSelection.length < 1) {
            this.$swal.fire({
              title: "至少刪除一個",
              icon: "error",
              timer: 2000,
              showConfirmButton: false,
            });
            return;
          }
          this.handleDelete(this.multipleSelection);
          break;
        default:
          break;
      }
    },
    getList() {
      this.listLoading = true;
      this.$api.products.getList(this.listQuery).then((response) => {
        const { data, count } = response;
        this.list = data;
        this.total = count;
        this.listLoading = false;
      });
    },
    // 取得下拉選單
    selectData() {
      let temp = {
        page: 1,
        limit: 999,
        TypeId: "SYS_NEWS",
      };
      this.$api.productCategorys.getList(temp).then((res) => {
        const { code, data } = res;
        if (code === 200) {
          this.selectListCategories = data.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        }
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    resetTemp() {
      this.$refs["ruleForm"].resetFields();
      this.temp = JSON.parse(JSON.stringify(formTemplate));
      this.fileList = [];
    },
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
     
    },
    handlePreview(row) {
      this.$api.products.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          this.fileList.push({
            path: this.temp.picture,
          });
        }
      });
      this.dialogStatus = "preview";
      this.dialogFormVisible = true;
    },
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    // 保存提交
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          let apiName = "";
          switch (this.dialogStatus) {
            case "add":
              apiName = "add";
              break;
            case "update":
              apiName = "update";
              break;
          }
          this.temp.categoryName = this.selectListCategories.filter((item) => item.value === this.temp.categoryId)[0]?.label;
          this.$api.products[apiName](this.temp).then(() => {
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            this.closeDialog()
            this.getList()
          });
        }
      });
    },
    handleUpdate(row) {
      this.$api.products.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          this.fileList.push({
            path: this.temp.picture,
          });
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    handleDelete(rows) {
      // 多行刪除
      this.delrows("products", rows,this.getList);
    },
  },
};
</script>
<style lang="scss" scoped>
.product{
  .itemProduct{
    margin-right: 5px;
  }
  .agree{
    color:green;
  }
  .reject{
    color:red;
  }
  .tableWrap{
  }
  .preview-dialog{
    .previewItem{
      display: flex;
      border: 1px solid #EBEEF5;
      .title{
        font-weight: 500;
        color: #606266;
        display: flex;
        align-items: center;
        width: 150px;
        padding: 8px 0px 8px 16px;
        border-right: 1px solid #EBEEF5;
      }
      .item{
        font-weight: 500;
        padding: 8px 0px 8px 16px;
        .imgWrap{
          width: 120px;
          height: 120px;
          img{
            width: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }

}
</style>
