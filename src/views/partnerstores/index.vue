<template>
  <div class="flex-column newsPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入標題'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column width="120px" label="商家圖片" prop="picture" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.picture" class="imgWrap"><img :src="formatImgData(scope.row.picture)" alt="" /></div>
              <span v-else>無</span>
            </template>
          </el-table-column>
          <el-table-column min-width="100px" align="center" label="商家類別名稱" prop="categoryName"></el-table-column>
          <el-table-column min-width="150px" align="center" label="商家名稱" prop="name"></el-table-column>
          <el-table-column width="150px" align="center" label="經度" prop="long"></el-table-column>
          <el-table-column width="150px" align="center" label="緯度" prop="lat"></el-table-column>
          <el-table-column width="80px" label="排序" prop="sort" align="center"></el-table-column>
          <el-table-column width="100px" align="center" label="狀態">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{ scope.row.state ? "上架" : "下架" }}</span>
            </template>
          </el-table-column>
          <el-table-column width="200px" align="center" :label="'操作'" fixed="right">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handleUpdate(scope.row)" type="primary" v-if="hasButton('btnEdit')">編輯</el-button>
                <el-button size="mini" @click="handleDelete([scope.row])" type="danger" v-if="hasButton('btnDel')">刪除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <el-dialog  @close="closeDialog" class="dialog-mini" v-loading="formLoading" top="10vh" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <!-- 類別 -->
          <el-col :span="24">
            <el-form-item label="商店類別" prop="categoryId">
              <el-select class="itemWidth" v-model="temp.categoryId" placeholder="請選擇類別" @blur="validateBlurSelect('categoryId')">
                <el-option v-for="item in selectLists" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 商店名稱 -->
          <el-col :span="24">
            <el-form-item label="商店名稱" prop="name">
              <el-input class="itemWidth" type="text" v-model="temp.name" size="small" placeholder="請輸入商店名稱"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店密碼 -->
          <el-col :span="24">
            <el-form-item label="商店密碼">
              <el-input class="itemWidth" type="text" v-model="temp.storePassword" size="small" placeholder="請輸入商店密碼"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店簡介 -->
          <el-col :span="24">
            <el-form-item label="簡介">
              <el-input class="itemWidth" type="textarea" v-model="temp.contents" size="small" placeholder="請輸入商店簡介"></el-input>
            </el-form-item>
          </el-col>
          <!-- 圖片上傳 -->
          <el-col :span="24">
            <el-form-item label="商家圖片" prop="picture">
              <upload-image :uploadLimit="1" @successUploadImg="successUploadImg" @deleteImg="deleteImg" :imagesPropAry="imagesPropAry"/>
              <el-input v-show="false" type="text" v-model.trim="temp.picture"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店電話號碼 -->
          <el-col :span="24">
            <el-form-item label="電話號碼">
              <el-input class="itemWidth" type="text" v-model.trim="temp.telephone" size="small" placeholder="請輸入商店電話"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店地址 -->
          <el-col :span="24">
            <el-form-item label="商店地址" prop="address">
              <el-input class="itemWidth" type="text" v-model.trim="temp.address" size="small" placeholder="請輸入商店地址"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店網址 -->
          <el-col :span="24">
            <el-form-item label="網址">
              <el-input class="itemWidth" type="text" v-model.trim="temp.url" size="small" placeholder="請輸入網址"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店經度 -->
          <el-col :span="24">
            <el-form-item label="商店位置經度" prop="long">
              <el-input class="itemWidth" type="text" v-model.trim="temp.long" size="small" placeholder="請輸入商店位置經度"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店緯度 -->
          <el-col :span="24">
            <el-form-item label="商店位置緯度" prop="lat">
              <el-input class="itemWidth" type="text" v-model.trim="temp.lat" size="small" placeholder="請輸入商店位置緯度"></el-input>
            </el-form-item>
          </el-col>
          <!-- 開始營業時間 -->
          <el-col :span="24">
            <el-form-item label="開始營業時間" prop="startBusinessHours">
                <el-time-picker v-model="temp.startBusinessHours" size="small"  placeholder="請選擇開始營業時間" value-format='HH:mm' format='HH:mm'> </el-time-picker>
            </el-form-item>
          </el-col>
          <!-- 結束營業時間 -->
          <el-col :span="24">
            <el-form-item label="結束營業時間" prop="endBusinessHours">
                <el-time-picker v-model="temp.endBusinessHours" size="small"  placeholder="請選擇結束營業時間" value-format='HH:mm' format='HH:mm'> </el-time-picker>
            </el-form-item>
          </el-col>
          <!-- 商家的統一編號 -->
          <el-col :span="24">
            <el-form-item label="統一編號">
              <el-input class="itemWidth" type="text" v-model.trim="temp.storeSn" size="small" placeholder="請輸入商店統一編號"></el-input>
            </el-form-item>
          </el-col>
          <!-- 是否為合作夥伴 -->
          <el-col :span="24">
            <el-form-item label="合作夥伴">
              <el-switch v-model="temp.cooperation" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col>
          <!-- 排序 -->
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small" :min="0"></el-input-number>
            </el-form-item>
          </el-col>
          <!-- 狀態(上架/下架) -->
          <el-col :span="24">
            <el-form-item label="狀態(上架/下架)">
              <el-switch v-model="temp.state" active-text="上架" inactive-text="下架"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closeDialog">取消</el-button>
        <el-button size="mini" type="primary" @click="submit">確認</el-button>
        <!-- <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button> -->
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
import uploadImage from "@/components/UploadImage";

const formTemplate = {
  id: "",
  picture:"",//圖片
  categoryId: "", //類別名稱
  categoryName: "", //類別名稱
  name: "", //商店名稱
  contents: "", //商店簡介
  telephone: "", //商店電話
  address: "", //商店地址
  long: "",//經度
  lat: "",//緯度
  url:"",
  startBusinessHours: "08:00",//開始營業時間
  endBusinessHours: "18:00",//結束營業時間
  sort: 0, //排序
  state: true, //預設為上架,狀態上架/下架
  cooperation:false,//是否為合作夥伴
  storeSn:"",//商家的統一編號
  storePassword:""//店家密碼
};

export default {
  name: "partnerstores",
  components: { Sticky, permissionBtn, Pagination,uploadImage},
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    //驗證電話號碼
    const checkNum = (rule, value, callback) => {
      const isNum = this.temp[rule.field].match(/^[0-9]+$/);
      if (isNum) {
        return callback();
      }
      return callback(new Error("電話格式不正確"));
    };
    // 驗證緯度
    const checkLat = (rule,value,callback) => {
      const lngRex = /^(\-|\+)?([0-8]?\d{1}\.\d{0,7}|90\.0{0,7}|[0-8]?\d{1}|90)$/; // eslint-disable-line
      if (lngRex.test(this.temp[rule.field])) {
        return callback();
      }
      return callback(new Error("緯度整數為0-90,小數為0到7位"));
    };
    // 驗證經度
    const checkLong = (rule,value,callback) => {
      const lngRex = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,7})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,7}|180)$/; // eslint-disable-line
      if (lngRex.test(this.temp[rule.field])) {
        return callback();
      }
      return callback(new Error("經數整數為0-180,小數為0到7位"));
    };
    return {
      temp: JSON.parse(JSON.stringify(formTemplate)),
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      imagePathAry:[],
      imagesPropAry:[],
      selectLists: [],
      multipleSelection: [], // 列表checkbox選中的值
      dialogFormVisible: false,
      dialogStatus: "",
      tableKey: 0,
      list: null,
      total: 0,
      formLoading:false,
      listLoading: true,
      listQuery: { // 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
        CategoryId: "", //商家ID
      },
      textMap: {
        update: "編輯",
        add: "新增",
      },
      rules: {
        categoryId: [{ required: true, message: "必填欄位", trigger: "change" }],
        name: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        // contents: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        // picture: [{ required: true, message: "必填欄位", trigger: ["blur", "change"]  }],
        telephone: [
          { required: false, message: "必填欄位", trigger: ["blur", "change"] },
          { validator: checkNum, trigger: ["blur", "change"] },
          { min: 9, message: "號碼至少9碼", trigger: ["blur", "change"] },
        ],
        address: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        long: [//經度
            { required: true, message: "必填欄位", trigger: ["blur", "change"] },
            { validator: checkLong, trigger: ["blur", "change"] },
            // { type: "number", message: "請輸入數字", trigger: ["blur", "change"] }
        ],
        lat: [//緯度
            { required: true, message: "必填欄位", trigger: ["blur", "change"] },
            { validator: checkLat, trigger: ["blur", "change"] },
            // { type: "number", message: "請輸入數字", trigger: ["blur", "change"] }
        ],
        startBusinessHours: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        endBusinessHours: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        // sort: [{ required: true, message: "必填欄位", trigger: "blur" }],
        // state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getList();
    this.selectData();
  },
  computed:{
    formatImgData(){
      return (imgJsonString)=>{
        let firstImgPath =JSON.parse(imgJsonString)[0].path
        return this.imgUrl + firstImgPath
      }
    },
    stateTextColor(){
      return (state)=>{
        return state ? "greenText" : "redText";
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
    validateBlurSelect(id) {
      this.$refs.ruleForm.validateField(id);
    },
    getList() {
      this.listLoading = true;
      this.$api.partnerStores.getList(this.listQuery).then((response) => {
        this.listLoading = false;
        const { data, count,code } = response;
        if(code===200){
          this.list = data;
          this.total = count; 
          this.$nextTick(() => {
            this.$refs.mainTable.doLayout();
          });
        }
      });
    },
    // 取得下拉選單
    selectData() {
      let temp = {
        page: 1,
        limit: 999,
      };
      this.$api.partnerStoreCategorys.getList(temp).then((res) => {
        const { code, data } = res;
        if (code === 200) {
          this.selectLists = data.map((item) => ({
            label: item.name,
            value: item.id,
            disabled:!item.state
          }));
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
      }
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
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
      this.imagePathAry=[],
      this.imagesPropAry=[],
      this.dialogStatus = "";
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
      this.temp.releaseDate = this.$dayjs().format("YYYY-MM-DD");
    },
    // 保存提交
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.formLoading = true
          //取得類別名稱
          this.temp.categoryName = this.selectLists.filter((item) => item.value === this.temp.categoryId)[0]?.label;
          this.temp.long = Number(this.temp.long) 
          this.temp.lat = Number(this.temp.lat)    
        
          this.$api.partnerStores[this.dialogStatus](this.temp).then((res) => {
            this.formLoading = false
            const {code} = res
            if(code===200){
              this.$swal.fire({
                title: "成功",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
              this.closeDialog();
              this.getList();
            }
          });
        }
      });
    },
    // 編輯彈窗
    handleUpdate(row) {
      this.$api.partnerStores.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          this.temp.long = String(this.temp.long) 
          this.temp.lat = String(this.temp.lat)
          if(this.temp.picture){
            this.imagesPropAry = JSON.parse(this.temp.picture)
            this.imagePathAry = JSON.parse(this.temp.picture)
          }
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    // 列表刪除
    handleDelete(rows) {
      this.delrows("partnerStores", rows, this.getList);
    },
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
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
.newsPage {
  .dialogContent {
    max-height: 70vh;
    overflow-y: auto;
    .tagError {
      color: #d63737;
      font-size: 12px;
      line-height: 20px;
    }
    .el-tag {
      margin-right: 10px;
    }
    .button-new-tag {
      display: block;
      // margin-left: 10px;
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .input-new-tag {
      display: block;
      width: 90px;
      // margin-left: 10px;
    }
  }
}
</style>
