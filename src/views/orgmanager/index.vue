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
      <el-row style="height: 100%">
        <el-col :span="4" style="height: 100%; border: 1px solid #ebeef5">
          <el-card shadow="never" class="body-small" style="height: 100%; overflow: auto">
            <div slot="header" class="clearfix">
              <el-button type="text" style="padding: 0 11px" @click="getAllOrgs">所有機構>></el-button>
            </div>

            <el-tree :data="orgsTree" :expand-on-click-node="false" default-expand-all :props="defaultProps" @node-click="handleNodeClick"></el-tree>
          </el-card>
        </el-col>
        <el-col :span="20" style="height: 100%">
          <div class="bg-white" style="height: 100%">
            <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)" @row-click="rowClick" @selection-change="handleSelectionChange">
              <el-table-column type="selection" align="center" width="55"> </el-table-column>

              <el-table-column :label="'Id'" v-if="showDescription" min-width="120px">
                <template slot-scope="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'層級ID'">
                <template slot-scope="scope">
                  <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.cascadeId }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'名稱'">
                <template slot-scope="scope">
                  <span>{{ scope.row.name }}</span>
                </template>
              </el-table-column>

              <el-table-column width="120px" :label="'上級部門'">
                <template slot-scope="scope">
                  <span>{{ scope.row.parentName }}</span>
                </template>
              </el-table-column>

              <el-table-column class-name="status-col" :label="'狀態'" width="100">
                <template slot-scope="scope">
                  <span :class="scope.row.status | statusFilter">{{ statusOptions.find((u) => u.key == scope.row.status).display_name }}</span>
                </template>
              </el-table-column>

              <el-table-column align="center" :label="'操作'" width="150" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">編輯</el-button>
                  <el-button v-if="scope.row.status == 0" size="mini" type="danger" @click="handleModifyStatus(scope.row, 1)">停用</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
          </div>
        </el-col>
      </el-row>

      <el-dialog v-el-drag-dialog class="dialog-mini" width="500px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
          <el-form-item size="small" :label="'Id'" prop="id" v-show="dialogStatus == 'update'">
            <span>{{ temp.id }}</span>
          </el-form-item>
          <el-form-item size="small" :label="'層級ID'" v-show="dialogStatus == 'update'">
            <span>{{ temp.cascadeId }}</span>
          </el-form-item>
          <el-form-item size="small" :label="'名稱'" prop="name">
            <el-input v-model="temp.name"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'狀態'">
            <el-select class="filter-item" v-model="temp.status" placeholder="Please select">
              <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item size="small" :label="'上級機構'">
            <treeselect ref="orgsTree" :options="mechOrgsTree" :default-expand-level="3" :multiple="false" :open-on-click="true" :open-on-focus="true" :clear-on-select="true" v-model="selectOrgs"></treeselect>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
          <el-button size="mini" v-if="dialogStatus == 'create'" type="primary" @click="createData">確認</el-button>
          <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button>
        </div>
      </el-dialog>
      <!-- 新增角色用戶 -->
      <el-dialog class="dialog-mini user-dialog" v-el-drag-dialog :title="'分配用戶'" :visible.sync="roleUsers.dialogUserResource">
        <selectUsersCom ref="selectUser" v-if="roleUsers.dialogUserResource" :orgId="multipleSelection[0].id" :hiddenFooter="true" :loginKey="'loginUser'" :users.sync="assignedUserIds" :userNames="roleUsers.rowIndex > -1 && roleUsers.list[roleUsers.rowIndex].map((u) => u.name || u.account).join(',')"> </selectUsersCom>
        <div style="text-align: right" slot="footer">
          <el-button size="small" type="cancel" @click="roleUsers.dialogUserResource = false">取消</el-button>
          <el-button size="small" type="primary" @click="handleSaveUsers">確定</el-button>
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
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import selectUsersCom from "@/components/SelectUsersCom";
import extend from "@/extensions/delRows.js";

export default {
  name: "org",
  components: {
    Sticky,
    permissionBtn,
    Treeselect,
    Pagination,
    selectUsersCom,
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
      subLists: [],
      total: 0,
      currentOrgId: "",
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
          key: 1,
          display_name: "停用",
        },
        {
          key: 0,
          display_name: "正常",
        },
      ],
      showDescription: false,
      orgs: [], // 用戶可訪問到的組織列表
      orgsTree: [], // 用戶可訪問到的所有機構組成的樹
      temp: {
        id: undefined,
        cascadeId: "",
        parentName: "",
        parentId: null,
        name: "",
        status: 0,
      },
      dialogFormVisible: false,
      chkRoot: false, // 根節點是否選中
      treeDisabled: true, // 樹選擇框時候可用
      dialogStatus: "",
      textMap: {
        update: "編輯",
        create: "新增",
      },
      rules: {
        name: [
          {
            required: true,
            message: "名稱不能為空",
            trigger: "blur",
          },
        ],
      },
      downloadLoading: false,
      selectOrgs: "",
      /**
       * 組織已分配的用戶ID
       */
      assignedUserIds: [],
      roleUsers: {
        dialogUserResource: false,
        Texts: "",
        rowIndex: -1,
        selectUsers: [],
        list: [],
      },
    };
  },
  watch: {
    selectOrgs() {
      if (this.selectOrgs === undefined || this.selectOrgs === null || this.selectOrgs === "") {
        // 如果是根節點
        this.temp.parentName = "根節點";
        this.temp.parentId = "";
        this.isRoot = true;
        return;
      }
      this.isRoot = false;
      this.temp.parentId = this.selectOrgs;
      var parentname = this.orgs.find((val) => {
        return this.selectOrgs === val.id;
      }).label;
      this.temp.parentName = parentname;
    },
  },
  computed: {
    mechOrgsTree() {
      const arr = [
        {
          id: "",
          label: "根節點",
          parentId: null,
        },
      ];
      return arr.concat(this.orgsTree);
    },
    isRoot: {
      get() {
        return this.chkRoot;
      },
      set(v) {
        this.chkRoot = v;
        if (v) {
          this.temp.parentName = "根節點";
          this.temp.parentId = "";
        }
        this.treeDisabled = v;
      },
    },
  },
  filters: {
    statusFilter(status) {
      var res = "color-success";
      switch (status) {
        case 1:
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
    this.getOrgTree();
  },
  methods: {
    loadRoleUsers() {
      var _this = this;
      this.isLoading = true;
      this.$api.users
        .LoadByOrg({
          page: 1,
          limit: 99999,
          orgId: _this.multipleSelection[0].id,
        })
        .then((response) => {
          this.roleUsers.dialogUserResource = true;
          _this.roleUsers.list[this.roleUsers.rowIndex] = response.data || [];
          _this.assignedUserIds = _this.roleUsers.list[this.roleUsers.rowIndex].map((u) => u.id);
        });
    },
    handleSaveUsers() {
      this.$refs.selectUser.handleSaveUsers();
      const postData = {
        orgId: this.multipleSelection[0].id,
        userIds: this.assignedUserIds || [],
      };
      this.$api.orgs.AssignOrgUsers(postData).then(() => {
        this.$message.success("新增成功");
        this.roleUsers.dialogUserResource = false;
      });
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    handleNodeClick(data) {
      this.currentOrgId = data.id;
      this.getList();
    },
    getAllOrgs() {
      this.currentOrgId = "";
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
        case "btnAssignOrgUser":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          this.roleUsers.rowIndex = this.list.findIndex((item) => item.id === this.multipleSelection[0].id);
          this.loadRoleUsers();
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
        default:
          break;
      }
    },
    getList() {
      this.listLoading = true;
      this.$api.login
        .getSubOrgs({
          orgId: this.currentOrgId,
          limit: this.listQuery.limit,
          page: this.listQuery.page,
        })
        .then((response) => {
          this.subLists = Object.assign([], response.data);
          this.total = response.count;
          this.listLoading = false;
          this.pageSubOrgs();
        });
    },
    pageSubOrgs() {
      this.list = this.subLists.slice((this.listQuery.page - 1) * this.listQuery.limit, this.listQuery.page * this.listQuery.limit);
      this.roleUsers.selectUsers = this.list.map(() => {
        return { users: [], Texts: "" };
      });
    },
    getOrgTree() {
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
      this.pageSubOrgs();
    },
    handleModifyStatus(row, status) {
      // 模擬修改狀態
      this.$message({
        message: "操作成功",
        type: "success",
      });
      row.status = status;
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        cascadeId: "",
        parentName: "根節點",
        parentId: "",
        name: "",
        status: 0,
      };
    },
    handleCreate() {
      // 彈出新增框
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.selectOrgs = "";
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      // 保存提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$api.orgs.add(this.temp).then((response) => {
            // 需要回填數據庫生成的數據
            this.temp.id = response.result.id;
            this.temp.cascadeId = response.result.cascadeId;
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;

            this.$swal
              .fire({
                icon: "success",
                title: "創建成功",
                timer: 1500,
                showConfirmButton: false,
              })
              .then(() => {
                this.getOrgTree();
              });
          });
        }
      });
    },
    handleUpdate(row) {
      // 彈出編輯框
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.selectOrgs = this.temp.parentId;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      // 更新提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          this.$api.orgs.update(tempData).then(() => {
            this.dialogFormVisible = false;
            this.$swal
              .fire({
                icon: "success",
                title: "更新成功",
                timer: 1500,
                showConfirmButton: false,
              })
              .then(() => {
                this.getOrgTree();
                for (const v of this.list) {
                  if (v.id === this.temp.id) {
                    const index = this.list.indexOf(v);
                    this.list.splice(index, 1, this.temp);
                    break;
                  }
                }
              });
          });
        }
      });
    },
    handleDelete(rows) {
      // 多行刪除
      this.delrows("orgs", rows, this.getOrgTree);
    },
  },
};
</script>

<style lang="scss" scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.el-select.filter-item.el-select--small {
  width: 100%;
}
/deep/ .user-dialog {
  .el-dialog {
    height: 70%;
    .el-icon-close {
      padding-top: 10px;
    }
    .el-dialog__body {
      height: calc(100% - 35px - 40px);
    }
    .el-dialog__headerbtn {
      top: 0;
    }
  }
}
</style>
