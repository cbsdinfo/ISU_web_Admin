<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input class="filter-item" size="mini" style="width: 200px" :placeholder="'名稱'" @keyup.enter.native="handleFilter" v-model="listQuery.key"></el-input>

        <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)" @row-click="rowClick" @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center" width="55"> </el-table-column>
          <el-table-column min-width="50px" label="區域類別序號" prop="areaId"></el-table-column>
          <el-table-column min-width="50px" label="區域類別名稱" prop="areaName"></el-table-column>
          <el-table-column min-width="50px" label="類別序號" prop="categoryId"></el-table-column>
          <el-table-column min-width="50px" label="類別名稱" prop="categoryName"></el-table-column>
          <el-table-column min-width="50px" label="發佈日期" prop="releaseDate"></el-table-column>
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

    <el-dialog v-el-drag-dialog class="dialog-mini" width="500px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form label-width="100px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
          <!-- 區域類別 -->
          <el-col :span="24">
            <el-form-item label="區域類別" prop="categoryId">
              <el-select v-model="temp.areaId" placeholder="請選擇區域類別" @blur="validateBlurSelect">
                  <el-option v-for="item in selectListsRoad"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 文章類別 -->
          <el-col :span="24">
            <el-form-item label="文章類別" prop="categoryId">
              <el-select v-model="temp.categoryId" placeholder="請選擇文章類別" @blur="validateBlurSelect">
                  <el-option v-for="item in selectListsArticle"
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
          <!-- <el-col :span="24">
            <el-form-item label="標題" prop="title">
              <el-input type="text" v-model="temp.title" size="small" placeholder="請輸入標題"></el-input>
            </el-form-item>
          </el-col> -->
          <!-- 摘要 -->
          <!-- <el-col :span="24">
            <el-form-item label="摘要" prop="summury">
              <el-input type="text" v-model="temp.summury" size="small" placeholder="請輸入摘要"></el-input>
            </el-form-item>
          </el-col> -->
          <!-- 圖片上傳 -->
          <!-- <el-col :span="24">
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
          </el-col> -->
          <!-- 編輯器內容 -->
          <!-- <el-col :span="24">
            <el-form-item label="內容" prop="contents">
              <VueEditor  v-model="temp.contents"></VueEditor>
            </el-form-item>
          </el-col> -->
          <!-- TAG設定 -->
          <!-- <el-col :span="24">
            <el-form-item label="TAG設定">
              <el-button v-if="!tagInputVisible" class="button-new-tag" size="small" @click="showInput">+ 新增TAG</el-button>
              <el-input class="input-new-tag" v-if="tagInputVisible" v-model="tagInputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm"> </el-input>
              <p class="tagError" v-if="isRepeatTag">請勿重覆TAG名稱</p>
              <el-tag :key="tag" v-for="tag in dynamicTags" closable :disable-transitions="false" @close="tagClose(tag)">{{ tag }}</el-tag>
            </el-form-item>
          </el-col> -->
          <!-- 排序 -->
          <!-- <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small"></el-input-number>
            </el-form-item>
          </el-col> -->
          <!-- 狀態(上架/下架) -->
          <!-- <el-col :span="24">
            <el-form-item label="狀態(上架/下架)" prop="state">
              <el-switch v-model="temp.state" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col> -->
          <!-- <el-col :span="24">
            <el-form-item label="區域類別序號" prop="areaId">
              <el-select v-model="temp.areaId" placeholder="請選擇區域類別序號"><el-option label="請選擇" value="請選擇"></el-option></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="區域類別名稱" prop="areaName">
              <el-input type="text" v-model="temp.areaName" size="small" placeholder="請輸入區域類別名稱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="類別序號" prop="categoryId">
              <el-select v-model="temp.categoryId" placeholder="請選擇類別序號"><el-option label="請選擇" value="請選擇"></el-option></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="類別名稱" prop="categoryName">
              <el-input type="text" v-model="temp.categoryName" size="small" placeholder="請輸入類別名稱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="發佈日期" prop="releaseDate">
              <el-date-picker type="date" v-model="temp.releaseDate" placeholder="請選擇發佈日期"></el-date-picker>
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
            <el-form-item label="內容" prop="contents">
              <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.contents" placeholder="請輸入內容"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="TAG設定" prop="tags">
              <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.tags" placeholder="請輸入TAG設定"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="列表圖片" prop="listImg">
              <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.listImg" placeholder="請輸入列表圖片"></el-input>
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
          </el-col> -->
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
import pbMixins from "@/mixins/permissionBtn.js";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import extend from "@/extensions/delRows.js";

const formTemplate = {
  id: "",
  areaId: "",//區域被別ID
  areaName: "",//區域類別名稱
  categoryId: "",//文章類別ID
  categoryName: "",//文章類別名稱
  releaseDate: "",//發布日期
  title: "",//標調
  summury: "",//摘要
  contents: "",//文章內容(編輯器)
  tags: "",//TAG 設定
  listImg: "",//照片路徑
  sort: 0,//排序
  state: false,//狀態(上/下架)
};

export default {
  name: "playerLeadsWayArticle",
  components: { Sticky, permissionBtn, Pagination },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      selectListsArticle:[],
      selectListsRoad:[],
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
        areaId: [{ required: true, message: "必填欄位", trigger: "blur" }],
        areaName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        categoryId: [{ required: true, message: "必填欄位", trigger: "blur" }],
        categoryName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        releaseDate: [{ required: true, message: "必填欄位", trigger: "blur" }],
        title: [{ required: true, message: "必填欄位", trigger: "blur" }],
        summury: [{ required: true, message: "必填欄位", trigger: "blur" }],
        contents: [{ required: true, message: "必填欄位", trigger: "blur" }],
        sort: [{ required: true, message: "必填欄位", trigger: "blur" }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getList();
    this.selectData("SYS_PlayerLeads_Article")
    this.selectData("SYS_PlayerLeads_Area")
    // console.log(this.dayjs().format("YYYY-MM-DD"));
  },
  methods: {
    validateBlurSelect() {
      this.$refs.ruleForm.validateField("categoryId");
    },
    // 取得下拉選單
    selectData(typeId){
      let temp = {
        page: 1,
        limit: 999,
        TypeId: typeId,
      }
      this.$api.categorys.Load(temp).then((res) => {
        const {code,data} = res
        if(code===200){
          if(typeId==='SYS_PlayerLeads_Article'){
            this.selectListsArticle = data.map((item)=>({
              label:item.name,
              value:item.id
            }))
          } 
          if(typeId==='SYS_PlayerLeads_Area'){
            this.selectListsRoad = data.map((item)=>({
              label:item.name,
              value:item.id
            }))
          }
        
        }
      });
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
    getList() {
      this.listLoading = true;
      this.$api.playerLeadsWayArticles.getList(this.listQuery).then((response) => {
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
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    // 模擬修改狀態
    handleModifyStatus(row, disable) {
      this.$swal.fire({
        title: "操作成功",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      row.disable = disable;
    },
    resetTemp() {
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
    },
    // 彈出添加框
    handleCreate() {
      // this.resetTemp();
      this.temp.releaseDate = this.$dayjs().format("YYYY-MM-DD")
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
          this.$api.playerLeadsWayArticles.add(this.temp).then(() => {
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
          this.$api.playerLeadsWayArticles.update(tempData).then(() => {
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
      this.delrows("playerLeadsWayArticles", rows);
    },
  },
};
</script>

