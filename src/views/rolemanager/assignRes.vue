<template>
  <div class="compent-dialog-body">
    <div class="content">
      <el-input size="small" @keyup.enter.native="handleFilter" style="width: 200px" class="filter-item" :placeholder="'請輸入關鍵字'" v-model="listQuery.key"> </el-input>

      <el-select clearable size="small" class="filter-item" style="width: 130px" v-model="listQuery.appId" :placeholder="'所屬應用'">
        <el-option v-for="item in apps" :key="item.id" :label="item.name + '(' + item.id + ')'" :value="item.id"> </el-option>
      </el-select>

      <el-button class="filter-item" size="small" v-waves icon="el-icon-search" @click="handleFilter">搜尋</el-button>

      <el-table class="table" ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" @row-click="rowClick" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55"> </el-table-column>

        <el-table-column :label="'Id'" min-width="120px">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="80px" :label="'名稱'">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column width="120px" :label="'所屬應用'">
          <template slot-scope="scope">
            <span>{{ scope.row.appName }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="150px" :label="'描述'">
          <template slot-scope="scope">
            <span style="color: red">{{ scope.row.description }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
    </div>
    <div class="el-dialog__footer">
      <el-button size="mini" @click="close">取消</el-button>
      <el-button size="mini" type="primary" @click="submit">確認</el-button>
    </div>
  </div>
</template>

<script>
import waves from "@/directive/waves"; // 水波紋指令
import Pagination from "@/components/Pagination";

export default {
  name: "assign-res",
  components: {
    Pagination,
  },
  directives: {
    waves,
  },
  props: ["roleId"],
  data() {
    return {
      multipleSelection: [], // 列表checkbox選中的值
      currentRoleId: this.roleId,
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
      apps: [],
    };
  },
  created() {
    this.getList();
    this.$api.applications.getList().then((response) => {
      this.apps = response.data;
    });
  },
  methods: {
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    getList() {
      const _this = this;
      this.listLoading = true;
      this.$api.resources.getList(this.listQuery).then((response) => {
        this.list = response.data;
        this.total = response.count;
        // 加載角色已經分配的資源
        this.$api.resources.loadForRole(_this.roleId).then((response) => {
          response.result.forEach((row) => {
            // 直接用這個竟然不行！！_this.$refs.mainTable.toggleRowSelection(row)
            const sel = _this.list.find((u) => u.id === row.id);
            if (sel !== undefined && sel != null) {
              _this.$refs.mainTable.toggleRowSelection(sel);
            }
          });
        });
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    close() {
      this.$emit("close");
    },
    submit() {
      // 提交結果
      this.$api.accessobjs
        .assign({
          type: "RoleResource",
          firstId: this.roleId,
          secIds: this.multipleSelection.map((u) => u.id),
        })
        .then(() => {
          this.$swal.fire({
            icon: "success",
            title: "分配成功",
            timer: 1500,
            showConfirmButton: false,
          });
        });

      this.close();
    },
  },
};
</script>
