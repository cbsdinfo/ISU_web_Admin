<!--
 * @description: 流程處理（審批）界面
 * @author: liyubao | xufuxing
 * @version: 1.0
 * @updateDate:2021-07-08 審核時可以根據表單是否只讀來修改、提交表單內容
-->
<template>
  <div class="createPost-container">
    <el-card class="box-card" style="text-align: right">
      {{ flowObj.customName }}
      <el-input style="width: 200px" v-model="postObj.verificationOpinion" placeholder="請輸入審核意見"></el-input>
      <verify-status v-model="postObj.verificationFinally" />
      <el-select v-model="postObj.NodeRejectType" placeholder="" v-if="postObj.verificationFinally == '3'">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
      <el-select v-model="postObj.NodeRejectStep" placeholder="" v-if="postObj.NodeRejectType == '2' && postObj.verificationFinally == '3'">
        <el-option v-for="item in FlowNodes" :key="item.id" :label="item.name" :value="item.id"> </el-option>
      </el-select>

      <select-users v-if="postObj.NodeDesignateType === 'RUNTIME_SPECIAL_USER'" placeholder="*選擇下一個節點執行用戶" :userNames.sync="postObj.NodeDesignateTxts" :users="postObj.NodeDesignates" :ignore-auth="true" v-on:users-change="usersChange"> </select-users>
      <select-roles v-if="postObj.NodeDesignateType === 'RUNTIME_SPECIAL_ROLE'" placeholder="*選擇下一個節點執行角色" :userNames.sync="postObj.NodeDesignateTxts" :roles="postObj.NodeDesignates" :ignore-auth="true" v-on:roles-change="rolesChange"> </select-roles>

      <el-button v-loading="loading" style="margin-left: 10px" type="success" @click="submitForm">提交 </el-button>
    </el-card>
    <!-- 自定義表單 -->
    <el-card class="box-card" v-if="flowObj.frmType == 1">
      <component ref="frmData" v-bind:is="flowObj.dbName != '' && flowObj.dbName + 'Detail'" :frmData.sync="flowObj.frmData" :canWriteFormItemIds="canWriteFormItemIds"></component>
    </el-card>
    <!-- 拖拽表單 -->
    <el-card class="box-card" v-if="flowObj.frmType == 2">
      <div style="padding-right: 25px">
        <CreatedForm :insite="true" ref="createdForm" v-if="frmContentData.list && frmContentData.list.length > 0" :data="frmContentData" :value="defaultValue" :canWriteFormItemIds="canWriteFormItemIds"></CreatedForm>
      </div>
    </el-card>
    <el-card class="box-card" v-else>
      <!--動態表單渲染-->
      <form ref="frmData">
        <p v-if="canWriteFormItemIds && canWriteFormItemIds.length > 0" v-html="flowObj.frmHtml"></p>
        <p v-else v-html="flowObj.frmPreviewHtml"></p>
      </form>
    </el-card>
    <el-card class="box-card">
      <div style="height: 500px">
        <CreatedFlow ref="createdFlow" :form-template="currentForm" :isEdit="true" :isShowContent="isShowContent" :scheme-content="flowObj.schemeContent"></CreatedFlow>
      </div>
    </el-card>
  </div>
</template>
<script>
import SelectUsers from "@/components/SelectUsers";
import SelectRoles from "@/components/SelectRoles";
import Sticky from "@/components/Sticky";
import VerifyStatus from "./Dropdown/VerifyStatus";
import CreatedFlow from "@/components/CreatedFlow";
import CreatedForm from "@/components/Formcreated/components/CreatedForm";
import { mapActions } from "vuex";
import { jump } from "@/utils/jumpRoute";

export default {
  name: "verify-flowinstance",
  components: {
    Sticky,
    VerifyStatus,
    CreatedFlow,
    CreatedForm,
    SelectUsers,
    SelectRoles,
  },
  data() {
    return {
      isShowContent: true,
      currentForm: null,
      loading: false, // 按鈕加載loading
      /**
       * 當前實例的所有節點
       */
      FlowNodes: [],
      /**
       * 當前節點可寫的表單項Id
       */
      canWriteFormItemIds: [],
      postObj: {
        flowInstanceId: "",
        verificationOpinion: "",
        verificationFinally: 1,
        NodeRejectStep: "",
        NodeRejectType: "0", // 預設上一步
        NodeDesignateType: "", //如果下個執行節點是運行時指定執行者。需要傳指定的類型.RUNTIME_SPECIAL_ROLE、RUNTIME_SPECIAL_USER
        NodeDesignates: [], //如果下個執行節點是運行時指定執行者。該值表示具體的執行者
        NodeDesignateTxts: "",
        frmData: "", //表單數據
        frmType: 0,
      },
      frmContentData: {
        list: [],
        config: {},
      },
      options: [
        {
          value: "0",
          label: "上一步",
        },
        {
          value: "1",
          label: "第一步",
        },
        {
          value: "2",
          label: "指定步驟",
        },
      ],
      defaultValue: {},
      flowObj: {
        customName: "",
        schemeContent: "",
        createDate: "",
        activityName: "",
        code: "",
        dbName: "",
        frmType: 0,
        frmData: "",
        activityId: "",
      },
    };
  },
  created() {
    const id = this.$route.params && this.$route.params.id;
    this.postObj.flowInstanceId = id;
    this.$api.flowinstances
      .get({
        id: id,
      })
      .then((response) => {
        this.flowObj = response.result;
        if (this.flowObj.frmType === 2) {
          this.frmContentData = JSON.parse(response.result.frmContentData);
        }
        this.defaultValue = JSON.parse(response.result.frmData);
        this.postObj.frmType = response.result.frmType;
        this.postObj.NodeDesignateType = response.result.nextNodeDesignateType; //節點的執行權限類型，如執行時選定用戶或設計時確定用戶
        var nodes = JSON.parse(this.flowObj.schemeContent).nodes;
        this.FlowNodes = nodes; // 需要過濾條件，應該退回到已經處理過的某個節點
        this.canWriteFormItemIds = response.result.canWriteFormItemIds;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    ...mapActions(["updateInstancesIsRender"]),
    submitForm() {
      let _this = this;
      _this.loading = true;

      _this.updateFrmData();

      this.$api.flowinstances.verify(this.postObj).then(
        () => {
          _this.loading = false;
          _this.updateInstancesIsRender({
            type: "",
            val: true,
          });
          this.$swal
            .fire({
              icon: "success",
              title: "執行成功",
              timer: 1500,
              showConfirmButton: false,
            })
            .then(() => {
              jump(this, "/flowInstances/wait");
            });
        },
        () => {
          _this.loading = false;
        }
      );
    },
    /**
     * 更新表單內容
     */
    updateFrmData() {
      if (!this.canWriteFormItemIds || this.canWriteFormItemIds.length == 0) {
        //如果沒有可寫的表單項
        return;
      }

      let _this = this;

      if (_this.postObj.frmType === 1) {
        // 使用的是自定義的頁面提交
        _this.postObj.frmData = JSON.stringify(_this.$refs.frmData.getData());
      } else if (_this.postObj.frmType === 0) {
        // 動態表單
        const frmdata = {};
        for (let i = 0; i < _this.$refs.frmData.elements.length; i++) {
          frmdata[_this.$refs.frmData[i].name] = _this.$refs.frmData[i].value;
        }
        _this.postObj.frmData = JSON.stringify(frmdata);
      } else {
        //拖拽表單
        _this.$refs.createdForm
          .getData()
          .then((res) => {
            _this.postObj.frmData = JSON.stringify(res);
            _this.handleAdd();
          })
          .catch(() => {});
        return;
      }
    },
    usersChange(name, val) {
      if (name == "users") {
        //用戶數據發生改動
        this.postObj.NodeDesignates = val;
      } else {
        this.postObj.NodeDesignateTxts = val;
      }
    },
    rolesChange(name, val) {
      // 可執行角色
      if (name == "roles") {
        //角色發生改變
        this.postObj.NodeDesignates = val;
      } else {
        this.postObj.NodeDesignateTxts = val;
      }
    },
  },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";
.createPost-container {
  position: relative;
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
