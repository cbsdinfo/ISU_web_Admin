<template>
  <el-form ref="dataForm" :rules="rules" :model="data" label-position="right" label-width="100px" style="height: calc(100% - 34px); overflow: auto">
    <el-row v-for="(row, findex) in formFieldsExchange" :key="findex">
      <el-col :span="span" v-for="(col, cindex) in row" :key="cindex">
        <!--靜態下拉列表選項-->
        <el-form-item v-if="col.editType == 'select' || col.editType == 'selectDynamic'" size="mini" :label="col.comment" :prop="col.columnName">
          <auth-select :isEdit="true" :type="col.editType == 'select' ? 'static' : 'dynamic'" :search-key="searchKey" :disabled="!editModel" :data-source="col.dataSource" v-model="data[col.columnName]"></auth-select>
        </el-form-item>

        <!--switch框處理bool類型-->
        <el-form-item v-else-if="col.editType == 'switch'" size="mini" :label="col.comment" :prop="col.columnName">
          <el-switch v-model="data[col.columnName]" :active-value="true" :disabled="!editModel" :inactive-value="false"> </el-switch>
        </el-form-item>

        <!--日期渲染-->
        <el-form-item v-else-if="col.editType == 'date'" size="mini" :label="col.comment" :prop="col.columnName">
          <el-date-picker v-model="data[col.columnName]" type="date" style="width: 185px" size="mini" :disabled="!editModel"> </el-date-picker>
        </el-form-item>

        <!--時間-->
        <el-form-item v-else-if="col.editType == 'datetime'" size="mini" :label="col.comment" :prop="col.columnName">
          <el-date-picker v-model="data[col.columnName]" type="datetime" style="width: 185px" size="mini" :disabled="!editModel"> </el-date-picker>
        </el-form-item>

        <!--多行文本-->
        <el-form-item v-else-if="col.editType == 'textarea'" size="mini" :label="col.comment" :prop="col.columnName">
          <el-input type="textarea" v-model="data[col.columnName]" :disabled="!editModel"></el-input>
        </el-form-item>

        <!--普通文本框渲染-->
        <el-form-item v-else size="mini" :label="col.comment" :prop="col.columnName">
          <el-input v-model="data[col.columnName]" :disabled="!editModel"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import AuthSelect from "@/components/Base/AuthSelect";
export default {
  name: "authForm",
  components: {
    AuthSelect,
  },
  model: {
    prop: "data",
  },
  props: {
    width: {
      //表單寬度
      type: Number,
      default: 0,
    },
    /**
     * 表單左邊label文字標籤的寬度
     */
    labelWidth: {
      type: Number,
      default: 100,
    },
    /**
     * 是否可編輯
     */
    editModel: {
      type: Boolean,
      default: false,
    },
    /**
     * 列數,需要可以被24整除
     */
    colNum: {
      type: Number,
      default: 1,
    },
    /**
     * 表單綁定的數據
     */
    data: {
      type: Object,
    },
    /**
     * 表單字段定義
     */
    formFields: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /**
     * 數據驗證規則
     */
    rules: {
      type: Object,
    },
  },
  watch: {
    formFields: function (newVal) {
      this.setFormFieldsExchange(newVal);
    },
  },
  data() {
    return {
      searchKey: {
        //動態下拉框搜索關鍵字
        page: 1,
        limit: 9999,
        key: "",
      },
      /**
       * 表單項屬性定義，將外部傳來的一維數組轉換為二維數組，方便渲染
       */
      formFieldsExchange: [],
    };
  },
  mounted() {
    // 第一次加載時，formFields無變化，watch無法監聽變化
    this.setFormFieldsExchange(this.formFields);
  },
  computed: {
    span() {
      //按傳入的列數，計算每列的寬度
      return 24 / this.colNum;
    },
  },
  methods: {
    setFormFieldsExchange(newVal) {
      let index = 0;
      let row = [];
      let _this = this;
      _this.formFieldsExchange = [];
      newVal
        .filter((u) => u.isEdit)
        .sort((a, b) => b.sort - a.sort)
        .forEach((item) => {
          row.push(item);
          index++;

          if (index >= _this.colNum) {
            index = 0;
            _this.formFieldsExchange.push(row);
            row = [];
          }
        });

      if (row.length > 0) {
        _this.formFieldsExchange.push(row);
      }
    },
    validate(callback) {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          callback();
        }
      });
    },

    clearValidate() {
      this.$refs["dataForm"].clearValidate();
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
