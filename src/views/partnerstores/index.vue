<template>
  <div class="flex-column newsPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入標題'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <!-- <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)"> -->
          <!-- <el-table-column type="selection" align="center" width="55"> </el-table-column> -->
          <el-table-column width="150px" align="center" label="發佈日期" prop="releaseDate">
            <template slot-scope="scope">
              <span>{{ $dayjs(scope.row.releaseDate).format("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="150px" align="center" label="類別名稱" prop="categoryName"></el-table-column>
          <el-table-column min-width="200px" align="center" label="標題" prop="title"></el-table-column>
          <el-table-column width="180px" align="center" label="列表圖片" prop="listImg">
            <template slot-scope="scope">
              <div class="imgWrap"><img :src="`${imgUrl}${scope.row.listImg}`" alt="" /></div>
            </template>
          </el-table-column>
          <el-table-column width="100px" align="center" label="是否可用">
            <template slot-scope="scope"
              ><span>{{ scope.row.state ? "是" : "否" }}</span></template
            >
          </el-table-column>
          <el-table-column min-width="100px" align="center" :label="'操作'">
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

    <el-dialog class="dialog-mini" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <!-- 類別 -->
          <el-col :span="24">
            <el-form-item label="商店類別" prop="categoryId">
              <el-select class="itemWidth" v-model="temp.categoryId" placeholder="請選擇類別" @blur="validateBlurSelect('categoryId')">
                <el-option v-for="item in selectLists" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 商店名稱 -->
          <el-col :span="24">
            <el-form-item label="商店名稱" prop="name">
              <el-input class="itemWidth" type="text" v-model="temp.name" size="small" placeholder="請輸入商店名稱"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店簡介 -->
          <el-col :span="24">
            <el-form-item label="摘要" prop="contents">
              <el-input class="itemWidth" type="textarea" v-model="temp.contents" size="small" placeholder="請輸入商店簡介"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店電話號碼 -->
          <el-col :span="24">
            <el-form-item label="電話號碼" prop="telephone">
              <el-input class="itemWidth" type="text" v-model="temp.telephone" size="small" placeholder="請輸入商店電話"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店地址 -->
          <el-col :span="24">
            <el-form-item label="商店地址" prop="address">
              <el-input class="itemWidth" type="text" v-model="temp.address" size="small" placeholder="請輸入商店地址"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店經度 -->
          <el-col :span="24">
            <el-form-item label="商店位置經度" prop="longitude">
              <el-input class="itemWidth" type="text" v-model="coordinate.longitude" size="small" placeholder="請輸入商店位置經度"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店緯度 -->
          <el-col :span="24">
            <el-form-item label="商店位置緯度" prop="latitude">
              <el-input class="itemWidth" type="text" v-model="coordinate.latitude" size="small" placeholder="請輸入商店位置緯度"></el-input>
            </el-form-item>
          </el-col>
          <!-- 商店營業開始時間 -->
          <el-col :span="24">
            <el-form-item label="營業開始時間">
                <el-time-picker v-model="startTime" size="small"  placeholder="任意时间点"> </el-time-picker>
                <!-- :arrowControl="data.options.arrowControl" :value-format="data.options.format" -->
            </el-form-item>
          </el-col>
          <!-- 商店結束營業時間 -->
          <!-- <el-col :span="24">
            <el-form-item label="營業結束時間">
           
              <el-time-picker v-model="endTime" value-format='HH:mm' format='HH:mm'>
              </el-time-picker>
             
            </el-form-item>
          </el-col> -->
          <!-- 排序 -->
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small" :min="0"></el-input-number>
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
        <el-button size="mini" @click="closeDialog">取消</el-button>
        <el-button size="mini" type="primary" @click="submit">確認</el-button>
        <!-- <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button> -->
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
  categoryId: "", //類別名稱
  categoryName: "", //類別名稱
  name: "", //商店名稱
  contents: "", //商店簡介
  telephone: "", //商店電話

  address: "", //商店地址
  longLat: "", //商店經緯度
  businessHours: "", //商店營業時間
  sort: 0, //排序
  state: true, //預設為上架,狀態上架/下架
};

export default {
  name: "partnerstores",
  components: { Sticky, permissionBtn, Pagination },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    // 自定驗證電話號碼
    var checkPhone = (rule, value, callback) => {
      console.log(typeof value, "\\\\/");
      //   const phoneReg = /(\d{2,3}-?|\(\d{2,3}\))\d{3,4}-?\d{4}|09\d{2}(\d{6}|-\d{3}-\d{3})/g;
      const phoneReg = this.temp.telephone.match(/^[0-9]+$/);
      console.log(phoneReg);
      if (phoneReg) {
        callback();
      } else {
        callback(new Error("請輸入數字"));
      }
      //   if (!Number.isInteger(+value)) {
      //     callback(new Error("請輸入數字"));
      //   } else {
      //     if (phoneReg.test(value)) {
      //       callback();
      //     } else {
      //       callback(new Error("電話號碼格式不正確"));
      //     }
      //   }
    };
    return {
      timePlacement:"選擇時間",
      startTime:"",
      endTime:"",
      coordinate: {
        longitude: "", //經度
        latitude: "", //緯度
      },
      selectLists: [],
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      fileList: [],
      dynamicTags: [],
      tagInputVisible: false,
      tagInputValue: "",
      isRepeatTag: false,
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
        CategoryId: "", //商家ID
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
        name: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        contents: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        telephone: [
          { required: true, message: "必填欄位", trigger: ["blur", "change"] },
          { validator: checkPhone, trigger: ["blur", "change"] },
          { min: 9, message: "號碼至少9碼", trigger: ["blur", "change"] },
        ],
        address: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        longitude: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        latitude: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        sort: [{ required: true, message: "必填欄位", trigger: "blur" }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getList();
    this.selectData();
  },
  methods: {
    validateBlurSelect(id) {
      this.$refs.ruleForm.validateField(id);
    },
    getList() {
      this.listLoading = true;
      this.$api.partnerStores.getList(this.listQuery).then((response) => {
        const { data, count } = response;
        this.list = data;
        this.total = count;
        this.listLoading = false;
      });
    },
    // 取得下拉選單
    selectData() {
      let temp = {
        page: 1,
        limit: 999,
        TypeId: "SYS_NEWS",
      };
      this.$api.partnerStoreCategorys.getList(temp).then((res) => {
        const { code, data } = res;
        if (code === 200) {
          this.selectLists = data.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        }
      });
    },
    fileSuccess(res, file, fileList) {
      const { filePath } = res[0];
      console.log(file);
      console.log("fileList", fileList);
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
    tagDelete(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },
    showInput() {
      this.tagInputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm() {
      let tagInputValue = this.tagInputValue;
      this.isRepeatTag = this.dynamicTags.includes(tagInputValue);
      if (!tagInputValue) {
        this.tagInputVisible = false;
      }
      if (tagInputValue && !this.isRepeatTag) {
        this.dynamicTags.push(tagInputValue);
        this.tagInputVisible = false;
        this.tagInputValue = "";
      }
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
      //this.$refs["ruleForm"].clearValidate();
      this.$refs["ruleForm"].resetFields();
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
      this.fileList = [];
      this.dynamicTags = [];
      this.dialogStatus = "";
      this.isRepeatTag = false;
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
      this.temp.releaseDate = this.$dayjs().format("YYYY-MM-DD");
    },
    // 保存提交
    submit() {
      let apiName = "";
      switch (this.dialogStatus) {
        case "add":
          apiName = "add";
          break;
        case "update":
          apiName = "update";
          break;
      }
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          //處理TAG
          this.temp.tags = this.dynamicTags.join(",");

          //取得類別名稱
          this.temp.categoryName = this.selectLists.filter((item) => item.value === this.temp.categoryId)[0]?.label;

          this.$api.partnerStores[apiName](this.temp).then(() => {
            // this.list.unshift(this.temp);
            // this.dialogFormVisible = false;
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            this.closeDialog();
            this.getList();
          });
        }
      });
    },
    // 編輯彈窗
    handleUpdate(row) {
      this.$api.partnerStores.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          if (this.temp.tags) {
            this.dynamicTags = this.temp.tags.split(",");
          }
          this.fileList.push({
            path: this.temp.listImg,
          });
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    // 列表刪除
    handleDelete(rows) {
      this.delrows("partnerStores", rows, this.getList);
    },
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
    },
    // 列表表格操作
    // rowClick(row) {
    //   this.$refs.mainTable.clearSelection();
    //   this.$refs.mainTable.toggleRowSelection(row);
    // },
    //列表表格操作
    // handleSelectionChange(val) {
    //   this.multipleSelection = val;
    // },
  },
};
</script>
<style lang="scss" scoped>
@import "~vue2-editor/dist/vue2-editor.css";

/* Import the Quill styles you want */
@import "~quill/dist/quill.core.css";
@import "~quill/dist/quill.bubble.css";
@import "~quill/dist/quill.snow.css";
.newsPage {
  .dialogContent {
    max-height: 70vh;
    overflow-y: auto;
    .tagError {
      color: #d63737;
      font-size: 12px;
      line-height: 20px;
    }
    .el-tag {
      margin-right: 10px;
    }
    .button-new-tag {
      display: block;
      // margin-left: 10px;
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .input-new-tag {
      display: block;
      width: 90px;
      // margin-left: 10px;
    }
  }
}
</style>
