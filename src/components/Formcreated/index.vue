<template>
  <el-container class="fm2-container" style="height: 100%">
    <el-header style="height: auto; padding: 0; border-bottom: 1px solid #ccc">
      <div class="components-list" style="padding-bottom: 0">
        <template v-if="basicFields.length">
          <draggable tag="ul" :list="basicComponents" v-bind="{ group: { name: 'people', pull: 'clone', put: false }, sort: false, ghostClass: 'ghost' }" :move="true" style="padding-bottom: 0">
            <template v-for="(item, index) in basicComponents">
              <li v-if="basicFields.indexOf(item.type) >= 0" class="form-edit-created-label" :class="{ 'no-put': item.type == 'divider' }" :key="index">
                <a>
                  <i class="icon iconfont" :class="item.icon"></i>
                  <span>{{ item.name }}</span>
                </a>
              </li>
            </template>
          </draggable>
        </template>
      </div>
    </el-header>
    <el-main class="fm2-main">
      <el-container>
        <el-container class="center-container" direction="vertical">
          <el-main :class="{ 'created-empty': createdFormData.list.length == 0 }">
            <ShowForm v-if="!resetJson" ref="createdFormData" :data="createdFormData" :select.sync="formDataSelect"></ShowForm>
          </el-main>
          <el-header class="btn-bar" style="height: 45px">
            <slot name="action"> </slot>
            <el-button v-if="clearable" type="text" size="mini" icon="el-icon-delete" @click="handleClear">清空</el-button>
            <el-button v-if="preview" type="text" size="mini" icon="el-icon-view" @click="handlePreview">預覽</el-button>
          </el-header>
        </el-container>

        <el-aside class="created-config-container">
          <el-container>
            <el-header height="45px" style="font-size: 0">
              <div class="config-tab" :class="{ active: configTab == 'created' }" @click="handleConfigSelect('created')">字段屬性</div>
              <div class="config-tab" :class="{ active: configTab == 'form' }" @click="handleConfigSelect('form')">表單屬性</div>
            </el-header>
            <el-main class="config-content">
              <config v-show="configTab == 'created'" :data="formDataSelect"></config>
              <CreatedFormConfig v-show="configTab == 'form'" :data="createdFormData.config"></CreatedFormConfig>
            </el-main>
          </el-container>
        </el-aside>
        <Model :visible="previewVisible" @on-close="previewVisible = false" ref="formPreview" width="1000px" form>
          <CreatedForm :insite="true" @on-change="handleDataChange" v-if="previewVisible" :data="createdFormData" :remote="remoteFuncs" ref="generateForm">
            <template v-slot:blank="scope"> Width <el-input v-model="scope.model.blank.width" style="width: 100px"></el-input> Height <el-input v-model="scope.model.blank.height" style="width: 100px"></el-input> </template>
          </CreatedForm>

          <template slot="action">
            <el-button type="primary" @click="handleGetData">獲取數據</el-button>
            <el-button @click="handleReset">重置</el-button>
          </template>
        </Model>

        <Model :visible="jsonVisible" @on-close="jsonVisible = false" ref="jsonPreview" width="800px" form>
          <template slot="action">
            <el-button type="primary" class="json-btn" :data-clipboard-text="jsonCopyValue">覆製</el-button>
          </template>
        </Model>
      </el-container>
    </el-main>
  </el-container>
</template>

<script>
import Draggable from "vuedraggable";
import Config from "./components/Config";
import CreatedFormConfig from "./components/CreatedFormConfig";
import ShowForm from "./components/ShowForm";
import Model from "./components/Model";
import CreatedForm from "./components/CreatedForm";
import { basicComponents, layoutComponents, advanceComponents } from "./config/config.js";
import code from "./config/code.js";
export default {
  name: "making-form",
  components: {
    Draggable,
    Config,
    CreatedFormConfig,
    ShowForm,
    Model,
    CreatedForm,
  },
  props: {
    editInfo: {
      type: Object,
    },
    preview: {
      type: Boolean,
      default: true,
    },
    generateCode: {
      type: Boolean,
      default: true,
    },
    generateJson: {
      type: Boolean,
      default: true,
    },
    upload: {
      type: Boolean,
      default: true,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    basicFields: {
      type: Array,
      default: () => ["grid", "input", "textarea", "number", "radio", "checkbox", "time", "date", "rate", "color", "select", "switch", "slider", "text", "imgupload"],
    },
  },
  data() {
    return {
      basicComponents,
      layoutComponents,
      advanceComponents,
      resetJson: false,
      createdFormData: {
        list: [],
        config: {
          labelWidth: 100,
          labelPosition: "right",
          size: "small",
        },
      },
      configTab: "created",
      formDataSelect: null,
      previewVisible: false,
      jsonVisible: false,
      remoteFuncs: {
        func_test(resolve) {
          setTimeout(() => {
            const options = [
              { id: "1", name: "1111" },
              { id: "2", name: "2222" },
              { id: "3", name: "3333" },
            ];
            resolve(options);
          }, 2000);
        },
        funcGetToken() {},
        upload_callback() {},
      },
      blank: "",
      htmlTemplate: "",
      uploadEditor: null,
      jsonCopyValue: "",
      jsonClipboard: null,
    };
  },
  created() {
    this._loadComponents();
  },
  methods: {
    _loadComponents() {
      const fields = {
        input: "單行文本",
        textarea: "多行文本",
        number: "計數器",
        radio: "單選框組",
        checkbox: "多選框組",
        time: "時間選擇器",
        date: "日期選擇器",
        select: "下拉選擇框",
        switch: "開關",
        text: "文字",
        imgupload: "圖片/文件",
        grid: "柵格布局",
      };
      this.basicComponents = this.basicComponents.map((item) => {
        return {
          ...item,
          name: fields[item.type],
        };
      });
      this.advanceComponents = this.advanceComponents.map((item) => {
        return {
          ...item,
          name: fields[item.type],
        };
      });
      this.layoutComponents = this.layoutComponents.map((item) => {
        return {
          ...item,
          name: fields[item.type],
        };
      });
    },
    handleConfigSelect(value) {
      this.configTab = value;
    },
    handlePreview() {
      this.previewVisible = true;
    },
    handleGetData() {
      this.$refs.generateForm
        .getData()
        .then(() => {
          this.jsonVisible = true;
        })
        .catch(() => {
          this.$refs.formPreview.end();
        });
    },
    handleReset() {
      this.$refs.generateForm.reset();
    },
    handleGenerateJson() {
      return this.createdFormData;
    },
    handleClear() {
      this.createdFormData = {
        list: [],
        config: {
          labelWidth: 100,
          labelPosition: "right",
          size: "small",
          customClass: "",
        },
      };
      this.formDataSelect = {};
    },
    getJSON() {
      return this.createdFormData;
    },
    getHtml() {
      return code(JSON.stringify(this.createdFormData));
    },
    setJSON(json) {
      this.createdFormData = json;
      if (json.list.length > 0) {
        this.formDataSelect = json.list[0];
      }
    },
    handleInput(val) {
      this.blank = val;
    },
    handleDataChange() {},
  },
  watch: {
    createdFormData: {
      deep: true,
      handler: function () {},
    },
    editInfo: {
      deep: true,
      handler() {
        if (this.editInfo && this.editInfo.list) {
          this.createdFormData = { ...this.editInfo };
          this.formDataSelect = this.editInfo && this.editInfo.list.length > 0 && this.editInfo.list[0];
        }
      },
    },
    // '$lang': function(val) {
    //   this._loadComponents()
    // }
  },
};
</script>

<style lang="scss">
@import "./styles/index.scss";
.created-empty {
  background-position: 50%;
}
</style>