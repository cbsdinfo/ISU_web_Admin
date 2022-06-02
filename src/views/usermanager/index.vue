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

              <el-table-column :label="'Id'" v-if="showDescription" min-width="120px">
                <template slot-scope="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'帳號'">
                <template slot-scope="scope">
                  <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.account }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'姓名'">
                <template slot-scope="scope">
                  <span>{{ scope.row.name }}</span>
                </template>
              </el-table-column>

              <el-table-column width="120px" :label="'所屬部門'">
                <template slot-scope="scope">
                  <span>{{ scope.row.organizations }}</span>
                </template>
              </el-table-column>
              <el-table-column min-width="150px" v-if="showDescription" :label="'描述'">
                <template slot-scope="scope">
                  <span style="color: red">{{ scope.row.description }}</span>
                </template>
              </el-table-column>

              <el-table-column class-name="status-col" :label="'狀態'" width="100">
                <template slot-scope="scope">
                  <span :class="scope.row.status | statusFilter">{{ statusOptions.find((u) => u.key == scope.row.status).display_name }}</span>
                </template>
              </el-table-column>

              <el-table-column align="center" :label="'操作'" width="230" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">編輯</el-button>
                  <el-button v-if="scope.row.status == 1" size="mini" type="danger" @click="handleModifyStatus(scope.row, 0)">停用</el-button>
                  <el-button v-else size="mini" type="success" @click="handleModifyStatus(scope.row, 1)">啟用</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
          </div>
        </el-col>
      </el-row>

      <el-dialog class="dialog-mini" width="500px" v-el-drag-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
          <el-form-item size="small" :label="'Id'" prop="id" v-show="dialogStatus == 'update'">
            <el-input v-model="temp.id" :disabled="true" size="small" placeholder="系統自動處理"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'帳號'" prop="account">
            <el-input v-model="temp.account"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'姓名'">
            <el-input v-model="temp.name"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'密碼'">
            <el-input v-model="temp.password" :placeholder="dialogStatus == 'update' ? '如果為空則不修改密碼' : '如果為空則預設與帳號相同'"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'狀態'">
            <el-select class="filter-item" v-model="temp.status" placeholder="Please select">
              <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item size="small" :label="'所屬機構'">
            <treeselect v-if="dialogFormVisible" :options="orgsTree" :default-expand-level="3" :multiple="true" :flat="true" :open-on-click="true" :open-on-focus="true" :clear-on-select="true" v-model="selectOrgs"></treeselect>
          </el-form-item>
          <el-form-item size="small" :label="'描述'">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="Please input" v-model="temp.description"> </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
          <el-button size="mini" v-if="dialogStatus == 'create'" type="primary" @click="createData">確認</el-button>
          <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button>
        </div>
      </el-dialog>

      <el-dialog width="516px" class="dialog-mini body-small" v-el-drag-dialog :title="'分配角色'" :visible.sync="dialogRoleVisible">
        <el-form ref="rolesForm" size="small" v-if="dialogRoleVisible" label-position="left">
          <el-form-item>
            <select-roles :roles="selectRoles" :userNames="selectRoleNames" v-on:roles-change="rolesChange"></select-roles>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogRoleVisible = false">取消</el-button>
          <el-button size="mini" type="primary" @click="acceRole">確認</el-button>
        </div>
      </el-dialog>
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
import SelectRoles from "@/components/SelectRoles";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";

export default {
  name: "user",
  components: {
    Sticky,
    permissionBtn,
    Treeselect,
    SelectRoles,
    Pagination,
  },
  mixins: [extend],
  directives: {
    waves,
    elDragDialog,
  },
  data() {
    return {
      defaultProps: {
        // tree配置項
        children: "children",
        label: "label",
      },
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        orgId: "",
        key: undefined,
      },
      apps: [],
      statusOptions: [
        {
          key: 0,
          display_name: "停用",
        },
        {
          key: 1,
          display_name: "正常",
        },
      ],
      showDescription: false,
      orgs: [], // 用戶可訪問到的組織列表
      orgsTree: [], // 用戶可訪問到的所有機構組成的樹
      selectRoles: [], // 用戶分配的角色
      selectRoleNames: "",
      temp: {
        id: undefined,
        description: "",
        organizations: "",
        organizationIds: "",
        account: "",
        name: "",
        password: "",
        status: 1,
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        create: "新增",
      },
      dialogRoleVisible: false, // 分配角色對話框
      rules: {
        account: [
          {
            required: true,
            message: "帳號不能為空",
            trigger: "blur",
          },
        ],
      },
      downloadLoading: false,
    };
  },
  computed: {
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
  mounted() {
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
        default:
          break;
      }
    },
    getList() {
      this.listLoading = true;
      this.$api.users.getList(this.listQuery).then((response) => {
        this.list = response.data;
        this.total = response.count;
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
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
                  title: `${status === 1 ? "停用" : "啟用"}成功`,
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
    // 保存提交
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$api.users.add(this.temp).then((response) => {
            this.temp.id = response.result;
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$swal.fire({
              icon: "success",
              title: "創建成功",
              timer: 1500,
              showConfirmButton: false,
            });
          });
        }
      });
    },
    // 彈出編輯框
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
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
          const tempData = Object.assign({}, this.temp);
          this.$api.users.update(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.temp);
                break;
              }
            }
            this.dialogFormVisible = false;
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
    // 多行刪除
    handleDelete(rows) {
      this.delrows("users", rows);
    },
    // 分配角色
    handleAccessRole(row) {
      const _this = this;
      this.temp = Object.assign({}, row); // copy obj
      this.$api.roles.loadForUser(this.temp.id).then((response) => {
        _this.dialogRoleStatus = "update";
        _this.dialogRoleVisible = true;
        _this.selectRoles = response.result;
        _this.getRoleList();
        _this.$nextTick(() => {
          _this.$refs["rolesForm"].clearValidate();
        });
      });
    },
    // 獲取角色
    getRoleList() {
      this.$api.roles.getList({}).then((response) => {
        this.selectRoleNames = [...response.result]
          .filter((x) => this.selectRoles.indexOf(x.id) > -1)
          .map((item) => item.name || item.account)
          .join(",");
      });
    },
    rolesChange(type, val) {
      if (type === "Texts") {
        this.selectRoleNames = val;
        return;
      }
      this.selectRoles = val;
    },
    acceRole() {
      this.$api.accsssobjs
        .assign({
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
