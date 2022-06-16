<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'名稱'" v-model="listQuery.key"> </el-input>
        <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)" @row-click="rowClick" @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center" width="55"> </el-table-column>
          <el-table-column min-width="50px" label="產品類別ID" prop="categoryId"></el-table-column>
          <el-table-column min-width="50px" label="產品類別名稱" prop="categoryName"></el-table-column>
          <el-table-column min-width="50px" label="商家名稱" prop="storeName"></el-table-column>
          <el-table-column min-width="50px" label="供應商代碼" prop="vendorCode"></el-table-column>
          <el-table-column min-width="50px" label="商城產品ID" prop="productId"></el-table-column>
          <el-table-column min-width="50px" label="產品名稱" prop="productName"></el-table-column>
          <el-table-column min-width="50px" label="價格" prop="price"></el-table-column>
          <el-table-column min-width="50px" label="產品圖檔" prop="picture"></el-table-column>
          <el-table-column min-width="50px" label="連結路徑" prop="url"></el-table-column>
          <el-table-column min-width="50px" label="是否可用"
            ><template slot-scope="scope"
              ><span>{{ scope.row.featured === 1 ? "是" : "否" }}</span></template
            ></el-table-column
          >
          <el-table-column min-width="50px" label="狀態( 1 = 未審核/ 2 =上架/ 3 =未通過)" prop="state"></el-table-column>

          <el-table-column min-width="200px" :label="'操作'">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handleUpdate(scope.row)" type="primary" v-if="hasButton('btnEdit')">編輯</el-button>
                <el-button size="mini" @click="handleDelete([scope.row])" type="warning" v-if="hasButton('btnDel')">刪除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <el-dialog v-el-drag-dialog class="dialog-mini" @close="closeDialog" width="500px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form label-width="100px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
          <el-col :span="24">
            <el-form-item label="產品類別ID" prop="categoryId">
              <el-select v-model="temp.categoryId" placeholder="請選擇產品類別ID"><el-option label="請選擇" value="請選擇"></el-option></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="產品類別名稱" prop="categoryName">
              <el-input type="text" v-model="temp.categoryName" size="small" placeholder="請輸入產品類別名稱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="商家名稱" prop="storeName">
              <el-input type="text" v-model="temp.storeName" size="small" placeholder="請輸入商家名稱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="供應商代碼" prop="vendorCode">
              <el-input type="text" v-model="temp.vendorCode" size="small" placeholder="請輸入供應商代碼"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="商城產品ID" prop="productId">
              <el-select v-model="temp.productId" placeholder="請選擇商城產品ID"><el-option label="請選擇" value="請選擇"></el-option></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="產品名稱" prop="productName">
              <el-input type="text" v-model="temp.productName" size="small" placeholder="請輸入產品名稱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="價格" prop="price">
              <el-input-number v-model="temp.price" placeholder="請輸入價格" size="small"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="產品圖檔" prop="picture">
              <el-input type="text" v-model="temp.picture" size="small" placeholder="請輸入產品圖檔"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="連結路徑" prop="url">
              <el-input type="text" v-model="temp.url" size="small" placeholder="請輸入連結路徑"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否為精選商品" prop="featured">
              <el-switch v-model="temp.featured" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="狀態( 1 = 未審核/ 2 =上架/ 3 =未通過)" prop="state">
              <el-input-number v-model="temp.state" placeholder="請輸入狀態( 1 = 未審核/ 2 =上架/ 3 =未通過)" size="small"></el-input-number>
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
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";

const formTemplate = {
  id: "",
  categoryId: "",
  categoryName: "",
  storeName: "",
  vendorCode: "",
  productId: "",
  productName: "",
  price: 0,
  picture: "",
  url: "",
  featured: false,
  state: 0,
};

export default {
  name: "product",
  components: { Sticky, permissionBtn, Pagination },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      filePath: "",
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: JSON.parse(JSON.stringify(formTemplate)),
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        create: "添加",
      },
      rules: {
        categoryId: [{ required: true, message: "必填欄位", trigger: "blur" }],
        categoryName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        storeName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        vendorCode: [{ required: true, message: "必填欄位", trigger: "blur" }],
        productId: [{ required: true, message: "必填欄位", trigger: "blur" }],
        productName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        price: [{ required: true, message: "必填欄位", trigger: "blur" }],
        picture: [{ required: true, message: "必填欄位", trigger: "blur" }],
        url: [{ required: true, message: "必填欄位", trigger: "blur" }],
        featured: [{ required: true, message: "必填欄位", trigger: "blur" }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
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
            this.temp.listImg = result[0].filePath;
            item.onSuccess(result);
          }
        });
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onBtnClicked: function (domId, callback) {
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
        case "btnExport":
          this.$refs.mainTable.exportExcel("資源文件", callback);
          break;
        default:
          break;
      }
    },
    getList() {
      this.listLoading = true;
      this.$api.products.getList(this.listQuery).then((response) => {
        const { data, count } = response;
        this.list = data;
        this.total = count;
        this.listLoading = false;
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
    resetTemp() {
      this.$refs["ruleForm"].resetFields();
      this.temp = JSON.parse(JSON.stringify(formTemplate));
      this.fileList = [];
    },
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
    },
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    // 保存提交
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          let apiName = "";
          switch (this.dialogStatus) {
            case "add":
              apiName = "add";
              break;
            case "update":
              apiName = "update";
              break;
          }
          this.$api.products[apiName](this.temp).then(() => {
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            this.closeDialog()
            this.getList()
          });
        }
      });
    },
    handleUpdate() {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    handleDelete(rows) {
      // 多行刪除
      this.delrows("products", rows);
    },
  },
};
</script>
