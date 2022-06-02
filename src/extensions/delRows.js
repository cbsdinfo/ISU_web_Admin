// delRows.js

let extension = {
  components: {
    //組件擴展
  },

  methods: {//事件擴展
    delrows(objs, rows, callback) {
      var _this = this
      _this.$swal.fire({
        title: "確定要刪除嗎？",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$api[objs].del(rows.map(u => u.id)).then((res) => {
            if (res.code === 200) {
              _this.$swal.fire({
                icon: "success",
                title: "刪除成功",
                timer: 1500,
                showConfirmButton: false
              }).then(() => {
                rows.forEach(row => {
                  const index = _this.list.indexOf(row)
                  _this.list.splice(index, 1)
                })
                if (callback != undefined) {
                  callback()
                }
              })
            }
          })
        }
      });
    }
  }
};
export default extension;
