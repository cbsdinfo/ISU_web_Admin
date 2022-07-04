<template>
  <div class="flex-column membershipbenefitsPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn> -->
      </div>
    </sticky>
    <div class="editorWrap">
      <el-form label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <el-col :span="24">
            <el-form-item label="" prop="contents">
              <VueEditor v-model="temp.contents"></VueEditor>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="btnWrap">
        <el-button size="mini" @click="submit" type="primary" v-if="hasButton('btnAdd')">送出</el-button>
      </div>
      <!-- <el-button size="mini" @click="handleDelete([scope.row])" type="danger" v-if="hasButton('btnDel')">刪除</el-button> -->
    </div>
  </div>
</template>
<script>
import { VueEditor } from "vue2-editor/dist/vue2-editor.core.js";
import pbMixins from "@/mixins/permissionBtn.js";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
// import permissionBtn from "@/components/PermissionBtn";
//import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";

export default {
  name: "membershipBenefits",//會籍禮遇
  components: { Sticky ,VueEditor },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [ pbMixins, extend ],
  data() {
    return {
      listLoading: true,
      temp:{
        contents:"",
      },
      rules: {
        contents: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getMembershipBenefits();
  },
  methods: {
    getMembershipBenefits(){
      this.$api.membershipBenefits.getMembershipBenefits().then((res) => {
        const {code,result} = res
        if(code===200){
          this.temp.contents = result.contents
        }
      });
    },
    //表單送出
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$api.membershipBenefits.addOrUpdate(this.temp).then(() => {
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            this.getMembershipBenefits();
          });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~vue2-editor/dist/vue2-editor.css";
/* Import the Quill styles you want */
@import "~quill/dist/quill.core.css";
@import "~quill/dist/quill.bubble.css";
@import "~quill/dist/quill.snow.css";
.membershipbenefitsPage{
  .editorWrap{
    margin: 20px auto 0px;
    width: 70%;
    .btnWrap{
      margin-top: 20px;
      text-align: center;
    }
  }
  
}
</style>
