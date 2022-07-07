<template>
  <div class="flex-column stampstorecategorysPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入飯店名稱'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column width="150px" label="飯店Logo" prop="logo" align="center">
            <template slot-scope="scope">
              <div class="imgWrap"><img :src="formatImgData(scope.row.logo)" alt="" /></div>
            </template>
          </el-table-column>
          <el-table-column width="100px" label="區域類別" prop="areaName" align="center"></el-table-column>
          <el-table-column min-width="50px" label="飯店名稱" prop="name" align="center"></el-table-column>
          <el-table-column min-width="100px" label="連結" prop="url" align="center"></el-table-column>
          <el-table-column width="100px" label="狀態" prop="isEnable" align="center">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{scope.row.state?'上架':'下架' }}</span>
            </template>
          </el-table-column>
          <el-table-column width="80px" label="排序" prop="sort" align="center"></el-table-column>
          <el-table-column width="250px" :label="'操作'" align="center">
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

    <el-dialog class="dialog-mini" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <!-- 區域類別 -->
          <el-col :span="24">
            <el-form-item label="區域類別" prop="areaId">
              <el-select class="itemWidth" v-model="temp.areaId" placeholder="請選擇區域類別" @blur="validateBlurSelect('areaId')">
                <el-option v-for="item in areaSelectList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 行政區 -->
          <el-col :span="24">
            <el-form-item label="行政區" prop="administrativeArea">
              <el-input type="text" v-model="temp.administrativeArea" placeholder="請輸入行政區"></el-input>
            </el-form-item>
          </el-col>

          <!-- 飯店名稱 -->
          <el-col :span="24">
            <el-form-item label="飯店名稱">
              <el-input type="text" v-model="temp.name" placeholder="請輸入飯店名稱"></el-input>
            </el-form-item>
          </el-col>

          <!-- 飯店名稱 -->
          <el-col :span="24">
            <el-form-item label="飯店連結" prop="url">
              <el-input type="text" v-model="temp.url" placeholder="請輸入飯店連結"></el-input>
            </el-form-item>
          </el-col>
          <!-- 飯店Logo -->
          <el-col :span="24">
            <el-form-item label="飯店Logo" prop="logo">
              <upload-image @successUploadImg="successUploadImg($event,'logo')" @deleteImg="deleteImg($event,'logo')" :uploadLimit="1" 
                :imagesPropAry="logoImagesPropAry"
              />
              <el-input v-show="false" type="text" v-model.trim="temp.logo"></el-input>
            </el-form-item>
          </el-col>
          <!-- 飯店圖片 -->
          <el-col :span="24">
            <el-form-item label="飯店圖片" prop="picture">
              <upload-image @successUploadImg="successUploadImg($event,'picture')" @deleteImg="deleteImg($event,'picture')" :uploadLimit="1" 
                :imagesPropAry="pictureImagesPropAry"
              />
              <el-input v-show="false" type="text" v-model.trim="temp.picture"></el-input>
            </el-form-item>
          </el-col>
          <!-- 排序 -->
          <el-col :span="24">
            <el-form-item :label="'排序'">
              <el-input-number v-model="temp.sort" :min="0"></el-input-number>
            </el-form-item>
          </el-col>
          <!-- 狀態(上/下架) -->
          <el-col :span="24">
            <el-form-item :label="'狀態(上/下架)'">
              <el-switch v-model="temp.state" active-text="上架" inactive-text="下架"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closeDialog">取消</el-button>
        <el-button size="mini" type="primary" @click="submit">確認</el-button>
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
  areaId: "",//區域類別ID
  areaName: "",//區域類別名稱
  administrativeArea: "",//行政區
  name: "",//飯店名稱
  logo: "",//飯店logo
  picture: "",//房間圖片
  url: "",//連結
  sort: 0,//排序
  state: true//狀態(上/下架)
};

export default {
  name: "bookingrooms",
  components: { Sticky, permissionBtn, Pagination,uploadImage },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      areaSelectList:[],
      logoImagePathAry:[],
      logoImagesPropAry:[],
      pictureImagePathAry:[],
      pictureImagesPropAry:[],
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: { // 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: JSON.parse(JSON.stringify(formTemplate)),
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        add: "新增",
      },
      rules: {
        areaId: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        administrativeArea: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
        url: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
        logo: [{ required: true, message: "必填欄位", trigger: ["blur", "change"]  }],
        picture: [{ required: true, message: "必填欄位", trigger: ["blur", "change"]  }],
      },
    };
  },
  async mounted() {
    this.getList()
    this.selectData();
  },
  computed:{
    stateTextColor(){
      return (state)=>{
        return {
          greenText: state,
          redText: !state
        }
      }
    },
    formatImgData(){
      return (imgJsonString)=>{
        let firstImgPath = JSON.parse(imgJsonString)[0].path
        return this.imgUrl+firstImgPath
      }
    },
  },
  methods: {
    validateBlurSelect(id) {
      this.$refs.ruleForm.validateField(id);
    },
    // 取得下拉選單
    selectData() {
      let temp = {
        page: 1,
        limit: 999,
        TypeId: "SYS_PlayerLeads_Area",
      };
      this.$api.categorys.load(temp).then((res) => {
        const { code, data } = res;
        if (code === 200) {
          this.areaSelectList = data.filter(item=>item.isEnable)
          this.areaSelectList = this.areaSelectList.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        }
      });
    },
    deleteImg(imgPath,imageType){
      if(imageType==='logo'){
        this.logoImagePathAry = this.logoImagePathAry.filter(item=>item.path !== imgPath)
        if(this.logoImagePathAry.length>0){
          this.temp.logo = JSON.stringify(this.logoImagePathAry)
        }else{
          this.temp.logo = ""
        }
      }
      if(imageType==='picture'){
        this.pictureImagePathAry = this.pictureImagePathAry.filter(item=>item.path !== imgPath)
        if(this.pictureImagePathAry.length>0){
          this.temp.picture = JSON.stringify(this.pictureImagePathAry)
        }else{
          this.temp.picture = ""
        }
      }
    },
    successUploadImg(successUploadResult,imageType){
      console.log("successUploadResult",successUploadResult);
      console.log("imageType",imageType);
      if(imageType==='logo'){
        successUploadResult.forEach(item => {   
          this.logoImagePathAry.push({
            path:item.filePath,
            id:item.id
          })
        });
        this.temp.logo = JSON.stringify(this.logoImagePathAry)
      }
      if(imageType==='picture'){
        successUploadResult.forEach(item => {   
          this.pictureImagePathAry.push({
            path:item.filePath,
            id:item.id
          })
        });
        this.temp.picture = JSON.stringify(this.pictureImagePathAry)
      }
    },
    getList(){
      this.listLoading = true;
      this.$api.bookingRooms.getList(this.listQuery).then((response) => {
        const { data, count } = response;
        this.list = data;
        this.total = count;
        this.listLoading = false;
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
      this.logoImagePathAry = [];
      this.logoImagesPropAry = [];
      this.pictureImagePathAry = [];
      this.pictureImagesPropAry = [];
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    submit() {
        let apiName = "";
        switch (this.dialogStatus) {
        case "add":
            apiName = "add";
            break;
        case "update":
            apiName = "update";
            break;
        }
        this.$refs["ruleForm"].validate((valid) => {
          if(valid){
            this.temp.areaName = this.areaSelectList.filter((item) => item.value === this.temp.areaId)[0]?.label;
            this.$api.bookingRooms[apiName](this.temp).then((res) => {
              const {code} = res;
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
    //編輯彈窗
    handleUpdate(row) {
      this.$api.bookingRooms.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          if(this.temp.picture){
            this.pictureImagePathAry = JSON.parse(this.temp.picture);
            this.pictureImagesPropAry = JSON.parse(this.temp.picture);
          }
          if(this.temp.logo){
            this.logoImagePathAry = JSON.parse(this.temp.logo);
            this.logoImagesPropAry = JSON.parse(this.temp.logo);
          }
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    //列表刪除
    handleDelete(rows) {
      this.delrows("bookingRooms", rows, this.getList);
    },
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
    },
  },
}
</script>
<style lang="scss" scoped>
.stampstorecategorysPage {
  .app-container{
    .imgWrap{
      width: 30px;
      height: 30px;
    }
  }
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
