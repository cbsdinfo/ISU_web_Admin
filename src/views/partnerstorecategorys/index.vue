<template>
  <div class="flex-column stampstorecategorysPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入類別名稱'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column min-width="50px" label="類別名稱" prop="name" align="center"></el-table-column>
          <el-table-column width="150px" label="產品縮圖" prop="picture" align="center">
            <template slot-scope="scope">
                <div class="imgWrap"><img :src="formatImgData(scope.row.picture)" alt="" /></div>
            </template>
          </el-table-column>
          <!-- <el-table-column width="100px" label="是否可用" prop="isEnable" align="center">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{scope.row.state?'上架':'下架' }}</span>
            </template>
          </el-table-column>
          <el-table-column width="80px" label="排序" prop="sort" align="center"></el-table-column> -->
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
          <el-form-item :label="'類別名稱'" prop="name">
            <el-input v-model="temp.name"></el-input>
          </el-form-item>
          
          <el-form-item label="類別圖片" prop="picture">
            <upload-image @successUploadImg="successUploadImg" @deleteImg="deleteImg" :uploadLimit="1" 
              :imagesPropAry="imagesPropAry"
            />
          </el-form-item>

          <el-form-item :label="'排序'">
            <el-input-number v-model="temp.sort" :min="0" :max="10"></el-input-number>
          </el-form-item>

          <el-form-item :label="'狀態(上/下架)'" prop="isEnable">
            <el-switch v-model="temp.state" active-text="上架" inactive-text="下架"></el-switch>
          </el-form-item>
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
  "id": "",
  "name": "",//類別名稱
  "picture": "",//類別圖片路徑
  "sort": 0,//排序
  "state": true//狀態(上/下架)
};

export default {
  name: "partnerstorecategorys",
  components: { Sticky, permissionBtn, Pagination,uploadImage },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      imagePathAry:[],
      imagesPropAry:[],
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      submitFlag:false,
      selectLists: [],
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
        name: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
      },
    };
  },
  async mounted() {
    this.getList()
  },
  computed:{
    stateTextColor(){
      return (state)=>{
        // console.log(state);
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
    deleteImg(imgPath){
      this.imagePathAry = this.imagePathAry.filter(item=>item.path !== imgPath)
    },
    successUploadImg(successUploadResult){
      // console.log(imgPathAry);
      successUploadResult.forEach(item => {   
        this.imagePathAry.push({
          path:item.filePath,
          id:item.id
        })
      });
    },
    getList(){
      this.listLoading = true;
      this.$api.partnerStoreCategorys.getList(this.listQuery).then((response) => {
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
      this.imagesPropAry = []
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
                if(this.imagePathAry.length>0){
                  this.temp.picture = JSON.stringify(this.imagePathAry);
                }else{
                  this.temp.picture = ""
                }
                this.$api.partnerStoreCategorys[apiName](this.temp).then((res) => {
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
      this.$api.partnerStoreCategorys.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          this.imagePathAry = JSON.parse(this.temp.picture);
          this.imagesPropAry = JSON.parse(this.temp.picture);
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    //列表刪除
    handleDelete(rows) {
      this.delrows("partnerStoreCategorys", rows, this.getList);
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
