<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" prefix-icon="el-icon-search" size="small" style="width: 200px; margin-bottom: 0" class="filter-item" :placeholder="'關鍵字'" v-model="listQuery.key"> </el-input>

        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>

        <el-checkbox size="mini" style="margin-left: 15px" @change="tableKey = tableKey + 1" v-model="showDescription">Id/描述</el-checkbox>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <el-row :gutter="4" class="fh">
        <el-col :span="6" class="fh ls-border">
          <el-card shadow="never" class="body-small fh" style="overflow: auto">
            <div slot="header" class="clearfix">
              <el-button type="text" style="padding: 0 11px" @click="getAllUsers">全部用戶>></el-button>
            </div>
            <el-tree :data="orgsTree" :expand-on-click-node="false" default-expand-all :props="defaultProps" @node-click="handleNodeClick"></el-tree>
          </el-card>
        </el-col>
        <el-col :span="18" class="fh">
          <div class="bg-white fh">
            <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)" @row-click="rowClick" @selection-change="handleSelectionChange">
              <el-table-column align="center" type="selection" width="55"> </el-table-column>

              <el-table-column :label="'Id'" v-if="showDescription" min-width="120px" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'帳號'" align="center">
                <template slot-scope="scope">
                  <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.account }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'姓名'" align="center">
                <template slot-scope="scope">
                  <span>{{ showName(scope.row.name) }}</span>
                </template>
              </el-table-column>
              
              <el-table-column min-width="120px" :label="'所屬部門'" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.organizations }}</span>
                </template>
              </el-table-column>
              
              <!-- <el-table-column min-width="150px" v-if="showDescription" :label="'描述'">
                <template slot-scope="scope">
                  <span style="color: red">{{ scope.row.description }}</span>
                </template>
              </el-table-column> -->

              <el-table-column class-name="status-col" :label="'狀態'" width="100">
                <template slot-scope="scope">
                  <span :class="scope.row.status | statusFilter">{{ statusOptions.find((u) => u.key == scope.row.status).display_name }}</span>
                </template>
              </el-table-column>

              <el-table-column align="center" :label="'操作'" width="230" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">編輯</el-button>
                  <el-button v-if="scope.row.status === 1 && hasButton('btnDisEnable')" @click="handleModifyStatus(scope.row, 0)" size="mini" type="danger">停用</el-button>
                  <el-button v-if="scope.row.status === 0 && hasButton('btnEnable')" @click="handleModifyStatus(scope.row, 1)" size="mini" type="success">啟用</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
          </div>
        </el-col>
      </el-row>
      <!-- 彈窗(編輯帳號) -->
      <el-dialog class="dialog-mini" width="500px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
        <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
          <el-form-item size="small" :label="'Id'" prop="id" v-show="dialogStatus == 'update'">
            <el-input v-model="temp.id" :disabled="true" size="small" placeholder="系統自動處理"></el-input>
          </el-form-item>
          <!-- 帳號 -->
          <el-form-item size="small" :label="'帳號'" prop="account">
            <el-input v-model="temp.account"></el-input>
          </el-form-item>
          <!-- 姓名 -->
          <el-form-item size="small" :label="'姓名'">
            <el-input v-model="temp.name"></el-input>
          </el-form-item>
          <!-- 密碼 -->
          <el-form-item size="small" :label="'密碼'">
            <el-input v-model="temp.password" :placeholder="dialogStatus == 'update' ? '如果為空則不修改密碼' : '如果為空則預設與帳號相同'"></el-input>
          </el-form-item>
          <!-- 狀態 -->
          <el-form-item size="small" :label="'狀態'">
            <el-select class="filter-item" v-model="temp.status" placeholder="Please select">
              <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key"> </el-option>
            </el-select>
          </el-form-item>
          <!-- 所屬機構 -->
          <el-form-item size="small" :label="'所屬機構'" prop="organizationIds">
            <treeselect v-if="dialogFormVisible" v-model="selectOrgs" :options="orgsTree" :default-expand-level="3" :multiple="true" :flat="true" :open-on-click="true" :open-on-focus="true" :clear-on-select="true"></treeselect>
          </el-form-item>
          <!-- 店家ID -->
          <el-form-item size="small" :label="'店家ID'" prop="parentStoreId">
            <el-select class="filter-item" v-model="temp.parentStoreId" placeholder="Please select">
              <el-option v-for="item in partnerStoresList" :key="item.id" :label="item.name+'('+item.categoryName+')'" :value="item.id"></el-option>
            </el-select>
          </el-form-item>

          <!-- <el-form-item size="small" :label="'描述'">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="Please input" v-model="temp.description"> </el-input>
          </el-form-item> -->

        </el-form>

        <div slot="footer">
          <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
          <el-button size="mini" v-if="dialogStatus == 'create'" type="primary" @click="createData">確認</el-button>
          <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button>
        </div>
        
      </el-dialog>
      <!-- 第一層分配角色(優化版) -->
      <el-dialog width="50%" class="dialog-mini body-small" :title="'分配角色'" :visible.sync="dialogRoleVisible" :close-on-click-modal="false" :lock-scroll="true">
        <el-form ref="rolesForm" size="small" label-position="left">
          <el-form-item>
            <selectUsersCom v-if="dialogRoleVisible"
              :ignore-auth="true" 
              :loginKey="'loginRole'" 
              :users.sync="selectRoles" 
              :userNames.sync="selectRoleNames"
              :hiddenFooter="true"
              @selectionUserChange="selectionUserChange"
            ></selectUsersCom>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogRoleVisible = false">取消</el-button>
          <el-button size="mini" type="primary" @click="acceRole">確認</el-button>
        </div>
      </el-dialog>
      <!-- 第一層分配角色(原版) -->
      <!-- <el-dialog width="516px" class="dialog-mini body-small" v-el-drag-dialog :title="'分配角色'" :visible.sync="dialogRoleVisible">
        <el-form ref="rolesForm" size="small" v-if="dialogRoleVisible" label-position="left">
          <el-form-item>
            <select-roles :roles="selectRoles" :userNames="selectRoleNames" v-on:roles-change="rolesChange"></select-roles>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogRoleVisible = false">取消</el-button>
          <el-button size="mini" type="primary" @click="acceRole">確認</el-button>
        </div>
      </el-dialog> -->
    </div>
  </div>
</template>

<script>
import { listToTreeSelect } from "@/utils";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import pbMixins from "@/mixins/permissionBtn.js";
import selectUsersCom from "@/components/SelectUsersCom";
// import SelectRoles from "@/components/SelectRoles";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";

export default {
  name: "user",
  // components: {Sticky,permissionBtn,Treeselect,Pagination,SelectRoles},
  components: {Sticky,permissionBtn,Treeselect,Pagination,selectUsersCom},
  mixins: [extend,pbMixins],
  directives: {waves,elDragDialog,},
  data() {
    return {
      partnerStoresList:[],
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      showDescription: false,
      dialogFormVisible: false,
      dialogRoleVisible: false, // 分配角色對話框
      dialogStatus: "",
      orgs: [], // 用戶可訪問到的組織列表
      orgsTree: [], // 用戶可訪問到的所有機構組成的樹
      selectRoles: [], // 用戶分配的角色
      selectRoleNames: "",
      listQuery: { // 查詢條件
        page: 1,
        limit: 20,
        orgId: "",
        key: undefined,
      },
      defaultProps: { // tree配置項
        children: "children",
        label: "label",
      },
      statusOptions: [//1=啟用;0=停用
        {
          key: 0,
          display_name: "停用",
        },
        {
          key: 1,
          display_name: "啟用",
        },
      ],
      temp: {
        // Users/AddOrUpdate
        id: undefined,
        description: "",//資料庫無此欄位
        organizations: "",//資料庫無此欄位
        organizationIds: "",
        account: "",//帳號
        name: "",//該帳號的名稱
        password: "",//密碼
        status: 1,
        parentStoreId:'',//資料庫無此欄位,打add新增表單API時加在organizations欄位裡
        // Users/AddOrUpdate
          // "id": "string",
          // "account": "string",
          // "password": "string",
          // "name": "string",
          // "sex": 0,
          // "status": 0,
          // "organizationIds": "string"
      },
      textMap: {
        update: "編輯",
        create: "新增",
      },
      rules: {
        organizationIds: [{ required: true,message: "必填欄位",trigger: ["blur", "change"]}],
        name: [{ required: true,message: "必填欄位",trigger: "blur",}],
        parentStoreId: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        account: [{ required: true,message: "帳號不能為空",trigger: "blur",}],
      },
    };
  },
  computed: {
    showName(){
      return(name)=>{
        let nameResult = ''
        let handleName = name.split(",")
        if( handleName.length > 1 ){
          nameResult = handleName[1]
        }
        if( handleName.length === 1){
          nameResult = name
        }
        return nameResult
      }
    },
    selectOrgs: {
      get: function () {
        if (this.dialogStatus === "update") {
          return this.temp.organizationIds && this.temp.organizationIds.split(",");
        } else {
          return [];
        }
      },
      set: function (v) {
        // console.log('set org:', v)
        var _this = this;
        _this.temp.organizationIds = (v.length > 0 && v.join(",")) || "";
        var organizations = _this.orgs
          .filter((val) => {
            return _this.temp.organizationIds.indexOf(val.id) >= 0;
          })
          .map((u) => u.label);
        this.temp.organizations = organizations.join(",");
      },
    },
  },
  filters: {
    statusFilter(status) {
      var res = "color-success";
      switch (status) {
        case 0:
          res = "color-danger";
          break;
        default:
          break;
      }
      return res;
    },
  },
  created() {
    this.getList();
  },
  async mounted() {
    await this.getLukangPartnerStoreIdList();
    await this.getSupplyStationPartnerStoreIdList()
    var _this = this; // 記錄vuecomponent
    this.$api.login.getOrgs().then((response) => {
      _this.orgs = response.result.map(function (item) {
        return {
          id: item.id,
          label: item.name,
          parentId: item.parentId || null,
        };
      });
      var orgstmp = JSON.parse(JSON.stringify(_this.orgs));
      _this.orgsTree = listToTreeSelect(orgstmp);
    });
  },
  methods: {
    //取得香客大樓類別的商家
    getLukangPartnerStoreIdList(){
      return new Promise((resolve)=>{
        let partnerStoreIdTemp = {
          CategoryId : "302220914290758",
          page : 1,
          limit : 99999,
        }
        this.$api.partnerStores.getList(partnerStoreIdTemp).then((res)=>{
          const { code , data } = res
          if(code===200){
            this.partnerStoresList.push(...data)
            resolve()
          }
        })
      })
    },
     //取得補給站類別的商家
    getSupplyStationPartnerStoreIdList(){
      return new Promise((resolve)=>{
        let partnerStoreIdTemp = {
          CategoryId : "301997438111814",
          page : 1,
          limit : 99999,
        }
        this.$api.partnerStores.getList(partnerStoreIdTemp).then((res)=>{
          const { code , data } = res
          if(code===200){
            this.partnerStoresList.push(...data)
            resolve()
          }
        })
      })
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    handleNodeClick(data) {
      this.listQuery.orgId = data.id;
      this.getList();
    },
    getAllUsers() {
      this.listQuery.orgId = "";
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onBtnClicked: function (domId) {
      console.log("you click:" + domId);
      switch (domId) {
        case "btnAdd":
          this.handleCreate();
          break;
        case "btnEdit":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          this.handleUpdate(this.multipleSelection[0]);
          break;
        case "btnDel":
          if (this.multipleSelection.length < 1) {
            this.$message({
              message: "至少刪除一個",
              type: "error",
            });
            return;
          }
          this.handleDelete(this.multipleSelection);
          break;
        case "btnAccessRole":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          this.handleAccessRole(this.multipleSelection[0]);
          break;
      }
    },
    getList() {
      this.listLoading = true;
      this.$api.users.getList(this.listQuery).then((response) => {
        this.listLoading = false;
        const {code} = response
        if(code===200){
          this.list = response.data;
          this.total = response.count;
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
    // 模擬修改狀態
    handleModifyStatus(row, status) {
      this.$swal
        .fire({
          icon: "warning",
          title: `確定要${status === 1 ? "啟用" : "停用"}『${row.name}』嗎？`,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "確定",
          cancelButtonText: "取消",
        })
        .then((result) => {
          if (result.isConfirmed) {
            row.status = status;
            let params = Object.assign({}, row);
            this.$api.users.update(params).then((res) => {
              if (res.code === 200) {
                this.$swal.fire({
                  icon: "success",
                  title: `${status === 1 ? "啟用" : "停用"}成功`,
                  timer: 1500,
                  showConfirmButton: false,
                });
              }
            });
          }
        });
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        description: "",
        organizations: "",
        organizationIds: "",
        account: "",
        name: "",
        status: 1,
      };
    },
    // 彈出新增框
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    //把parentStoreId跟organizationIds組在一起
    handleTempName(){
      let handleTempName = this.temp.name.split(",");
      handleTempName.unshift(this.temp.parentStoreId);
      this.temp.name = handleTempName.join(",")
    },
    // 保存提交
    createData() {
      
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.handleTempName()
          
          this.$api.users.add(this.temp).then((res) => {
            const{ code } = res;
            if(code === 200){
              this.$swal.fire({
                icon: "success",
                title: "創建成功",
                timer: 1500,
                showConfirmButton: false,
              });
              this.dialogFormVisible = false;
              this.getList()
            }
          });
        }
      });
    },
    handleUpdateDialogTempName(){
      if(this.temp.name){

        let handleTempName = this.temp.name.split(',');
      
        if(handleTempName.length>1){
          this.$set(this.temp,"parentStoreId", handleTempName[0])
          this.temp.name = handleTempName[1]
         
        }
      }
    },
    // 彈出編輯框
    handleUpdate(row) {
        this.temp = Object.assign({}, row); // copy obj
        this.handleUpdateDialogTempName()
        this.dialogStatus = "update";
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].clearValidate();
        });
    },
    // 更新提交
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {

          this.handleTempName()
         
          this.$api.users.update(this.temp).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.temp);
                break;
              }
            }
            this.dialogFormVisible = false;
            this.resetTemp()
            this.$swal.fire({
              icon: "success",
              title: "更新成功",
              timer: 1500,
              showConfirmButton: false,
            });
          });
        }
      });
    },
    // 列表刪除
    handleDelete(rows) {
      this.delrows("users", rows , this.getList);
    },
    // 分配角色
    async handleAccessRole(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.$api.roles.loadForUser(this.temp.id).then(async (response) => {
        this.selectRoles = response.result;
        await this.getRoleList();
        this.dialogRoleStatus = "update";
        this.dialogRoleVisible = true;
        this.$nextTick(() => {
          this.$refs["rolesForm"].clearValidate();
        });
      });
    },
    // 獲取角色
    getRoleList() {
      console.log("getRoleList");
      return new Promise((resolve)=>{
        this.$api.roles.getList({}).then((response) => {
          this.selectRoleNames = [...response.result]
            .filter((x) => this.selectRoles.indexOf(x.id) > -1)
            .map((item) => item.name || item.account)
            .join(",");
          resolve()
        });
      })
    },
    rolesChange(type, val) {
      if (type === "Texts") {
        this.selectRoleNames = val;
        return;
      }
      this.selectRoles = val;
    },
    selectionUserChange(val){
      console.log(val);
      this.selectRoles = val
    },
    acceRole() {
      console.log("acceRole");
      this.$api.accessObjs.assign({
        type: "UserRole",
        firstId: this.temp.id,
        secIds: this.selectRoles,
      })
      .then(() => {
        this.dialogRoleVisible = false;
        this.$swal.fire({
          icon: "success",
          title: "更新成功",
          timer: 1500,
          showConfirmButton: false,
        });
      });
    },
  },
};
</script>

<style>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.el-card__header {
  padding: 12px 20px;
}

.body-small.dialog-mini .el-dialog__body .el-form {
  padding-right: 0px;
  padding-top: 0px;
}
</style>
