<template>
  <div class="flex-column productCategorys">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" @change="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'名稱'" v-model="listQuery.key"> </el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <!-- <el-table-column type="selection" align="center" width="55"> </el-table-column> -->
          <el-table-column width="120px" label="商品類別圖片" prop="picture" align="center">
            <template slot-scope="scope">
              <div class="imgWrap"><img :src="`${imgUrl}${scope.row.picture}`" alt="" /></div>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" label="商品類別名稱" prop="name" align="center"></el-table-column>
          <el-table-column min-width="50px" label="排序" prop="sort" align="center"></el-table-column>
          <el-table-column min-width="50px" label="狀態" align="center">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{ scope.row.state ? "上架" : "下架" }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="100px" :label="'操作'" align="center" fixed="right">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handleUpdate(scope.row)" type="primary" v-if="hasButton('btnEdit')">編輯</el-button>
                <el-button size="mini" @click="handleDelete([scope.row])" type="danger" v-if="hasButton('btnDel')">刪除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <el-dialog class="dialog-mini" v-loading="formLoading" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form label-width="120px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
          <el-col :span="24">
            <el-form-item label="商品類別名稱" prop="name">
              <el-input type="text" v-model="temp.name" size="small" placeholder="請輸入商品類別名稱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="列表圖片" prop="picture">
              <el-input v-show="false" type="text" v-model="temp.picture"></el-input>
              <el-upload ref="upload" action="#" list-type="picture-card" :limit="2" :file-list="fileList" :on-success="fileSuccess" :http-request="uploadFile">
                <i slot="default" class="el-icon-plus"></i>
                <div slot="file" slot-scope="{ file }">
                  <img class="el-upload-list__item-thumbnail" :src="`${imgUrl}${file.path}`" alt="" />
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small" :min="0"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="狀態(上架/下架)" prop="state">
              <el-switch v-model="temp.state" active-text="上架" inactive-text="下架"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closeDialog">取消</el-button>
        <el-button size="mini" type="primary" @click="submit">確認</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import pbMixins from "@/mixins/permissionBtn.js";
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import extend from "@/extensions/delRows.js";

const formTemplate = {
  id: "",
  name: "",
  picture: "",
  sort: 0,
  state: false,
};

export default {
  name: "productCategory",
  components: { Sticky, permissionBtn, Pagination },
  mixins: [pbMixins, extend],
  data() {
    return {
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      temp: JSON.parse(JSON.stringify(formTemplate)),
      fileList: [],
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      formLoading:false,
      listLoading: true,
      dialogFormVisible: false,
      dialogStatus: "",
      listQuery: {// 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
      },
      textMap: {
        update: "編輯",
        create: "新增",
      },
      rules: {
        name: [{ required: true, message: "必填欄位", trigger: "blur" }],
        picture: [{ required: true, message: "必填欄位", trigger: "blur" }],
        sort: [{ required: true, message: "必填欄位", trigger: "blur" }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getList();
  },
  computed:{
    stateTextColor(){
      return (state)=>{
        return state?'greenText':'redText'
      }
    }
  },
  methods: {
    //成功上傳圖片後的回調
    fileSuccess(res, file, fileList) {
      const { filePath } = res[0];
      fileList.forEach((item, index) => {
        if (file.uid !== item.uid) {
          fileList.splice(index, 1);
        }
      });
      fileList.forEach((item, index) => {
        if (file.uid === item.uid) {
          fileList[index].path = filePath;
        }
      });
    },
    uploadFile(item) {
      let imgFile = item.file;
      if (imgFile) {
        const formData = new FormData();
        formData.append("files", imgFile);
        this.$api.files.Upload(formData).then((res) => {
          const { code, result } = res;
          if (code === 200) {
            this.temp.picture = result[0].filePath;
            item.onSuccess(result);
          }
        });
      }
    },
    getList() {
      this.listLoading = true;
      this.$api.productCategorys.getList(this.listQuery).then((response) => {
        this.listLoading = false;
        const { data, count,code } = response;
        if(code===200){
          this.list = data;
          this.total = count;
          this.$nextTick(() => {
            this.$refs.mainTable.doLayout();
          });
        }
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    //新增(彈窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    // 保存提交
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.formLoading = true

          this.$api.productCategorys[this.dialogStatus](this.temp).then((res) => {
            this.formLoading = false
            const {code} = res
            if(code===200){
              this.$swal.fire({
                title: "成功",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
              this.closeDialog();
              this.getList();
            }
          });
        }
      });
    },
    //編輯(彈窗)
    handleUpdate(row) {
      this.$api.productCategorys.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          let { id, picture, name, sort, state } = result;
          this.temp = { id, picture, name, sort, state };
          this.fileList.push({
            path: picture,
          });
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    handleDelete(rows) {
      // 多行刪除
      this.delrows("productCategorys", rows, this.getList);
    },
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
    },
    resetTemp() {
      this.$refs["ruleForm"].resetFields();
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
      this.fileList = [];
    },
    onBtnClicked: function (domId) {
      console.log("you click:" + domId);
      switch (domId) {
        case "btnAdd":
          this.handleCreate();
          break;
        case "btnEdit":
          if (this.multipleSelection.length !== 1) {
            this.$swal.fire({
              title: "只能選中一個進行編輯",
              icon: "error",
              timer: 2000,
              showConfirmButton: false,
            });
            return;
          }
          this.handleUpdate(this.multipleSelection[0]);
          break;
        case "btnDel":
          if (this.multipleSelection.length < 1) {
            this.$swal.fire({
              title: "至少刪除一個",
              icon: "error",
              timer: 2000,
              showConfirmButton: false,
            });

            return;
          }
          this.handleDelete(this.multipleSelection);
          break;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.productCategorys {
  .imgWrap {
    margin: auto;
    width: 100px;
    height: 100px;
    img {
      width: 100%;
      object-fit: cover;
    }
  }
}
</style>