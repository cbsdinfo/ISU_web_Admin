export default {
  data() {
    return {
      /* 權限按鈕 */
      buttons: [],
    };
  },
  methods: {
    /* 獲取本路由下所有功能按鈕 */
    getButtons() {
      this.$route.meta.elements.forEach((el) => {
        this.buttons.push(el.domId);
      });
    },

    /* 是否擁有按鈕功能權限 */
    hasButton(domId) {
      return this.buttons.includes(domId);
    },
  },
  mounted() {
    this.getButtons();
  },
};
