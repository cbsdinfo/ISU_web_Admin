<template>
  <div class="dashboard-editor-container">
    <panel-group></panel-group>
  </div>
</template>


<script>
import PanelGroup from "./components/PanelGroup";

export default {
  name: "dashboard-admin",
  components: {
    PanelGroup,
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  min-height: calc(100vh - 84px);
}
</style>