<template>
  <section class="pageLogin">
    <div class="pageLogin__card">
      <div class="pageLogin__card--left">
        <img src="@/assets/login/loginPic.svg" alt="" />
      </div>

      <div class="pageLogin__card--right">
        <el-form class="loginForm" autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">
          <h3 class="loginForm__title" @click="handleSuperLogin()">ISU</h3>
          <el-form-item prop="username">
            <el-input suffix-icon="iconfont icon-yonghu_zhanghao_wode" name="username" type="text" v-model="loginForm.username" autoComplete="on" placeholder="請輸入帳號" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="loginForm.password" placeholder="請輸入密碼">
              <i slot="suffix" title="顯示密碼" @click="showPwd()" style="cursor: pointer" class="el-input__icon iconfont icon-xianshi_chakan" :class="`icon-${pwdType === 'password' ? 'xianshi_chakan' : 'yincang'}`"></i>
            </el-input>
          </el-form-item>

          <el-button class="loginForm__btn" v-waves :loading="loading" @click.native.prevent="handleLogin()">登入</el-button>
        </el-form>
      </div>
    </div>

    <!-- super login container -->
    <transition name="fade">
      <div v-if="superLogin" class="superLogin__container">
        <div @click="loginBy(item.account, item.password)" v-for="item in accountData" :key="item.account" class="superLogin__account">
          {{ item.name }}
        </div>
      </div>
    </transition>
  </section>
</template>

<script>
import waves from "@/directive/waves"; // 水波紋指令

export default {
  name: "login",
  directives: { waves },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.length <= 0) {
        callback(new Error("帳號不能為空"));
      } else {
        callback();
      }
    };
    const validatePass = (rule, value, callback) => {
      if (value.length <= 0) {
        callback(new Error("密碼不能為空"));
      } else {
        callback();
      }
    };

    return {
      loginForm: {
        username: "",
        password: "",
        appkey: "",
      },
      /* account data */
      superLogin: false,
      accountData: [
        {
          name: "最高權限管理員",
          account: "System",
          password: "123456",
        },
        {
          name: "中邦測試人員",
          account: "CBSD_ADMIN",
          password: "CBSD_ADMIN",
        },
      ],

      loginRules: {
        username: [
          {
            required: true,
            trigger: "blur",
            validator: validateUsername,
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            validator: validatePass,
          },
        ],
      },
      loading: false,
      pwdType: "password",
    };
  },
  methods: {
    /* 快速登入 */
    handleSuperLogin() {
      if (process.env.NODE_ENV === "development") this.superLogin = true;
    },
    loginBy(str, pas) {
      this.loginForm = {
        username: str,
        password: pas,
        appkey: "",
      };

      this.handleLogin();
    },

    showPwd() {
      if (this.pwdType === "password") {
        this.pwdType = "";
      } else {
        this.pwdType = "password";
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("Login", this.loginForm)
            .then((status) => {
              if (status === "success") {
                this.$swal
                  .fire({
                    icon: "success",
                    title: "登入成功！",
                    timer: 1500,
                    showConfirmButton: false,
                  })
                  .then(() => {
                    this.loading = false;
                    this.$router.push({
                      path: "/",
                    });
                  });
              }
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$main: #3baba4;
$subColor: #f2961a;
$light_gray: #eee;
$color_balck: #333;

.pageLogin {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url("../../assets/login/bg.svg");

  &__card {
    display: flex;
    background-color: white;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
    border-radius: 42px;

    &--left {
      padding: 50px;
      border-radius: 42px 0 0 42px;
    }

    &--right {
      padding: 50px;
      background-color: #f2f3f5;
      border-radius: 0 42px 42px 0;
      display: flex;
      align-items: center;
      justify-content: center;

      ::v-deep input {
        min-width: 250px;
      }

      .loginForm {
        &__title {
          color: $main;
          font-size: 24px;
          font-weight: 500;
          margin: 0;
          padding-bottom: 20px;
        }

        &__btn {
          width: 100%;
          height: 40px;
          background-color: $main;
          color: white;
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
  }
}

@media (max-width: 1023px) {
  .pageLogin {
    background-image: url("../../assets/login/bg-phone.svg");
    &__card {
      &--left {
        display: none;
      }
      &--right {
        padding: 30px;
        border-radius: 42px;
      }
    }
  }
}

.superLogin {
  &__container {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: transparent;
    height: 50px;
    display: flex;
    padding: 0.25rem 2rem;
    align-items: center;
    transition: 0.5s;
  }

  &__account {
    transition: 0.5s;
    cursor: pointer;
    padding: 0.5rem 1rem;
    color: #dddddd;
    letter-spacing: 0.15rem;
    border: 1px dashed #dddddd;
    border-radius: 0.5rem;
    margin-right: 0.75rem;

    &:hover {
      box-shadow: 0 0 8px $subColor;
      text-shadow: 0 0 4px $subColor;
      border: 1px solid $subColor;
      transform: translateY(-4px);
    }
  }
}
</style>