<template>
  <div class="flex-column stampstorecategorysPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入標題'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column min-width="50px" label="類別名稱" prop="name" align="center"></el-table-column>
          <el-table-column width="80px" label="狀態" prop="isEnable" align="center">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.isEnable)">{{scope.row.isEnable?'上架':'下架' }}</span>
            </template>
          </el-table-column>
          <el-table-column width="80px" label="排序" prop="sort" align="center"></el-table-column>
          <!-- <el-table-column width="200px" label="分類標誌" prop="typeId" align="center"></el-table-column> -->
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
          <el-form-item size="small" :label="'類別名稱'" prop="name">
            <el-input v-model="temp.name"></el-input>
          </el-form-item>

          <el-form-item size="small" :label="'排序'">
            <el-input-number v-model="temp.sort" :min="0"></el-input-number>
          </el-form-item>

          <el-form-item size="small" :label="'是否可用'" prop="isEnable">
            <el-switch v-model="temp.isEnable" active-text="是" inactive-text="否"></el-switch>
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

const formTemplate = {
  id: "", // 分類表ID（可作為分類的標識）
  dtCode: "", //店家的帳號(專門給集章類別/集章商品)
  name: "", // 名稱
  dtValue: "", //店家的中文名稱(專門給集章類別/集章商品)
  isEnable: true, // 是否可用
  sort: 0, // 排序號
  description: "", // 分類描述
  typeId: "SYS_stampstorecategorys", // 分類類型ID
  extendInfo: "", // 其他信息,防止最後加逗號，可以刪除
};

export default {
  name: "stampstorecategorys",
  components: { Sticky, permissionBtn, Pagination },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      userHasHighestAuthorityRole:undefined,
      selectLists: [],
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
        TypeId: "SYS_stampstorecategorys",
        StoreId:""
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
  computed:{
    stateTextColor(){
      return (state)=>{
        return {
          greenText: state,
          redText: !state
        }
      }
    }
  },
  async mounted() {
    console.log(this.hasButton("highestAuthorityRole"));
    // this.userHasHighestAuthorityRole = await this.getUserPermissionRoles()
    if(this.hasButton("highestAuthorityRole")){
      //有最高權限,可以取得所有機構新增的集章類別
      this.listQuery.StoreId = ""
      this.getList()
    }else{
      //一般權限,只能取得該機構新增過的集章類別
      await this.getOrgs()
      this.getList()
    }
  },
  methods: {
    //取得該商店,機構,公司的id
    getOrgs(){
      return new Promise((resolve)=>{
        this.$api.login.getOrgs(this.$store.state.user.token).then((res)=>{
            const {code,result} = res;
            if(code===200){
                let rootParentId = result.filter(item=>!item.parentId)[0]?.id
                this.listQuery.StoreId = rootParentId
                resolve()
            }
        })
      })
    },
    //取得登帳號擁有的全部角色
    // getUserPermissionRoles(){
    //   return new Promise((resolve)=>{
    //     this.$api.login.getPermissionRoles().then((res)=>{
    //       const { result, code } = res;
    //       if(code===200){
    //         let userPermissionRolesId = result.map((item)=>item.id)
    //         let userHasHighestAuthorityRole = userPermissionRolesId.includes("301166682144838")
    //         // this.userHasHighestAuthorityRole = userPermissionRolesId.includes("301166682144838")
    //         resolve(userHasHighestAuthorityRole)
    //       }
    //     })
    //   })
    // },
    getList(){
      this.listLoading = true;
      this.$api.categorys.load(this.listQuery).then((response) => {
        const { data, count } = response;
        this.list = data;
        this.total = count;
        this.listLoading = false;
      });
    },
    onBtnClicked: function (domId) {
      console.log("you click:" + domId);
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
      //this.$refs["ruleForm"].clearValidate();
      this.$refs["ruleForm"].resetFields();
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    // 保存提交
    submit() {
        let apiName = "";
        switch (this.dialogStatus) {
        case "add":
            apiName = "add";
            if(this.userHasHighestAuthorityRole){
              this.temp.dtCode="highestAuthorityRole";
              this.temp.dtValue="最高權限角色"
            }else{
              this.temp.dtCode =  this.$store.state.user.defaultorg.id
              this.temp.dtValue = this.$store.state.user.defaultorg.name
            }
            break;
        case "update":
            apiName = "update";
            break;
        }
        
        console.log(this.temp);
        console.log(apiName);
        this.$refs["ruleForm"].validate((valid) => {
            if(valid){
                this.$api.categorys[apiName](this.temp).then(() => {
                this.$swal.fire({
                    title: "成功",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
                this.closeDialog();
                this.getList();
                });
            }
        });
    },
    // 編輯彈窗
    handleUpdate(row) {
      this.$api.categorys.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    // 列表刪除
    handleDelete(rows) {
      this.delrows("categorys", rows, this.getList);
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
