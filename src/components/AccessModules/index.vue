<template>
  <div class="compent-dialog-body">
    <div class="p-m">
      <el-form ref="form" label-position="left" :class="step == '1' ? '' : 'hide'">
        <el-form-item size="small">
          <div class="block">
            <el-tree ref="tree" :data="modules" :check-strictly="true" show-checkbox node-key="id" default-expand-all :expand-on-click-node="false">
              <span class="custom-tree-node" slot-scope="{ node }">
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </el-form-item>
      </el-form>

      <div :class="step == '2' ? '' : 'hide'">
        <div class="block">
          <template v-for="(node, index) in noSystemNodes">
            <div :key="node.id">
              <h4 class="title">
                {{ node.parentName }} > {{ node.label }}
                <el-checkbox :indeterminate="node.isIndeterminate" v-model="node.checkAll" @change="handleCheckPropAllChange($event, node.properties, index)">全選</el-checkbox>
              </h4>
              <div class="p-l-m">
                <el-checkbox-group v-model="node.checks">
                  <template v-for="propy in node.properties">
                    <el-checkbox @change="onChangeProp(index)" :label="propy.columnName" :key="propy.columnName" size="small">{{ propy.comment }}</el-checkbox>
                  </template>
                </el-checkbox-group>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <el-button size="small" @click="close">取消</el-button>
      <el-button size="small" type="primary" v-show="step > 1" @click="up">上一步</el-button>
      <el-button size="small" type="success" @click="acceRole">{{ step === 1 ? "下一步" : "儲存" }}</el-button>
    </div>
  </div>
</template>

<script>
import { listToTreeSelect } from "@/utils";

export default {
  name: "access-modules",
  components: {},
  props: ["roleId"],
  data() {
    return {
      currentRoleId: this.roleId,
      modules: [], // 登入用戶可以訪問到的所有模塊
      menus: [], // 登入用戶可以訪問到的所有菜單
      moduleArr: [], // 合併modules & element 所有資料
      noSystemNodes: [],
      step: 1, // 步驟
    };
  },
  watch: {
    roleId(val) {
      // 因為組件只掛載一次，後期只能通過watch來改變selectusers的值
      this.currentRoleId = val;
      this.init();
    },
    step(val) {
      if (val === 1) {
        this.$emit("change-title", "為角色分配【可見模塊】");
      } else if (val === 2) {
        this.$emit("change-title", "為角色分配【可見菜單】");
      } else {
        this.$emit("change-title", "為角色分配【可見字段】");
      }
    },
  },
  async mounted() {
    var _this = this;

    let modules = [];
    await this.$api.login.getModules().then((response) => {
      modules = response.result.map(function (item) {
        let lable = item.name;
        if (!item.isSys) {
          lable += "(非系統模塊，可分配字段)";
        }
        return {
          id: item.id,
          label: lable,
          parentId: item.parentId || null,
          parentName: item.parentName,
          isSys: item.isSys,
          code: item.code,
        };
      });
    });
    // 獲取用戶可訪問的全部的菜單
    await this.$api.modules.loadMenus("").then((response) => {
      _this.menus = response.result.map((item) => {
        item.label = item.name;
        item.parentId = item.moduleId || null;
        return item;
      });

      _this.moduleArr = modules.concat(_this.menus);
      _this.modules = listToTreeSelect(_this.moduleArr);

      _this.init();
    });
  },
  methods: {
    async init() {
      var _this = this;
      let moduleIds = [];
      let moduleArr = [];
      await this.$api.modules.loadForRole(_this.roleId).then((response) => {
        moduleIds = response.result;
      });
      await this.$api.modules.loadMenusForRole(_this.roleId).then((response) => {
        moduleArr = moduleIds.concat(response.result);
        _this.$refs.tree.setCheckedKeys(moduleArr.map((item) => item.id));
      });
    },
    onChangeProp(index) {
      const item = this.noSystemNodes[index];
      item.checkAll = item.checks.length === item.properties.length;
      item.isIndeterminate = !!(item.checks.length > 0 && item.checks.length < item.properties.length);
      this.$set(this.noSystemNodes, index, item);
    },
    close() {
      this.$emit("close");
    },
    up() {
      this.step = this.step * 1.0 - 1;
      return;
    },
    acceRole() {
      var step = this.step * 1.0;
      switch (step) {
        case 1:
          var checkNodes = this.$refs.tree.getCheckedNodes(false);
          if (checkNodes.length < 1) {
            this.$swal.fire({
              icon: "warning",
              title: "請先選擇模塊",
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }

          this.setProperties(checkNodes);
          this.step = 2;
          break;
        case 2:
          this.noSystemNodes.forEach((item, index) => {
            this.$api.modules.unAssignDataProperty(item.code, this.roleId).then(() => {
              this.$api.modules.assignDataProperty(item.code, this.roleId, item.checks).then(() => {
                if (index + 1 === this.noSystemNodes.length) {
                  this.$swal.fire({
                    icon: "success",
                    title: "分配成功",
                    timer: 1500,
                    showConfirmButton: false,
                  });
                  this.close();
                }
              });
            });
          });
          break;
      }
      return;
    },
    // checkNodes = 當前選中的function
    setProperties(checkNodes) {
      var noSystem = false;
      this.noSystemNodes = [];

      checkNodes.forEach((item) => {
        if (!item.isSys && typeof item.isSys === "boolean" && !!item.code) {
          noSystem = true;
          this.$api.modules.getProperties(item.code).then((res) => {
            item.properties = res.result;
            this.$api.modules.loadPropertiesForRole(item.code, this.roleId).then((res) => {
              item.loadPropertiesForRole = res.result;
              item.checks = res.result || [];
              item.checkAll = false;
              item.isIndeterminate = false;
              item.checkAll = item.checks.length === item.properties.length;
              item.isIndeterminate = !!(item.checks.length > 0 && item.checks.length < item.properties.length);
              this.noSystemNodes.push(item);
              this.step = 2;
            });
          });
        }
      });
      if (noSystem) {
        this.saveAssign();
        // 有部分不是系統模塊,需要分配字段
      } else {
        // 全是系統模塊
        this.saveAssign();
        this.close();
      }
    },
    // 儲存所選function
    saveAssign() {
      // 目前所有勾選的key值/items值
      const keys = this.$refs.tree.getCheckedKeys();
      const getCheckedItems = this.moduleArr.filter((i) => keys.includes(i.id));

      // eslint-disable-next-line
      const getCheckedElements = getCheckedItems.filter((i) => !!i.moduleId);
      const getCheckedMenus = getCheckedItems.filter((i) => !i.moduleId);

      this.$api.accessobjs
        .assign({
          type: "RoleModule",
          firstId: this.roleId,
          secIds: getCheckedMenus.map((i) => i.id),
        })
        .then(() => {
          this.$api.accessobjs
            .assign({
              type: "RoleElement",
              firstId: this.roleId,
              secIds: getCheckedElements.map((i) => i.id),
            })
            .then(() => {
              this.$swal.fire({
                icon: "success",
                title: "分配成功",
                timer: 1500,
                showConfirmButton: false,
              });
            });
        });
    },
    handleCheckPropAllChange(val, properties, index) {
      const item = this.noSystemNodes[index];
      item.checks = val ? properties.map((item) => item.columnName) : [];
      item.isIndeterminate = false;
      this.$set(this.noSystemNodes, index, item);
    },
  },
};
</script>

<style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: left;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.p-m {
  padding: 10px;
}
.p-l-m {
  padding-left: 10px;
}

.hide {
  display: none;
}
</style>