<template>
  <div class="flex-column">
    <div class="app-container flex-item">
      <el-row style="height: 100%">
        <el-col :span="15" style="height: 100%">
          <div class="bg-white" style="height: 50%">
            <el-card shadow="never" class="body-small" style="height: 100%; overflow: auto">
              <div slot="header" class="clearfix">
                <el-button type="text" style="padding: 0 11px">基本資料</el-button>
              </div>
              <el-form ref="dataForm" :model="temp" label-position="right" label-width="100px">
                <el-form-item size="small" :label="'帳號'" prop="account">
                  <span>{{ temp.account }}</span>
                </el-form-item>

                <el-form-item size="small" :label="'姓名'" prop="name">
                  <el-input v-model="temp.name"></el-input>
                </el-form-item>
                <el-form-item size="small" :label="'性別'">
                  <el-radio v-model="temp.sex" :label="0">男</el-radio>
                  <el-radio v-model="temp.sex" :label="1">女</el-radio>
                </el-form-item>
                <el-form-item size="small" :label="' '">
                  <el-button size="mini" type="primary" @click="changeProfile">確認修改</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
          <div class="bg-white" style="height: 50%">
            <el-card shadow="never" class="body-small" style="height: 100%; overflow: auto">
              <div slot="header" class="clearfix">
                <el-button type="text" style="padding: 0 11px">修改密碼</el-button>
              </div>
              <el-form ref="dataForm" :model="temp" label-position="right" label-width="100px">
                <el-form-item size="small" :label="'新密碼'" prop="name">
                  <el-input v-model="newpwd" show-password></el-input>
                </el-form-item>
                <el-form-item size="small" :label="' '">
                  <el-button size="mini" type="primary" @click="changePassword">確認修改</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </el-col>
        <el-col :span="4" style="height: 100%">
          <div class="bg-white" style="height: 100%">
            <el-card shadow="never" class="body-small" style="height: 100%; overflow: auto">
              <div slot="header" class="clearfix">
                <el-button type="text" style="padding: 0 11px">可訪問的模塊</el-button>
              </div>

              <el-tree :data="modulesTree" :expand-on-click-node="false" default-expand-all :props="orgTreeProps"> </el-tree>
            </el-card>
          </div>
        </el-col>
        <el-col :span="5" style="height: 100%; border: 1px solid #ebeef5">
          <el-card shadow="never" class="body-small" style="height: 100%; overflow: auto">
            <div slot="header" class="clearfix">
              <el-button type="text" style="padding: 0 11px">可訪問的機構（✅為當前預設,點擊可切換）</el-button>
            </div>

            <el-tree :data="orgsTree" :expand-on-click-node="false" default-expand-all :props="orgTreeProps" @node-click="handleNodeClick"></el-tree>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { listToTreeSelect } from "@/utils";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import waves from "@/directive/waves"; // 水波紋指令
import { mapGetters } from "vuex";
import store from "@/store";

export default {
  name: "profile",
  components: {},
  directives: {
    waves,
  },
  data() {
    return {
      orgTreeProps: {
        // tree配置項
        children: "children",
        label: "label",
      },
      listLoading: true,
      orgs: [], // 用戶可訪問到的組織列表
      orgsTree: [], // 用戶可訪問到的所有機構組成的樹

      modules: [],
      modulesTree: [], // 用戶可訪問的所有模塊組成的樹

      temp: {
        account: "",
        name: "",
        sex: 0,
      },
      newpwd: "",
    };
  },
  computed: {
    ...mapGetters(["defaultorgid"]),
  },
  filters: {},
  mounted() {
    this.getUserProfile();
    this.getOrgTree();
    this.getModulesTree();
  },
  methods: {
    changeProfile() {
      const _this = this;
      this.$api.users.changeProfile(this.temp).then((response) => {
        _this.$message({
          message: response.message,
          type: "success",
        });
      });
    },

    changePassword() {
      const _this = this;
      this.$api.users
        .changePassword({
          account: _this.temp.account,
          password: _this.newpwd,
        })
        .then((response) => {
          _this.$message({
            message: response.message,
            type: "success",
          });
        });
    },

    handleNodeClick(data) {
      store.commit("SET_DEFAULTORG", data);
      this.getOrgTree();
    },

    getUserProfile() {
      var _this = this; // 記錄vuecomponent
      this.$api.login.getUserProfile().then((response) => {
        _this.temp = response.result;
      });
    },

    getModulesTree() {
      var _this = this; // 記錄vuecomponent
      this.$api.login.getModules().then((response) => {
        _this.modules = response.result.map(function (item) {
          return {
            id: item.id,
            label: item.name,
            parentId: item.parentId,
          };
        });
        var tmp = JSON.parse(JSON.stringify(_this.modules));
        _this.modulesTree = listToTreeSelect(tmp);
      });
    },

    getOrgTree() {
      var _this = this; // 記錄vuecomponent
      this.$api.login.getOrgs().then((response) => {
        _this.orgs = response.result.map(function (item) {
          var name = item.name;
          if (_this.defaultorgid === item.id) {
            name = name + "✅";
          }
          return {
            id: item.id,
            label: name,
            parentId: item.parentId,
          };
        });
        var orgstmp = JSON.parse(JSON.stringify(_this.orgs));
        _this.orgsTree = listToTreeSelect(orgstmp);
      });
    },
  },
};
</script>

<style scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.el-select.filter-item.el-select--small {
  width: 100%;
}
</style>
