<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入商家名稱'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <el-select v-model.trim="temp.categoryId" placeholder="請選擇集章類別" size="mini">
          <el-option v-for="item in selectListCategories" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <!-- <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜尋</el-button> -->
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <!-- <el-table-column type="selection" align="center" width="55"> </el-table-column> -->
          <!-- <el-table-column min-width="50px" label="類別序號" prop="categoryId"></el-table-column> -->
          <el-table-column min-width="50px" label="類別名稱" prop="categoryName"></el-table-column>
          <el-table-column min-width="50px" label="商家名稱" prop="storeName"></el-table-column>
          <el-table-column min-width="50px" label="集章商品名稱" prop="productName"></el-table-column>
          <el-table-column min-width="50px" label="兌換點數" prop="points"></el-table-column>
          <el-table-column min-width="50px" label="庫存量" prop="inventory"></el-table-column>
          <el-table-column min-width="50px" label="狀態">
            <template slot-scope="scope">
              <span>{{ scope.row.state? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="200px" :label="'操作'">
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

    <el-dialog class="dialog-mini preview-dialog" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
    <!-- <el-dialog v-el-drag-dialog class="dialog-mini" width="500px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible"> -->
      <el-form label-width="120px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
          <!-- <el-col :span="24">
            <el-form-item label="類別名稱" prop="categoryName">
               <el-input type="text" v-model="temp.categoryName" size="small" placeholder="請輸入類別名稱"></el-input>
            </el-form-item>
          </el-col> -->

          <!-- 集章類別 -->
          <el-col :span="24">
            <el-form-item label="集章類別" prop="categoryId">
              <el-select v-model.trim="temp.categoryId" @blur="validateBlurSelect('categoryId')" class="itemWidth" placeholder="請選擇集章類別">
                <el-option v-for="item in selectListCategories" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 商家名稱 -->
          <el-col :span="24">
            <el-form-item label="商家名稱" prop="storeName">
              <el-input type="text" v-model="temp.storeName" size="small" placeholder="請輸入商家名稱"></el-input>
            </el-form-item>
          </el-col>
          <!-- 集章商品名稱 -->
          <el-col :span="24">
            <el-form-item label="集章商品名稱" prop="productName">
              <el-input type="text" v-model="temp.productName" size="small" placeholder="請輸入集章商品名稱"></el-input>
            </el-form-item>
          </el-col>
          <!-- 兌換點數 -->
          <el-col :span="24">
            <el-form-item label="兌換點數" prop="points">
              <el-input-number v-model="temp.points" placeholder="請輸入兌換點數" size="small"></el-input-number>
            </el-form-item>
          </el-col>
          <!-- 庫存量 -->
          <el-col :span="24">
            <el-form-item label="庫存量" prop="inventory">
              <el-input-number v-model="temp.inventory" placeholder="請輸入庫存量" size="small"></el-input-number>
            </el-form-item>
          </el-col>
          <!-- 狀態(上架/下架) -->
          <el-col :span="24">
            <el-form-item label="狀態(上架/下架)" prop="state">
              <el-switch v-model="temp.state" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="closeDialog" size="mini">取消</el-button>
        <el-button @click="submit" size="mini" type="primary">確認</el-button>
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
  categoryId: "",//集章類別ID
  categoryName: "",//集章類別名稱
  storeName: "",//店家名稱
  productName: "",//產品名稱
  points: 0,//點數章數
  inventory: 0,//庫存
  state: false,//上(下)價狀態
};

export default {
  name: "stampStoreProduct",
  components: { Sticky, permissionBtn, Pagination },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      selectListCategories:[],
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 10,
        key: undefined,//商家名稱,
        CategoryId:""//類別ID
      },
      temp: JSON.parse(JSON.stringify(formTemplate)),
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        add: "新增",
      },
      rules: {
        categoryId: [{ required: true, message: "必填欄位", trigger: "change" }],
        categoryName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        storeName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        productName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        points: [{ required: true, message: "必填欄位", trigger: "blur" }],
        inventory: [{ required: true, message: "必填欄位", trigger: "blur" }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getList();
    this.selectData()
  },
  methods: {
    validateBlurSelect(type) {
      this.$refs.ruleForm.validateField(type);
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    selectData() {
      let temp = {
        page: 1,
        limit: 999,
        TypeId: "SYS_stampStoreProducts",
      };
      this.$api.categorys.load(temp).then((res) => {
        const { code, data } = res;
        if (code === 200) {
          this.selectListCategories = data.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        }
      });
    },
    onBtnClicked: function (domId) {
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
    getList() {
      this.listLoading = true;
      this.$api.stampStoreProducts.getList(this.listQuery).then((response) => {
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
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
    },
    resetTemp() {
      this.$refs["ruleForm"].resetFields();
      this.temp = JSON.parse(JSON.stringify(formTemplate));
    },
    // 彈出新增框
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
      // this.resetTemp();
      // this.dialogStatus = "add";
      // this.dialogFormVisible = true;
      // this.$nextTick(() => {
      //   this.$refs["ruleForm"].clearValidate();
      // });
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
          // this.temp.categoryName = this.selectListCategories.filter((item) => item.value === this.temp.categoryId)[0]?.label;
          this.$api.stampStoreProducts[apiName](this.temp).then(() => {
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
      // this.$refs["ruleForm"].validate((valid) => {
      //   if (valid) {
      //     this.$api.stampStoreProducts.add(this.temp).then(() => {
      //       this.list.unshift(this.temp);
      //       this.dialogFormVisible = false;
      //       this.$swal.fire({
      //         title: "成功",
      //         icon: "success",
      //         timer: 2000,
      //         showConfirmButton: false,
      //       });
      //     });
      //   }
      // });
    },
    // 彈出(編輯)
    handleUpdate(row) {
      this.$api.stampStoreProducts.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          console.log(result);
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    // 列表刪除
    handleDelete(rows) {
      this.delrows("stampStoreProducts", rows,this.getList);
    },
    // updateData() {
    //   // 更新提交
    //   this.$refs["ruleForm"].validate((valid) => {
    //     if (valid) {
    //       const tempData = Object.assign({}, this.temp);
    //       this.$api.stampStoreProducts.update(tempData).then(() => {
    //         for (const v of this.list) {
    //           if (v.id === this.temp.id) {
    //             const index = this.list.indexOf(v);
    //             this.list.splice(index, 1, this.temp);
    //             break;
    //           }
    //         }
    //         this.dialogFormVisible = false;
    //         this.$swal.fire({
    //           title: "成功",
    //           icon: "success",
    //           timer: 2000,
    //           showConfirmButton: false,
    //         });
    //       });
    //     }
    //   });
    // },
  },
};
</script>
