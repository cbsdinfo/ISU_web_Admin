<template>
  <el-menu class="navbar" mode="horizontal">
    <div class="logo"><img class="user-avatar" :src="logo" />ISU</div>
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    <el-dropdown class="avatar-container" @command="handleCommand" trigger="click">
      <div class="avatar-wrapper">
        歡迎您，{{ name }}
        <i class="el-icon-caret-bottom"></i>
      </div>
      <el-dropdown-menu class="user-dropdown" slot="dropdown">
        <el-dropdown-item command="handleGoProfile">
          <span>個人中心</span>
        </el-dropdown-item>
        <el-dropdown-item>
          <span>切換主題
            <el-switch :active-value="1" :inactive-value="0" style="margin-left: 5px" v-model="theme" />
          </span>
        </el-dropdown-item>
        <el-dropdown-item command="logout" divided>
          <span>登出</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-menu>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Hamburger from "@/components/Hamburger";
import logo from "@/assets/logo.png?imageView2/1/w/80/h/80";

export default {
  data: function () {
    return {
      logo: logo,
      theme: 1,
    };
  },
  components: {
    Hamburger,
  },
  computed: {
    ...mapGetters(["sidebar", "name", "themeStatus"]),
  },
  watch: {
    theme() {
      this.toggleClass(document.body, "custom-theme");
    },
  },
  mounted() {
    this.theme = Number(this.themeStatus);
    this.toggleClass(document.body, "custom-theme");
  },
  methods: {
    ...mapActions(["signOutOidc", "saveTheme"]),
    toggleClass(element, className) {
      if (!element || !className) {
        return;
      }
      let classString = element.className;
      const nameIndex = classString.indexOf(className);
      if (nameIndex === -1) {
        classString += "" + className;
      } else if (this.theme !== 1) {
        classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length);
      }
      element.className = this.theme === 1 ? classString : "";
      this.saveTheme(this.theme);
    },
    toggleSideBar() {
      this.$store.dispatch("ToggleSideBar");
    },
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        location.reload(); // 為了重新實例化vue-router對象 避免bug
      });
    },
    handleGoProfile() {
      this.$router.push("/profile");
    },
    handleCommand(name) {
      if (!name) return;
      this[name]();
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
