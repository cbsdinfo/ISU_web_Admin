<template>
  <div class="flex-column newsPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入標題'" v-model="listQuery.key"> </el-input>
        <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%">
        <!-- <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)"> -->
          <!-- <el-table-column type="selection" align="center" width="55"> </el-table-column> -->
          <el-table-column min-width="50px" align="center" label="發佈日期" prop="releaseDate" :formatter="dateFormat"></el-table-column>
          <el-table-column min-width="50px" align="center" label="類別名稱" prop="categoryName"></el-table-column>
          <el-table-column min-width="50px" align="center" label="標題" prop="title"></el-table-column>
          <el-table-column min-width="300px" align="center" label="列表圖片" prop="listImg">
            <template slot-scope="scope">
              <div class="imgWrap"><img :src="`${imgUrl}${scope.row.listImg}`" alt=""></div>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" align="center" label="是否可用">
            <template slot-scope="scope"><span>{{ scope.row.state? "是" : "否" }}</span></template>
          </el-table-column>
          <el-table-column max-width="100px" align="center" :label="'操作'">
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

    <el-dialog class="dialog-mini" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
          <!-- 類別 -->
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
          <!-- 日期 -->
          <el-col :span="24">
            <el-form-item label="日期" prop="releaseDate">
              <el-date-picker type="date" v-model="temp.releaseDate" value-format="yyyy-MM-dd" placeholder="請選擇日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <!-- 標題 -->
          <el-col :span="24">
            <el-form-item label="標題" prop="title">
              <el-input type="text" v-model="temp.title" size="small" placeholder="請輸入標題"></el-input>
            </el-form-item>
          </el-col>
          <!-- 摘要 -->
          <el-col :span="24">
            <el-form-item label="摘要" prop="summury">
              <el-input type="text" v-model="temp.summury" size="small" placeholder="請輸入摘要"></el-input>
            </el-form-item>
          </el-col>
          <!-- 圖片上傳 -->
          <el-col :span="24">
            <el-form-item label="列表圖片" prop="listImg">
              <el-input v-show="false" type="text" v-model="temp.listImg"></el-input>
              <el-upload ref="upload" action="#" list-type="picture-card" :limit="2"
                :file-list="fileList"
                :on-success="fileSuccess"
                :http-request="uploadFile"
              >
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
              <VueEditor  v-model="temp.contents"></VueEditor>
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
              <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small"></el-input-number>
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
  components: { Sticky, permissionBtn, Pagination,VueEditor },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
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
    this.getList();
    this.selectData()
  },
  methods: {
    dateFormat(row){
      let date = row.releaseDate
      return this.$dayjs(date).format("YYYY-MM-DD")
    },
    getList() {
      this.listLoading = true;
      this.$api.newss.load(this.listQuery).then((response) => {
        const { data, count } = response;
        this.list = data;
        this.total = count;
        this.listLoading = false;
      });
    },
    // 取得下拉選單
    selectData(){
      let temp = {
        page: 1,
        limit: 999,
        TypeId: "SYS_NEWS",
      }
      this.$api.categorys.load(temp).then((res) => {
        const {code,data} = res
        if(code===200){
          this.selectLists = data.map((item)=>({
            label:item.name,
            value:item.id
          }))
        }
      });
    },
    fileSuccess(res,file,fileList) {
      const {filePath} = res[0]
      console.log(file);
      console.log("fileList",fileList);
      fileList.forEach((item,index)=>{
        if(file.uid!==item.uid){
          fileList.splice(index,1)
        }
      })
      fileList.forEach((item,index)=>{
        if(file.uid===item.uid){
          fileList[index].path = filePath
        }
      })
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
      if(!tagInputValue){
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
       this.temp.releaseDate = this.$dayjs().format("YYYY-MM-DD")
    },
    // 保存提交
    submit() {
      let apiName ="";
      switch(this.dialogStatus){
        case "add":
          apiName = "add"
          break
        case "update":
          apiName = "update"
          break
      }
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          //處理TAG
          this.temp.tags = this.dynamicTags.join(",")

          //取得類別名稱
          this.temp.categoryName = this.selectLists.filter((item)=>item.value===this.temp.categoryId)[0]?.label


          this.$api.newss[apiName](this.temp).then(() => {
            // this.list.unshift(this.temp);
            // this.dialogFormVisible = false;
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
    // 編輯彈窗
    handleUpdate(row) {
      this.$api.newss.get({id:row.id}).then((res)=>{
        const{code,result} = res
        if(code===200){
          let {id,categoryId,categoryName,releaseDate,title,summury,contents,tags,listImg,sort,state} = result
          this.temp = {id,categoryId,categoryName,releaseDate,title,summury,contents,tags,listImg,sort,state}
          if(tags){
            this.dynamicTags = tags.split(',')
          }
          this.fileList.push({
            path:listImg
          })
        }
      })
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    // 列表刪除
    handleDelete(rows) {
      this.delrows("newss",rows,this.getList);
    },
    closeDialog(){
      this.dialogFormVisible = false
      this.resetTemp()
    }
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
@import '~quill/dist/quill.core.css';
@import '~quill/dist/quill.bubble.css';
@import '~quill/dist/quill.snow.css';
.newsPage{
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
  .imgWrap{
    margin: auto;
    width: 200px;
    height: 200px;
    img{
      width: 100%;
      object-fit: cover
    }
  }
}
</style>
