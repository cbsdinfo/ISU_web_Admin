<!--
處於草稿和駁回狀態的流程，可以進行編輯
可以編輯流程的基本信息和提交的表單內容
-->
<template>
  <div>
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-button v-loading="loading" size="mini" style="margin-left: 10px" type="success" @click="submitForm">保存 </el-button>
      </div>
    </sticky>
    <div class="createPost-container">
      <el-form class="form-container" :model="postObj" :rules="rules" ref="postObj">
        <el-row>
          <el-col :span="12">
            <el-form-item label="標題" label-width="100px" prop="schemeNameRule">
              <el-input name="name" v-model="postObj.customName" required style="max-width: 200px"> </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label-width="100px" label="實例編號:">
              <el-input type="text" v-model="postObj.code" style="max-width: 200px"> </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label-width="100px" label="發布時間:" class="postInfo-container-item">
              <el-date-picker v-model="postObj.createDate" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="選擇日期時間"> </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label-width="100px" label="重要性(占位):" class="postInfo-container-item">
              <el-rate style="margin-top: 8px" :max="3" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :low-threshold="1" :high-threshold="3"> </el-rate>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label-width="100px" label="摘要:">
              <el-input type="textarea" :rows="3" placeholder="請輸入內容" v-model="postObj.description"> </el-input>
              <span class="word-counter" v-if="contentShortLength">{{ contentShortLength }}字</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!--運行時選定用戶-->
        <el-form-item label="選擇下一個節點執行用戶" v-if="postObj.NodeDesignateType === 'RUNTIME_SPECIAL_USER'">
          <select-users placeholder="*選擇下一個節點執行用戶" :userNames.sync="postObj.NodeDesignateTxts" :users="postObj.NodeDesignates" v-on:users-change="usersChange"> </select-users>
        </el-form-item>

        <el-form-item label="選擇下一個節點執行角色" v-if="postObj.NodeDesignateType === 'RUNTIME_SPECIAL_ROLE'">
          <select-roles placeholder="*選擇下一個節點執行角色" :userNames.sync="postObj.NodeDesignateTxts" :roles="postObj.NodeDesignates" v-on:roles-change="rolesChange"> </select-roles>
        </el-form-item>
        <!--運行時選定用戶 end-->

        <el-collapse v-model="activeNames" style="padding: 0 15px; background: #fff">
          <el-collapse-item name="1">
            <!--開發者自定義表單-->
            <el-card class="box-card" v-if="postObj.frmType == 1">
              <component ref="frmData" v-bind:is="postObj.dbName != '' && postObj.dbName + 'Update'" :frmData="postObj.frmData"> </component>
            </el-card>
            <!--可拖動表單-->
            <template v-else-if="postObj.frmType === 2">
              <div style="padding-right: 25px">
                <CreatedForm :insite="false" ref="createdForm" :data="createdFormData" :value="defaultValue"> </CreatedForm>
              </div>
            </template>
            <el-card class="box-card" v-else>
              <form ref="frmData">
                <p v-html="postObj.frmPreviewHtml"></p>
              </form>
            </el-card>
          </el-collapse-item>

          <el-collapse-item title="流程圖" name="3">
            <span slot="title" style="font-size: 16px; font-weight: 600">流程圖</span>
            <div style="height: 500px">
              <CreatedFlow ref="createdFlow" :form-template="currentForm" :isEdit="true" :isShowContent="isShowContent" :scheme-content="postObj.schemeContent"></CreatedFlow>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import CreatedForm from "@/components/Formcreated/components/CreatedForm";
import CreatedFlow from "@/components/CreatedFlow";
import { jump } from "@/utils/jumpRoute";
import { mapGetters } from "vuex";
export default {
  name: "flowinstance-detail",
  components: {
    Sticky,
    CreatedForm,
    CreatedFlow,
  },
  computed: {
    ...mapGetters(["defaultorgid"]),
    contentShortLength() {
      return this.postObj.description ? this.postObj.description.length : 0;
    },
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === "") {
        this.$message({
          message: rule.field + "為必傳項",
          type: "error",
        });
        callback(null);
      } else {
        callback();
      }
    };
    return {
      isShowContent: true,
      currentForm: null,
      postObj: {
        id: "",
        customName: "",
        schemeContent: "",
        createDate: "",
        activityName: "",
        code: "",
        dbName: "",
        frmType: 0,
        frmData: "",
        activityId: "",
        NodeDesignateType: "", //如果下個執行節點是運行時指定執行者。需要傳指定的類型.RUNTIME_SPECIAL_ROLE、RUNTIME_SPECIAL_USER
        NodeDesignates: [], //如果下個執行節點是運行時指定執行者。該值表示具體的執行者
        NodeDesignateTxts: "", //選中執行者顯示的文本
      },
      createdFormData: {
        list: [],
        config: {},
      },
      rules: {
        schemeNameRule: [
          {
            validator: validateRequire,
          },
        ],
        frmRule: [
          {
            validator: validateRequire,
          },
        ],
      },
      defaultValue: {},
      activeNames: ["1", "2", "3"], // 展開的信息
      loading: false,
    };
  },
  created() {
    const id = this.$route.params && this.$route.params.id;
    this.$api.flowinstances
      .get({
        id: id,
      })
      .then((response) => {
        this.postObj = response.result;
        this.defaultValue = JSON.parse(response.result.frmData);
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    handleUpdate() {
      const _this = this;
      _this.postObj.OrgId = this.defaultorgid;
      this.$api.flowinstances.update(_this.postObj).then(() => {
        _this.loading = false;
        _this.$swal.fire({
          icon: "success",
          title: "修改成功",
          timer: 1500,
          showConfirmButton: false,
        });
      });
      _this.loading = false;
      jump(_this, "/flowInstances/Index");
    },
    submitForm() {
      var _this = this;
      _this.$refs.postObj.validate((valid) => {
        if (!valid) return false;
        _this.loading = true;
        if (_this.postObj.frmType === 1) {
          // 使用的是自定義的頁面提交
          _this.postObj.frmData = JSON.stringify(_this.$refs.frmData.getData());
        } else if (_this.postObj.frmType === 0) {
          // 動態表單提交數據
          const frmdata = {};
          for (let i = 0; i < _this.$refs.frmData.elements.length; i++) {
            frmdata[_this.$refs.frmData[i].name] = _this.$refs.frmData[i].value;
          }
          _this.postObj.frmData = JSON.stringify(frmdata);
        } else {
          //拖動表單處理
          _this.$refs.createdForm
            .getData()
            .then((res) => {
              _this.postObj.frmData = JSON.stringify(res);
              _this.handleUpdate();
            })
            .catch(() => {
              _this.loading = false;
            });
          return;
        }
        _this.handleUpdate();
      });
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";

.createPost-container {
  position: relative;
  padding: 10px;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }

    .editor-container {
      min-height: 500px;
      margin: 0 0 30px;

      .editor-upload-btn-container {
        text-align: right;
        margin-right: 10px;

        .editor-upload-btn {
          display: inline-block;
        }
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: -10px;
    top: 0px;
  }
}
</style>