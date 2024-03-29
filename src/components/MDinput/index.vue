<template>
  <div class="material-input__component" :class="computedClasses">
    <div :class="{iconClass:icon}">
      <i class="el-input__icon material-input__icon" :class="['el-icon-' + icon]" v-if="icon"></i>
      <input v-if="type === 'email'" type="email" class="material-input" :name="name" :placeholder="fillPlaceHolder" v-model="currentValue" :readonly="readonly" :disabled="disabled" :autoComplete="autoComplete" :required="required" @focus="handleMdFocus" @blur="handleMdBlur" @input="handleModelInput">
      <input v-if="type === 'url'" type="url" class="material-input" :name="name" :placeholder="fillPlaceHolder" v-model="currentValue" :readonly="readonly" :disabled="disabled" :autoComplete="autoComplete" :required="required" @focus="handleMdFocus" @blur="handleMdBlur" @input="handleModelInput">
      <input v-if="type === 'number'" type="number" class="material-input" :name="name" :placeholder="fillPlaceHolder" v-model="currentValue" :step="step" :readonly="readonly" :disabled="disabled" :autoComplete="autoComplete" :max="max" :min="min" :minlength="minlength" :maxlength="maxlength" :required="required" @focus="handleMdFocus" @blur="handleMdBlur" @input="handleModelInput">
      <input v-if="type === 'password'" type="password" class="material-input" :name="name" :placeholder="fillPlaceHolder" v-model="currentValue" :readonly="readonly" :disabled="disabled" :autoComplete="autoComplete" :max="max" :min="min" :required="required" @focus="handleMdFocus" @blur="handleMdBlur" @input="handleModelInput">
      <input v-if="type === 'tel'" type="tel" class="material-input" :name="name" :placeholder="fillPlaceHolder" v-model="currentValue" :readonly="readonly" :disabled="disabled" :autoComplete="autoComplete" :required="required" @focus="handleMdFocus" @blur="handleMdBlur" @input="handleModelInput">
      <input v-if="type === 'text'" type="text" class="material-input" :name="name" :placeholder="fillPlaceHolder" v-model="currentValue" :readonly="readonly" :disabled="disabled" :autoComplete="autoComplete" :minlength="minlength" :maxlength="maxlength" :required="required" @focus="handleMdFocus" @blur="handleMdBlur" @input="handleModelInput">
      <span class="material-input-bar"></span>
      <label class="material-label">
        <slot></slot>
      </label>
    </div>
  </div>
</template>

<script>
// source:https://github.com/wemake-services/vue-material-input/blob/master/src/components/MaterialInput.vue

export default {
  name: "md-input",
  props: {
    icon: String,
    name: String,
    type: {
      type: String,
      default: "text",
    },
    value: [String, Number],
    placeholder: String,
    readonly: Boolean,
    disabled: Boolean,
    min: String,
    max: String,
    step: String,
    minlength: Number,
    maxlength: Number,
    required: {
      type: Boolean,
      default: true,
    },
    autoComplete: {
      type: String,
      default: "off",
    },
    validateEvent: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    computedClasses() {
      return {
        "material--active": this.focus,
        "material--disabled": this.disabled,
        "material--raised": Boolean(this.focus || this.currentValue), // has value
      };
    },
  },
  watch: {
    value(newValue) {
      this.currentValue = newValue;
    },
  },
  data() {
    return {
      currentValue: this.value,
      focus: false,
      fillPlaceHolder: null,
    };
  },
  methods: {
    handleModelInput(event) {
      const value = event.target.value;
      this.$emit("input", value);
      if (this.$parent.$options.componentName === "ElFormItem") {
        if (this.validateEvent) {
          this.$parent.$emit("el.form.change", [value]);
        }
      }
      this.$emit("change", value);
    },
    handleMdFocus(event) {
      this.focus = true;
      this.$emit("focus", event);
      if (this.placeholder && this.placeholder !== "") {
        this.fillPlaceHolder = this.placeholder;
      }
    },
    handleMdBlur(event) {
      this.focus = false;
      this.$emit("blur", event);
      this.fillPlaceHolder = null;
      if (this.$parent.$options.componentName === "ElFormItem") {
        if (this.validateEvent) {
          this.$parent.$emit("el.form.blur", [this.currentValue]);
        }
      }
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
// Fonts:
$font-size-base: 16px;
$font-size-small: 18px;
$font-size-smallest: 12px;
$font-weight-normal: normal;
$font-weight-bold: bold;
$apixel: 1px;
// Utils
$spacer: 12px;
$transition: 0.2s ease all;
$index: 0px;
$index-has-icon: 30px;
// Theme:
$color-white: white;
$color-grey: #9e9e9e;
$color-grey-light: #e0e0e0;
$color-blue: #2196f3;
$color-red: #f44336;
$color-black: black;
// Base clases:
%base-bar-pseudo {
  content: "";
  height: 1px;
  width: 0;
  bottom: 0;
  position: absolute;
  transition: $transition;
}

// Mixins:
@mixin slided-top() {
  top: -($font-size-base + $spacer);
  left: 0;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
}

// Component:
.material-input__component {
  margin-top: 36px;
  position: relative;
  * {
    box-sizing: border-box;
  }
  .iconClass {
    .material-input__icon {
      position: absolute;
      left: 0;
      line-height: $font-size-base;
      color: $color-blue;
      top: $spacer;
      width: $index-has-icon;
      height: $font-size-base;
      font-size: $font-size-base;
      font-weight: $font-weight-normal;
      pointer-events: none;
    }
    .material-label {
      left: $index-has-icon;
    }
    .material-input {
      text-indent: $index-has-icon;
    }
  }
  .material-input {
    font-size: $font-size-base;
    padding: $spacer $spacer $spacer - $apixel * 10 $spacer / 2;
    display: block;
    width: 100%;
    border: none;
    line-height: 1;
    border-radius: 0;
    &:focus {
      outline: none;
      border: none;
      border-bottom: 1px solid transparent; // fixes the height issue
    }
  }
  .material-label {
    font-weight: $font-weight-normal;
    position: absolute;
    pointer-events: none;
    left: $index;
    top: 0;
    transition: $transition;
    font-size: $font-size-small;
  }
  .material-input-bar {
    position: relative;
    display: block;
    width: 100%;
    &:before {
      @extend %base-bar-pseudo;
      left: 50%;
    }
    &:after {
      @extend %base-bar-pseudo;
      right: 50%;
    }
  }
  // Disabled state:
  &.material--disabled {
    .material-input {
      border-bottom-style: dashed;
    }
  }
  // Raised state:
  &.material--raised {
    .material-label {
      @include slided-top();
    }
  }
  // Active state:
  &.material--active {
    .material-input-bar {
      &:before,
      &:after {
        width: 50%;
      }
    }
  }
}

.material-input__component {
  background: $color-white;
  .material-input {
    background: none;
    color: $color-black;
    text-indent: $index;
    border-bottom: 1px solid $color-grey-light;
  }
  .material-label {
    color: $color-grey;
  }
  .material-input-bar {
    &:before,
    &:after {
      background: $color-blue;
    }
  }
  // Active state:
  &.material--active {
    .material-label {
      color: $color-blue;
    }
  }
  // Errors:
  &.material--has-errors {
    &.material--active .material-label {
      color: $color-red;
    }
    .material-input-bar {
      &:before,
      &:after {
        background: transparent;
      }
    }
  }
}
</style>
