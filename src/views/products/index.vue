<template>
  <div class="flex-column product">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入商品、店家名稱'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <el-select size="mini" v-model="listQuery.State" placeholder="請選擇商品類別" @change="getList()">
          <el-option v-for="item in selectListState" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    
    <div class="app-container flex-item tableWrap">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column width="120px" label="商品縮圖" prop="picture" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.picture" class="imgWrap"><img :src="formatImgData(scope.row.picture)" alt="" /></div>
              <span v-else>無</span>
            </template>
          </el-table-column>
          <el-table-column min-width="100px" label="商品類別" prop="categoryName" align="center"></el-table-column>
          <el-table-column min-width="120px" label="商品名稱" prop="productName" align="center"></el-table-column>
          <el-table-column min-width="120px" label="商家名稱" prop="storeName" align="center"></el-table-column>
          <el-table-column min-width="120px" label="供應商代碼" prop="vendorCode" align="center"></el-table-column>
          <el-table-column min-width="120px" label="前台商品連結" prop="url" align="center"></el-table-column>
          <el-table-column width="120px" label="是否為精選商品" align="center">
            <template slot-scope="scope">
              <span :class="featuredTextColor(scope.row.featured)">{{ scope.row.featured? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column width="90px" label="商品狀態" prop="state" align="center">
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
              <span>{{ !!scope.row.modifyDate?$dayjs(scope.row.modifyDate).format("YYYY-MM-DD"):"-"}}</span>
            </template>
          </el-table-column>
          <el-table-column width="80px" label="排序" prop="sort" align="center"></el-table-column>
          <el-table-column width="200px" :label="'操作'" align="center">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handlePreview(scope.row)" type="primary" v-if="hasButton('preview')">查看</el-button>
                <el-button size="mini" @click="handleUpdate(scope.row)" type="primary" v-if="hasButton('btnEdit')">編輯</el-button>
                <!-- <el-button size="mini" @click="handleDelete([scope.row])" type="danger" v-if="hasButton('btnDel')">刪除</el-button> -->
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>
     <!-- <upload-image/> -->
    <el-dialog class="dialog-mini preview-dialog" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <!-- 新增,編輯 -->
          <template v-if="dialogStatus==='add' || dialogStatus==='update'">   
            <!-- 商品類別 -->
            <el-form-item label="商品類別" prop="categoryId">
              <el-select class="itemWidth" v-model.trim="temp.categoryId" placeholder="請選擇商品類別" @blur="validateBlurSelect('categoryId')">
                <el-option v-for="item in selectListCategories" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
            <!-- 商家名稱 -->
            <el-col :span="24">
              <el-form-item label="商家名稱" prop="storeName">
                <el-input class="itemWidth" type="text" v-model.trim="temp.storeName" placeholder="請輸入商家名稱"></el-input>
              </el-form-item>
            </el-col>
            <!-- 商品名稱 -->
            <el-col :span="24">
              <el-form-item label="商品名稱" prop="productName">
                <el-input type="text" v-model.trim="temp.productName" placeholder="請輸入商品名稱"></el-input>
              </el-form-item>
            </el-col>
            <!-- 商品ID -->
            <el-col :span="24">
              <el-form-item label="商品ID" prop="productId">
                <el-input type="text" v-model.trim="temp.productId" placeholder="請輸入商品ID"></el-input>
              </el-form-item>
            </el-col>
            <!-- 圖片上傳 -->
            <el-col :span="24">
              <el-form-item label="商品圖片" prop="picture">
                <upload-image @successUploadImg="successUploadImg" @deleteImg="deleteImg" :imagesPropAry="imagesPropAry"/>
                <el-input v-show="false" type="text" v-model.trim="temp.picture"></el-input>
              </el-form-item>
            </el-col>
            <!-- 價格 -->
            <el-col :span="24">
              <el-form-item label="價格" prop="price">
                <el-input v-model.number="temp.price" placeholder="請輸入價格" size="small"></el-input>
              </el-form-item>
            </el-col>
            <!-- 商品連結 -->
            <el-col :span="24">
              <el-form-item label="商品前台連結" prop="url">
                <el-input type="text" v-model.trim="temp.url" placeholder="請輸入商品連結"></el-input>
              </el-form-item>
            </el-col>
            <!-- 編輯器 -->
            <el-col :span="24">
              <el-form-item label="內容">
                <VueEditor v-model="temp.contents"></VueEditor>
              </el-form-item>
            </el-col>
            <!-- 是否為精選商品 -->
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
                <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small" :min="0"></el-input-number>
              </el-form-item>
            </el-col>
            <!-- 商品狀態 -->
            <el-col :span="24">
              <el-form-item label="商品狀態" prop="state">
                <el-radio v-model.number="temp.state" :label="1">未審核</el-radio>
                <el-radio v-model.number="temp.state" :label="2">上架</el-radio>
                <el-radio v-model.number="temp.state" :label="3">未通過</el-radio>
                <el-radio v-model.number="temp.state" :label="4">補貨中</el-radio>
                <!-- <el-input-number class="itemProduct" v-model.number="temp.state"  :max="4" :min="1" size="small"></el-input-number>
                <span>{{statusText(temp.state)}}</span> -->
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
                <p class="title">商品縮圖</p>
                <div class="item imgContent">
                  <div class="imgWrap" v-for="(item,index) in imagePathAry" :key="index">
                    <img :src="`${imgUrl}${item.path}`">
                  </div>
                  <!-- {{temp.storeName}} -->
                </div>
              </div>
               <div class="previewItem">
                <p class="title">供應商代碼</p>
                <p class="item">{{temp.vendorCode}}</p>
              </div>
               <div class="previewItem">
                <p class="title">商品名稱</p>
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
import { VueEditor } from "vue2-editor/dist/vue2-editor.core.js"; //編輯器
import pbMixins from "@/mixins/permissionBtn.js";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";
import uploadImage from "@/components/UploadImage";

const formTemplate = {
  id: "",
  categoryId: "",//商品類別ID(資料帶入)
  categoryName: "",//商品類別名稱(資料帶入)
  storeName: "",//商家名稱(資料帶入)
  vendorCode: "",//供應商代碼(資料帶入)
  productId: "",//商品ID(資料帶入)
  productName: "",//商品名稱(資料帶入)
  price:undefined ,//商品價格(資料帶入)
  picture: "",//商品圖片路徑(資料帶入)
  url: "",//前台商品連結(資料帶入)
  featured:undefined,//是否為精選商品(資料帶入)
  sort:"0",
  state: 1,//狀態( 1 = 未審核/ 2 =上架/ 3 =未通過)(資料帶入預設是未審核)
};

export default {
  name: "product",
  components: { Sticky, permissionBtn, Pagination,uploadImage,VueEditor },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    // const imageValidate = (rule, value, callback) => {
    //   if (this.imagePathAry.length > 0) {
    //     return callback();
    //   }
    //   return callback(new Error("圖片為必填"));
    // };
    return {
      imagePathAry:[],
      imagesPropAry:[],
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
        storeName: [{ required: true, message: "必填欄位", trigger: ["blur","change"] }],
        picture: [{ required: true, message: "必填欄位", trigger: ["blur", "change"]  }],
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
    this.selectData()
  },
  computed:{
    formatImgData(){
      return (imgJsonString)=>{
        let firstImgPath =JSON.parse(imgJsonString)[0].path
        return this.imgUrl+firstImgPath
      }
    },
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
    },
    featuredTextColor(){
      return (state)=>{
        return {
          greenText: state,
          redText: !state
        }
      }
    }
  },
  methods: {
    deleteImg(imgPath){
      this.imagePathAry = this.imagePathAry.filter(item=>item.path !== imgPath)
      if(this.imagePathAry.length>0){
        this.temp.picture = JSON.stringify(this.imagePathAry)
      }else{
        this.temp.picture = ""
      }
    },
    successUploadImg(successUploadResult){
      successUploadResult.forEach(item => {   
        this.imagePathAry.push({
          path:item.filePath,
          id:item.id
        })
      });
      this.temp.picture = JSON.stringify(this.imagePathAry)
    },
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
          this.selectListCategories = data.filter(item=>item.state)
          this.selectListCategories = this.selectListCategories.map((item) => ({
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
      this.imagesPropAry = [];
      this.imagePathAry = [];
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
          this.imagePathAry = JSON.parse(this.temp.picture)
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
          //將照片轉成JSON字串
          // if(this.imagePathAry.length>0){
          //   this.temp.picture = JSON.stringify(this.imagePathAry);
          // }else{
          //   this.temp.picture = ""
          // }
          this.temp.categoryName = this.selectListCategories.filter((item) => item.value === this.temp.categoryId)[0]?.label;
          this.$api.products[apiName](this.temp).then((res) => {
            const{code} = res;
            if(code === 200){
              this.$swal.fire({
                title: "成功",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
              this.closeDialog()
              this.getList()
            }
          });
        }
      });
    },
    handleUpdate(row) {
      this.$api.products.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          this.imagesPropAry = JSON.parse(this.temp.picture)
          this.imagePathAry = JSON.parse(this.temp.picture)
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
@import "~vue2-editor/dist/vue2-editor.css";

/* Import the Quill styles you want */
@import "~quill/dist/quill.core.css";
@import "~quill/dist/quill.bubble.css";
@import "~quill/dist/quill.snow.css";
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
  .preview-dialog{
    .el-radio{
      margin: 0px 15px 0px 0px;
    }
    .previewItem{
      display: flex;
      border: 1px solid #EBEEF5;
      .title{
        flex-shrink: 0;
        font-weight: 500;
        color: #606266;
        display: flex;
        align-items: center;
        width: 150px;
        padding: 8px 0px 8px 16px;
        border-right: 1px solid #EBEEF5;
      }
      .imgContent{
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
      }
      .item{
        font-weight: 500;
        padding: 8px 0px 8px 16px;
          .imgWrap{
            // margin-right: 5px;
            // padding: 5px;
            width: 120px;
            height: 120px;
            // margin: 0px 8px 0px 0px;
            margin:5px;
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
