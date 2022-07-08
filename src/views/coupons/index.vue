<template>
  <div class="flex-column couponsPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入優惠券名稱'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column width="100px" label="優惠券縮圖" prop="picture" align="center">
            <template slot-scope="scope">
              <div class="imgWrap" v-if="scope.row.picture"><img :src="formatImgData(scope.row.picture)" alt="" /></div>
              <span v-else>無</span>
              <!-- <div class="imgWrap" v-else><img src="../../assets/default-img/coupons/gift-box 2.png" alt="" /></div> -->
            </template>
          </el-table-column>
          <el-table-column min-width="120px" label="優惠券名稱" prop="name" align="center"></el-table-column>
          <el-table-column min-width="100px" label="兌換點數" prop="points" align="center"></el-table-column>
          <el-table-column min-width="150px" label="摘要" prop="summury" align="center"></el-table-column>
          <el-table-column min-width="400px" label="內容" prop="contents" align="center"></el-table-column>
          <el-table-column width="100px" label="狀態" prop="state" align="center">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{scope.row.state?'上架':'下架' }}</span>
            </template>
          </el-table-column>
          <el-table-column width="100px" label="是否顯示兌換清單中" prop="exchangeList" align="center">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.exchangeList)">{{scope.row.exchangeList?'是':'否' }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" label="排序" prop="sort" align="center"></el-table-column>
          <!-- <el-table-column width="200px" label="分類標誌" prop="typeId" align="center"></el-table-column> -->
          <el-table-column min-width="150px" :label="'操作'" align="center">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handleUpdate(scope.row)" type="primary" v-if="hasButton('btnEdit')">編輯</el-button>
                <!-- <el-button size="mini" @click="handleDelete([scope.row])" type="danger" v-if="hasButton('btnDel')">刪除</el-button> -->
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <el-dialog class="dialog-mini" v-loading="couponsFormLoading" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <!-- 優惠券名稱 -->
          <el-col :span="24">
            <el-form-item :label="'優惠券名稱'" prop="name">
                <el-input v-model.trim="temp.name"></el-input>
            </el-form-item>
          </el-col>
          <!-- 優惠券圖片 -->
          <el-col :span="24">
            <el-form-item label="優惠券圖片" prop="picture">
                <upload-image @successUploadImg="successUploadImg" @deleteImg="deleteImg" :uploadLimit="1" 
                  :imagesPropAry="imagesPropAry"
                />
                <!-- <el-input v-show="false" type="text" v-model.trim="temp.picture"></el-input> -->
            </el-form-item>
          </el-col>
          <!-- 摘要 -->
          <el-col :span="24">
            <el-form-item label="摘要" prop="summury">
              <el-input class="itemWidth" type="input" v-model.trim="temp.summury" placeholder="請輸入摘要"></el-input>
            </el-form-item>
          </el-col>
          <!-- 內容 -->
          <el-col :span="24">
            <el-form-item label="內容" prop="contents">
              <el-input v-model.trim="temp.contents" class="itemWidth" type="textarea" placeholder="請輸入內容" rows="5"></el-input>
            </el-form-item>
          </el-col>
          <!-- 點數 -->
          <el-col :span="24">
            <el-form-item label="兌換所需點數" prop="points">
              <el-input v-model.number="temp.points" placeholder="請輸入兌換點數"></el-input>
            </el-form-item>
          </el-col>
          <!-- 狀態 -->
          <el-col :span="24">
            <el-form-item size="small" :label="'狀態(上/下架)'" prop="isEnable">
              <el-switch v-model="temp.state" active-text="上架" inactive-text="下架"></el-switch>
            </el-form-item>
          </el-col>
          <!-- 排序 -->
          <el-col :span="24">
            <el-form-item size="small" :label="'排序'">
                <el-input-number v-model="temp.sort" :min="0"></el-input-number>
            </el-form-item>
          </el-col>
          <!-- 是否顯示兌換清單中 -->
          <el-col :span="24">
            <el-form-item :label="'是否顯示兌換清單中'" prop="isEnable">
                <el-switch v-model="temp.exchangeList" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col>
          <!-- 到期天數設定 -->
          <el-col :span="24">
            <el-form-item label="到期天數設定" prop="expiryDays">
              <el-input v-model.number="temp.expiryDays" placeholder="請輸入天數"></el-input>
              <!-- <el-date-picker class="itemWidth" type="date" v-model="temp.expiryDays" value-format="yyyy-MM-dd" placeholder="請選擇日期"></el-date-picker> -->
            </el-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <el-form-item label="兌換章數" prop="points">
              <el-input v-model.number="temp.points" placeholder="請輸入兌換點數"></el-input>
            </el-form-item>
          </el-col> -->
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
  name: "",//優惠券名稱
  picture: "",//優惠券圖檔路徑
  summury: "",//摘要
  contents: "",//內容
  points: undefined,//點數
  expiryDays: "",//到期日
  exchangeList: true,//是否顯示於兌換清單中
  sort: 0,//排序
  state: true//狀態
};

export default {
  name: "coupons",
  components: { Sticky, permissionBtn, Pagination,uploadImage },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      temp: JSON.parse(JSON.stringify(formTemplate)),
      couponsFormLoading:true,
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      dialogFormVisible: false,
      dialogStatus: "",
      imagePathAry:[],
      imagesPropAry:[],
      selectLists: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {// 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
      },
      textMap: {
        update: "編輯",
        add: "新增",
      },
      rules: {
        name: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
        summury: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
        contents: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
        points: [
          { required: true, message: "必填欄位", trigger:  ["blur", "change"] },
          { type: 'number', message: "必填為數字", trigger:  ["blur", "change"] },
        ],
        expiryDays: [
          { required: true, message: "必填欄位", trigger:  ["blur", "change"] },
          { type: 'number', message: "必填為數字", trigger:  ["blur", "change"] }
        ],
      },
    };
  },
  async mounted() {
    this.getList()
  },
  computed:{
    formatImgData(){
      return (imgJsonString)=>{
        let firstImgPath = JSON.parse(imgJsonString)[0].path
        return this.imgUrl+firstImgPath
      }
    },
    stateTextColor(){
      return (state)=>{// console.log(state);
        return {
          greenText: state,
          redText: !state
        }
      }
    },
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
      this.temp.picture = JSON.stringify(this.logoImagePathAry)
    },
    getList(){
      this.listLoading = true;
      this.$api.coupons.getList(this.listQuery).then((response) => {
        this.listLoading = false;
        const { data, count,code } = response;
        if(code===200){
          this.list = data;
          this.total = count;
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
      this.imagePathAry=[];
      this.imagesPropAry=[];
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    submit() {
        this.$refs["ruleForm"].validate((valid) => {
            if(valid){
                this.couponsFormLoading = true
                //將照片轉成JSON字串
                // if(this.imagePathAry.length>0){
                //   this.temp.picture = JSON.stringify(this.imagePathAry);
                // }else{
                //   this.temp.picture = ""
                // }
                this.$api.coupons[this.dialogStatus](this.temp).then((res) => {
                  this.couponsFormLoading = false
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
      this.$api.coupons.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          if(this.temp.picture){
            this.imagesPropAry = JSON.parse(this.temp.picture);
          }
          this.dialogStatus = "update";
          this.dialogFormVisible = true;
        }
      });
    
      
    },
    // 列表刪除
    handleDelete(rows) {
      this.delrows("coupons", rows, this.getList);
    },
    closeDialog(){
      this.dialogFormVisible = false;
      this.resetTemp();
    },
  },
}
</script>
<style lang="scss" scoped>
.couponsPage {
  .app-container{
    .greenText{
        color:green;
    }
    .redText{
        color:red;
    }
    .imgWrap{
      width: 30px;
      height: 30px;
    }
  }
  .dialogContent {
    max-height: 70vh;
    overflow-y: auto;
  }
}
</style>
