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
          <el-table-column width="180px" align="center" label="列表圖片" prop="listImg">
            <template slot-scope="scope">
              <div class="imgWrap"><img :src="`${imgUrl}${scope.row.listImg}`" alt="" /></div>
            </template>
          </el-table-column>
          <el-table-column min-width="150px" align="center" label="類別名稱" prop="categoryName"></el-table-column>
          <el-table-column min-width="200px" align="center" label="標題" prop="title"></el-table-column>
          <el-table-column width="80px" align="center" label="狀態">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{ scope.row.state ? "上架" : "下架" }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120px" align="center" label="發佈日期" prop="releaseDate">
            <template slot-scope="scope">
              <span>{{ scope.row.releaseDate | dateTimeFormatToDate }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="150px" align="center" :label="'操作'" fixed="right">
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

    <el-dialog class="dialog-mini" v-loading="newsFormLoading" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
          <!-- 類別 -->
          <el-col :span="24">
            <el-form-item label="類別" prop="categoryId">
              <el-select class="itemWidth" v-model="temp.categoryId" placeholder="請選擇類別" @blur="validateBlurSelect">
                <el-option v-for="item in selectLists" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 日期 -->
          <el-col :span="24">
            <el-form-item label="日期" prop="releaseDate">
              <el-date-picker class="itemWidth" type="date" v-model="temp.releaseDate" value-format="yyyy-MM-dd" placeholder="請選擇日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <!-- 標題 -->
          <el-col :span="24">
            <el-form-item label="標題" prop="title">
              <el-input class="itemWidth" type="text" v-model="temp.title" size="small" placeholder="請輸入標題"></el-input>
            </el-form-item>
          </el-col>
          <!-- 摘要 -->
          <el-col :span="24">
            <el-form-item label="摘要" prop="summury">
              <el-input class="itemWidth" type="textarea" v-model="temp.summury" size="small" placeholder="請輸入摘要"></el-input>
            </el-form-item>
          </el-col>
          <!-- 圖片上傳 -->
          <el-col :span="24">
            <el-form-item label="列表圖片" prop="listImg">
              <el-input v-show="false" type="text" v-model="temp.listImg"></el-input>
              <el-upload ref="upload" action="#" list-type="picture-card" :limit="2" :file-list="fileList" :on-success="fileSuccess" :http-request="uploadFile">
                <i slot="default" class="el-icon-plus"></i>
                <div slot="file" slot-scope="{ file }">
                  <img class="el-upload-list__item-thumbnail" :src="`${imgUrl}${file.path}`" alt="" />
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
          <!-- 編輯器內容 -->
          <el-col :span="24">
            <el-form-item label="內容" prop="contents">
              <!-- <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.contents" placeholder="請輸入內容"></el-input> -->
              <VueEditor v-model="temp.contents"></VueEditor>
            </el-form-item>
          </el-col>
          <!-- TAG設定 -->
          <el-col :span="24">
            <el-form-item label="TAG設定">
              <el-button v-if="!tagInputVisible" class="button-new-tag" size="small" @click="showInput">+ 新增TAG</el-button>
              <el-input class="input-new-tag" v-if="tagInputVisible" v-model="tagInputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm"> </el-input>
              <p class="tagError" v-if="isRepeatTag">請勿重覆TAG名稱</p>
              <el-tag :key="tag" v-for="tag in dynamicTags" closable :disable-transitions="false" @close="tagDelete(tag)">{{ tag }}</el-tag>
              <!-- <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.tags" placeholder="請輸入TAG設定"></el-input> -->
            </el-form-item>
          </el-col>
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
import { VueEditor } from "vue2-editor/dist/vue2-editor.core.js";
import pbMixins from "@/mixins/permissionBtn.js";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";

const formTemplate = {
  id: "", //序號ID(API,CategoryTypes/Load回傳的id)
  categoryId: "", //類別ID
  categoryName: "", //類別名稱
  releaseDate: "", //發佈日期
  title: "", //標題
  summury: "", //摘要
  contents: "", //編輯器內容
  tags: "", //TAG 設定
  listImg: "", //列表圖片
  sort: 0, //排序
  state: true, //狀態
};

export default {
  name: "news",
  components: { Sticky, permissionBtn, Pagination, VueEditor },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      temp: JSON.parse(JSON.stringify(formTemplate)),
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      selectLists: [],
      fileList: [],
      dynamicTags: [],
      tagInputVisible: false,
      tagInputValue: "",
      isRepeatTag: false,
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      newsFormLoading: null,
      listLoading: true,
      dialogFormVisible: false,
      dialogStatus: "",
      listQuery: { // 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
      },
      textMap: {
        update: "編輯",
        add: "新增",
      },
      rules: {
        categoryId: [{ required: true, message: "必填欄位", trigger: "change" }],
        categoryName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        releaseDate: [{ required: true, message: "必填欄位", trigger: "blur" }],
        title: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        summury: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        listImg: [{ required: true, message: "圖片為必填" }],
        sort: [{ required: true, message: "必填欄位", trigger: "blur" }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  computed: {
    stateTextColor() {
      return (state) => {
        return state ? "greenText" : "redText";
      };
    },
  },
  mounted() {
    this.getList();
    this.selectData();
  },
  methods: {
    getList() {
      this.listLoading = true;
      this.$api.newss.load(this.listQuery).then((response) => {
        const { data, count,code } = response;
        if(code===200){
          this.list = data;
          this.total = count;
          this.listLoading = false;
          this.$nextTick(() => {
            this.$refs.mainTable.doLayout();
          });
        }
      });
    },
    // 取得下拉選單
    selectData() {
      let temp = {
        page: 1,
        limit: 999,
        TypeId: "SYS_NEWS",
      };
      this.$api.categorys.load(temp).then((res) => {
        const { code, data } = res;
        if (code === 200) {
          this.selectLists = data.map((item) => ({
            label: item.name,
            value: item.id,
            disabled:!item.isEnable
          }));
        }
      });
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
    //rule驗證select的blur事件會無法正常觸發,所以這邊額外自己寫blur事件來驗證
    validateBlurSelect() {
      this.$refs.ruleForm.validateField("categoryId");
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
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
      this.fileList = [];
      this.dynamicTags = [];
      this.dialogStatus = "";
      this.isRepeatTag = false;
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.temp.releaseDate = this.$dayjs().format("YYYY-MM-DD");
      this.dialogFormVisible = true;
    },
    // 保存提交
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.newsFormLoading = true;
          //處理TAG
          this.temp.tags = this.dynamicTags.join(",");

          //取得類別名稱
          this.temp.categoryName = this.selectLists.filter((item) => item.value === this.temp.categoryId)[0]?.label;

          this.$api.newss[this.dialogStatus](this.temp).then((res) => {
            this.newsFormLoading = false;
            const {code} = res
            if(code===200){
              this.newsFormLoading = false;
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
    // 編輯彈窗
    handleUpdate(row) {
      this.newsFormLoading = true;
      this.$api.newss.get({ id: row.id }).then((res) => {
        this.newsFormLoading = false;
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
      this.delrows("newss", rows, this.getList);
    },
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
    },
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
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .input-new-tag {
      display: block;
      width: 90px;
    }
  }
}
</style>
