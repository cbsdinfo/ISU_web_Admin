<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'名稱'" v-model="listQuery.key"> </el-input>

        <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <auth-table style="height: calc(100% - 60px)" ref="multipleTable" :select-type="'null'" :table-fields="headerList" :data="list" :v-loading="listLoading" @row-click="rowClick" @selection-change="handleSelectionChange"></auth-table>

        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";
import AuthTable from "@/components/Base/AuthTable";
import ColumnDefine from "@/interface/columnDefine";

export default {
  name: "sysLog",
  components: {
    Sticky,
    permissionBtn,
    Pagination,
    AuthTable,
  },
  mixins: [extend],
  directives: {
    waves,
    elDragDialog,
  },
  data() {
    return {
      headerList: [], // 主列表列定義
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
        appId: undefined,
      },
    };
  },
  filters: {
    statusFilter(disable) {
      const statusMap = {
        false: "color-success",
        true: "color-danger",
      };
      return statusMap[disable];
    },
  },
  created() {
    this.headerList = [
      new ColumnDefine("content", "內容", true, true, "text", "", "string", "varchar", ""),
      new ColumnDefine("typeName", "分類", true, true, "text", "", "string", "varchar", ""),
      new ColumnDefine("href", "模塊", true, true, "textarea", "", "string", "varchar", ""),

      new ColumnDefine("result", "是否異常", true, true, "select", "COMMON_STATUS", "int", "tinyint", ""),

      new ColumnDefine("application", "應用", true, true, "text", "", "string", "varchar", ""),
      new ColumnDefine("createName", "操作人", true, true, "textarea", "", "string", "varchar", ""),
      new ColumnDefine("createTime", "時間", true, true, "textarea", "", "string", "varchar", ""),
    ];
  },
  mounted() {
    this.getList();
  },
  methods: {
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onBtnClicked: function (domId) {
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
          this.delrows("syslogs", this.multipleSelection);
          break;
        default:
          break;
      }
    },
    getList() {
      this.listLoading = true;
      this.$api.syslogs.getList(this.listQuery).then((response) => {
        console.log(response);
        this.list = response.data;
        this.total = response.count;
        this.listLoading = false;
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
  },
};
</script>

<style>
.dialog-mini .el-select {
  width: 100%;
}
</style>
