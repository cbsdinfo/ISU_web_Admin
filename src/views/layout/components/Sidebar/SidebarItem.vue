<template>
  <div v-if="!item.hidden" class="customColor">
    <template v-if="!item.children || item.children.length <= 0 || item.alwaysShow">
      <el-menu-item :index="item.path" :class="{'submenu-title-noDropdown':!isNest}">
        <i :class="`iconfont icon-${item.meta.icon}`"></i>
        <span v-if="item.meta && item.meta.title" slot="title">{{item.meta.title}}</span>
      </el-menu-item>
    </template>

    <el-submenu v-else :index="item.path">
      <template slot="title">
        <i :class="`iconfont icon-${item.meta.icon}`"></i>
        <span v-if="item.meta&&item.meta.title" slot="title">{{item.meta.title}}</span>
      </template>

      <template v-for="child in routes">
        <template v-if="!child.hidden">
          <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children && child.children.length>0" :item="child" :key="child.path"></sidebar-item>
          <el-menu-item v-else :key="child.name" :index="child.path">
            <i :class="`iconfont icon-${child.meta.icon}`"></i>
            <span v-if="child.meta&&child.meta.title" slot="title">{{child.meta.title}}</span>
          </el-menu-item>
        </template>
      </template>
    </el-submenu>

  </div>
</template>

<script>
export default {
  name: "SidebarItem",
  props: {
    // route配置json
    item: {
      type: Object,
      required: true,
    },
    isNest: {
      type: Boolean,
      default: false,
    },
    basePath: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      routes: [],
    };
  },
  watch: {
    item() {
      this.groupRouters();
    },
  },
  created() {
    this.groupRouters();
  },
  methods: {
    groupRouters() {
      this.routes =
        this.item.children &&
        this.item.children.length > 0 &&
        this.item.children.sort((a, b) => a.meta.sortNo - b.meta.sortNo);
    },
  },
};
</script>
<style lang="scss" scope>
.el-menu{
  background-color: #050D34 !important;
  .customColor{//單層菜單
    .el-menu-item{
      background-color: #050D34 !important;
      .iconfont{
        margin-right: 5px;
        color: rgba(255, 255, 255, 0.85) !important;
      }
      span{
        color: rgba(255, 255, 255, 0.85) !important;
        font-weight: 400;
      }
    }
    .el-submenu{//雙層菜單
      .el-submenu__title{
        background-color: #050D34 !important;
          .iconfont,span, .el-submenu__icon-arrow{
            color: rgba(255, 255, 255, 0.85) !important;
          }
          .iconfont{
            margin-right: 5px;
          }
          span{
            font-weight: 400;
          }
        
        
      }
    }
  }
}
.menu-wrapper .iconfont {
  margin-right: 5px;
  font-size: 16px;
  vertical-align: middle;
}
</style>


