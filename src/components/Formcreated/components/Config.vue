<template>
  <div v-if="show">
    <el-form label-position="top">
      <el-form-item :label="'字段標識'" v-if="data.type != 'grid'">
        <el-input v-model="data.model" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="'標題'" v-if="data.type != 'grid'">
        <el-input v-model="data.name" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="'寬度'" v-if="Object.keys(data.options).indexOf('width') >= 0">
        <el-input v-model="data.options.width" size="small"></el-input>
      </el-form-item>

      <el-form-item :label="'高度'" v-if="Object.keys(data.options).indexOf('height') >= 0">
        <el-input v-model="data.options.height" size="small"></el-input>
      </el-form-item>

      <el-form-item :label="'大小'" v-if="Object.keys(data.options).indexOf('size') >= 0"> 寬度 <el-input size="small" style="width: 90px" type="number" v-model.number="data.options.size.width"></el-input> 高度 <el-input size="small" style="width: 90px" type="number" v-model.number="data.options.size.height"></el-input> </el-form-item>

      <el-form-item :label="'占位'" v-if="Object.keys(data.options).indexOf('placeholder') >= 0 && (data.type != 'time' || data.type != 'date')">
        <el-input size="small" v-model="data.options.placeholder"></el-input>
      </el-form-item>
      <el-form-item :label="'布劇'" v-if="Object.keys(data.options).indexOf('inline') >= 0">
        <el-radio-group v-model="data.options.inline" size="small">
          <el-radio-button :label="false">塊級</el-radio-button>
          <el-radio-button :label="true">行內</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="'顯示輸入框'" v-if="Object.keys(data.options).indexOf('showInput') >= 0">
        <el-switch v-model="data.options.showInput"></el-switch>
      </el-form-item>
      <el-form-item :label="'最小值'" v-if="Object.keys(data.options).indexOf('min') >= 0">
        <el-input-number size="small" v-model="data.options.min" :min="0" :max="100" :step="1"></el-input-number>
      </el-form-item>
      <el-form-item :label="'最大值'" v-if="Object.keys(data.options).indexOf('max') >= 0">
        <el-input-number size="small" v-model="data.options.max" :min="0" :max="100" :step="1"></el-input-number>
      </el-form-item>
      <el-form-item :label="'步長'" v-if="Object.keys(data.options).indexOf('step') >= 0">
        <el-input-number size="small" v-model="data.options.step" :min="0" :max="100" :step="1"></el-input-number>
      </el-form-item>
      <el-form-item :label="'多選'" v-if="data.type == 'select' || data.type == 'imgupload'">
        <el-switch size="small" v-model="data.options.multiple" @change="handleSelectMuliple"></el-switch>
      </el-form-item>
      <el-form-item :label="'可搜尋'" v-if="data.type == 'select'">
        <el-switch v-model="data.options.filterable"></el-switch>
      </el-form-item>
      <el-form-item label="'允許半邊'" v-if="Object.keys(data.options).indexOf('allowHalf') >= 0">
        <el-switch v-model="data.options.allowHalf" size="small"> </el-switch>
      </el-form-item>
      <el-form-item :label="'支持透明度選擇'" v-if="Object.keys(data.options).indexOf('showAlpha') >= 0">
        <el-switch v-model="data.options.showAlpha" size="small"> </el-switch>
      </el-form-item>
      <el-form-item :label="'是否顯示標籤'" v-if="Object.keys(data.options).indexOf('showLabel') >= 0">
        <el-switch v-model="data.options.showLabel" size="small"> </el-switch>
      </el-form-item>
      <el-form-item :label="'選項'" v-if="Object.keys(data.options).indexOf('options') >= 0">
        <template>
          <template v-if="data.type == 'radio' || (data.type == 'select' && !data.options.multiple)">
            <el-radio-group v-model="data.options.defaultValue" style="line-height: 40px" size="small">
              <draggable tag="ul" :list="data.options.options" v-bind="{ group: { name: 'options' }, ghostClass: 'ghost', handle: '.drag-item' }" handle=".drag-item">
                <li v-for="(item, index) in data.options.options" :key="index">
                  <el-radio :label="item.value" style="margin-right: 5px">
                    <el-input :style="{ width: data.options.showLabel ? '80px' : '180px' }" size="mini" v-model="item.value"></el-input>
                    <el-input style="width: 80px" size="mini" v-if="data.options.showLabel" v-model="item.label"></el-input>
                  </el-radio>
                  <i class="drag-item" style="font-size: 16px; margin: 0 5px; cursor: move"><i class="el-icon-rank" title="拖動"></i></i>
                  <el-button @click="handleOptionsRemove(index)" circle plain type="danger" size="mini" title="刪除" icon="el-icon-delete" style="padding: 4px; margin-left: 5px"></el-button>
                </li>
              </draggable>
            </el-radio-group>
          </template>

          <template v-if="data.type == 'checkbox' || (data.type == 'select' && data.options.multiple)">
            <el-checkbox-group v-model="data.options.defaultValue" size="small">
              <draggable tag="ul" :list="data.options.options" v-bind="{ group: { name: 'options' }, ghostClass: 'ghost', handle: '.drag-item' }" handle=".drag-item">
                <li v-for="(item, index) in data.options.options" :key="index">
                  <el-checkbox :label="item.value" style="margin-right: 5px">
                    <el-input :style="{ width: data.options.showLabel ? '90px' : '180px' }" size="mini" v-model="item.value"></el-input>
                    <el-input style="width: 90px" size="mini" v-if="data.options.showLabel" v-model="item.label"></el-input>
                  </el-checkbox>
                  <i class="drag-item" style="font-size: 16px; margin: 0 5px; cursor: move"><i class="el-icon-rank" title="拖動"></i></i>
                  <el-button @click="handleOptionsRemove(index)" circle plain type="danger" title="刪除" size="mini" icon="el-icon-delete" style="padding: 4px; margin-left: 5px"></el-button>
                </li>
              </draggable>
            </el-checkbox-group>
          </template>
          <div style="margin-left: 22px">
            <el-button type="text" @click="handleAddOption">新增選項</el-button>
          </div>
        </template>
      </el-form-item>

      <el-form-item :label="'預設值'" v-if="Object.keys(data.options).indexOf('defaultValue') >= 0 && (data.type == 'textarea' || data.type == 'input' || data.type == 'text' || data.type == 'rate' || data.type == 'color' || data.type == 'switch')">
        <el-input size="small" v-if="data.type == 'textarea'" type="textarea" :rows="5" v-model="data.options.defaultValue"></el-input>
        <el-input size="small" v-if="data.type == 'input'" v-model="data.options.defaultValue"></el-input>
        <el-input size="small" v-if="data.type == 'text'" v-model="data.options.defaultValue"></el-input>
        <el-rate size="small" v-if="data.type == 'rate'" style="display: inline-block; vertical-align: middle" :max="data.options.max" :allow-half="data.options.allowHalf" v-model="data.options.defaultValue"></el-rate>
        <el-button size="small" type="text" v-if="data.type == 'rate'" style="display: inline-block; vertical-align: middle; margin-left: 10px" @click="data.options.defaultValue = 0">清空</el-button>
        <el-color-picker v-if="data.type == 'color'" v-model="data.options.defaultValue" :show-alpha="data.options.showAlpha" size="small"></el-color-picker>
        <el-switch v-if="data.type == 'switch'" v-model="data.options.defaultValue"></el-switch>
      </el-form-item>

      <template v-if="data.type == 'time' || data.type == 'date'">
        <el-form-item :label="'顯示類型'" v-if="data.type == 'date'">
          <el-select v-model="data.options.type" size="small">
            <el-option value="year"></el-option>
            <el-option value="month"></el-option>
            <el-option value="date"></el-option>
            <el-option value="dates"></el-option>
            <!-- <el-option value="week"></el-option> -->
            <el-option value="datetime"></el-option>
            <el-option value="datetimerange"></el-option>
            <el-option value="daterange"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="'是否為範圍選擇'" v-if="data.type == 'time'">
          <el-switch v-model="data.options.isRange" size="small"> </el-switch>
        </el-form-item>
        <el-form-item :label="'是否獲取時間戳'" v-if="data.type == 'date'">
          <el-switch v-model="data.options.timestamp" size="small"> </el-switch>
        </el-form-item>
        <el-form-item :label="'占位'" v-if="(!data.options.isRange && data.type == 'time') || (data.type != 'time' && data.options.type != 'datetimerange' && data.options.type != 'daterange')">
          <el-input size="small" v-model="data.options.placeholder"></el-input>
        </el-form-item>
        <el-form-item :label="'開始時間'" v-if="data.options.isRange || data.options.type == 'datetimerange' || data.options.type == 'daterange'">
          <el-input size="small" v-model="data.options.startPlaceholder"></el-input>
        </el-form-item>
        <el-form-item :label="'結束時間'" v-if="data.options.isRange || data.options.type == 'datetimerange' || data.options.type == 'daterange'">
          <el-input size="small" v-model="data.options.endPlaceholder"></el-input>
        </el-form-item>
        <el-form-item :label="'格式'">
          <el-input size="small" v-model="data.options.format"></el-input>
        </el-form-item>
        <el-form-item :label="'預設值'" v-if="data.type == 'time' && Object.keys(data.options).indexOf('isRange') >= 0">
          <el-time-picker key="1" style="width: 100%" v-if="!data.options.isRange" v-model="data.options.defaultValue" :arrowControl="data.options.arrowControl" :value-format="data.options.format" size="small"> </el-time-picker>
          <el-time-picker key="2" v-if="data.options.isRange" style="width: 100%" v-model="data.options.defaultValue" is-range :arrowControl="data.options.arrowControl" :value-format="data.options.format" size="small"> </el-time-picker>
        </el-form-item>
      </template>

      <template v-if="data.type == 'imgupload'">
        <el-form-item :label="'最大上傳數'">
          <el-input size="small" type="number" v-model.number="data.options.length"></el-input>
        </el-form-item>
        <template>
          <el-form-item :label="'圖片上傳地址'" :required="true">
            <el-input size="small" v-model="data.options.action"></el-input>
          </el-form-item>
        </template>
      </template>

      <template v-if="data.type == 'blank'">
        <el-form-item :label="'綁定數據類型'">
          <el-select size="small" v-model="data.options.defaultType">
            <el-option value="String" :label="'字符串'"></el-option>
            <el-option value="Object" :label="'對象'"></el-option>
            <el-option value="Array" :label="'數組'"></el-option>
          </el-select>
        </el-form-item>
      </template>

      <template v-if="data.type == 'grid'">
        <el-form-item :label="'柵格間隔'">
          <el-input size="small" type="number" v-model.number="data.options.gutter"></el-input>
        </el-form-item>
        <el-form-item :label="'列配置項'">
          <draggable tag="ul" :list="data.columns" v-bind="{ group: { name: 'options' }, ghostClass: 'ghost', handle: '.drag-item' }" handle=".drag-item">
            <li v-for="(item, index) in data.columns" :key="index">
              <i class="drag-item" style="font-size: 16px; margin: 0 5px; cursor: move"><i class="el-icon-rank" title="拖動"></i></i>
              <el-input :placeholder="'柵格值'" size="mini" style="width: 100px" type="number" v-model.number="item.span"></el-input>

              <el-button @click="handleOptionsRemove(index)" circle plain type="danger" size="mini" icon="el-icon-delete" title="刪除" style="padding: 4px; margin-left: 5px"></el-button>
            </li>
          </draggable>
          <div style="margin-left: 22px">
            <el-button size="small" type="text" @click="handleAddColumn">新增列</el-button>
          </div>
        </el-form-item>
        <el-form-item :label="'水平排列方式'">
          <el-select size="small" v-model="data.options.justify">
            <el-option value="start" :label="'左對齊'"></el-option>
            <el-option value="end" :label="'右對齊'"></el-option>
            <el-option value="center" :label="'居中'"></el-option>
            <el-option value="space-around" :label="'兩側間隔相等'"></el-option>
            <el-option value="space-between" :label="'兩端對齊'"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="'垂直排列方式'">
          <el-select size="small" v-model="data.options.align">
            <el-option value="top" :label="'頂對齊'"></el-option>
            <el-option value="middle" :label="'居中'"></el-option>
            <el-option value="bottom" :label="'底對齊'"></el-option>
          </el-select>
        </el-form-item>
      </template>

      <template v-if="data.type != 'grid' && data.type !== 'text'">
        <el-form-item :label="'操作屬性'">
          <el-checkbox size="small" v-model="data.options.readonly" v-if="Object.keys(data.options).indexOf('readonly') >= 0">只讀</el-checkbox>
          <el-checkbox size="small" v-model="data.options.disabled" v-if="Object.keys(data.options).indexOf('disabled') >= 0">禁用</el-checkbox>
          <el-checkbox size="small" v-model="data.options.editable" v-if="Object.keys(data.options).indexOf('editable') >= 0">文本框可輸</el-checkbox>
          <el-checkbox size="small" v-model="data.options.clearable" v-if="Object.keys(data.options).indexOf('clearable') >= 0">顯示清除按鈕</el-checkbox>
          <el-checkbox size="small" v-model="data.options.arrowControl" v-if="Object.keys(data.options).indexOf('arrowControl') >= 0">使用箭頭進行時間選擇</el-checkbox>
          <el-checkbox size="small" v-model="data.options.isDelete" v-if="Object.keys(data.options).indexOf('isDelete') >= 0">刪除</el-checkbox>
          <el-checkbox size="small" v-model="data.options.isEdit" v-if="Object.keys(data.options).indexOf('isEdit') >= 0">編輯</el-checkbox>
        </el-form-item>
        <el-form-item :label="'校驗'">
          <div v-if="Object.keys(data.options).indexOf('required') >= 0">
            <el-checkbox size="small" v-model="data.options.required">必填</el-checkbox>
          </div>
          <el-select v-if="Object.keys(data.options).indexOf('dataType') >= 0" v-model="data.options.dataType" size="mini">
            <el-option value="string" :label="'字符串'"></el-option>
            <el-option value="number" :label="'數字'"></el-option>
            <el-option value="boolean" :label="'布爾值'"></el-option>
            <el-option value="integer" :label="'整數'"></el-option>
            <el-option value="float" :label="'浮點數'"></el-option>
            <el-option value="url" :label="'URL地址'"></el-option>
            <el-option value="email" :label="'郵箱地址'"></el-option>
            <!-- <el-option value="hex" :label="'十六進制'"></el-option> -->
          </el-select>

          <div v-if="Object.keys(data.options).indexOf('pattern') >= 0">
            <el-input size="mini" v-model.lazy="data.options.pattern" style="width: 240px" :placeholder="'填寫正則表達式'"></el-input>
          </div>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
import Draggable from "vuedraggable";
export default {
  name: "config",
  components: {
    Draggable,
  },
  props: ["data"],
  data() {
    return {
      validator: {
        type: null,
        required: null,
        pattern: null,
        range: null,
        length: null,
      },
    };
  },
  computed: {
    show() {
      if (this.data && Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    handleOptionsRemove(index) {
      if (this.data.type === "grid") {
        this.data.columns.splice(index, 1);
      } else {
        this.data.options.options.splice(index, 1);
      }
    },
    handleAddOption() {
      if (this.data.options.showLabel) {
        this.data.options.options.push({
          value: "新選項",
          label: "新選項",
        });
      } else {
        this.data.options.options.push({
          value: "新選項",
        });
      }
    },
    handleAddColumn() {
      this.data.columns.push({
        span: "",
        list: [],
      });
    },
    generateRules() {
      this.data.rules = [];
      Object.keys(this.validator).forEach((key) => {
        if (this.validator[key]) {
          this.data.rules.push(this.validator[key]);
        }
      });
    },
    handleSelectMuliple(value) {
      if (value) {
        if (this.data.options.defaultValue) {
          this.data.options.defaultValue = [this.data.options.defaultValue];
        } else {
          this.data.options.defaultValue = [];
        }
      } else {
        if (this.data.options.defaultValue.length > 0) {
          this.data.options.defaultValue = this.data.options.defaultValue[0];
        } else {
          this.data.options.defaultValue = "";
        }
      }
    },
    validateRequired(val) {
      if (val) {
        this.validator.required = {
          required: true,
          message: `${this.data.model}必須填寫`,
        };
      } else {
        this.validator.required = null;
      }
      this.$nextTick(() => {
        this.generateRules();
      });
    },
    validateDataType(val) {
      if (!this.show) {
        return false;
      }

      if (val) {
        this.validator.type = {
          type: val,
          message: `${this.data.model}格式不正確`,
        };
      } else {
        this.validator.type = null;
      }
      this.generateRules();
    },
    valiatePattern(val) {
      if (!this.show) {
        return false;
      }
      if (val) {
        this.validator.pattern = {
          pattern: val,
          message: `${this.data.model}格式不匹配`,
        };
      } else {
        this.validator.pattern = null;
      }
      this.generateRules();
    },
  },
  watch: {
    "data.options.isRange": function (val) {
      if (typeof val !== "undefined") {
        if (val) {
          this.data.options.defaultValue = null;
        } else {
          if (Object.keys(this.data.options).indexOf("defaultValue") >= 0) {
            this.data.options.defaultValue = "";
          }
        }
      }
    },
    "data.options.required": function (val) {
      this.validateRequired(val);
    },
    "data.options.dataType": function (val) {
      this.validateDataType(val);
    },
    "data.options.pattern": function (val) {
      this.valiatePattern(val);
    },
    "data.name": function () {
      if (this.data.options) {
        this.validateRequired(this.data.options.required);
        this.validateDataType(this.data.options.dataType);
        this.valiatePattern(this.data.options.pattern);
      }
    },
  },
};
</script>