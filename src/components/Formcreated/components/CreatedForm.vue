<!--
 * @description: 拖拽表單界面
 * @author: liyubao | xufuxing
 * @version: 1.0
 * @updateDate:2021-07-08 審核時可以根據表單是否只讀來修改、提交表單內容
-->

<template>
  <div class="created-form-content">
    <el-form ref="generateForm" label-suffix=":" :size="data.config.size" :model="frmData" :rules="rules" :label-position="data.config.labelPosition" :label-width="`${data.config.labelWidth}px`">
      <template v-for="item in data.list">
        <template v-if="item.type == 'grid'">
          <el-row :key="item.key" type="flex" :gutter="item.options.gutter ? item.options.gutter : 0" :justify="item.options.justify" :align="item.options.align">
            <el-col v-for="(col, colIndex) in item.columns" :key="colIndex" :span="col.span">
              <template v-for="citem in col.list">
                <el-form-item v-if="citem.type == 'blank'" :label="citem.name" :prop="citem.model" :key="citem.key">
                  <slot :name="citem.model" :model="frmData"></slot>
                </el-form-item>
                <CreatedFormItem :disabled="disabled(citem.model)" v-else :key="citem.key" :frmData.sync="frmData" :remote="remote" :rules="rules" :frmContentDataItem="citem"> </CreatedFormItem>
              </template>
            </el-col>
          </el-row>
        </template>
        <template v-else-if="item.type == 'blank'">
          <el-form-item :label="item.name" :prop="item.model" :key="item.key">
            <slot :name="item.model" :model="frmData"></slot>
          </el-form-item>
        </template>
        <template v-else>
          <CreatedFormItem :disabled="disabled(item.model)" :key="item.key" :frmData.sync="frmData" :rules="rules" :frmContentDataItem="item" :remote="remote"> </CreatedFormItem>
        </template>
      </template>
    </el-form>
  </div>
</template>

<script>
import CreatedFormItem from "./CreatedFormItem";
export default {
  name: "fm-generate-form",
  components: {
    CreatedFormItem,
  },
  props: {
    data: Object,
    remote: String,
    value: Object,
    insite: Boolean,
    /**
     * 可編輯的表單項id
     */
    canWriteFormItemIds: Array(),
    /**
     * 初始化可讀寫表單字段的模式
     * null || undefined || '' : 如果canWriteFormItemIds為空，則全部為只讀
     * reverse : 如果canWriteFormItemIds為空，則全部為可編輯。常用戶流程實例創建的時候
     *
     */
    noCanWriteFormItemIdsMode: String, //
  },
  data() {
    return {
      frmData: {},
      rules: {},
    };
  },
  created() {
    this.generateModle(this.data.list);
  },
  mounted() {},
  methods: {
    generateModle(arr) {
      arr.length > 0 &&
        arr.forEach((arrItem) => {
          if (arrItem.type === "grid") {
            arrItem.columns.forEach((item) => {
              this.generateModle(item.list);
            });
          } else {
            if (
              this.value &&
              Object.keys(this.value).indexOf(arrItem.model) >= 0
            ) {
              this.frmData[arrItem.model] = this.value[arrItem.model];
            } else {
              if (arrItem.type === "blank") {
                this.$set(
                  this.frmData,
                  arrItem.model,
                  arrItem.options.defaultType === "String"
                    ? ""
                    : arrItem.options.defaultType === "Object"
                    ? {}
                    : []
                );
              } else {
                this.frmData[arrItem.model] = arrItem.options.defaultValue;
              }
            }

            if (this.rules[arrItem.model]) {
              this.rules[arrItem.model] = [
                ...this.rules[arrItem.model],
                ...arrItem.rules.map((item) => {
                  if (item.pattern) {
                    return { ...item, pattern: JSON.stringify(item.pattern) };
                  } else {
                    return { ...item };
                  }
                }),
              ];
            } else {
              this.rules[arrItem.model] = [
                ...arrItem.rules.map((item) => {
                  if (item.pattern) {
                    return { ...item, pattern: JSON.stringify(item.pattern) };
                  } else {
                    return { ...item };
                  }
                }),
              ];
            }
          }
        });
    },
    getData() {
      return new Promise((resolve, reject) => {
        this.$refs.generateForm.validate((valid) => {
          if (valid) {
            resolve(this.frmData);
          } else {
            reject(new Error(this.$t("fm.message.validError")).message);
          }
        });
      });
    },
    reset() {
      this.$refs.generateForm.resetFields();
    },
    /**
     * 判定表單項是否只讀
     * @adddate 2021-07-08
     */
    disabled: function (id) {
      if (
        this.canWriteFormItemIds == undefined ||
        this.canWriteFormItemIds.length == 0
      ) {
        if (
          this.noCanWriteFormItemIdsMode &&
          this.noCanWriteFormItemIdsMode == "reverse"
        ) {
          return false;
        }
        return true; //沒有可寫的字段，全部只讀
      }
      let canwrite = this.canWriteFormItemIds.indexOf(id) > -1;
      return !canwrite;
    },
  },
  watch: {
    data: {
      deep: true,
      handler(val) {
        this.frmData = {}; //清空上一次選擇
        this.rules = {};
        this.generateModle(val.list);
      },
    },
    value: {
      deep: true,
      handler(val) {
        this.frmData = { ...this.frmData, ...val };
      },
    },
  },
};
</script>

<style lang="scss">
.created-form-content {
  position: relative;
  .form-model {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
  }
}
</style>
