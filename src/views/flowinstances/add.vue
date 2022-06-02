<!--
 * @description: 發起流程實例
 * @author: liyubao | xufuxing
 * @version: 1.0
-->
<template>
  <div>
    <sticky :className="'sub-navbar '">
      <el-button v-if="active > 0" size="mini" style="margin-left: 10px" type="primary" @click="pre">上一步</el-button>
      <el-button v-if="active < 1" size="mini" style="margin-left: 10px" @click="next">下一步</el-button>
      <el-button v-loading="loading" size="mini" style="margin-left: 10px" type="success" @click="submitForm">保存 </el-button>
    </sticky>
    <div class="createPost-container">
      <el-form class="form-container" :model="postObj" :rules="rules" ref="postObj">
        <el-steps class="steps" :active="active" finish-status="success">
          <el-step title="選擇模板"></el-step>
          <el-step title="基礎信息"></el-step>
        </el-steps>
        <!--選擇模板-->
        <div class="createPost-main-container" v-show="active == 0">
          <el-form-item label=" ">
            <el-select style="width: 400px" v-model="currentSchemeId" size="small" placeholder="請選擇">
              <el-option v-for="item in flowschemes" :key="item.id" :label="item.schemeName" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="選擇下一個節點執行用戶" v-if="postObj.NodeDesignateType === 'RUNTIME_SPECIAL_USER'">
            <select-users placeholder="*選擇下一個節點執行用戶" :userNames.sync="postObj.NodeDesignateTxts" :users="postObj.NodeDesignates" :ignore-auth="true" v-on:users-change="usersChange"> </select-users>
          </el-form-item>

          <el-form-item label="選擇下一個節點執行角色" v-if="postObj.NodeDesignateType === 'RUNTIME_SPECIAL_ROLE'">
            <select-roles placeholder="*選擇下一個節點執行角色" :userNames.sync="postObj.NodeDesignateTxts" :roles="postObj.NodeDesignates" :ignore-auth="true" v-on:roles-change="rolesChange"> </select-roles>
          </el-form-item>

          <div class="flow-form-content">
            <el-card class="box-card" v-if="postObj.frmType == 1">
              <component ref="frmData" v-bind:is="postObj.dbName + 'Add'" :canWriteFormItemIds="canWriteFormItemIds"></component>
            </el-card>
            <template v-else-if="postObj.frmType === 2">
              <CreatedForm noCanWriteFormItemIdsMode="reverse" :canWriteFormItemIds="canWriteFormItemIds" :insite="true" ref="createdForm" v-if="contentData.list && contentData.list.length > 0" :data="contentData" :value="{}"> </CreatedForm>
            </template>
            <form ref="frmData" v-else>
              <p v-html="frmPreview"></p>
            </form>
          </div>
          <div class="flow-form-content" style="height: 500px">
            <CreatedFlow ref="createdFlow" :form-template="currentForm" :isEdit="true" :isShowContent="isShowContent" :scheme-content="currentScheme.schemeContent"></CreatedFlow>
          </div>
        </div>
        <!--編輯基礎信息-->
        <div class="createPost-main-container" v-show="active == 1">
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
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
import { formatTime } from "@/utils/index";
import MDinput from "@/components/MDinput";
import Sticky from "@/components/Sticky";
import CreatedForm from "@/components/Formcreated/components/CreatedForm";
import CreatedFlow from "@/components/CreatedFlow";
import { mapGetters, mapActions } from "vuex";
import SelectUsers from "@/components/SelectUsers";
import SelectRoles from "@/components/SelectRoles";

import { jump } from "@/utils/jumpRoute";
export default {
  name: "flowinstance-add",
  components: {
    MDinput,
    Sticky,
    CreatedForm,
    CreatedFlow,
    SelectUsers,
    SelectRoles,
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
      /**
       * 開始節點可寫的表單項Id
       */
      canWriteFormItemIds: [],
      postObj: {
        id: undefined,
        code: new Date().getTime(),
        dbName: "", // 關聯的數據庫名
        frmType: 0, // 表單類型 0：預設動態表單，1：用戶自定義頁面
        description: "",
        customName: "",
        frmData: "",
        schemeId: "",
        NodeDesignateType: "", //如果下個執行節點是運行時指定執行者。需要傳指定的類型.RUNTIME_SPECIAL_ROLE、RUNTIME_SPECIAL_USER
        NodeDesignates: [], //如果下個執行節點是運行時指定執行者。該值表示具體的執行者
        NodeDesignateTxts: "", //選中執行者顯示的文本
      },
      loading: false,
      flowschemes: [], // 選擇的流程模板列表
      contentData: {
        //表單中的控件屬性描述
        list: [],
        config: {},
      },
      fields: 0, // 表單數據元素個數
      currentSchemeId: "",
      currentScheme: {
        schemeContent: "",
      }, // 當前選中的流程模板
      frmPreview: "",
      active: 0,
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
    };
  },
  watch: {
    currentSchemeId(id) {
      this.currentScheme.schemeContent = "";
      this.onSchemeChange(id);
    },
  },
  computed: {
    ...mapGetters(["defaultorgid"]),
    contentShortLength() {
      return this.postObj.description ? this.postObj.description.length : 0;
    },
  },
  created() {
    this.$api.flowschemes.getList().then((response) => {
      // 獲取模板列表
      this.flowschemes = response.data;
      // 初始化值
      this.currentSchemeId = this.flowschemes[0].id;
    });
  },
  methods: {
    ...mapActions(["updateInstancesIsRender"]),
    next() {
      if (this.active++ > 1) this.active = 0;
    },
    pre() {
      if (this.active-- < 0) this.active = 0;
    },
    onSchemeChange(schemeId) {
      // 預覽表單和流程
      var _this = this;
      this.currentScheme = Object.assign(
        {},
        this.flowschemes.find((u) => u.id === schemeId)
      );
      this.postObj.customName = this.currentScheme.schemeName + formatTime("yyyy-MM-dd hh:mm:ss");
      this.postObj.schemeId = schemeId;
      var schemeContent = JSON.parse(this.currentScheme.schemeContent);

      //判定開始節點可編輯的表單項內容
      var startNode = schemeContent.nodes.find((i) => i.id.indexOf("start round mix") > -1);
      this.canWriteFormItemIds = startNode.setInfo.CanWriteFormItemIds;

      //需要判定開始節點的下一個節點是否為執行時選定執行人
      var startline = schemeContent.lines.find((i) => i.from.indexOf("start round mix") > -1);
      var startNextNode = schemeContent.nodes.find((i) => i.id == startline.to);
      if (startNextNode && startNextNode.setInfo) {
        _this.postObj.NodeDesignateType = startNextNode.setInfo.NodeDesignate;
      }
      this.$api.forms
        .get({
          id: this.currentScheme.frmId,
          canWriteFormItemIds: JSON.stringify(_this.canWriteFormItemIds),
        })
        .then((response) => {
          if (response.result.frmType === 1) {
            // 用戶自定義的頁面,即Vue組件
            _this.postObj.frmType = 1;
            _this.postObj.dbName = response.result.webId;
          } else if (response.result.frmType === 2) {
            // 拖拽界面
            _this.postObj.frmType = 2;
            _this.postObj.dbName = "";
            response.result.html = response.result.content; // 暫無用content替代一下html
            _this.contentData = JSON.parse(response.result.contentData);
            _this.contentData &&
              _this.canWriteFormItemIds &&
              _this.contentData.list &&
              _this.contentData.list.length > 0 &&
              _this.canWriteFormItemIds.length > 0 &&
              _this.contentData.list.forEach((item) => {
                item.options.disabled = _this.canWriteFormItemIds.indexOf(item.model) == -1;
              });
            _this.frmPreview = response.result.html; // 表單預覽的數據
            _this.fields = response.result.fields; // 表單屬性的個數
          } else {
            _this.postObj.frmType = 0;
            _this.postObj.dbName = "";
            _this.frmPreview = response.result.htmlWithCanWriteIds; // 表單預覽的數據
            _this.fields = response.result.fields; // 表單屬性的個數
          }
        });
    },
    handleAdd() {
      const _this = this;
      _this.postObj.OrgId = this.defaultorgid;
      this.$api.flowinstances.add(_this.postObj).then(() => {
        _this.loading = false;
        _this.updateInstancesIsRender({
          type: "",
          val: true,
        });
        _this.$swal
          .fire({
            icon: "success",
            title: "創建成功",
            timer: 1500,
            showConfirmButton: false,
          })
          .then(() => {
            jump(_this, "/flowInstances/Index");
          });
      });
      _this.loading = false;
    },
    submitForm() {
      var _this = this;
      _this.$refs.postObj.validate((valid) => {
        if (valid) {
          _this.loading = true;
          if (_this.postObj.schemeContent === "") {
            _this.$message({
              message: "請選擇一個流程模板",
              type: "error",
            });
            _this.loading = false;
            return;
          }
          if (_this.postObj.frmType === 1) {
            // 使用的是自定義的頁面提交
            _this.postObj.frmData = JSON.stringify(_this.$refs.frmData.getData());
          } else if (_this.postObj.frmType === 0) {
            // 解析表單中提交的數據
            const frmdata = {};
            for (let i = 0; i < _this.$refs.frmData.elements.length; i++) {
              frmdata[_this.$refs.frmData[i].name] = _this.$refs.frmData[i].value;
            }
            _this.postObj.frmData = JSON.stringify(frmdata);
          } else {
            _this.$refs.createdForm
              .getData()
              .then((res) => {
                _this.postObj.frmData = JSON.stringify(res);
                _this.handleAdd();
              })
              .catch(() => {
                _this.loading = false;
              });
            return;
          }
          _this.handleAdd();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
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
<style rel="stylesheet/scss" lang="scss">
@import "src/styles/mixin.scss";

iframe {
  border: 0;
}

.createPost-container {
  margin: 10px;
  padding: 10px;
  background-color: white;
  min-height: 100%;

  .createPost-main-container {
    max-width: 1000px;
    margin: 0 auto;
    margin-top: 40px;
  }
}

.steps {
  max-width: 1000px;
  margin: 0 auto;

  .el-step__main {
    margin-left: -21px;
  }
}

.edit-btns {
  padding: 20px;
}

.el-tabs--border-card {
  border: 1px solid #dcdfe6;
  -webkit-box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0.12), 0 0 0px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0.12), 0 0 0px 0 rgba(0, 0, 0, 0.04);
}

.el-tabs--border-card.border-b-none {
  border-bottom: 0 !important;
}

.editor {
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-top: 0;
}

.flow-form-content {
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
}
</style>
