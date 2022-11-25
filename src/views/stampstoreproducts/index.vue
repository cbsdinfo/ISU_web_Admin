<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-select v-model.trim="listQuery.CategoryId" placeholder="請選擇集章類別" size="mini" @change="handleFilter">
          <el-option v-for="item in selectListCategoriesFilter" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入商家名稱'" v-model="listQuery.key" @change="handleFilter()" clearable></el-input>
        <permission-btn v-if="!hasButton('highestAuthorityRole')" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
         
          <el-table-column min-width="60px" label="集章類別名稱" prop="categoryName" align="center"></el-table-column>
          <el-table-column min-width="100px" label="商家名稱" prop="storeName" align="center"></el-table-column>
          <el-table-column min-width="100px" label="集章商品名稱" prop="productName" align="center"></el-table-column>
          <el-table-column width="150px" label="兌換章數" prop="points" align="center"></el-table-column>
          <!-- <el-table-column min-width="50px" label="庫存量" prop="inventory" align="center"></el-table-column> -->
          <el-table-column width="100px" label="狀態" align="center">
            <template slot-scope="scope">
              <span :class="stateTextColor(scope.row.state)">{{ scope.row.state? "上架" : "下架" }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120px" label="建立日期" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.releaseDate | dateTimeFormatToDate }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="!hasButton('highestAuthorityRole')" width="200px" :label="'操作'" align="center" fixed="right">
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

    <el-dialog class="dialog-mini preview-dialog" v-loading="formLoading" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form label-width="120px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
          <!-- 集章類別 -->
          <el-col :span="24">
            <el-form-item label="集章類別" prop="categoryId">
              <el-select v-model.trim="temp.categoryId" @blur="validateBlurSelect('categoryId')" class="itemWidth" placeholder="請選擇集章類別">
                <el-option v-for="item in selectListCategories" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 商家名稱 -->
          <el-col :span="24">
            <el-form-item label="商家名稱" prop="storeName">
              <el-input type="text" v-model="temp.storeName" size="small" placeholder="請輸入商家名稱" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <!-- 集章商品名稱 -->
          <el-col :span="24">
            <el-form-item label="集章商品名稱" prop="productName">
              <el-input type="text" v-model="temp.productName" size="small" placeholder="請輸入集章商品名稱"></el-input>
            </el-form-item>
          </el-col>
          <!-- 兌換章數 -->
          <el-col :span="24">
            <el-form-item label="兌換章數" prop="points">
              <el-input v-model.number="temp.points" placeholder="請輸入兌換點數" size="small"></el-input>
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
  storeId: "",//一般角色權限給登入帳號所屬的機構id;
  categoryId: "",//集章類別ID
  categoryName: "",//集章類別名稱
  storeName: "",//店家名稱
  productName: "",//產品名稱
  points: undefined,//點數章數
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
      temp: JSON.parse(JSON.stringify(formTemplate)),
      selectListCategories:[],
      selectListCategoriesFilter:[],
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      dialogFormVisible: false,
      dialogStatus: "",
      formLoading:false,
      listLoading: true,
      selectDataQuery:{
        page: 1,
        limit: 999,
        TypeId: "SYS_stampstorecategorys",
        StoreId:"",
      },
      listQuery: {// 查詢條件
        page: 1,
        limit: 10,
        StoreId:"",//必給
        key: undefined,//商家名稱,
        CategoryId:""//類別ID
      },
      textMap: {
        update: "編輯",
        add: "新增",
      },
      rules: {
        categoryId: [{ required: true, message: "必填欄位", trigger: "change" }],
        categoryName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        storeName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        productName: [{ required: true, message: "必填欄位", trigger: "blur" }],
        points: [
          { required: true, message: "必填欄位", trigger: "blur" },
          { type:'number',message:"必須是數字"}
        ],
        inventory: [{ required: true, message: "必填欄位", trigger: "blur" }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
    };
  },
  computed:{
    stateTextColor(){
      return (state)=>{
        return state ? "greenText" : "redText";
      }
    }
  },
  async mounted() {
    if(this.hasButton("highestAuthorityRole")){//判斷此帳號
    console.log('highestAuthorityRole');
      this.listQuery.StoreId = ""
      //有最高權限,可以取得所有機構新增的集章類別
      this.selectDataQuery.StoreId = ""
      this.selectData()
      this.getList();
    }else{
      //一般權限,只能取得該機構新增過的集章類別
      console.log('只能看自己商店的物品');
      await this.getOrgs()
      this.selectData()
      this.getList();
    }
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
    //取得該商店,機構,公司的id
    getOrgs(){
      return new Promise((resolve)=>{
        this.$api.login.getOrgs(this.$store.state.user.token).then((res)=>{
            const {code,result} = res;
            if(code===200){
                // let rootParentId = result.filter(item=>!item.parentId)[0]?.id
                // console.log('只能看自己商店的物品','result',result,rootParentId);
                // // this.selectDataQuery.StoreId = rootParentId;
                // // this.listQuery.StoreId = rootParentId;

                this.selectDataQuery.StoreId = result[0].id;
                this.listQuery.StoreId = result[0].id;
                resolve()
            }
        })
      })
    },
    selectData() {
      this.$api.categorys.load(this.selectDataQuery).then((res) => {
        const { code, data } = res;
        if (code === 200) {
         
          // this.selectListCategories = data.filter(item=>item.isEnable)
          this.selectListCategories = data.map((item) => ({
            label: item.name,
            value: item.id,
            disabled:!item.isEnable
          }));
         
          this.selectListCategoriesFilter = JSON.parse(JSON.stringify(data))
          this.selectListCategoriesFilter = this.selectListCategoriesFilter.map((item) => ({
            label: item.name,
            value: item.id,
          }));
          this.selectListCategoriesFilter.unshift({
            label: '全部',
            value: "",
          })
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
      console.log(this.listQuery);
      this.listLoading = true;
      this.$api.stampStoreProducts.getList(this.listQuery).then((response) => {
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
      this.temp.storeName = this.$store.state.user.defaultorg.name
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    // 保存提交
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.formLoading = true
          if(this.dialogStatus==='add'){
            //業務邏輯:只有一般商店的角色可新增,如果未來需求能使最高權限角色也可新增的話,要和後端確認最高權限角色新增時storeId要給什麼
            this.temp.storeId = this.$store.state.user.defaultorg.id
          }
          this.temp.categoryName = this.selectListCategories.filter((item) => item.value === this.temp.categoryId)[0]?.label;
          
          this.$api.stampStoreProducts[this.dialogStatus](this.temp).then((res) => {
            this.formLoading = false
            const{code} = res;
            if(code===200){
              this.$swal.fire({
                title: "成功",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
              this.closeDialog()
              this.getList()
            }
          });
        }
      });
    },
    // 彈出(編輯)
    handleUpdate(row) {
      this.$api.stampStoreProducts.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
          this.dialogStatus = "update";
          this.dialogFormVisible = true;
        }
      });
     
    },
    // 列表刪除
    handleDelete(rows) {
      this.delrows("stampStoreProducts", rows,this.getList);
    },
  },
};
</script>
