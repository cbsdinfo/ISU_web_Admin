<!--
 * @description: 通用表格組件
 * @author: liyubao | xufuxing
 * @version: 1.0
 * @updateDate:2021-09-26 增加自定義模版的支持
* @description: 用於渲染給定列定義，給定數據的表格，簡單用法如下：
*               <auth-table ref="tableName" :table-fields="tableFields" :data="dataList" ></auth-table>
*               支持的事件：row-click selection-change
*               支持的方法：exportExcel clearSelection
-->

<template>
  <el-table ref="mainTable" border :data="data" v-loading="vLoading" tooltip-effect="dark" style="width: 100%" height="100%" @row-click="rowClick" @selection-change="selectionChange">
    <!--單選-->
    <el-table-column v-if="selectType == 'radio'" width="55" align="center">
      <template slot-scope="scope">
        <el-radio :label="scope.row.id" v-model="currentSelected">{{ "" }}</el-radio>
      </template>
    </el-table-column>
    <!--多選-->
    <el-table-column v-if="selectType == 'checkbox'" width="55" type="selection" align="center"> </el-table-column>

    <!--使用服務器返回的表頭，如果複雜的表頭和格式解析，請自己定義表格格式-->
    <template v-for="(headerItem, index) in tableFields.filter((u) => u.isList).sort((a, b) => b.sort - a.sort)">
      <!-- 用父類傳進來的自定義模版來處理顯示 -->
      <el-table-column v-if="templates.some((x) => x == headerItem.columnName)" :key="index" :label="headerItem.comment">
        <template slot-scope="scope">
          <component :row="scope.row" v-bind:is="headerItem.columnName"> </component>
        </template>
      </el-table-column>

      <!-- 靜態下拉框處理 -->
      <el-table-column v-else-if="headerItem.editType == 'select' || headerItem.editType == 'selectDynamic'" :key="index" :label="headerItem.comment">
        <template slot-scope="scope">
          <auth-select :isEdit="editModel && headerItem.isEdit" :type="headerItem.editType == 'select' ? 'static' : 'dynamic'" :search-key="searchKey" @change="itemChange(scope.row)" :data-source="headerItem.dataSource" v-model="scope.row[headerItem.columnName]" size="mini"></auth-select>
        </template>
      </el-table-column>

      <!--switch框處理bool類型-->
      <el-table-column v-else-if="headerItem.editType == 'switch'" :prop="headerItem.columnName" :label="headerItem.comment" :key="index" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-switch @change="itemChange(scope.row)" v-model="scope.row[headerItem.columnName]" :active-value="true" :inactive-value="false" :disabled="!editModel || !headerItem.isEdit" size="mini"> </el-switch>
        </template>
      </el-table-column>

      <!--日期選擇框處理-->
      <el-table-column v-else-if="headerItem.editType == 'date'" :prop="headerItem.columnName" :label="headerItem.comment" :key="index" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-date-picker @change="itemChange(scope.row)" v-if="editModel && headerItem.isEdit" v-model="scope.row[headerItem.columnName]" type="date" :placeholder="scope.row[headerItem.comment]" style="width: 130px" value-format="yyyy-MM-dd" size="mini"> </el-date-picker>
          <span v-else>{{ scope.row[headerItem.columnName] }}</span>
        </template>
      </el-table-column>

      <!--時間選擇框處理-->
      <el-table-column v-else-if="headerItem.editType == 'datetime'" :prop="headerItem.columnName" :label="headerItem.comment" :key="index" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-date-picker @change="itemChange(scope.row)" v-if="editModel && headerItem.isEdit" v-model="scope.row[headerItem.columnName]" type="datetime" :placeholder="scope.row[headerItem.comment]" style="width: 130px" size="mini"> </el-date-picker>
          <span v-else>{{ scope.row[headerItem.columnName] }}</span>
        </template>
      </el-table-column>

      <!--普通的處理方式-->
      <el-table-column v-else :prop="headerItem.columnName" :label="headerItem.comment" :key="index" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input @keyup.enter.native="itemChange(scope.row)" v-if="editModel && headerItem.isEdit" v-model="scope.row[headerItem.columnName]" size="mini"> </el-input>
          <span v-else>{{ scope.row[headerItem.columnName] }}</span>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script>
import extend from "@/extensions/filterCategory.js";
import AuthSelect from "@/components/Base/AuthSelect";
export default {
  name: "authTable",
  components: {
    AuthSelect,
  },
  mixins: [extend],
  props: {
    /**
     * 表格列模版列表，用來處理有特殊列顯示的需求
     */
    templates: {
      type: Array,
      default: () => {
        return [];
      },
    },

    /**
     * 表格選擇方式：checkbox/radio
     * 預設為checkbox
     */
    selectType: {
      type: String,
      default: "checkbox",
    },
    /**
     * 是否可編輯
     */
    editModel: {
      type: Boolean,
      default: false,
    },
    /**
     * 加載狀態
     */
    vLoading: {
      type: Boolean,
      default: false,
    },

    /**
     * 列表頭定義
     */
    tableFields: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /**
     * 列表數據
     */
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  watch: {},
  data() {
    return {
      searchKey: {
        //動態下拉框搜尋關鍵字
        page: 1,
        limit: 9999,
        key: "",
      },
      currentSelected: "", //當前選中的數據
    };
  },
  mounted() {},
  computed: {
    json_fields() {
      let obj = {};

      this.tableFields
        .filter((u) => u.isList)
        .forEach((item) => {
          if (!item.comment) return;
          if (item.editType === "select") {
            //下拉需要選擇的
            obj[item.comment] = {
              field: item.columnName,
              callback: (value) => {
                return this.filterSelect(value, item.dataSource);
              },
            };
            return;
          }
          if (item.editType === "switch") {
            obj[item.comment] = {
              field: item.columnName,
              callback: (value) => {
                return this.filterSwitch(value, item.dataSource);
              },
            };
            return;
          }
          obj[item.comment] = item.columnName;
        });
      return obj;
    },
  },
  methods: {
    /**
     * 點擊行事件
     */
    rowClick(row) {
      this.currentSelected = row.id;
      this.$emit("row-click", row);
    },
    /**
     * 選擇行發生變化事件
     */
    selectionChange(val) {
      this.$emit("selection-change", val);
    },

    /**
     * 表單項值變化事件
     */
    itemChange(val) {
      this.$emit("item-change", val);
    },
    /**
     * 清空選擇項
     */
    clearSelection() {
      this.$refs.mainTable.clearSelection();
    },
    /**
     * 選中當前行
     */
    toggleRowSelection(row) {
      this.$refs.mainTable.toggleRowSelection(row);
    },
    /**
     * 導出excel
     * @fileName 導出文件名
     */
    exportExcel(fileName, callback) {
      let obj = {};
      obj.json_fields = this.json_fields;
      obj.data = this.data;
      obj.excelName = fileName;
      callback(obj);
    },
  },
};
</script>

<style lang="scss">
.nomal-form label {
  font-weight: 500 !important;
}

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
</style>

<style scoped>
.el-form-item {
  margin-bottom: 15px !important;
}

.m-t-lg {
  margin-top: 20px;
}

.pagination-container {
  border: 0;
  padding-left: 0 !important;
}

.times .el-date-editor.el-input,
.times .el-date-editor.el-input__inner {
  width: 120px;
}

.times .el-select {
  width: 120px;
}

.box-flex .label {
  width: 50px;
}

.m-b-sm {
  margin-bottom: 5px;
}

.p-l-m {
  padding-left: 10px;
}

.p-r-m {
  padding-right: 10px;
}
.edit-button {
  position: absolute !important;
  top: 2px;
  right: 5px;
}
.delete-button {
  right: 90px;
}
.show-title-button {
  cursor: pointer;
  padding: 0 10px 0 0;
}
</style>
