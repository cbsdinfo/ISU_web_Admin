<!--
 * @description: 拖拽表單表單項渲染
 * @author: liyubao | xufuxing
 * @version: 1.0
 * @updateDate:2021-07-14 審核時可以根據表單是否只讀來修改、提交表單內容
-->

<template>
  <el-form-item :label="frmContentDataItem.name" :prop="frmContentDataItem.model">
    <template v-if="frmContentDataItem.type == 'input'">
      <el-input v-if="frmContentDataItem.options.dataType == 'number' || frmContentDataItem.options.dataType == 'integer' || frmContentDataItem.options.dataType == 'float'" :type="frmContentDataItem.options.dataType" v-model.number="itemVal" :placeholder="frmContentDataItem.options.placeholder" :style="{ width: frmContentDataItem.options.width }" :disabled="disabled"></el-input>
      <el-input v-else :type="frmContentDataItem.options.dataType" v-model="itemVal" :disabled="disabled" :placeholder="frmContentDataItem.options.placeholder" :style="{ width: frmContentDataItem.options.width }"></el-input>
    </template>

    <template v-if="frmContentDataItem.type == 'textarea'">
      <el-input type="textarea" :rows="5" v-model="itemVal" :disabled="disabled" :placeholder="frmContentDataItem.options.placeholder" :style="{ width: frmContentDataItem.options.width }"></el-input>
    </template>

    <template v-if="frmContentDataItem.type == 'number'">
      <el-input-number v-model="itemVal" :style="{ width: frmContentDataItem.options.width }" :step="frmContentDataItem.options.step" :min="frmContentDataItem.options.min > 0 ? frmContentDataItem.options.min : -Infinity" :max="frmContentDataItem.options.max > 0 ? frmContentDataItem.options.max : Infinity" controls-position="right" :disabled="disabled"></el-input-number>
    </template>

    <template v-if="frmContentDataItem.type == 'radio'">
      <el-radio-group v-model="itemVal" :style="{ width: frmContentDataItem.options.width }" :disabled="disabled">
        <el-radio :style="{ display: frmContentDataItem.options.inline ? 'inline-block' : 'block' }" :label="item.value" v-for="(item, index) in frmContentDataItem.options.remote ? frmContentDataItem.options.remoteOptions : frmContentDataItem.options.options" :key="index">
          <template v-if="frmContentDataItem.options.remote">{{ item.label }}</template>
          <template v-else>{{ frmContentDataItem.options.showLabel ? item.label : item.value }}</template>
        </el-radio>
      </el-radio-group>
    </template>

    <template v-if="frmContentDataItem.type == 'checkbox'">
      <el-checkbox-group v-model="itemVal" :style="{ width: frmContentDataItem.options.width }" :disabled="disabled">
        <el-checkbox :style="{ display: frmContentDataItem.options.inline ? 'inline-block' : 'block' }" :label="item.value" v-for="(item, index) in frmContentDataItem.options.remote ? frmContentDataItem.options.remoteOptions : frmContentDataItem.options.options" :key="index">
          <template v-if="frmContentDataItem.options.remote">{{ item.label }}</template>
          <template v-else>{{ frmContentDataItem.options.showLabel ? item.label : item.value }}</template>
        </el-checkbox>
      </el-checkbox-group>
    </template>

    <template v-if="frmContentDataItem.type == 'time'">
      <el-time-picker v-model="itemVal" :is-range="frmContentDataItem.options.isRange" :placeholder="frmContentDataItem.options.placeholder" :start-placeholder="frmContentDataItem.options.startPlaceholder" :end-placeholder="frmContentDataItem.options.endPlaceholder" :readonly="frmContentDataItem.options.readonly" :disabled="disabled" :editable="frmContentDataItem.options.editable" :clearable="frmContentDataItem.options.clearable" :arrowControl="frmContentDataItem.options.arrowControl" :value-format="frmContentDataItem.options.format" :style="{ width: frmContentDataItem.options.width }">
      </el-time-picker>
    </template>

    <template v-if="frmContentDataItem.type == 'date'">
      <el-date-picker v-model="itemVal" :type="frmContentDataItem.options.type" :placeholder="frmContentDataItem.options.placeholder" :start-placeholder="frmContentDataItem.options.startPlaceholder" :end-placeholder="frmContentDataItem.options.endPlaceholder" :readonly="frmContentDataItem.options.readonly" :disabled="disabled" :editable="frmContentDataItem.options.editable" :clearable="frmContentDataItem.options.clearable" :value-format="frmContentDataItem.options.timestamp ? 'timestamp' : frmContentDataItem.options.format" :format="frmContentDataItem.options.format" :style="{ width: frmContentDataItem.options.width }">
      </el-date-picker>
    </template>

    <template v-if="frmContentDataItem.type == 'rate'">
      <el-rate v-model="itemVal" :max="frmContentDataItem.options.max" :disabled="disabled" :allow-half="frmContentDataItem.options.allowHalf"></el-rate>
    </template>

    <template v-if="frmContentDataItem.type == 'color'">
      <el-color-picker v-model="itemVal" :disabled="disabled" :show-alpha="frmContentDataItem.options.showAlpha"></el-color-picker>
    </template>

    <template v-if="frmContentDataItem.type == 'select'">
      <el-select v-model="itemVal" :disabled="disabled" :multiple="frmContentDataItem.options.multiple" :clearable="frmContentDataItem.options.clearable" :placeholder="frmContentDataItem.options.placeholder" :style="{ width: frmContentDataItem.options.width }" :filterable="frmContentDataItem.options.filterable">
        <el-option v-for="item in frmContentDataItem.options.remote ? frmContentDataItem.options.remoteOptions : frmContentDataItem.options.options" :key="item.value" :value="item.value" :label="frmContentDataItem.options.showLabel || frmContentDataItem.options.remote ? item.label : item.value"></el-option>
      </el-select>
    </template>

    <template v-if="frmContentDataItem.type == 'switch'">
      <el-switch v-model="itemVal" :disabled="disabled"> </el-switch>
    </template>

    <template v-if="frmContentDataItem.type == 'slider'">
      <el-slider v-model="itemVal" :min="frmContentDataItem.options.min" :max="frmContentDataItem.options.max" :disabled="disabled" :step="frmContentDataItem.options.step" :show-input="frmContentDataItem.options.showInput" :range="frmContentDataItem.options.range" :style="{ width: frmContentDataItem.options.width }"></el-slider>
    </template>

    <template v-if="frmContentDataItem.type === 'imgupload'">
      <Upload v-model="itemVal" :disabled="disabled" :style="{ width: frmContentDataItem.options.width }" :width="frmContentDataItem.options.size.width" :height="frmContentDataItem.options.size.height" :token="frmContentDataItem.options.token" :domain="frmContentDataItem.options.domain" :multiple="frmContentDataItem.options.multiple" :length="frmContentDataItem.options.length" :is-qiniu="frmContentDataItem.options.isQiniu" :is-delete="frmContentDataItem.options.isDelete" :min="frmContentDataItem.options.min" :is-edit="frmContentDataItem.options.isEdit" :action="frmContentDataItem.options.action">
      </Upload>
    </template>

    <template v-if="frmContentDataItem.type == 'editor'">
      <vue-editor v-model="itemVal" :style="{ width: frmContentDataItem.options.width }"> </vue-editor>
    </template>

    <template v-if="frmContentDataItem.type == 'cascader'">
      <el-cascader v-model="itemVal" :disabled="disabled" :clearable="frmContentDataItem.options.clearable" :placeholder="frmContentDataItem.options.placeholder" :style="{ width: frmContentDataItem.options.width }" :options="frmContentDataItem.options.remoteOptions"> </el-cascader>
    </template>

    <template v-if="frmContentDataItem.type == 'text'">
      <span>{{ itemVal }}</span>
    </template>
  </el-form-item>
</template>

<script>
import Upload from "./ImageUpload";
export default {
  props: ["frmContentDataItem", "frmData", "rules", "remote", "disabled"],
  components: {
    Upload,
  },
  data() {
    return {
      itemVal: this.frmData[this.frmContentDataItem.model],
    };
  },
  created() {
    if (
      this.frmContentDataItem.options.remote &&
      this.remote[this.frmContentDataItem.options.remoteFunc]
    ) {
      this.remote[this.frmContentDataItem.options.remoteFunc]((data) => {
        this.frmContentDataItem.options.remoteOptions = data.map((item) => {
          return {
            value: item[this.frmContentDataItem.options.props.value],
            label: item[this.frmContentDataItem.options.props.label],
            children: item[this.frmContentDataItem.options.props.children],
          };
        });
      });
    }
    if (
      this.frmContentDataItem.type === "imgupload" &&
      this.frmContentDataItem.options.isQiniu
    ) {
      this.remote[this.frmContentDataItem.options.tokenFunc]((data) => {
        this.frmContentDataItem.options.token = data;
      });
    }
  },
  methods: {},
  watch: {
    itemVal: {
      deep: true,
      handler(val) {
        this.frmData[this.frmContentDataItem.model] = val;
        this.$emit("update:frmData", {
          ...this.frmData,
          [this.frmContentDataItem.model]: val,
        });
        // this.$emit('input-change', val, this.frmContentDataItem.model)
      },
    },
    frmData: {
      deep: true,
      handler(val) {
        this.itemVal = val[this.frmContentDataItem.model];
      },
    },
  },
};
</script>
