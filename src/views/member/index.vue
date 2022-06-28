<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" @change="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入姓名'" v-model="listQuery.key"> </el-input>
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column min-width="50px" label="姓名" prop="name" align="center"></el-table-column>
          <el-table-column min-width="50px" label="電話號碼" prop="telephone" align="center"></el-table-column>
          <el-table-column min-width="50px" label="性別" prop="gender" align="center"></el-table-column>
          <el-table-column min-width="50px" label="Email" prop="email" align="center"></el-table-column>
          <el-table-column width="80px" label="是否可用" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.state? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" label="入會日期" prop="createDate" align="center">
            <template slot-scope="scope">
              <span>{{ $dayjs(scope.row.createDate).format("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" label="開卡日期" prop="openCardDate" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.openCardDate?$dayjs(scope.row.openCardDate).format("YYYY-MM-DD"):'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" label="剩餘點數" prop="points" align="center"></el-table-column>

          <el-table-column min-width="150px" :label="'操作'" align="center">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handleUpdate(scope.row)" type="primary" v-if="hasButton('btnEdit')">編輯</el-button>
                <el-button size="mini" @click="handleDelete([scope.row])" type="danger" v-if="hasButton('btnDel')">刪除</el-button>
                <el-button size="mini" type="white" v-if="hasButton('pointsAdd')">給點</el-button>
                <el-button size="mini" type="white" v-if="hasButton('pointsAcquireRecord')">點數取得紀錄</el-button>
                <el-button size="mini" type="white" v-if="hasButton('pointsConvertRecord')">點數兌換紀錄</el-button>
                <el-button size="mini" type="white" v-if="hasButton('couponAcquireRecord')">優惠券取得紀錄</el-button>
                <el-button size="mini" type="white" v-if="hasButton('couponUsageRecord')">優惠券使用紀錄</el-button>
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
            <!-- 姓名 -->
            <el-col :span="24">
                <el-form-item label="姓名" prop="name">
                <el-input type="text" v-model.trim="temp.name" size="small" placeholder="請輸入姓名"></el-input>
                </el-form-item>
            </el-col>
            <!-- 電話(帳號) -->
            <el-col :span="24">
                <el-form-item label="電話(帳號)" prop="telephone">
                  <el-input type="text" v-model.trim="temp.telephone" size="small" placeholder="請輸入電話(帳號)"></el-input>
                </el-form-item>
            </el-col>
            <!-- 密碼 -->
            <el-col :span="24">
              <el-form-item label="密碼" prop="password">
                <el-input type="password" v-model.trim="temp.password" size="small" placeholder="請輸入密碼"></el-input>
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
                <el-radio v-model="temp.citizenship" label="L" @change="changeCitizenship">本國籍</el-radio>
                <el-radio v-model="temp.citizenship" label="F" @change="changeCitizenship">外國籍</el-radio>
                </el-form-item>
            </el-col>
            <!-- 信箱 -->
            <el-col :span="24">
                <el-form-item label="Email" prop="email" >
                <el-input type="text" v-model="temp.email" size="small" placeholder="請輸入Email"></el-input>
                </el-form-item>
                <!-- <el-form-item v-if="temp.citizenship==='F'" label="Email" ref="email" prop="email" >
                <el-input type="text" v-model="temp.email" size="small" placeholder="請輸入Email"></el-input>
                </el-form-item>
                <el-form-item v-if="temp.citizenship==='L'" label="Email">
                <el-input type="text" v-model="temp.email" size="small" placeholder="請輸入Email"></el-input>
                </el-form-item> -->
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
      // console.log(value);
      // console.log("[rule",rule);
      const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;// eslint-disable-line
      const isEmail = this.temp[rule.field].match(emailRule);
      // console.log(isEmail);
      if (isEmail) {
        return callback();
      }
      return callback(new Error("信箱格式不正確"));
    };
    return {
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
          { required: true, message: "必填欄位", trigger:  ["blur", "change"] },
          { validator: emailValidate, trigger: ["blur", "change"] },
        ],
        birthday: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        // emailL: [{ required: false, trigger:  ["blur", "change"]}],


        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
        openCard: [{ required: true, message: "必填欄位", trigger: "blur" }],
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
      temp: JSON.parse(JSON.stringify(formTemplate)),
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        add: "新增",
      },
    };
  },
//   computed:{
//     emailValidate(){
//         let emailValidate = ""
//         // if(this.temp.citizenship==='F'){
//         //     emailValidate = 'emailF';
//         //     this.$refs["emailF"].resetField()
//         // }else{
//         //     emailValidate = 'emailL';
//         //     this.$refs["emailL"].resetField()
//         // }
//         if(this.temp.citizenship==='F'){
//             emailValidate = 'emailF';
//         }
//         console.log(emailValidate);
//         return emailValidate
//     }
//   },
  mounted() {
    this.getList();
  },
  methods: {
    changeCitizenship(){
        console.log(this.temp.citizenship);
        // this.$refs["email"].resetFields();
        // if(this.temp.citizenship==='F'){
        //     console.log("觸發驗證");
        // //   this.$refs.ruleForm.validateField('email');
        //   this.$refs["email"].clearValidate();
        // }
        // this.$refs["email"].clearValidate();
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
    closeDialog() {
      this.dialogFormVisible = false;
      this.resetTemp();
    },
    resetTemp() {
      //this.$refs["ruleForm"].clearValidate();
      this.$refs["ruleForm"].resetFields();
      this.temp = JSON.parse(JSON.stringify(formTemplate)); // copy obj
    },
    // 新增(談窗)
    handleCreate() {
    //   this.temp = JSON.parse(JSON.stringify(formTemplate))
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
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
            this.closeDialog();
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
    handleDelete(rows) {
      // 多行刪除
      this.delrows("members", rows ,this.getList);
    },
  },
};
</script>
