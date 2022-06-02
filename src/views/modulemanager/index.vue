<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" size="mini" prefix-icon="el-icon-search" style="width: 200px; margin-bottom: 0" class="filter-item" :placeholder="'關鍵字'" v-model="listQuery.key"> </el-input>

        <permission-btn :size="'mini'" v-on:btn-event="onBtnClicked"></permission-btn>

        <el-checkbox size="mini" class="ml-15" @change="tableKey = tableKey + 1" v-model="showDescription">Id/描述 </el-checkbox>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <el-row class="fh">
        <el-col :span="10" class="fh ls-border">
          <el-card shadow="never" class="card-body-none fh" style="overflow-y: auto">
            <div slot="header" class="clearfix">
              <el-button type="text" style="padding: 0 11px" @click="getAllMenus">所有菜單>></el-button>
            </div>
            <tree-table ref="menuTable" highlight-current-row :data="modulesTree" :columns="columns" @row-click="treeClick" border> </tree-table>
          </el-card>
        </el-col>
        <el-col :span="14" class="fh">
          <div class="bg-white fh">
            <el-table ref="mainTable" :key="tableKey" :data="currentPageMenus" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)" @row-click="rowClick" @selection-change="handleSelectionChange">
              <el-table-column type="selection" align="center" width="55"> </el-table-column>

              <el-table-column :label="'Id'" v-if="showDescription" min-width="120px">
                <template slot-scope="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'DOM ID'">
                <template slot-scope="scope">
                  <span class="link-type" @click="handleEditMenu(scope.row)">{{ scope.row.domId }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="50px" :label="'名稱'">
                <template slot-scope="scope">
                  <span>{{ scope.row.name }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="30px" :label="'排序'">
                <template slot-scope="scope">
                  <span>{{ scope.row.sort }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'樣式'">
                <template slot-scope="scope">
                  <span>{{ scope.row.class }}</span>
                </template>
              </el-table-column>

              <el-table-column min-width="80px" :label="'ICON'">
                <template slot-scope="scope">
                  <span>{{ scope.row.icon }}</span>
                </template>
              </el-table-column>

              <el-table-column width="80px" :label="'是否隱藏'">
                <template slot-scope="scope">
                  <span>{{ scope.row.attr == "true" ? "是" : "否" }}</span>
                </template>
              </el-table-column>

              <el-table-column :label="'描述'" v-if="showDescription" min-width="120px">
                <template slot-scope="scope">
                  <span>{{ scope.row.remark }}</span>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
          </div>
        </el-col>
      </el-row>

      <!--菜單dialog-->
      <el-dialog v-el-drag-dialog class="dialog-mini" width="500px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
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
          <el-form-item size="small" :label="'排序'">
            <el-input-number v-model="temp.sortNo" :min="1" :max="20"></el-input-number>
          </el-form-item>
          <el-form-item size="small" :label="'是否系統'" prop="isSys">
            <el-switch v-model="temp.isSys" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </el-form-item>
          <el-form-item size="small" :label="'模塊標識'">
            <el-input v-model="temp.code"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'圖標'">
            <el-popover placement="top-start" width="500" ref="popoverModule" trigger="click" content="">
              <el-input slot="reference" :class="temp.iconName ? `iconfont icon-${temp.iconName} custom-icon-input` : ''" v-model="temp.iconName"></el-input>
              <el-row class="selectIcon-box">
                <el-col :class="{ active: temp.iconName === item.font_class }" :span="3" v-for="(item, index) in iconData.glyphs" :key="index">
                  <i :class="`${iconData.font_family} ${iconData.css_prefix_text}${item.font_class}`" @click="handleChangeTempIcon(item)"></i>
                </el-col>
              </el-row>
            </el-popover>
          </el-form-item>
          <el-form-item size="small" :label="'url'">
            <el-input v-model="temp.url"></el-input>
          </el-form-item>

          <el-form-item size="mini" :label="'上級機構'">
            <treeselect ref="modulesTree" :normalizer="normalizer" :disabled="treeDisabled" :options="modulesTreeRoot" :default-expand-level="3" :multiple="false" :open-on-click="true" :open-on-focus="true" :clear-on-select="true" v-model="dpSelectModule"></treeselect>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
          <el-button size="mini" v-if="dialogStatus == 'create'" type="primary" @click="createData">確認</el-button>
          <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button>
        </div>
      </el-dialog>

      <!--功能dialog-->
      <el-dialog v-el-drag-dialog class="dialog-mini" width="500px" :title="textMap[dialogMenuStatus]" :visible.sync="dialogMenuVisible" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :rules="rules" ref="menuForm" :model="menuTemp" label-position="right" label-width="100px">
          <el-form-item size="small" :label="'Id'" prop="id" v-show="dialogMenuStatus == 'update'">
            <span>{{ menuTemp.id }}</span>
          </el-form-item>

          <el-form-item size="small" :label="'名稱'" prop="name">
            <el-input v-model="menuTemp.name"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'DOM ID'">
            <el-input v-model="menuTemp.domId"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'隱藏於權限組件'">
            <el-switch v-model="menuTemp.attr" active-value="true" inactive-value="false"></el-switch>
          </el-form-item>
          <el-form-item size="small" :label="'樣式'" style="position: relative">
            <el-button :type="menuTemp.class" class="custom-select-icon" size="mini"></el-button>
            <el-select style="width: 100%" v-model="menuTemp.class" placeholder="請選擇">
              <el-option v-for="item in classBtns" :key="item.value" :label="item.value" :value="item.value">
                <span style="float: left">{{ item.value }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">
                  <el-button :type="item.value" size="mini"></el-button>
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item size="small" :label="'圖標'">
            <el-popover placement="top-start" width="500" trigger="click" ref="popoverMenu">
              <el-input slot="reference" :class="menuTemp.icon ? `iconfont icon-${menuTemp.icon} custom-icon-input` : ''" v-model="menuTemp.icon"></el-input>
              <el-row class="selectIcon-box">
                <el-col :class="{ active: menuTemp.icon === item.font_class }" :span="3" v-for="(item, index) in iconData.glyphs" :key="index">
                  <i :class="`${iconData.font_family} ${iconData.css_prefix_text}${item.font_class}`" @click="handleChangeMenuTempIcon(item)"></i>
                </el-col>
              </el-row>
            </el-popover>
          </el-form-item>
          <el-form-item size="small" :label="'排序'">
            <el-input-number v-model="menuTemp.sort" :min="0" :max="10"></el-input-number>
          </el-form-item>
          <el-form-item size="small" :label="'備註'">
            <el-input v-model="menuTemp.remark"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'所屬模塊'">
            <treeselect ref="menuModulesTree" :normalizer="normalizer" :options="modulesTree" :default-expand-level="3" :multiple="false" :open-on-click="true" :open-on-focus="true" :clear-on-select="true" v-model="menuTemp.moduleId"></treeselect>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogMenuVisible = false">取消</el-button>
          <el-button size="mini" v-if="dialogMenuStatus == 'create'" type="primary" @click="addMenu">確認</el-button>
          <el-button size="mini" v-else type="primary" @click="updateMenu">確認</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import treeTable from "@/components/TreeTable";
import Pagination from "@/components/Pagination";
import { listToTreeSelect } from "@/utils";
import extend from "@/extensions/delRows.js";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import elDragDialog from "@/directive/el-dragDialog";
import iconData from "@/assets/public/css/comIconfont/iconfont.json";
export default {
  name: "module",
  components: {
    Sticky,
    permissionBtn,
    Treeselect,
    treeTable,
    Pagination,
  },
  mixins: [extend],
  directives: {
    waves,
    elDragDialog,
  },
  data() {
    return {
      iconData: iconData,
      classBtns: [
        {
          value: "normal",
        },
        {
          value: "primary",
        },
        {
          value: "danger",
        },
        {
          value: "success",
        },
        {
          value: "info",
        },
        {
          value: "warning",
        },
      ], // 按鈕樣式
      normalizer(node) {
        // treeselect定義字段
        return {
          label: node.name,
          id: node.id,
          children: node.children,
        };
      },
      columns: [
        // treetable的列名
        {
          text: "模塊名稱",
          value: "name",
        },
        {
          text: "模塊標識",
          value: "code",
        },
        {
          text: "URL",
          value: "url",
        },
      ],
      selectMenus: [], // 菜單列表選中的值
      tableKey: 0,
      list: [], // 菜單列表
      total: 0,
      currentModule: null, // 左邊模塊treetable當前選中的項
      listLoading: false,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        orgId: "",
        key: undefined,
      },
      apps: [],

      showDescription: false,
      modules: [], // 用戶可訪問到的模塊列表
      modulesTree: [], // 用戶可訪問到的所有模塊組成的樹
      temp: {
        // 模塊臨時值
        id: undefined,
        cascadeId: "",
        url: "",
        code: "",
        sortNo: 0,
        iconName: "",
        parentId: null,
        name: "",
        status: 0,
        isSys: false,
      },
      menuTemp: {
        // 菜單臨時值
        id: undefined,
        url: "",
        icon: "",
        code: "",
        moduleId: null,
        name: "",
        status: 0,
        sort: 0,
        attr: "false",
      },
      lastParentId: "", //最後一次選中的上級模塊Id
      dialogFormVisible: false, // 模塊編輯框
      dialogStatus: "",
      dialogMenuVisible: false, // 菜單編輯框
      dialogMenuStatus: "",

      chkRoot: false, // 根節點是否選中
      treeDisabled: false, // 樹選擇框時候可用
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
    };
  },
  computed: {
    isRoot: {
      get() {
        return this.chkRoot;
      },
      set(v) {
        this.chkRoot = v;
        if (v) {
          this.temp.parentName = "根節點";
          this.temp.parentId = null;
        }
      },
    },
    modulesTreeRoot() {
      const root = [
        {
          name: "根節點",
          parentId: "",
          id: "",
        },
      ];
      return root.concat(this.modulesTree);
    },
    currentPageMenus: {
      get() {
        var start = (this.listQuery.page - 1) * this.listQuery.limit;
        var end = this.listQuery.page * this.listQuery.limit;
        var result = this.list.slice(start, end);
        return result;
      },
    },
    dpSelectModule: {
      // 模塊編輯框下拉選中的模塊
      get: function () {
        if (this.dialogStatus === "update") {
          return this.temp.parentId || "";
        } else {
          return this.lastParentId;
        }
      },
      set: function (v) {
        if (v === undefined || v === null || !v) {
          // 如果是根節點
          this.temp.parentName = "根節點";
          this.temp.parentId = null;
          return;
        }
        this.temp.parentId = v;
        this.lastParentId = v;
        var parentname = this.modules.find((val) => {
          return v === val.id;
        }).name;
        this.temp.parentName = parentname;
      },
    },
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: "info",
        1: "danger",
      };
      return statusMap[status];
    },
  },
  created() {
    // this.getList()
  },
  mounted() {
    this.getModulesTree();
  },
  methods: {
    handleChangeTempIcon(item) {
      this.temp.iconName = item.font_class;
      this.$refs.popoverModule.doClose();
    },
    handleChangeMenuTempIcon(item) {
      this.menuTemp.icon = item.font_class;
      this.$refs.popoverMenu.doClose();
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    treeClick(data) {
      // 左側treetable點擊事件
      this.currentModule = data;
      this.currentModule.parent = null;
      this.getList();
    },
    getAllMenus() {
      this.currentModule = null;
      this.getList();
    },
    handleSelectionChange(val) {
      this.selectMenus = val;
    },
    onBtnClicked: function (domId) {
      console.log("you click:" + domId);
      switch (domId) {
        case "btnAdd":
          this.handleCreate();
          break;
        case "btnEdit":
          if (this.currentModule === null) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          this.handleUpdate(this.currentModule);
          break;
        case "btnDel":
          if (this.currentModule === null) {
            this.$message({
              message: "至少刪除一個",
              type: "error",
            });
            return;
          }
          this.handleDelete(this.currentModule);
          break;
        case "btnAddMenu":
          this.handleAddMenu();
          break;
        case "btnEditMenu":
          if (this.selectMenus.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          this.handleEditMenu(this.selectMenus[0]);
          break;
        case "btnDelMenu":
          if (this.selectMenus.length < 1) {
            this.$message({
              message: "至少刪除一個",
              type: "error",
            });
            return;
          }
          this.handleDelMenus(this.selectMenus);
          break;
        default:
          break;
      }
    },
    getList() {
      this.listLoading = true;
      var moduleId = this.currentModule === null ? null : this.currentModule.id;
      this.$api.modules.loadMenus(moduleId).then((response) => {
        this.list = response.result;
        this.total = response.result.length;
        this.listLoading = false;
      });
    },
    getModulesTree() {
      var _this = this; // 記錄vuecomponent
      this.$api.login.getModules().then((response) => {
        _this.modules = response.result.map((item) => {
          return {
            sortNo: item.sortNo,
            id: item.id,
            name: item.name,
            iconName: item.iconName,
            parentId: item.parentId || null,
            code: item.code,
            url: item.url,
            cascadeId: item.cascadeId,
            isSys: item.isSys,
          };
        });
        var modulestmp = JSON.parse(JSON.stringify(_this.modules));
        _this.modulesTree = listToTreeSelect(modulestmp).sort((a, b) => a.sortNo - b.sortNo);
        const arr = _this.modulesTree.filter((item) => item.children && item.children.length > 0);
        // 預設選中第一個
        _this.$refs.menuTable.rowClick(arr[0].children[0]);
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
    resetTemp() {
      this.temp = {
        id: undefined,
        cascadeId: "",
        url: "",
        iconName: "",
        code: "",
        parentId: null,
        name: "",
        status: 0,
      };
    },
    resetMenuTemp() {
      this.menuTemp = {
        id: undefined,
        cascadeId: "",
        icon: "",
        url: "",
        code: "",
        moduleId: this.currentModule ? this.currentModule.id : null,
        name: "",
        status: 0,
        sort: 0,
      };
    },

    // #region 模塊管理
    handleCreate() {
      // 彈出新增框
      this.dpSelectModule = this.lastParentId;
      this.resetTemp();

      // 預設帶入排序
      const newArr = this.modulesTree.map((res) => res.sortNo);
      this.temp.sortNo = newArr.length > 0 ? Math.max(...newArr) + 1 : 1;

      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      // 保存提交
      this.$refs["dataForm"].validate((valid) => {
        var _this = this;
        if (valid) {
          if (_this.temp.url.indexOf("http") > -1 && !_this.temp.code) {
            _this.$message.error("請輸入模塊標識");
            return;
          }
          //如果打開彈框後，沒有做任何選擇操作，父級為空
          _this.temp.parentId = _this.temp.parentId || _this.lastParentId;

          this.$api.modules.add(_this.temp).then((response) => {
            // 需要回填數據庫生成的數據
            _this.temp.id = response.result.id;
            _this.temp.cascadeId = response.result.cascadeId;
            _this.list.unshift(_this.temp);
            _this.dialogFormVisible = false;
            _this.$swal
              .fire({
                icon: "success",
                title: "創建成功",
                timer: 1500,
                showConfirmButton: false,
              })
              .then(() => {
                _this.getModulesTree();
              });
          });
        }
      });
    },
    handleUpdate(row) {
      // 彈出編輯框
      this.temp = Object.assign({}, row); // copy obj
      if (this.temp.children) {
        // 點擊含有子節點樹結構時，帶有的children會造成提交的時候json死循環
        this.temp.children = null;
      }

      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.dpSelectModule = this.temp.parentId;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      // 更新提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          if (tempData.url.indexOf("http") > -1 && !tempData.code) {
            this.$message.error("請輸入模塊標識");
            return;
          }
          this.$api.modules.update(tempData).then(() => {
            this.dialogFormVisible = false;
            this.$swal
              .fire({
                icon: "success",
                title: "更新成功",
                timer: 1500,
                showConfirmButton: false,
              })
              .then(async () => {
                await this.getModulesTree();
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
    handleDelete(row) {
      var _this = this;
      _this.delrows("modules", [row], () => {
        _this.getModulesTree();
      });
    },
    // #end region

    // #region 菜單管理
    handleAddMenu() {
      // 彈出新增框
      this.resetMenuTemp();

      // 預設帶入排序
      const newArr = this.currentPageMenus.map((res) => res.sort);
      this.menuTemp.sort = newArr.length > 0 ? Math.max(...newArr) + 1 : 1;

      this.dialogMenuStatus = "create";
      this.dialogMenuVisible = true;
      this.$nextTick(() => {
        this.$refs["menuForm"].clearValidate();
      });
    },
    addMenu() {
      // 保存提交
      this.$refs["menuForm"].validate((valid) => {
        if (valid) {
          this.$api.modules.addMenu(this.menuTemp).then((response) => {
            // 需要回填數據庫生成的數據
            this.menuTemp.id = response.result.id;
            this.list.unshift(this.menuTemp);
            this.dialogMenuVisible = false;
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
    handleEditMenu(row) {
      // 彈出編輯框
      this.menuTemp = Object.assign({}, row); // copy obj
      this.dialogMenuStatus = "update";
      this.dialogMenuVisible = true;
      this.$nextTick(() => {
        this.$refs["menuForm"].clearValidate();
      });
    },
    updateMenu() {
      // 更新提交
      this.$refs["menuForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.menuTemp);
          this.$api.modules.updateMenu(tempData).then(() => {
            this.dialogMenuVisible = false;
            this.$swal
              .fire({
                icon: "success",
                title: "更新成功",
                timer: 1500,
                showConfirmButton: false,
              })
              .then(() => {
                for (const v of this.list) {
                  if (v.id === this.menuTemp.id) {
                    const index = this.list.indexOf(v);
                    this.list.splice(index, 1, this.menuTemp);
                    break;
                  }
                }
              });
          });
        }
      });
    },
    handleDelMenus(rows) {
      // 多行刪除
      this.$api.modules.delMenu(rows.map((u) => u.id)).then(() => {
        this.$swal
          .fire({
            icon: "success",
            title: "刪除成功",
            timer: 1500,
            showConfirmButton: false,
          })
          .then(() => {
            rows.forEach((row) => {
              const index = this.list.indexOf(row);
              this.list.splice(index, 1);
            });
          });
      });
    },
    // #end region
  },
};
</script>

<style lang="scss">
.ml-15 {
  margin-left: 15px;
}

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

.selectIcon-box {
  text-align: center;
  border: 1px solid #eeeeee;
  border-right: 0;
  border-bottom: 0;

  .el-col {
    padding: 10px 0;
    border-right: 1px solid #eeeeee;
    border-bottom: 1px solid #eeeeee;

    &.active {
      .iconfont {
        color: #409eff;
      }
    }
  }

  .iconfont {
    cursor: pointer;
    font-size: 20px;
  }
}

.custom-icon-input::before {
  font-size: 18px;
  position: absolute;
  right: 10px;
  top: 8px;
}
.custom-select-icon {
  position: absolute;
  top: 8px;
  right: 40px;
  z-index: 10;
}
</style>