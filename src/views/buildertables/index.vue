<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'名稱'" v-model="firstQuery.key"> </el-input>
        <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item flex-column">
      <div class="flex-item">
        <el-card shadow="nerver" class="demo-card fh">
          <auth-table style="height: calc(100% - 52px)" ref="mainTable" :select-type="'radio'" :table-fields="firstHeaderList" :data="mainList" :v-loading="listLoading" @row-click="rowClickFirstTable"></auth-table>
          <pagination v-show="firstTotal > 0" :total="firstTotal" :page.sync="firstQuery.page" :limit.sync="firstQuery.limit" @pagination="handleCurrentChange" />
        </el-card>
      </div>
      <el-row class="flex-item">
        <el-col :span="showTitleDialog ? 12 : 0" class="fh form-card">
          <el-card shadow="nerver" class="demo-card fh">
            <div slot="header">
              <span v-if="radio == ''">表信息</span>
              <span v-else>{{ tableName }}表信息</span>
            </div>
            <auth-form ref="dataForm" :rules="mainRules" :edit-model="editModel" :form-fields="firstHeaderList" v-model="firstTemp" :col-num="3"></auth-form>
          </el-card>
        </el-col>

        <!-- 第二部分多選 -->
        <el-col :span="!showTitleDialog ? 24 : 12" class="fh detail-card">
          <el-card shadow="nerver" class="demo-card fh" id="secondCard">
            <div slot="header">
              <i class="show-title-button" :class="showTitleDialog ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'" :title="showTitleDialog ? '展開' : '收縮'" @click="showTitleDialog = !showTitleDialog"></i>
              <span v-if="radio == ''">表字段信息（修改後，編輯框內迴車生效）</span>
              <span v-else>{{ tableName }}表字段信息（修改後，編輯框內迴車生效）</span>
              <div class="edit-buttons">
                <el-button class="filter-item edit-button" size="mini" v-waves icon="el-icon-refresh" @click="onBtnClicked('btnSync')">同步結構</el-button>
                <el-button v-if="editModel" class="filter-item edit-button delete-button" size="mini" v-waves icon="el-icon-delete" @click="onBtnClicked('btnDelDetail')">刪除</el-button>
              </div>
            </div>
            <auth-table style="height: calc(100% - 52px - 34px)" ref="secondTable" border :editModel="editModel" :table-fields="secondHeaderList" :data="secondList" @row-click="rowClickSecondTable" @selection-change="selChangeSecondTable" @item-change="handleUpdateDetail"></auth-table>
            <pagination v-show="secondTotal > 0" :total="secondTotal" :page.sync="secondQuery.page" :limit.sync="secondQuery.limit" @pagination="handleSecondPage" />
          </el-card>
        </el-col>
      </el-row>
      <el-card shadow="nerver" v-if="editModel" style="text-align: right; padding-bottom: 10px">
        <el-row>
          <el-col :span="24">
            <el-button size="mini" @click="editModel = false">取消</el-button>
            <el-button size="mini" v-if="dialogStatus == 'create'" type="primary" @click="createData">確認</el-button>
            <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import ColumnDefine from "@/interface/columnDefine";
import { mapGetters } from "vuex";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import { parseTime, defaultVal } from "@/utils/index";
import AuthForm from "@/components/Base/AuthForm";
import AuthTable from "@/components/Base/AuthTable";
import { typeLists } from "@/utils/const.js";
export default {
  name: "builderTable",
  components: {
    Sticky,
    permissionBtn,
    Pagination,
    AuthForm,
    AuthTable,
  },
  directives: {
    waves,
    elDragDialog,
  },

  data() {
    return {
      // ------------------------主列表數據（頭）-----------------------------
      firstHeaderList: [], // 主列表列定義
      radio: "", // 主列表選中項
      firstQuery: {
        // 主列表查詢條件
        page: 1,
        limit: 20,
        key: undefined,
        appId: undefined,
      },
      tableName: "",
      mainList: null, // 主列表值
      firstTotal: 0, // 主列表總條數
      listLoading: true, // 主列表記錄總數
      tableKey: 0,
      showTitleDialog: true,

      editModel: false, // 是否為編輯模式
      editType: "edit", // 編輯類型
      dialogStatus: "", // 主修改對話框狀態create/update
      selectRow: {},
      firstTemp: {}, // 當前選中的頭信息
      mainRules: {
        tableName: [
          {
            required: true,
            message: "請輸入表名",
            trigger: "change",
          },
        ],
        namespace: [
          {
            required: true,
          },
        ],
        moduleCode: [
          {
            required: true,
            message: "請輸入模塊標識",
            trigger: "change",
          },
        ],
        moduleName: [
          {
            required: true,
            message: "請輸入模塊名稱",
            trigger: "change",
          },
        ],
      },
      // ------------------------明細列表數據-------------------------------------
      secondHeaderList: [], // 明細列表列定義
      secondList: [], // 明細列表值
      secondQuery: {}, // 明細列表的過濾條件，如頁碼、每頁條數，搜索關鍵字等
      secondTotal: 0, // 明細列表總條數
      multipleSelection: [], // 明細列表checkbox選中的值,

      // ------------------------通用數據項-------------------------------------
      textMap: {
        update: "編輯",
        create: "新增",
      },
    };
  },

  computed: {
    ...mapGetters(["defaultorgid"]),
  },
  created() {
    this.getList();
  },
  mounted() {
    this.initCfg();
  },
  methods: {
    initCfg() {
      this.firstHeaderList = [
        new ColumnDefine("id", "id", false, false, "text", "", "string", "varchar", ""),
        new ColumnDefine("tableName", "表名", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("moduleName", "模塊名稱", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("parentTableId", "父表", true, true, "selectDynamic", "/BuilderTables/AllMain", "string", "varchar", ""),
        new ColumnDefine("foreignKey", "外鍵", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("isDynamicHeader", "動態頭部", true, true, "switch", "", "bool", "tinyint", ""),
        new ColumnDefine("className", "實體類名稱", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("namespace", "命名空間", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("moduleCode", "模塊編碼", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("folder", "vue目錄", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("comment", "描述", true, true, "textarea", "", "string", "varchar", ""),
      ];

      this.secondHeaderList = [
        new ColumnDefine("columnName", "字段名", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("comment", "描述", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("editType", "編輯類型", true, true, "select", typeLists, "string", "varchar", ""),
        new ColumnDefine("entityType", "實體類型", true, true, "text", "", "string", "varchar", ""),
        new ColumnDefine("columnType", "字段類型", true, true, "text", "", "string", "varchar", ""),
        // new ColumnDefine("dataSource", "數據來源", true, true, "selectDynamic", "/CategoryTypes/Load", "string", "varchar", ""),
        new ColumnDefine("isList", "可顯示", true, true, "switch", "", "bool", "tinyint", ""),
        new ColumnDefine("isEdit", "可編輯", true, true, "switch", "", "bool", "tinyint", ""),
        new ColumnDefine("sort", "排序", true, true, "number", "", "string", "varchar", ""),
      ];
    },
    // ------------------------通用處理函數-------------------------------------
    onBtnClicked: function (domId, callback) {
      console.log("you click:" + domId);
      switch (domId) {
        case "btnAdd": // 新增新記錄
          this.editModel = true;
          this.resetFirstTemp();
          this.secondList = [];
          this.dialogStatus = "create";
          this.tableName = "新建";
          this.editType = "add";
          this.$nextTick(() => {
            this.$refs["dataForm"].clearValidate();
          });
          break;
        case "btnEdit": // 編輯頭
          this.firstTemp = Object.assign({}, this.selectRow);
          if (this.firstTemp.id === "") {
            this.editModel = false;
            this.$message({
              message: "請選擇要修改的項",
              type: "error",
            });
            return;
          }
          this.dialogStatus = "update";
          this.editModel = true;
          this.editType = "edit";
          this.$nextTick(() => {
            this.$refs["dataForm"].clearValidate();
          });
          break;
        case "btnDel": // 刪除主表
          if (this.firstTemp.id === "") {
            this.$message({
              message: "請選擇要刪除的項",
              type: "error",
            });
            return;
          }
          this.handleFirstDel(this.firstTemp);
          break;
        case "btnCreateEntity": // 創建實體
          this.handleCreateEntity();
          break;
        case "btnCreateBusiness": // 創建業務邏輯
          this.handleCreateBusiness();
          break;
        case "btnCreateVue": // 創建vue界面
          this.handleCreateVue();
          break;
        case "btnUpdateDetail": // 同步表數據結構
          this.handleUpdateDetail();
          break;
        case "btnDelDetail": // 刪除明細行
          if (this.multipleSelection.length < 1) {
            this.$message({
              message: "至少刪除一個",
              type: "error",
            });
            return;
          }
          this.handleSecondDel(this.multipleSelection);
          break;
        case "btnSync": // 同步表數據結構
          this.handleSync();
          break;
        case "btnExport":
          this.$refs.mainTable.exportExcel(`表結構${parseTime(new Date())}`, callback);
          break;
        default:
          break;
      }
    },
    // 創建實體
    handleCreateEntity() {
      this.$api.buildertables
        .CreateEntity({
          id: this.firstTemp.id,
        })
        .then(() => {
          this.$message.success("創建成功");
        });
    },
    // 創建業務邏輯
    handleCreateBusiness() {
      this.$api.buildertables
        .CreateBusiness({
          id: this.firstTemp.id,
        })
        .then(() => {
          this.$message.success("創建成功");
        });
    },
    // 創建vue界面
    handleCreateVue() {
      if (this.firstTemp.folder == undefined || this.firstTemp.folder == "") {
        this.$message.error("Vue根目錄不能為空");
        return;
      }
      this.$api.buildertables
        .CreateVue({
          id: this.firstTemp.id,
          vueProjRootPath: this.firstTemp.folder,
        })
        .then(() => {
          this.$message.success("創建成功");
        });
    },
    // ------------------------主數據列表處理------------------------------------
    getList() {
      this.listLoading = true;
      this.$api.buildertables.getList(this.firstQuery).then((response) => {
        this.mainList = response.data;
        this.firstTotal = response.count;

        if (this.firstTotal > 0) {
          this.rowClickFirstTable(this.mainList[0]);
        }

        this.listLoading = false;
      });
    },
    rowClickFirstTable(row) {
      // 點擊行
      this.radio = row.id;
      this.tableName = row.tableName;
      this.secondQuery.page = 1;
      this.secondQuery.limit = 10;
      this.querySecondList(this.radio);
      this.showTitleDetail(row);
    },
    handleFilter() {
      this.firstQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.firstQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.firstQuery.page = val.page;
      this.firstQuery.limit = val.limit;
      this.getList();
    },
    resetFirstTemp() {
      this.firstTemp = {};
      let tempObj = {};
      this.firstHeaderList.forEach((item) => {
        tempObj[item.columnName] = defaultVal(item.entityType);
      });
      tempObj.namespace = "ISU.Repository.Domain";
      this.firstTemp = tempObj;
    },
    createData() {
      // 保存提交
      this.$refs["dataForm"].validate(() => {
        let tempData = Object.assign({}, this.firstTemp);
        tempData.OrgId = this.defaultorgid;
        this.$api.buildertables.add(tempData).then((resp) => {
          this.firstTemp.id = resp.result;
          this.mainList.unshift(this.firstTemp);
          this.editModel = false;
          this.rowClickFirstTable(this.firstTemp);
          this.$swal.fire({
            icon: "success",
            title: "創建成功",
            timer: 1500,
            showConfirmButton: false,
          });
        });
      });
    },
    showTitleDetail(row) {
      // 彈出編輯框
      this.selectRow = Object.assign({}, row); // 新增訂單時保存當前選中行
      this.firstTemp = Object.assign({}, row); // copy obj
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },

    updateData() {
      // 更新提交
      this.$refs["dataForm"].validate(() => {
        let tempData = Object.assign({}, this.firstTemp);
        this.$api.buildertables.update(tempData).then(() => {
          for (const v of this.mainList) {
            if (v.id === this.firstTemp.id) {
              const index = this.mainList.indexOf(v);
              this.mainList.splice(index, 1, this.firstTemp);
              break;
            }
          }

          this.editModel = false;
          this.$swal.fire({
            icon: "success",
            title: "更新成功",
            timer: 1500,
            showConfirmButton: false,
          });
        });
      });
    },
    handleFirstDel(row) {
      // 刪除頭
      this.$api.buildertables.del([row.id]).then(() => {
        this.$swal
          .fire({
            icon: "success",
            title: "刪除成功",
            timer: 1500,
            showConfirmButton: false,
          })
          .then(() => {
            this.mainList = this.mainList.filter((item) => item.id !== row.id);
            if (this.mainList.length > 0) {
              this.$nextTick(() => {
                this.rowClickFirstTable(this.mainList[0]);
              });
              return;
            }
            this.secondList = [];
            this.showTitleDetail({});
          });
      });
    },

    // ------------------------明細列表處理-------------------------------------
    handleSecondPage(e) {
      this.secondQuery = e;
      this.querySecondList(this.radio);
    },
    querySecondList(id) {
      this.$api.buildertables
        .getDetailList({
          BuilderTableId: id,
          page: this.secondQuery.page,
          limit: this.secondQuery.limit,
          key: this.secondQuery.customerKey,
        })
        .then((res) => {
          this.secondTotal = res.count;
          this.secondList = res.data;
        });
    },
    rowClickSecondTable(row) {
      // 行點擊事件
      this.$refs.secondTable.clearSelection();
      this.$refs.secondTable.toggleRowSelection(row);
    },
    handleSecondDel(rows) {
      this.$api.buildertables.delDetail(rows.map((item) => item.id)).then(() => {
        rows.forEach((row) => {
          this.secondList = this.secondList.filter((item) => item.id !== row.id);
        });
        this.$swal.fire({
          icon: "success",
          title: "刪除成功",
          timer: 1500,
          showConfirmButton: false,
        });
      });
    },
    handleSync() {
      //同步數據結構
      this.$api.buildertables.sync({ tableName: this.tableName, id: this.radio }).then(() => {
        this.querySecondList(this.radio);

        this.$swal.fire({
          icon: "success",
          title: "同步成功",
          timer: 1500,
          showConfirmButton: false,
        });
      });
    },
    selChangeSecondTable(val) {
      // 明細選中事件
      this.multipleSelection = val;
    },
    handleUpdateDetail(item) {
      // 同步表數據結構
      this.$api.buildertables.updateDetail(item).then(() => {
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

<style lang="scss">
.demo-card .el-card__header {
  padding: 10px !important;
  line-height: 1;
  position: relative;
}

.el-card__body {
  padding: 10px 10px 0 10px !important;
  height: 100%;
}
.form-card .el-card__body {
  padding-right: 0 !important;
}
.form-card .el-form {
  padding-right: 5px;
}

.dialog-small .el-dialog__header {
  padding: 10px;
  border-bottom: 1px solid #efefef;
}

.dialog-small .el-dialog__headerbtn {
  top: 15px;
}

.dialog-small .el-dialog__body {
  padding: 10px;
}

.el-form-item__error {
  padding-top: 0;
}
.edit-buttons {
  position: absolute !important;
  top: 2px;
  right: 10px;
}
</style>
