<template>
  <div class="flex-column bannerPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'名稱'" v-model="listQuery.key"> </el-input>
        <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <el-tabs v-model="defaultTabName" @tab-click="tabsClick">
      <el-tab-pane label="上方banner" name="topBanner"></el-tab-pane>
      <el-tab-pane label="中間banner" name="middleBanner"></el-tab-pane>
      <div class="app-container flex-item">
        <div class="bg-white" style="height: 100%">
          <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%">
            <el-table-column min-width="100px" label="圖片" prop="picture" align="center">
                <template slot-scope="scope">
                <div class="imgWrap"><img :src="`${imgUrl}${scope.row.picture}`" alt=""></div>
                </template>
            </el-table-column>
            <el-table-column min-width="50px" label="連結網址" prop="url" align="center"></el-table-column>
            <el-table-column min-width="50px" label="排序" prop="sort" align="center"></el-table-column>
            <el-table-column min-width="50px" label="是否可用" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.state? "是" : "否" }}</span>
                </template>
            </el-table-column>
            <el-table-column min-width="50px" :label="'操作'" align="center">
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
      <!-- <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
      <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
      <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane> -->
    </el-tabs>

    <el-dialog class="dialog-mini" top="10vh" @close="closeDialog" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form label-width="120px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
            <!-- banner顯示在前台的位置 -->
            <el-col :span="24">
                <el-form-item label="banner位置" prop="bannerType">
                    <el-select v-model="temp.bannerType" placeholder="請選擇Banner位置" @blur="validateBlurSelect">
                        <el-option value="topBanner" label="上方"></el-option>
                        <el-option value="middleBanner" label="中間"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <!-- 上傳圖片 -->
            <el-col :span="24">
                <el-form-item label="列表圖片" prop="picture">
                    <el-input v-show="false" type="text" v-model="temp.picture"></el-input>
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
            <!-- 連結 -->
            <el-col :span="24">
                <el-form-item label="連結網址" prop="url">
                    <el-input type="text" v-model="temp.url" size="small" placeholder="請輸入連結網址"></el-input>
                </el-form-item>
            </el-col>
            <!-- 排序 -->
            <el-col :span="24">
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="temp.sort" placeholder="請輸入排序" size="small"></el-input-number>
                </el-form-item>
            </el-col>
            <!--狀態上架/下架  -->
            <el-col :span="24">
                <el-form-item label="狀態(上架/下架)" prop="state">
                    <el-switch v-model="temp.state" active-text="是" inactive-text="否"></el-switch>
                </el-form-item>
            </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submit">送出</el-button>
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
  bannerType: "",
  picture: "",
  url: "",
  sort: 0,
  state: true,
};

export default {
  name: "banner",
  components: { Sticky, permissionBtn, Pagination },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    return {
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      fileList:[],
      defaultTabName: 'topBanner',
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        BannerType:"",
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
        bannerType: [{ required: true, message: "必填欄位", trigger: ["blur","change"] }],
        picture: [{ required: true, message: "必填欄位", trigger: "blur" }],
        url: [{ required: true, message: "必填欄位", trigger: ["blur","change"] }],
        sort: [{ required: true, message: "必填欄位", trigger:  ["blur","change"] }],
        state: [{ required: true, message: "必填欄位", trigger:  ["blur","change"] }],
      },
    };
  },
  mounted() {
    this.getList();
  },
//   watch:{
//     defaultTabName:{
//         handler(bannerType){
//             console.log(bannerType);
//             this.getList(bannerType)
//         }
//     }
//   },
  methods: {
    tabsClick(){
        console.log("tabsClick");
        this.getList()
    },
    validateBlurSelect() {
      this.$refs.ruleForm.validateField("bannerType");
    },
    //成功上傳圖片後的回調
    fileSuccess(res,file,fileList) {
        const {filePath} = res[0]
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
              this.temp.picture = result[0].filePath;
              item.onSuccess(result)
            }
        })
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
    getList() {
      this.listQuery.BannerType = this.defaultTabName
      this.listLoading = true;
      this.$api.banners.getList(this.listQuery).then((response) => {
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
    // 保存提交
    submit() {
      let bannerType = this.temp.bannerType
      let apiName = "";
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
          this.$api.banners[apiName](this.temp).then(() => {
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            this.closeDialog()
            
            //判斷彈窗新增的是上方還是中間banner,要更新tab的值
            this.defaultTabName = bannerType
            this.getList()
          });
        }
      });
    },
    closeDialog(){
      this.dialogFormVisible = false
      this.resetTemp()
    },
    resetTemp() {
      this.$refs["ruleForm"].resetFields();
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
      this.fileList = [];
    },
    //新增(彈窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    //編輯(彈窗)
    handleUpdate(row) {
      this.$api.banners.get({id:row.id}).then((res)=>{
        const{code,result} = res
        if(code===200){
          let {id,bannerType,picture,url,sort,state} = result
          this.temp = {id,bannerType,picture,url,sort,state}
          this.fileList.push({
            path:picture
          })
        }
      })
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    //刪除(列表)
    handleDelete(rows) {
      this.delrows("banners", rows,this.getList);
    }
  },
};
</script>
<style lang="scss" scoped>
.bannerPage{
    .imgWrap{
        margin: auto;
        width: 200px;
        height: 200px;
        img{
            width: 100%;
            object-fit: cover
        }
    }
    ::v-deep .el-tabs{
        .el-tabs__header{
            padding-left: 10px;
            .el-tabs__active-bar{
                display:none;
            }
            .is-active{
                background-color: blue;
                color: white;
            }
            .el-tabs__item{
                padding: 0px 10px
            }
        }
    }
}
</style>
