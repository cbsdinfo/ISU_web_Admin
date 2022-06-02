<template>
  <div class="form-config-container">
    <el-form label-position="top">
      <el-form-item :label="'標籤對齊方式'">
        <el-radio-group v-model="data.labelPosition" size="small">
          <el-radio-button label="left">左對齊</el-radio-button>
          <el-radio-button label="right">右對齊</el-radio-button>
          <el-radio-button label="top">頂對齊</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item :label="'表單標籤寬度'">
        <el-input-number v-model="data.labelWidth" :min="0" :max="200" size="small" :step="10"></el-input-number>
      </el-form-item>

      <el-form-item :label="'組件大小'">
        <el-radio-group v-model="data.size" size="small">
          <el-radio-button label="medium">medium</el-radio-button>
          <el-radio-button label="small">small</el-radio-button>
          <el-radio-button label="mini">mini</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "created-form-config",
  props: ["data"],
};
</script>