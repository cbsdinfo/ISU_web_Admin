<template>
  <div class="flex-column newsPage">
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
          <!-- <el-table-column min-width="50px" label="類別序號" prop="categoryId"></el-table-column> -->
          <el-table-column min-width="50px" label="發佈日期" prop="releaseDate"></el-table-column>
          <el-table-column min-width="50px" label="類別名稱" prop="categoryName"></el-table-column>
          <el-table-column min-width="50px" label="標題" prop="title"></el-table-column>
          <el-table-column min-width="50px" label="摘要" prop="summury"></el-table-column>
          <el-table-column min-width="50px" label="內容" prop="contents"></el-table-column>
          <el-table-column min-width="50px" label="TAG設定" prop="tags"></el-table-column>
          <el-table-column min-width="50px" label="列表圖片" prop="listImg"></el-table-column>
          <el-table-column min-width="50px" label="排序" prop="sort"></el-table-column>
          <el-table-column min-width="50px" label="是否可用"
            ><template slot-scope="scope"
              ><span>{{ scope.row.state === 1 ? "是" : "否" }}</span></template
            ></el-table-column
          >

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

    <el-dialog class="dialog-mini" top="10vh" :close-on-click-modal="false" :lock-scroll="true" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
          <el-col :span="24">
            <el-form-item label="類別" prop="categoryId">
              <el-select v-model="temp.categoryId" placeholder="請選擇類別" @blur="validateBlurSelect">
                  <el-option v-for="item in selectLists"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <el-form-item label="類別名稱" prop="categoryName">
              <el-input type="text" v-model="temp.categoryName" size="small" placeholder="請輸入類別名稱"></el-input>
            </el-form-item>
          </el-col> -->
          <el-col :span="24">
            <el-form-item label="日期" prop="releaseDate">
              <el-date-picker type="date" v-model="temp.releaseDate" value-format="yyyy-MM-dd" placeholder="請選擇日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="標題" prop="title">
              <el-input type="text" v-model="temp.title" size="small" placeholder="請輸入標題"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="摘要" prop="summury">
              <el-input type="text" v-model="temp.summury" size="small" placeholder="請輸入摘要"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="列表圖片" prop="listImg">
              <el-input v-show="false" type="text" v-model="temp.listImg" size="small" placeholder="請輸入摘要"></el-input>
              <el-upload ref="upload" action="#" list-type="picture-card" :limit="1" :disabled="!!temp.listImg"
                :on-success="fileSuccess"
                :http-request="uploadFile"
              >
                <i slot="default" class="el-icon-plus"></i>
                <div slot="file" slot-scope="{ file }">
                  <img class="el-upload-list__item-thumbnail" :src="`${imgUrl}${file.path}`" alt="" />
                  <span class="el-upload-list__item-actions">
                    <span class="el-upload-list__item-delete" @click="handleRemove"><i class="el-icon-delete"></i></span>
                  </span>
                </div>
              </el-upload>
            </el-form-item>

            <!-- <input type="file" name="" id="" @change="inputFile"> -->
          </el-col>
          <el-col :span="24">
            <el-form-item label="內容" prop="contents">
              <!-- <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.contents" placeholder="請輸入內容"></el-input> -->
              <VueEditor  v-model="temp.contents"></VueEditor>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="TAG設定">
              <el-button v-if="!tagInputVisible" class="button-new-tag" size="small" @click="showInput">+ 新增TAG</el-button>
              <el-input class="input-new-tag" v-if="tagInputVisible" v-model="tagInputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm"> </el-input>
              <p class="tagError" v-if="isRepeatTag">請勿重覆TAG名稱</p>
              <el-tag :key="tag" v-for="tag in dynamicTags" closable :disable-transitions="false" @close="handleClose(tag)">{{ tag }}</el-tag>
              <!-- <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.tags" placeholder="請輸入TAG設定"></el-input> -->
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="狀態(上架/下架)" prop="state">
              <el-switch v-model="temp.state" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="mini" v-if="dialogStatus == 'create'" type="primary" @click="createData">確認</el-button>
        <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button>
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
  state: false, //狀態
};

export default {
  name: "news",
  components: { Sticky, permissionBtn, Pagination,VueEditor },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    // var validateTags = (rule, value, callback) => {
    //   console.log(value);
    // };
    return {
      selectLists:[],
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      filePath:"",
      fileList:[],
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
      },
      temp: JSON.parse(JSON.stringify(formTemplate)),
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        create: "添加",
      },
      rules: {
        categoryId: [{ required: true, message: "必填欄位", trigger: "change" }],
        categoryName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        releaseDate: [{ required: true, message: "必填欄位", trigger: "blur" }],
        title: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        summury: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        // contents: [{ required: true, message: "必填欄位", trigger: "blur" }],
        sort: [{ required: true, message: "必填欄位", trigger: "blur" }],
        listImg: [{ required: true, message: "圖片為必填" }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  mounted() {
    //TODO:取得類別下拉
    this.getList();
    this.selectData()
  },
  methods: {
     getList() {
      this.listLoading = true;
      this.$api.newss.Load(this.listQuery).then((response) => {
        const { data, count } = response;
        this.list = data;
        this.total = count;
        this.listLoading = false;
      });
    },
    selectData(){
      let temp = {
        page: 1,
        limit: 999,
        TypeId: "SYS_NEWS",
      }
      this.$api.categorys.Load(temp).then((res) => {
        const {code,data} = res
        if(code===200){
          this.selectLists = data.map((item)=>({
            label:item.name,
            value:item.id
          }))
        }
        console.log(this.selectLists);
      });
    //  this.$api.newss.Get({id:'SYS_NEWS'}).then((res) => {
    //    console.log(res);
    //   });
    },
    handleRemove(file){
      console.log(file);
      let fileList = this.$refs.upload.uploadFiles;
      console.log(fileList);
      let targetId = fileList[0].id
      this.$api.files.Delete([targetId]).then((res)=>{
        const { code } = res;
        if (code === 200) {
          fileList.forEach((item,index)=>{
            if(item.id===targetId){
              fileList.splice(index, 1)
              this.temp.listImg = ""
            }
          })
        }
      })
    },
    fileSuccess(res,file,fileList) {
      const {id,filePath} = res[0]
      fileList[0].path = filePath
      fileList[0].id = id
    },
    uploadFile(item){
      let imgFile = item.file
      if(imgFile){
        const formData = new FormData();
        formData.append('files',imgFile);
        this.$api.files.Upload(formData).then((res)=>{
            const { code,result } = res;
            if (code === 200) {
              this.temp.listImg = result[0].filePath;
              item.onSuccess(result)
            }
        })
      }
    },
    handleClose(tag) {
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
      console.log(this.isRepeatTag);
      if (this.isRepeatTag) {
        console.log("請勿重覆TAG");
      }
      if (tagInputValue && !this.isRepeatTag) {
        this.dynamicTags.push(tagInputValue);
        this.tagInputVisible = false;
        this.tagInputValue = "";
      }
    },
    //rule驗證select的blur事件會無法正常觸發,所以這邊額外自己寫
    validateBlurSelect() {
      this.$refs.ruleForm.validateField("categoryId");
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
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
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    resetTemp() {
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
    },
    // 彈出添加框
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
    },
    // 保存提交
    createData() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$api.newss.add(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          });
        }
      });
    },
    // 彈出編輯框
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
    },
    // 更新提交
    updateData() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          this.$api.newss.update(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.temp);
                break;
              }
            }
            this.dialogFormVisible = false;
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          });
        }
      });
    },
    // 多行刪除
    handleDelete(rows) {
      this.delrows("newss", rows);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~vue2-editor/dist/vue2-editor.css";

/* Import the Quill styles you want */
@import '~quill/dist/quill.core.css';
@import '~quill/dist/quill.bubble.css';
@import '~quill/dist/quill.snow.css';
.newsPage{
  .testLAbel{
    width: 120px;
  }
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
  .dialogContent{
    max-height: 70vh;
    overflow-y: auto
  }
}
</style>
