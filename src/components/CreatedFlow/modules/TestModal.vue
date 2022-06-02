<template>
  <div>
    <a-drawer title="測試" placement="right" :width="600" :visible="testVisible" @close="onClose">

      <div>當前的flowData:</div>
      <json-view :value="flowData" :expand-depth=3 boxed copyable />

      <div style="margin-top: 12px;">暫存:</div>
      <a-textarea :autosize="{ minRows: 10, maxRows: 100 }" :value="flowDataJson" @change="editFlowDataJson" />

      <a-divider />
      <a-button @click="tempSave" :style="{ marginRight: '8px' }">暫存</a-button>
      <a-button @click="onLoad" type="primary">加載(暫存中的json數據)</a-button>
    </a-drawer>
  </div>
</template>

<script>
import JsonView from "vue-json-viewer";
import { flowConfig } from "../config/args-config.js";

export default {
  components: {
    JsonView,
  },
  data() {
    return {
      testVisible: false,
      flowData: null,
      flowDataJson: "",
    };
  },
  methods: {
    onClose() {
      this.testVisible = false;
    },
    editFlowDataJson(e) {
      this.flowDataJson = e.target.value;
    },
    tempSave() {
      let tempObj = Object.assign({}, this.flowData);
      tempObj.status = flowConfig.flowStatus.SAVE;
      this.flowDataJson = JSON.stringify(tempObj);
    },
    onLoad() {
      this.$emit("loadFlow", this.flowDataJson);
      this.onClose();
    },
  },
};
</script>

<style>
</style>