<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸任務名稱'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column min-width="50px" label="店家名稱" prop="partnerStoreName" align="center"></el-table-column>
          <el-table-column min-width="50px" label="任務標題" prop="missionName" align="center"></el-table-column>
          <el-table-column width="80px" label="任務狀態" align="center" >
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{ scope.row.state ? "上架" : "下架" }}</span>
            </template>
          </el-table-column>
          <el-table-column width="250px" :label="'操作'" align="center" fixed="right">
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

    <el-dialog class="dialog-mini" v-loading="formLoading" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <!-- 店家名稱(必填)-->
          <el-form-item :label="'店家名稱'" prop="partnerStoreId">
            <el-select  @blur="validateBlurSelect" v-model="temp.partnerStoreId" class="filter-item" placeholder="請選擇店家">
              <el-option v-for="item in partnerStoreOptions" :key="item.id" :label="item.name" :value="item.id" :disabled="!item.state"> </el-option>
            </el-select>
            <!-- <el-input type="text" v-model="temp.name" placeholder="請輸入店家名稱"></el-input> -->
          </el-form-item>
          
          <!-- 任務名稱(必填) -->
          <el-form-item :label="'任務名稱'" prop="missionName">
            <el-input type="text" v-model="temp.missionName" placeholder="請輸入任務名稱"></el-input>
          </el-form-item>

          <!-- 任務簡介(必填) -->
          <el-form-item label="任務簡介" prop="missionIntroduction">
            <el-input type="text" v-model.trim="temp.missionIntroduction" placeholder="請輸入任務簡介"></el-input>
          </el-form-item>
        

          
          <div class="multipleInputWrap" v-for="(item,index) in temp.subtasksMissionAry" :key="index">
            <!-- 子任務標題(必填)  :prop="'subtasksMission.'+index+'.name'";item.name+index-->
            <el-form-item :label="`子任務標題-${index+1}`" :prop="'subtasksMissionAry.'+index+'.name'"
              :rules="{
                required: true,
                message: '必填欄位',
                trigger: ['blur'],
              }"
              class="form-input"
            >
              <el-input v-model.trim="temp.subtasksMissionAry[index].name" type="text" placeholder="請輸入子任務標題"></el-input>
              <el-button v-if="index===0" class="btn" size="mini" type="success" @click="addSubtasksMission">新增</el-button>
              <el-button v-else class="btn" size="mini" type="danger" @click="delSubtasksMission(index)">刪除</el-button>
            </el-form-item>

            <!-- 子任務簡介(必填)subtasksMission.'+index+'.introduction ;:prop="item.introduction+index"-->
            <el-form-item :label="`子任務簡介-${index+1}`" :prop="'subtasksMissionAry.'+index+'.introduction'"
              :rules="{
                required: true,
                message: '必填欄位',
                trigger: ['blur'],
              }"
            >
              <el-input v-model.trim="temp.subtasksMissionAry[index].introduction" type="text" placeholder="請輸入子任務簡介"></el-input>
            </el-form-item>
          </div>

          <!-- 狀態 -->
          <el-form-item :label="'狀態(上/下架)'">
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
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
// import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";

const formTemplate = {
  id: "",
  partnerStoreId:"",//店家Id
  partnerStoreName: "",//店家名稱
  missionName: "",//任務名稱
  missionIntroduction: "",//任務簡介
  subMission:"",//子任務名稱+簡介
  state: true,//狀態(上/下架)
  subtasksMissionAry:[//此變數API不需要,但套件驗證規則,需在此寫此物件
    {
      name:"",
      introduction:""
    }
  ],
};

export default {
  name: "partnerStoreMission",
  components: { Sticky, permissionBtn, Pagination },
  // directives: {
  //   elDragDialog,
  // },
  mixins: [pbMixins, extend],
  data() {
    return {
      temp: JSON.parse(JSON.stringify(formTemplate)),
      tableKey: 0,
      list: null,
      total: 0,
      formLoading:false,
      listLoading: true,
      dialogFormVisible: false,
      dialogStatus: "",
      partnerStoreOptions:[],
      listQuery: { // 查詢條件
        page: 1,
        limit: 10,
        key: null,
      },
      textMap: {
        update: "編輯",
        add: "新增",
      },
      rules: {
        partnerStoreId: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],me: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
        missionName: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
        missionIntroduction: [{ required: true, message: "必填欄位", trigger:  ["blur", "change"] }],
      },
    };
  },
  async mounted() {
    this.getList()
    this.getPartnerStoreCategory()
  },
  computed:{
    stateTextColor(){
      return (state)=>{
        return state ? "greenText" : "redText";
      }
    }
  },
  methods: {
    //rule驗證select的blur事件會無法正常觸發,所以這邊額外自己寫blur事件來驗證
    validateBlurSelect() {
      this.$refs.ruleForm.validateField("partnerStoreId");
    },
    getPartnerStoreCategory(){
      let categoryTemp = {
        page: 1,
        limit: 99999,
        key: undefined,
        CategoryId: "", //商家ID
      }
      this.$api.partnerStores.getList(categoryTemp).then((res)=>{
        const {code,data} = res
        if(code===200){
          this.partnerStoreOptions = data
          this.partnerStoreOptions = this.partnerStoreOptions.filter(item=>item.categoryId==="301997438111814")
        }
      })
    },
    delSubtasksMission(index){
      this.temp.subtasksMissionAry.splice(index,1)
      // if(type==="name"){
      //   this.temp.subtasksMissionName.splice(index,1)
      // }
      // if(type==="introduction"){
      //   console.log(type,index);
      // }
    },
    addSubtasksMission(){
      this.temp.subtasksMissionAry.push({
        name:"",
        introduction:""
      })
    },
    getList(){
      this.listLoading = true;
      this.$api.partnerStoreMissions.getList(this.listQuery).then((response) => {
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
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if(valid){
          this.formLoading = true
          this.temp.subMission = JSON.stringify(this.temp.subtasksMissionAry);

          this.temp.partnerStoreName = this.partnerStoreOptions.filter(item=>item.id===this.temp.partnerStoreId)[0]?.name;
          console.log(this.temp);
          
          this.$api.partnerStoreMissions[this.dialogStatus](this.temp).then((res) => {
            this.formLoading = false
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
        }else{
          console.log("驗證沒過");
        }
      });
    },
    //編輯彈窗
    handleUpdate(row) {
      this.formLoading = true
      this.$api.partnerStoreMissions.get({ id: row.id }).then((res) => {
        this.formLoading = false
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          this.$set( this.temp, 'subtasksMissionAry', JSON.parse(result.subMission) )
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    //列表刪除
    handleDelete(rows) {
      this.delrows("partnerStoreMissions", rows, this.getList);
    },
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
    },
  }
}
</script>
<style lang="scss" scoped>
  .app-container{
    .imgWrap{
      width: 30px;
      height: 30px;
    }
  }
  .dialogContent {
    max-height: 70vh;
    overflow-y: auto;
    ::v-deep .multipleInputWrap{
      .form-input{
        position: relative;
        .el-form-item__content{
          input{
            padding-right: 56px;
          }
        }
      }
      .btn{
        height:36px;
        position: absolute;
        right: 0px;
      }
    }
  }

</style>
