<!--
 * @description: 通用下拉選擇框
 * @author: liyubao | xufuxing
 * @version: 1.1
 * @updateDate:2021-08-25 增加傳入value/label數組的支持
 *             2021-08-26 增加動態下拉列表支持
*  @description: 用於通用的下拉框選擇，簡單用法如下：
*             字典獲取： <auth-select :isEdit="isEdit" @change="change" :data-source="'SYS_STATUS'" v-model="val" size="mini"></auth-select>
*             動態列表： <auth-select :isEdit="isEdit" @change="change" :type="'dynamic'" :data-source="'/CategoryTypes/Load'" v-model="val" size="mini"></auth-select>
-->

<template>
  <div>
    <span v-if="!isEdit">{{ labelName }}</span>
    <el-select allow-create clearable v-else :size="size" :disabled="disabled" :value="value" @change="handleChange">
      <el-option v-for="(item, index) in typeDatas" :key="index" :value="item[defaultProps.value]" :label="item[defaultProps.label]"></el-option>
    </el-select>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import request from "@/utils/request";

export default {
  name: "authSelect",
  components: {},
  props: {
    /**
     * 下拉的類型：
     * static：從數據字典Category按字典類型加載
     * dynamic：從接口中獲取
     */
    type: {
      type: String,
      default: "static",
    },

    /**
     * 搜索關鍵字
     * 當style為dynamic時，該值為傳入的搜索關鍵字
     */
    searchKey: {
      type: Object,
      defalut: {},
    },
    /**
     * 下拉框數據來源，
     * 當為字符串時，表示字典類型，下拉框的選項為該字典類型下所有的字典列表
     * 當為value/label列表時，下拉框的選項為value/label列表
     * 當sytle為dynamic時，下拉框的選項從dataSource接口地址中獲取列表
     */
    dataSource: [String, Number, Array],
    /**
     * 綁定值，直接同步v-model
     */
    value: {
      type: [String, Number],
      default: "",
    },
    /*
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * 是否為編輯狀態
     */
    isEdit: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: "mini",
    },
    defaultProps: {
      type: Object,
      default() {
        return {
          label: "label",
          value: "value",
        };
      },
    },
  },
  data() {
    return {};
  },
  destroyed() {
    this.clearTypeDatas();
  },
  computed: {
    ...mapGetters({
      typeDataLists: "typeDataLists",
      typeIds: "typeIds",
    }),
    typeDatas() {
      if (Array.isArray(this.dataSource)) {
        //如果直接輸入的是key/value對象數組
        return this.dataSource;
      }
      const object = this.typeDataLists.length > 0 && this.typeDataLists.find((item) => item.typeId === this.dataSource);
      return (object && object.typeDatas) || [];
    },
    labelName() {
      //當前值對應的名稱

      var item = {};

      if (Array.isArray(this.dataSource)) {
        //如果直接輸入的是key/value對象數組
        item = this.dataSource.find((item) => item[this.defaultProps.value] === this.value);
      } else {
        item = this.typeDatas.find((item) => item[this.defaultProps.value] === this.value);
      }
      return (item && item[this.defaultProps.label]) || this.value;
    },
  },
  watch: {
    typeId() {
      this.getList();
    },
  },
  created() {
    this.initView();
  },
  methods: {
    ...mapActions({
      saveTypeDataLists: "saveTypeDataLists",
      saveTypeIds: "saveTypeIds",
      clearTypeDatas: "clearTypeDatas",
    }),
    initView() {
      if (Array.isArray(this.dataSource)) {
        //如果是直接輸入的是key/value對象數組
        return;
      }

      const type = this.typeDataLists.find((item) => item.typeId === this.dataSource);
      this.saveTypeIds(this.dataSource); //這句為什麼不能刪除？？😨😨😨😨
      if (type) {
        return;
      }
      this.getList();
    },
    getList() {
      if (Array.isArray(this.dataSource)) {
        //如果輸入的是key/value對象數組
        return;
      }
      if (this.type == "dynamic") {
        request({
          url: this.dataSource,
          method: "get",
          params: this.searchKey,
        }).then((res) => {
          const obj = {
            typeId: this.dataSource, //todo:暫時用url地址作為緩存的key，如果換了搜索關鍵字會有BUG
            typeDatas: res.data.map((item) => {
              var o = {
                label: item.name,
                value: item.id,
              };
              return o;
            }),
          };
          this.saveTypeDataLists(obj);
        });
      } else {
        //從字典表裡面按照字典類型獲取
        const listQuery = {
          page: 1,
          limit: 9999,
          TypeId: this.dataSource,
        };
        return this.$api.categorys.getList(listQuery).then((res) => {
          if (res) {
            const obj = {
              typeId: this.dataSource,
              typeDatas: res.data.map((item) => {
                var o = {
                  label: item.name,
                  value: item.dtValue,
                };
                return o;
              }),
            };
            this.saveTypeDataLists(obj);
          }
        });
      }
    },
    handleChange(val) {
      this.$emit("input", val);
      this.$emit("change", val);
    },
  },
};
</script>

<style scoped></style>
