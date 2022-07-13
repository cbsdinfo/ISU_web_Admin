<!--
 * @description: 用戶及角色選擇共用組件
 * @author: liyubao | xufuxing
 * @version: 1.0
 * @updateDate:2021-07-04
-->
<template>
  <div class="select-users-wrap" style="height: 100%">  
    <div class="flex-row" style="height: 100%">  
      <div class="part-box" v-if="loginKey === 'loginUser' && !orgId">
        <el-card shadow="never" class="body-small custom-card" style="height: 100%">
          <div slot="header" class="clearfix">
            <el-button type="text" style="padding: 0 11px" @click="getAllUsers">全部用戶>></el-button>
          </div>
          <el-tree :data="orgsTree" :expand-on-click-node="false" default-expand-all @node-click="handleNodeClick"> </el-tree>
        </el-card>
      </div>
      <div class="flex-item table-box">
        <!-- 關鍵字搜尋 -->
        <div class="flex-row" style="align-items: center" @keyup.13="handleSearch">
          <el-input size="mini" style="margin: 10px; width: 200px" placeholder="請輸入內容" v-model="searchKey">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">查詢</el-button>
          <div style="text-align: right; padding: 5px 10px" :title="names" v-if="names" class="flex-item ellipsis">當前選中：{{ names }}</div>
        </div>
        <!-- 帳號選擇 -->
        <!-- <el-table v-if="loginKey === 'loginUser'" @row-click="rowClick" @select="handleSelectionUser" @select-all="handleSelectionUser" ref="multipleTable" height="calc(100% - 52px - 36px)" :data="tableData.datas" tooltip-effect="dark" v-loading="tableData.loading" style="width: 100%; border-top: 1px solid #e4e4e4"> -->
        <el-table v-if="loginKey === 'loginUser'" @select="handleSelectionUser" @select-all="handleSelectionUser" ref="multipleTable" height="calc(100% - 52px - 36px)" :data="tableData.datas" tooltip-effect="dark" v-loading="tableData.loading" style="width: 100%; border-top: 1px solid #e4e4e4">  
          <el-table-column align="center" type="selection" width="55"> </el-table-column>

          <el-table-column align="center" min-width="80px" :label="'帳號'">
            <template slot-scope="scope">
              <span class="link-type">{{ scope.row.account }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" min-width="80px" :label="'姓名'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" :label="'所屬部門'">
            <template slot-scope="scope">
              <span>{{ scope.row.organizations }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" class-name="status-col" :label="'狀態'" width="100">
            <template slot-scope="scope">
              <span :class="scope.row.status | userStatusFilter">{{ statusOptions.find((u) => u.key == scope.row.status).display_name }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!--角色選擇-->
        <!-- <el-table ref="multipleTable" height="calc(100% - 52px - 36px)" v-else :data="tableData.datas" tooltip-effect="dark" v-loading="tableData.loading" border style="width: 100%" @row-click="rowClick" @select="handleSelectionUser" @select-all="handleSelectionUser"> -->
        <el-table v-else @select="handleSelectionUser" @select-all="handleSelectionUser" 
          ref="multipleTable" :data="tableData.datas" tooltip-effect="dark" v-loading="tableData.loading" border style="width: 100%"
        >  
          <el-table-column align="center" type="selection" width="55"> </el-table-column>
          <el-table-column align="center" min-width="50px" :label="'角色名稱'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" class-name="status-col" :label="'狀態'" width="100">
            <template slot-scope="scope">
              <span :class="scope.row.status | userStatusFilter">{{ statusOptions.find((u) => u.key == scope.row.status).display_name }}</span>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination :background="false" layout="prev, pager, next" :total="tableData.total" :page-size="tableData.listQuery.limit" @current-change="handlePageSearch" style="margin-top: 3px; text-align: right"> </el-pagination>
      </div>
    </div>
    <div style="text-align: right; margin-top: 10px" v-if="!hiddenFooter">
      <el-button size="small" type="cancel" @click="handleClose">取消</el-button>
      <el-button size="small" type="primary" @click="handleSaveUsers">確定</el-button>
    </div>
  </div>
</template>
<script>
import { listToTreeSelect, unique } from "@/utils";

export default {
  props: {
    ignoreAuth: Boolean,//是否忽略登入用戶權限，直接獲取全部數據,用於可以跨部門選擇用戶、角色的場景
    show: Boolean,
    loginKey: String,//如果為loginUser，則表示選擇用戶
    orgId: String,//如果不為空則顯示左邊樹狀結構
    hiddenFooter: Boolean,//是否隱藏【確定】按鈕,如果本頁面的【確定】按鈕被隱藏，父組件可以通過調用$ref.xxx.handleSaveUsers方法獲取改變後的值
    userNames: String,//初始選中的顯示文本（由逗號組成的串）
    users: Array,//初始選中項Id列表
  },
  data() {
    return {
      orgsTree: [],
      searchKey: "",
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
      tableData: {
        datas: [],
        total: 0,
        selectTexts: [],//外部傳進來的已選中項顯示文本
        selectIds: [],//外部傳進來的已選中項Id
        currentPageIds: [],//當前頁選擇的Id列表,為解決刪除選中項的時候使用
        currentPageTexts: [],//當前頁選擇的文本信息,為解決刪除選中項的時候使用
        loading: false,
        listQuery: {
          page: 1,
          limit: 10,
          orgId: "",
          key: undefined,
        },
      },
    };
  },
  computed: {
    names() {
      let names = "";
      if (this.tableData.selectTexts && this.tableData.selectTexts.length > 0) {
        names = [...this.tableData.selectTexts].join(",");
      }
      return names;
    },
  },
  filters: {
    userStatusFilter(status) {
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
    if (this.users) {
      this.tableData.selectIds = [...this.users];
      this.tableData.selectTexts = this.userNames && this.userNames.split(",");
    }
    this.loadData();
  },
  methods: {
    // 加載數據
    loadData(page) {
      this.tableData.listQuery.page = page || 1;
      if (this.loginKey === "loginUser") {
        (!this.leftTreeDatas || this.leftTreeDatas.length <= 0) && this.getLeftTree();
        this.getUserList();
        return;
      }
      this.getRoleList();
    }, 
    //獲取角色
    getRoleList() {
      this.tableData.loading = true;
      this.tableData.listQuery.key = this.searchKey;
      this.tableData.total = 0;

      if (this.ignoreAuth != undefined && this.ignoreAuth) {
        this.$api.roles.loadAll(this.tableData.listQuery).then((response) => {
          this.tableData.datas = response.data;
          this.tableData.total = response.count;

          this.initCurrentPageData();
          this.setSelectTable();
        });
      } else {
        this.$api.roles.getList(this.tableData.listQuery).then((response) => {
          this.tableData.datas = response.result;
          this.initCurrentPageData();
          this.setSelectTable();
        });
      }
    },
    // 獲取用戶
    getUserList() {
      this.tableData.loading = true;
      this.tableData.listQuery.key = this.searchKey;

      let queryFn = this.ignoreAuth ? this.$api.users.loadAll : this.$api.users.getList;

      queryFn(this.tableData.listQuery).then((response) => {
        this.tableData.datas = response.data;
        this.tableData.total = response.count;
        this.tableData.loading = false;

        this.initCurrentPageData();
        this.setSelectTable();
      });
    },
    //用後端返回的當前列表數據計算當前頁面的選中項信息
    initCurrentPageData() {
      this.tableData.currentPageIds = [...this.tableData.datas].filter((x) => this.tableData.selectIds.indexOf(x.id) > -1).map((item) => item.id);
      this.tableData.currentPageTexts = [...this.tableData.datas].filter((x) => this.tableData.selectTexts.indexOf(x.name) > -1).map((item) => item.name);
    },
    //設置界面列表選中
    setSelectTable() {
      this.$nextTick(() => {
        const rows = [...this.tableData.datas].filter((x) => [...this.tableData.currentPageIds].some((y) => y === x.id));
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
        this.tableData.loading = false;
      });
    },
    // 通過部門獲取用戶
    handleNodeClick(data) {
      this.tableData.listQuery.orgId = data.id;
      this.tableData.listQuery.page = 1;
      this.getUserList();
    },
    // 搜尋用戶/角色
    handleSearch() {
      this.loadData();
    },
    // 獲取全部用戶
    getAllUsers() {
      this.tableData.listQuery.orgId = "";
      this.tableData.listQuery.page = 1;
      this.getUserList();
    },
    // 分頁查詢用戶/角色
    handlePageSearch(val) {
      this.loadData(val);
    },
    handleClose() {
      this.$emit("update:show", false);
    },
    //獲取左邊樹狀結構數據（通常是部門）
    getLeftTree() {
      this.$api.login.getOrgs().then((response) => {
        this.leftTreeDatas = response.result.map(function (item) {
          return {
            id: item.id,
            label: item.name,
            parentId: item.parentId || null,
          };
        });
        var orgstmp = JSON.parse(JSON.stringify(this.leftTreeDatas));
        this.orgsTree = listToTreeSelect(orgstmp);
      });
    },
    // 確認用戶選擇
    handleSaveUsers() {
      const names = this.tableData.selectTexts && this.tableData.selectTexts.join(",");
      this.$emit("update:userNames", names);
      this.$emit("update:users", this.tableData.selectIds);
      this.$emit("update:show", false);
    },
    // 選擇用戶
    handleSelectionUser(val) {
      //先判定被刪除的
      var delIds = this.tableData.currentPageIds.filter((x) => val.map((u) => u.id).indexOf(x) < 0);
      if (delIds.length > 0) {
        this.tableData.selectIds = this.tableData.selectIds.filter((x) => delIds.indexOf(x) < 0);
      }

      var delTexts = this.tableData.currentPageTexts.filter((x) => val.map((u) => u.name).indexOf(x) < 0);
      if (delTexts.length > 0) {
        this.tableData.selectTexts = this.tableData.selectTexts.filter((x) => delTexts.indexOf(x) < 0);
      }

      this.tableData.currentPageIds = val.map((item) => item.id);
      this.tableData.currentPageTexts = val.map((item) => item.name);

      //合併已選中的項和新增的項
      this.tableData.selectIds = unique([...this.tableData.selectIds, ...this.tableData.currentPageIds]);
      this.tableData.selectTexts = unique([...this.tableData.selectTexts, ...this.tableData.currentPageTexts]);
      this.$emit("selectionUserChange",this.tableData.selectIds)
    },
    //點擊table的row任何一個地方都會觸發的事件,目前不在table讓使用者觸發,考量太多額外操作,要點擊就點checkbox就好
    rowClick(row) {
      this.$refs.multipleTable.clearSelection();
      this.$refs.multipleTable.toggleRowSelection(row);
      this.tableData.selectTexts = [row].map((item) => item.name || item.account);
      this.tableData.currentPageTexts = [row].map((item) => item.name || item.account);
      this.tableData.selectIds = [row].map((item) => item.id);
      this.tableData.currentPageIds = [row].map((item) => item.id);
    },
  },
};
</script>
<style lang="scss">
.select-users-wrap {
  .part-box {
    border: none;
  }

  .table-box {
    border: 1px solid #e4e4e4;
    border-left: 0;
  }

  .custom-card {
    height: 100%;

    .el-card__body {
      height: calc(100% - 34px);
      overflow: auto;
    }
  }

  .flex-item {
    overflow: hidden;
  }
}
</style>
