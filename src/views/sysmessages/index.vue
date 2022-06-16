<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'名稱'" v-model="listQuery.key"> </el-input>

        <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜尋</el-button>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" height="calc(100% - 52px)" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" @row-click="rowClick" @selection-change="handleSelectionChange">
          <el-table-column min-width="50px" :label="'消息分類'">
            <template slot-scope="scope">
              <span>{{ scope.row.typeName }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="50px" :label="'發送人'">
            <template slot-scope="scope">
              <span>{{ scope.row.fromName }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="80px" :label="'狀態'">
            <template slot-scope="scope">
              <el-tag type="danger" v-if="scope.row.toStatus == 0">未讀</el-tag>
              <el-tag v-if="scope.row.toStatus == 1">已讀</el-tag>
            </template>
          </el-table-column>
          <el-table-column min-width="180px" :label="'消息內容'">
            <template slot-scope="scope">
              <span>{{ scope.row.content }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'消息時間'">
            <template slot-scope="scope">
              <span>{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" :label="'操作'" width="230" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" v-if="scope.row.toStatus == 0" @click="handleRead(scope.row)">標記已讀 </el-button>
              <el-button type="danger" size="mini" @click="handleDelete([scope.row])">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
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

export default {
  name: "sysMessage",
  components: {
    Sticky,
    permissionBtn,
    Pagination,
  },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [extend],
  data() {
    return {
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        status: 999, //999為全部，0為未讀，1為已讀
        key: undefined,
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
      console.log("you click:" + domId);
      switch (domId) {
        case "btnEdit":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          this.handleRead(this.multipleSelection[0]);
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
      this.$api.sysmessages.getList(this.listQuery).then((response) => {
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
    handleRead(row) {
      //標記已讀
      this.$api.sysmessages
        .read({
          id: row.id,
        })
        .then(() => {
          for (const v of this.list) {
            if (v.id === row.id) {
              v.toStatus = 1; //標記界面已讀
              break;
            }
          }
        });
    },

    handleDelete(rows) {
      // 邏輯刪除
      this.delrows("sysmessages", rows);
    },
  },
};
</script>

<style>
.dialog-mini .el-select {
  width: 100%;
}
</style>