<template>
  <div class="flex-column memberPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" @change="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入姓名'" v-model="listQuery.key"> </el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column min-width="150px" label="姓名" prop="name" align="center"></el-table-column>
          <el-table-column width="120px" label="電話號碼" prop="telephone" align="center"></el-table-column>
          <el-table-column width="80px" label="性別" prop="gender" align="center"></el-table-column>
          <el-table-column width="300px" label="Email" prop="email" align="center"></el-table-column>
          <el-table-column width="80px" label="是否可用" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.state? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column width="100px" label="入會日期" prop="createDate" align="center">
            <template slot-scope="scope">
              <span>{{ $dayjs(scope.row.createDate).format("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <el-table-column width="100px" label="開卡日期" prop="openCardDate" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.openCardDate?$dayjs(scope.row.openCardDate).format("YYYY-MM-DD"):'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="150px" label="剩餘點數" prop="points" align="center"></el-table-column>

          <el-table-column min-width="350px" :label="'操作'" align="center">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button v-if="hasButton('btnEdit')" @click="handleUpdate(scope.row)" type="primary"  size="mini">編輯</el-button>
                <el-button v-if="hasButton('btnDel')"  @click="handleDelete([scope.row])" size="mini" type="danger" >刪除</el-button>
                <el-button v-if="hasButton('pointsAdd')" @click="openPointsDialog(scope.row)" size="mini" type="white" >給點</el-button>
                <el-button v-if="hasButton('pointsAcquireRecord')" @click="openRecord(scope.row,'pointsAcquireRecord')" size="mini" type="white">點數取得紀錄</el-button>
                <el-button v-if="hasButton('pointsConvertRecord')" size="mini" type="white" >點數兌換紀錄</el-button>
                <el-button v-if="hasButton('couponAcquireRecord')" size="mini" type="white" >優惠券取得紀錄</el-button>
                <el-button v-if="hasButton('couponUsageRecord')" size="mini" type="white" >優惠券使用紀錄</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <el-dialog class="dialog-mini" top="10vh" @close="closeDialog('addForm')" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm">
        <el-row :gutter="8">
            <!-- 姓名 -->
            <el-col :span="24">
                <el-form-item label="姓名" prop="name">
                <el-input type="text" v-model.trim="temp.name" size="small" placeholder="請輸入姓名"></el-input>
                </el-form-item>
            </el-col>
            <!-- 電話(帳號) -->
            <el-col :span="24">
                <el-form-item label="電話(帳號)" prop="telephone">
                  <el-input type="text" autocomplete='off' v-model.trim="temp.telephone" size="small" placeholder="請輸入電話(帳號)"></el-input>
                </el-form-item>
            </el-col>
            <!-- 密碼 -->
            <el-col :span="24">
              <el-form-item label="密碼" prop="password">
                <!-- 多一個隱藏的input是為了避免瀏覽器自動帶入帳號密碼 -->
                <input type="password" name="txtPassword" style="display:none">
                <el-input v-model.trim="temp.password" type="password" name="txtPassword" autocomplete="new-password" size="small" placeholder="請輸入密碼"></el-input>
              </el-form-item>
            </el-col>
            <!-- 性別 -->
            <el-col :span="24">
                <el-form-item label="性別" prop="gender">
                <el-select class="itemWidth" v-model="temp.gender" placeholder="請選擇性別" @blur="validateBlurSelect('gender')">
                    <el-option v-for="item in sexySelectLists" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
                </el-form-item>
            </el-col>
            <!-- 國籍 -->
            <el-col :span="24">
                <el-form-item label="國籍" prop="citizenship">
                  <el-radio v-model="temp.citizenship" label="本國籍" @change="changeCitizenship">本國籍</el-radio>
                  <el-radio v-model="temp.citizenship" label="外國籍" @change="changeCitizenship">外國籍</el-radio>
                </el-form-item>
            </el-col>
            <!-- 信箱 -->
            <el-col :span="24">
                <!-- :rule="[{required:temp.citizenship === '外國籍'? true:false, message: '必填欄位',trigger:['blur', 'change']}]" -->
                <el-form-item label="Email" prop="email">
                  <el-input type="text" v-model="temp.email" size="small" placeholder="請輸入Email"></el-input>
                </el-form-item>
            </el-col>
            <!-- 生日 -->
            <el-col :span="24">
                <el-form-item label="生日" prop="birthday">
                    <el-date-picker type="date" v-model="temp.birthday" placeholder="請選擇生日" format="yyyy-MM-dd"></el-date-picker>
                </el-form-item>
            </el-col>
            <!-- 興趣 -->
            <el-col :span="24">
                <el-form-item label="興趣" prop="interest">
                <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.interest" placeholder="請輸入興趣"></el-input>
                </el-form-item>
            </el-col>
            <!-- 地址 -->
            <el-col :span="24">
                <el-form-item label="地址">
                <el-input type="text" v-model="temp.address" size="small" placeholder="請輸入地址"></el-input>
                </el-form-item>
            </el-col>
            <!-- 狀態(上架/下架) -->
            <el-col :span="24">
                <el-form-item label="狀態(是否啟用)" prop="state">
                <el-switch v-model="temp.state" active-text="是" inactive-text="否"></el-switch>
                </el-form-item>
            </el-col>
            <!-- 卡別 -->
            <!-- <el-col :span="24">
                <el-form-item label="卡別" prop="cardLevel">
                <el-input type="text" v-model="temp.cardLevel" size="small" :disabled="true"></el-input>
                </el-form-item>
            </el-col> -->
          <!-- </template> -->
          <template v-if="dialogStatus==='update'">
            <!-- 是否開卡 -->
            <el-col :span="24">
                <el-form-item label="是否開卡" prop="openCard">
                <el-switch v-model="temp.openCard" active-text="是" inactive-text="否"></el-switch>
                </el-form-item>
            </el-col>
            <!-- 開卡日期 -->
            <el-col :span="24">
                <el-form-item label="開卡日期" prop="openCardDate">
                <el-date-picker type="date" v-model="temp.openCardDate" placeholder="請選擇開卡日期"></el-date-picker>
                </el-form-item>
            </el-col>
            <!-- 開卡飯店 -->
            <el-col :span="24">
                <el-form-item label="開卡飯店" prop="openCardHotel">
                <el-input type="text" v-model="temp.openCardHotel" size="small" placeholder="請輸入開卡飯店"></el-input>
                </el-form-item>
            </el-col>
          </template>
          <!-- <el-col :span="24">
            <el-form-item label="記錄發送生日禮日期" prop="sendBirthdayDate">
              <el-date-picker type="date" v-model="temp.sendBirthdayDate" placeholder="請選擇記錄發送生日禮日期"></el-date-picker>
            </el-form-item>
          </el-col> -->
         
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closeDialog('addForm')">取消</el-button>
        <el-button size="mini" type="primary" @click="submit">確認</el-button>
      </div>
    </el-dialog>

    <!-- 會員給點彈窗 -->
    <el-dialog class="dialog-mini" top="10vh" @close="closeDialog('pointAddForm')" width="600px" :title="textMap[dialogStatus]" :visible.sync="memberPointVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="80px" :model="pointsTemp" :rules="pointRules" ref="pointsRuleForm">
        <el-row :gutter="8">
          <el-col :span="24">
            <el-form-item label="加點點數" prop="pointNumber">
              <el-input v-model.number="pointsTemp.pointNumber" size="small" placeholder="請輸入點數"></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-form-item label="加點點數" prop="points">
            <el-input v-model="pointsTemp.pointNumber" size="small" placeholder="請輸入點數"></el-input>
          </el-form-item> -->
        </el-row>
      </el-form>

      <div slot="footer">
        <el-button @close="closeDialog('pointAddForm')" size="mini">取消</el-button>
        <el-button @click="pointsSubmit" size="mini" type="primary">送出</el-button>
      </div>
    </el-dialog>

    <!-- 紀錄彈窗 -->
    <el-dialog @close="closeRecordDialog" class="dialog-mini" top="10vh" width="600px" :title="textMap[dialogStatus]" :visible.sync="recordPointVisible" :close-on-click-modal="false" :lock-scroll="true">
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
  name: "",//姓名
  telephone: "",//電話(帳號)
  password:"",
  gender: "",//性別
  citizenship: "",//國籍
  email: "",//信箱(外國籍時必填;本國籍選填)
  birthday: "",//生日
  interest: "",//興趣
  address: "",//地址
  state: true,//狀態
  //birthdayMonth: "",//生日月分
  //openCard: false,//是否開卡
  //openCardDate: "",//開卡日期
  //openCardHotel: "",//開卡飯店
  //sendBirthdayDate: "",//發送生日禮時間
  //cardLevel: "VIP",//卡別
};
const pointsFormTemplate = {
  memberId: "",
  pointType: "",
  pointNumber: "",
  storeName: ""//愛嬉遊後台加點,給空值即可,只有飯店自己的後台加點才需要帶
};

export default {
  name: "member",
  components: { Sticky, permissionBtn, Pagination },
  directives: {
    waves,
    elDragDialog,
  },
  mixins: [pbMixins, extend],
  data() {
    //驗證電話號碼
    const checkNum = (rule, value, callback) => {
      const isNum = this.temp[rule.field].match(/^[0-9]+$/);
      if (isNum) {
        return callback();
      }
      return callback(new Error("電話格式不正確"));
    };
    const emailValidate = (rule,value,callback) => {
      console.log("value",value);
      // || !this.rules.email[0].required
      const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;// eslint-disable-line
      const isEmail = this.temp[rule.field].match(emailRule);
      if (isEmail || (!this.rules.email[0].require && !value)) {
        return callback();
      }
      return callback(new Error("信箱格式不正確"));
    };
    return {
      memberPointVisible:false,
      recordPointVisible:false,
      isValidateEmail:"",
      rules: {//驗證
        name: [{ required: true, message: "必填欄位", trigger: "blur" }],
        telephone: [
          { required: true, message: "必填欄位", trigger: "blur" },
          { validator: checkNum, trigger: ["blur", "change"] },
          { min: 9, message: "號碼至少9碼", trigger: ["blur", "change"] },
        ],
        // password: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        gender: [{ required: true, message: "必填欄位", trigger: "change" }],
        citizenship: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        email: [
          { required: false, message: '必填欄位'},
          { validator: emailValidate, trigger: ["blur"]},
        ],
        birthday: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        // emailL: [{ required: false, trigger:  ["blur", "change"]}],


        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
        openCard: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
      pointRules:{
        pointNumber: [
          { required: true, message: "必填欄位", trigger: ["blur","change"] },
          { type:'number', message: "必填是數字"}
        ]
      },
      sexySelectLists:[
        {
            label:"男",
            value:"男"
        },
        {
            label:"女",
            value:"女"
        },
        {
            label:"其他",
            value:"其他"
        }
      ],
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
      pointsTemp:JSON.parse(JSON.stringify(pointsFormTemplate)),
      temp: JSON.parse(JSON.stringify(formTemplate)),
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        add: "新增",
        pointsAdd:"新增會員點數",
        pointsAcquireRecord:"點數取得紀錄"
      },
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    closeRecordDialog(){
      this.recordPointVisible = false;
    },
    openRecord(row,type){
      console.log(row,type);
      this.recordPointVisible = true;
      this.dialogStatus = type;
      this.recordLoad(row.id,type)
    },
    recordLoad(memberId,type){
      console.log(type);
      const requestData = {
        MemberId:memberId,
        page:1,
        limit:999,
        key:""
      }
      this.$api.members.loadPoints(requestData).then((res)=>{
        console.log(res);
      })
    },
    openPointsDialog(row){
     this.pointsTemp.memberId = row.id;
     this.pointsTemp.pointType = "後台加點"
     this.memberPointVisible = true;
     this.dialogStatus = "pointsAdd";
    },
    changeCitizenship(){
        this.$refs.ruleForm.validateField("citizenship");
        if(this.temp.citizenship==='外國籍'){
          this.rules.email[0].required = true
        }else{
          this.rules.email[0].required = false
        }
    },
    // rowClick(row) {
    //   this.$refs.mainTable.clearSelection();
    //   this.$refs.mainTable.toggleRowSelection(row);
    // },
    // handleSelectionChange(val) {
    //   this.multipleSelection = val;
    // },
    validateBlurSelect(id) {
      this.$refs.ruleForm.validateField(id);
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
      this.$api.members.getList(this.listQuery).then((response) => {
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
    handleModifyStatus(row, disable) {
      // 模擬修改狀態
      this.$swal.fire({
        title: "操作成功",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      row.disable = disable;
    },
    closeDialog(formType) {
      if(formType==='pointAddForm'){
        this.memberPointVisible = false;
      }
      if(formType==='addForm'){
        this.dialogFormVisible = false;
      }
      this.resetTemp(formType);
    },
    resetTemp(formType) {
      if(formType==='pointAddForm'){
        this.$refs["pointsRuleForm"].resetFields();
        this.pointsTemp = JSON.parse(JSON.stringify(pointsFormTemplate));
      }
      if(formType==='addForm'){
        this.$refs["ruleForm"].resetFields();
        this.temp = JSON.parse(JSON.stringify(formTemplate));
      }
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    //點數送出
    pointsSubmit(){
      this.$refs["pointsRuleForm"].validate((valid) => {
        if (valid) {
          this.$api.members.addPoints(this.pointsTemp).then(() => {
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            this.closeDialog("pointAddForm");
            this.getList();
          });
        }
      });
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
          this.$api.members[apiName](this.temp).then(() => {
            this.$swal.fire({
              title: "成功",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            this.closeDialog("addForm");
            this.getList();
          });
        }
      });
    },
    // 編輯彈窗
    handleUpdate(row) {
      this.$api.members.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.temp = JSON.parse(JSON.stringify(result));
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    handleDelete(rows) {
      // 多行刪除
      this.delrows("members", rows ,this.getList);
    },
  },
};
</script>
<style lang="scss" scoped>
.memberPage{
  .app-container{
    .el-table__body-wrapper{
      .buttonFlexBox{
        min-height: 100px;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-content: space-evenly;
        .el-button{
          margin: 0px 10px 0px 0px;
        }
      }
    }
  }
}
</style>
