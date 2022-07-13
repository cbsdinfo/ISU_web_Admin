<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" prefix-icon="el-icon-search" size="small" style="width: 200px; margin-bottom: 0" class="filter-item" :placeholder="'關鍵字'" v-model="listQuery.key"> </el-input>

        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>

        <el-checkbox size="small" style="margin-left: 15px" @change="tableKey = tableKey + 1" v-model="showDescription">Id/描述</el-checkbox>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <div class="bg-white fh">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)" @row-click="rowClick" @selection-change="handleSelectionChange">
          <el-table-column align="center" type="selection" width="55"> </el-table-column>

          <el-table-column :label="'Id'" v-if="showDescription" min-width="120px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="50px" :label="'角色名稱'" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="300px" :label="'用戶列表'">
            <template slot-scope="scope" v-if="list.length > 0">
              <role-users ref="roleUser" :role-id="scope.row.id" :selectUsers.sync="roleUsers.list[scope.$index]"></role-users>
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
              <el-button v-if="scope.row.status === 1 && hasButton('btnDisEnable')" @click="handleModifyStatus(scope.row, 0)" size="mini" type="danger">停用</el-button>
              <el-button v-if="scope.row.status === 0 && hasButton('btnEnable')" @click="handleModifyStatus(scope.row, 1)" size="mini" type="success">啟用</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>

      <!-- dialog -->
      <el-dialog width="500px" class="dialog-mini" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
          <el-form-item size="small" :label="'Id'" prop="id" v-show="dialogStatus == 'update'">
            <el-input v-model="temp.id" :disabled="true" placeholder="系統自動處理"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'角色名稱'" prop="name">
            <el-input v-model="temp.name"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'狀態'">
            <el-select class="filter-item" v-model="temp.status" placeholder="Please select">
              <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key"> </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
          <el-button size="small" v-if="dialogStatus == 'create'" type="primary" @click="createData">確認</el-button>
          <el-button size="small" v-else type="primary" @click="updateData">確認</el-button>
        </div>
      </el-dialog>
      <!--只有這麼寫dialog，才能正常觸發ESC關閉-->
      <el-dialog class="dialog-mini" ref="accessModulesDlg" :title="accessTitle" :visible.sync="dialogAccessModules" :close-on-click-modal="false" :close-on-press-escape="false">
        <access-modules ref="accessModules" v-if="dialogAccessModules" :role-id="multipleSelection[0].id" @change-title="changeTitle" @close="dialogAccessModules = false"></access-modules>
      </el-dialog>

      <el-dialog class="dialog-mini" :title="'為角色分配資源'" :visible.sync="dialogAccessResource" :close-on-click-modal="false" :close-on-press-escape="false">
        <access-resource ref="accessResource" v-if="dialogAccessResource" :role-id="multipleSelection[0].id" @close="dialogAccessResource = false"></access-resource>
      </el-dialog>
      <!-- 新增角色用戶 -->
      <el-dialog class="dialog-mini user-dialog" :title="'為角色分配帳號'" :visible.sync="roleUsers.dialogUserResource" :close-on-click-modal="false" :close-on-press-escape="false">
        <selectUsersCom ref="selectUser" v-if="roleUsers.dialogUserResource" :hiddenFooter="true" :loginKey="'loginUser'" :users.sync="assignedUserIds" :userNames="roleUsers.rowIndex > -1 && roleUsers.list[roleUsers.rowIndex].map((u) => u.name || u.account).join(',')"> </selectUsersCom>
        <div style="text-align: right" slot="footer">
          <el-button size="small" type="cancel" @click="roleUsers.dialogUserResource = false">取消</el-button>
          <el-button size="small" type="primary" @click="handleSaveUsers">確定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import pbMixins from "@/mixins/permissionBtn.js";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import RoleUsers from "@/components/RoleUsers";
import permissionBtn from "@/components/PermissionBtn";
import accessModules from "@/components/AccessModules";
import accessResource from "./assignRes";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import selectUsersCom from "@/components/SelectUsersCom";
import extend from "@/extensions/delRows.js";

export default {
  name: "role",
  components: {
    RoleUsers,
    Sticky,
    permissionBtn,
    accessModules,
    accessResource,
    Pagination,
    selectUsersCom,
  },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [extend,pbMixins],
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
      roleList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
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
          display_name: "啟用",
        },
      ],
      showDescription: false,
      temp: {
        id: undefined,
        organizations: "",
        organizationIds: "",
        name: "",
        status: 0,
      },
      dialogAccessModules: false, // 角色分配模塊對話框
      dialogAccessResource: false, // 分配資源對話框
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        create: "新增",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [
          {
            required: true,
            message: "帳號不能為空",
            trigger: "blur",
          },
        ],
      },
      downloadLoading: false,
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
      accessTitle: "為角色分配模塊菜單",
    };
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
  mounted() {
    this.getList();
  },
  methods: {
    changeTitle(val) {
      // 自動調整對話框標題
      this.accessTitle = val;
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    getAllroles() {
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onBtnClicked: function (domId) {
      console.log(domId);
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
        case "btnAccessModule":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          if (this.multipleSelection[0].status === 0) {
            this.$message({
              message: "所選角色目前為停用狀態,無法為角色分配模塊",
              type: "error",
            });
            return;
          }

          this.dialogAccessModules = true;
          break;
        case "btnAssignReource":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }

          this.dialogAccessResource = true;
          break;
        case "btnRoleAccessUser":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行分配",
              type: "error",
            });
            return;
          }
          this.roleUsers.rowIndex = this.list.findIndex((item) => item.id === this.multipleSelection[0].id);
          this.assignedUserIds = this.roleUsers.list[this.roleUsers.rowIndex].map((u) => u.id);

          this.roleUsers.dialogUserResource = true;
          break;
        default:
          break;
      }
    },
    handleSaveUsers() {
      this.$refs.selectUser.handleSaveUsers();
      const postData = {
        roleId: this.multipleSelection[0].id,
        userIds: this.assignedUserIds || [],
      };
      this.$api.roles.AssignRoleUsers(postData).then(() => {
        this.$message.success("新增成功");
        this.roleUsers.dialogUserResource = false;
        this.getList();
      });
    },
    getList() {
      this.listLoading = true;
      this.list = [];
      this.$api.roles.getList(this.listQuery).then((response) => {
        this.roleList = response.result;
        this.total = response.result.length;
        this.listLoading = false;
        this.pageFn();
      });
    },
    pageFn() {
      this.list = this.roleList.slice((this.listQuery.page - 1) * this.listQuery.limit, this.listQuery.page * this.listQuery.limit);
      this.roleUsers.selectUsers = this.list.map(() => {
        return { users: [], Texts: "" };
      });
      this.roleUsers.list = this.list.map(() => []);
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.list = [];
      setTimeout(() => {
        this.pageFn();
      });
    },
    // 模擬修改狀態
    handleModifyStatus(row, status) {
      this.$swal.fire({
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
          console.log(params);
          this.$api.roles.update(params).then((res) => {
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
      // this.$message({
      //   message: "操作成功",
      //   type: "success",
      // });
      // row.status = status;
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        organizations: "",
        organizationIds: "",
        name: "",
        status: 0,
      };
    },
    handleCreate() {
      // 彈出新增框
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      // 保存提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$api.roles.add(this.temp).then((response) => {
            this.roleUsers.list.unshift([]);
            this.temp.id = response.result.id;
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
    handleUpdate(row) {
      // 彈出編輯框
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      // 更新提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          this.$api.roles.update(tempData).then(() => {
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
     // 列表刪除
    handleDelete(rows) {
      this.delrows("roles", rows, this.getList);
    },
    // 列表刪除
    // handleDelete(rows) {
    //   this.$api.roles.del(rows.map((u) => u.id)).then(() => {
    //     this.$swal
    //       .fire({
    //         icon: "success",
    //         title: "刪除成功",
    //         timer: 1500,
    //         showConfirmButton: false,
    //       })
    //       .then(() => {
    //         rows.forEach((row) => {
    //           const index = this.list.indexOf(row);
    //           this.list.splice(index, 1);
    //           this.roleUsers.list.splice(index, 1);
    //         });
    //       });
    //   });
    // },
  },
};
</script>

<style lang="scss">
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

.user-dialog {
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
