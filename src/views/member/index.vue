<template>
  <div class="flex-column memberPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 列表篩選 -->
        <el-input v-model="listQuery.key" @keyup.enter.native="handleFilter" @change="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入姓名'"> </el-input>
        <el-select v-model="listQuery.Gender" @change="handleFilter" placeholder="請選擇性別" size="mini">
          <el-option v-for="item in sexyFilterSelectLists" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-select v-model="listQuery.State" @change="handleFilter" placeholder="請選擇起停用" size="mini">
          <el-option v-for="item in stateFilterSelectLists" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-date-picker v-model="filterDateRange" type="daterange" value-format = "yyyy-MM-dd" size="mini" @change="changeDateRange"
          range-separator="至"
          start-placeholder="入會開始日期"
          end-placeholder="入會結束日期"
        ></el-date-picker>
        <!-- 功能按鈕 -->
        <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
        <el-button v-if="hasButton('btnExportFile')" class="exportBtn" type="primary" size="mini">
          <!-- <i class="iconfont el-icon-download"></i> -->
          <json-excel :fetch="fetchData" :fields="json_fields" name="愛嬉遊會員資料">
            匯出excel
          </json-excel>
          <!-- 匯出excel -->
        </el-button>
      </div>
    </sticky>
    <!-- 列表 -->
    <div class="app-container flex-item">
      <div class="bg-white" style="height: 100%">
        <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)">
          <el-table-column min-width="150px" label="姓名" prop="name" align="center"></el-table-column>
          <el-table-column width="120px" label="電話號碼" prop="telephone" align="center"></el-table-column>
          <el-table-column width="80px" label="性別" prop="gender" align="center"></el-table-column>
          <el-table-column min-width="300px" label="Email" prop="email" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.email?scope.row.email:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="80px" label="狀態" align="center">
            <template slot-scope="scope">
              <span :class="memberState(scope.row.state)">{{ scope.row.state? "啟用" : "停用" }}</span>
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
          <el-table-column width="120px" label="剩餘點數" prop="points" align="center"></el-table-column>

          <el-table-column width="300px" :label="'操作'" align="center">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button v-if="hasButton('btnEdit')" @click="handleUpdate(scope.row)" type="primary"  size="mini">編輯</el-button>
                <el-button v-if="hasButton('pointsAddOrCancel')" @click="openPointsDialog(scope.row)" size="mini" type="white" >加/扣點</el-button>
                <el-button v-if="hasButton('pointsRecord')" @click="openRecord(scope.row,'pointsRecord')" size="mini" type="white">點數紀錄</el-button>
                <el-button v-if="hasButton('couponRecord')" @click="openRecord(scope.row,'couponRecord')" size="mini" type="white">優惠券紀錄</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- 會員新增,編輯彈窗 -->
    <el-dialog class="dialog-mini" top="8vh" @close="closeDialog('addForm')" width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
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
                <el-input v-model.trim="temp.password" type="password" name="txtPassword" autocomplete="new-password" :disabled="dialogStatus==='update'" size="small" placeholder="請輸入密碼"></el-input>
              </el-form-item>
            </el-col>
            <!-- 性別 -->
            <el-col :span="24">
              <el-form-item label="性別" prop="gender">
                <el-select @blur="validateBlurSelect('gender')" v-model="temp.gender" class="itemWidth" placeholder="請選擇性別" size="small">
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
              <el-form-item label="Email" prop="email">
                <el-input type="text" v-model="temp.email" size="small" placeholder="請輸入Email"></el-input>
              </el-form-item>
            </el-col>
            <!-- 生日 -->
            <el-col :span="24">
              <el-form-item label="生日" prop="birthday">
                  <el-date-picker type="date" v-model="temp.birthday" placeholder="請選擇生日" value-format="yyyy-MM-dd" size="small"></el-date-picker>
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
            <!-- 卡別 -->
            <el-col :span="24">
              <el-form-item label="卡別" prop="cardLevel">
                <el-input type="text" v-model="temp.cardLevel" size="small" :disabled="true"></el-input>
              </el-form-item>
            </el-col>
            <!-- 狀態(上架/下架) -->
            <el-col :span="24">
              <el-form-item label="狀態(是否啟用)" prop="state">
                <el-switch v-model="temp.state" active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          <!-- </template> -->
          <template v-if="dialogStatus==='update'">
            <!-- 入會日期 -->
            <el-col :span="24">
              <el-form-item label="入會日期">
                <span>{{$dayjs(temp.createDateTime).format("YYYY-MM-DD")}}</span>
              </el-form-item>
            </el-col>
            <!-- 累積點數 -->
            <el-col :span="24">
              <el-form-item label="累積點數">
                <span>{{temp.pointsTotal}}</span>
              </el-form-item>
            </el-col>
            <!-- 剩餘點數 -->
            <el-col :span="24">
              <el-form-item label="剩餘點數">
                <span>{{temp.points}}</span>
              </el-form-item>
            </el-col>
            <!-- 是否開卡 -->
            <el-col :span="24">
              <el-form-item label="是否開卡">
                <span>{{temp.openCard?'是':'否'}}</span>
              </el-form-item>
            </el-col>
            <!-- 開卡日期 -->
            <el-col :span="24">
                <el-form-item label="開卡日期">
                  <span>{{temp.openCardDate?$dayjs(temp.openCardDate).format("YYYY-MM-DD"):'-'}}</span>
                </el-form-item>
            </el-col>
            <!-- 開卡飯店 -->
            <el-col :span="24">
              <el-form-item label="開卡飯店">
                <span>{{temp.openCardHotel?temp.openCardHotel:'-'}}</span>
              </el-form-item>
            </el-col>
            <!-- 發送生日禮日期 -->
            <el-col :span="24">
              <el-form-item label="發送生日禮日期">
                <span>{{temp.sendBirthdayDate?$dayjs(temp.sendBirthdayDate).format("YYYY-MM-DD"):'-'}}</span>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closeDialog('addForm')">取消</el-button>
        <el-button size="mini" type="primary" @click="submit">確認</el-button>
      </div>
    </el-dialog>

    <!-- 會員加/扣點彈窗 -->
    <el-dialog class="dialog-mini" top="30vh" @close="closeDialog('pointForm')" width="600px" :title="textMap[dialogStatus]" :visible.sync="memberPointVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="80px" :model="pointsTemp" :rules="pointRules" ref="pointsRuleForm" size="medium">
        <el-row :gutter="8">
          <el-col :span="24">
            <el-form-item label="加/扣點數" prop="pointNumber">
              <el-input v-model.number="pointsTemp.pointNumber" size="small" placeholder="加點請輸入正整數/扣點請輸入負整數"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer">
        <el-button @close="closeDialog('pointForm')" size="mini">取消</el-button>
        <el-button @click="pointsSubmit" size="mini" type="primary">送出</el-button>
      </div>
    </el-dialog>

    <!-- 紀錄彈窗 -->
    <el-dialog @close="closeRecordDialog" class="dialog-mini pointRecordDialog" top="10vh" width="80%" :title="textMap[dialogStatus]" :visible.sync="recordPointVisible" :close-on-click-modal="false" :lock-scroll="true">
      <!-- 點數紀錄 -->
      <template v-if="dialogStatus==='pointsRecord'">
        <el-select @change="recordLoad(dialogStatus)" v-model="recordListQuery.State" class="itemWidth" placeholder="請選擇點數狀態" size="small">
          <el-option v-for="item in pointsStateSelect" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-table :key="tableKey" :data="pointsRecordList" v-loading="recordListLoading" border fit highlight-current-row style="width:100%" height="calc(100% - 84px)">
          <el-table-column min-width="150px" label="點數類型" prop="pointType" align="center"></el-table-column>
          <el-table-column min-width="120px" label="商家名稱" prop="storeName" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.storeName?scope.row.storeName:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="100px" label="點數數量" align="center">1</el-table-column>
          <el-table-column width="100px" label="點數狀態" prop="state" align="center">
            <template slot-scope="scope">
              <span :class="pointStateTextColor(scope.row.state)">{{scope.row.state===1?'未使用':scope.row.state===2?'已使用':'取消'}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" label="新增點數人員" prop="createUserName" align="center"></el-table-column>
          <el-table-column width="180px" label="新增點數時間" prop="createDate" align="center"></el-table-column>
          <el-table-column min-width="120px" label="使用點數人員" prop="modifyUserName" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.modifyUserName?scope.row.modifyUserName:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="180px" label="使用點數時間" prop="modifyDate" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.modifyDate?scope.row.modifyDate:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="180px" label="點數到期日" prop="pointEndDate" align="center"></el-table-column>
        </el-table>
      </template>
      <!-- 優惠券紀錄 -->
      <template v-if="dialogStatus==='couponRecord'">
        <el-select @change="recordLoad(dialogStatus)" v-model="recordListQuery.State" class="itemWidth" placeholder="請選擇點數狀態" size="small">
          <el-option v-for="item in couponStateSelect" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-table :key="tableKey" :data="couponRecordList" v-loading="recordListLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 84px)">
          <el-table-column min-width="150px" label="優惠券名稱" prop="couponName" align="center"></el-table-column>
          <el-table-column min-width="120px" label="兌換此優惠券所需點數" prop="points" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.storeName?scope.row.storeName:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="120px" label="優惠券使用狀態" prop="state" align="center">
            <template slot-scope="scope">
              <span :class="couponStateTextColor(scope.row.state)">{{scope.row.state?'已使用':'未使用'}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" label="消費者兌換時間" prop="createDate" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.createDate?scope.row.createDate:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" label="優惠券到期日" prop="couponEndDate" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.couponEndDate}}</span>
            </template>
          </el-table-column>
          <el-table-column width="100px" label="使用商家" prop="storeName" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.storeName?scope.row.storeName:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" label="使用點數人員" prop="modifyUserName" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.modifyUserName?scope.row.modifyUserName:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="180px" label="使用點數時間" prop="modifyDate" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.modifyDate?scope.row.modifyDate:'-'}}</span>
            </template>
          </el-table-column>
         
        </el-table>
      </template>
      <pagination v-show="recordTotal > 0" :total="recordTotal" :page.sync="recordListQuery.page" :limit.sync="recordListQuery.limit" @pagination="handleRecordCurrentChange"/>
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
import JsonExcel from "vue-json-excel";
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
  cardLevel: "VIP",//卡別
  state: true,//狀態
};
const pointsFormTemplate = {
  memberId: "",
  pointType: "",
  pointNumber: "",
  storeName: ""//愛嬉遊後台加點,給空值即可,只有飯店自己的後台加點才需要帶
};

export default {
  name: "member",
  components: { Sticky, permissionBtn, Pagination,JsonExcel },
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
    //信箱格式驗證
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
    //驗證正負整數
    // const positiveAndNegativeIntegersValidate = (rule,value,callback) => {
    //   var reg = new RegExp("^-?[0-9]*.?[0-9]*$");
    //   if (reg.test(this.temp[rule.field]) ) {
    //     return callback();
    //   }
    //   return callback(new Error("請輸入正整數或負整數"));
    // };
    return {
      json_fields: {
        '名稱': 'name',
        '電話(帳號)':'telephone',
        '信箱': 'email',
        '性別':'gender',
        '國籍':'citizenship',
        '生日':'birthday',
        '興趣':'interest',
        '地址':'address',
        '卡別':'cardLevel',
        '狀態':'state',
        '入會日期':'createDate',
        '累積點數':'pointsTotal',
        '剩餘點數':'points',
        '是否開卡':'openCard',
        '開卡日期':'openCardDate',
        '開卡飯店':'openCardHotel',
        '發送生日禮日期':'sendBirthdayDate'
      },
      filterDateRange:null,
      couponRecordList:[],
      pointsRecordList:[],
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
        password: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        gender: [{ required: true, message: "必填欄位", trigger: "change" }],
        citizenship: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        email: [
          { required: false, message: '必填欄位'},
          { validator: emailValidate, trigger: ["blur"]},
        ],
        birthday: [{ required: true, message: "必填欄位", trigger: ["blur", "change"] }],
        state: [{ required: true, message: "必填欄位", trigger: "blur" }],
      },
      pointRules:{
        pointNumber: [
          { required: true, message: "必填欄位", trigger: ["blur","change"] },
          // { validator: positiveAndNegativeIntegersValidate, trigger: ["blur", "change"] },
          { type:'number', message: "必填是數字"}
        ]
      },
      stateFilterSelectLists:[
        {
            label:"全部狀態",
            value:null
        },
        {
            label:"啟用",
            value:true
        },
        {
            label:"停用",
            value:false
        }
      ],
      sexyFilterSelectLists:[
        {
            label:"全部性別",
            value:""
        },
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
      pointsStateSelect:[
        {
          label:"全部",
          value:0
        },
        {
          label:"未使用",
          value:1
        },
        {
          label:"已使用",
          value:2
        },
        {
          label:"取消",
          value:3
        },
      ],
      couponStateSelect:[
        {
          label:"全部",
          value:null
        },
        {
          label:"已使用",
          value:true
        },
        {
          label:"未使用",
          value:false
        },
      ],
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      recordTotal:0,
      total: 0,
      recordListLoading:true,
      listLoading: true,
      recordListQuery: {
        // 點數,優惠券共用
        MemberId:"",
        page:1,
        limit:20,
        State:undefined,
        //點數狀態,0=>全部;1=>未使用;2=>已使用;3=>取消
        //優惠券狀態,null=>全部;false=>未使用;true=>已使用
        key:""
      },
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
        State:null,
        Gender:"",
        StartDate:"",
        EndDate:"",
      },
      pointsTemp:JSON.parse(JSON.stringify(pointsFormTemplate)),
      temp: JSON.parse(JSON.stringify(formTemplate)),
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        add: "新增",
        pointsAddOrCancel:"加/扣會員點數",
        pointsRecord:"點數紀錄",
        couponRecord:"優惠券紀錄",
      },
    };
  },
  computed:{
    memberState(){
      return ((state)=>{
        let className = "enable"
        if(!state){
          className = 'disenable'
        }
        return className
      })
    },
    pointStateTextColor(){
      //0=>全部;1=>未使用;2=>已使用;3=>取消
      return ((state)=>{
        let className = "notUsed"
        if(state===2){
          className = 'used'
        }
        if(state===3){
          className = 'cancel'
        }
        return className
      })
    },
    couponStateTextColor(){
      //null=>全部;false=>未使用;true=>已使用
      return ((state)=>{
        let className = "used"
        if(!state){
          className = 'notUsed'
        }
        return className
      })
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    changeDateRange(){
      console.log(this.filterDateRange);
      if(this.filterDateRange){
        const [startDate,endDate] = this.filterDateRange
        console.log(startDate);
        this.listQuery.StartDate = startDate
        this.listQuery.EndDate = endDate
      }
      if(!this.filterDateRange){
        this.listQuery.StartDate = ""
        this.listQuery.EndDate = ""
      }
      this.handleFilter()
    },
    //匯出
    async fetchData(){
      let handleData = []
      this.listQuery.limit = 9999999;
      let result = await this.$api.members.getList(this.listQuery)
      const { code,data } = result;
      if(code===200){
        if(data.length===0){
          this.$swal.fire({
            title: "沒有符合的資料可匯出",
            icon: "warning",
            timer: 2000,
            showConfirmButton: false,
          });
          return
        }
        handleData = data.map((item)=>{
          item.email = item.email?item.email:'-';
          item.birthday = this.$dayjs(item.birthday).format('YYYY-MM-DD');
          item.interest = item.interest?item.interest:'-';
          item.state = item.state?'啟用':'停用';
          item.createDate = this.$dayjs(item.createDate).format('YYYY-MM-DD');
          item.openCard = item.openCard?'是':'否';
          item.openCardDate = item.openCardDate?item.openCardDate:'-';
          item.openCardHotel = item.openCardHotel?item.openCardHotel:'-';
          item.sendBirthdayDate = item.sendBirthdayDate?this.$dayjs(item.sendBirthdayDate).format('YYYY-MM-DD'):'-';
          return item
        })
        return handleData
      }
    },
    closeRecordDialog(){
      this.recordPointVisible = false;
      this.recordListQuery = {// 查詢條件
        MemberId:"",
        page:1,
        limit:20,
        State:undefined,
        key:""
      }
      this.recordTotal = 0
    },
    openRecord(row,type){
      this.recordPointVisible = true;
      this.dialogStatus = type;
      this.recordListQuery.MemberId = row.id
      if(type==='pointsRecord'){
        //點數API,撈全部狀態state = 0 
        this.recordListQuery.State = 0 
      }
      if(type==='couponRecord'){
        //優惠券API,撈全部狀態state = null
        console.log("this.recordListQuery.state = null ");
        this.recordListQuery.State = null 
      }
      this.recordLoad(type)
    },
    recordLoad(type){
      this.recordListLoading = true;
      let apiName = ""
      if(type==='pointsRecord'){
        apiName = "memberPointsLoad"
      }
      if(type==='couponRecord'){
        apiName = "memberCouponLoad"
      }
      this.$api.members[apiName](this.recordListQuery).then((res)=>{
          const { code,count,data} = res
          if(code===200){
            if( apiName === "memberPointsLoad"){
              this.pointsRecordList = data;
            }
            if( apiName === "memberCouponLoad"){
              this.couponRecordList = data;
            }
            this.recordTotal = count
          }
          this.recordListLoading = false;
      })

      // if(type==='pointsRecord'){
      //   this.$api.members.memberPointsLoad(this.recordListQuery).then((res)=>{
      //     const { code,count,data} = res
      //     if(code===200){
      //       this.pointsRecordList = data;
      //       this.recordTotal = count
      //     }
      //     this.listLoading = false;
      //   })
      // }
      // if(type==='couponRecord'){
      //   const requestData = {
      //     MemberId:memberId,
      //     page:1,
      //     limit:999,
      //     State:2,//null=>全部;true=>使用;false=>未使用
      //     key:""
      //   }
      //   this.$api.members.memberCouponLoad(requestData).then((res)=>{
      //     console.log(res);
      //   })
      // }
    },
    openPointsDialog(row){
      this.pointsTemp.memberId = row.id;
      this.pointsTemp.pointType = "後台加點"
      this.memberPointVisible = true;
      this.dialogStatus = "pointsAddOrCancel";
    },
    changeCitizenship(){
        this.$refs.ruleForm.validateField("citizenship");
        if(this.temp.citizenship==='外國籍'){
          this.rules.email[0].required = true
        }else{
          this.rules.email[0].required = false
        }
    },
    validateBlurSelect(id) {
      this.$refs.ruleForm.validateField(id);
    },
    onBtnClicked: function (domId) {
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
    handleRecordCurrentChange(val) {
      this.recordListQuery.page = val.page;
      this.recordListQuery.limit = val.limit;
      this.recordLoad(this.dialogStatus);
    },
    closeDialog(formType) {
      if(formType==='pointForm'){
        this.memberPointVisible = false;
      }
      if(formType==='addForm'){
        this.dialogFormVisible = false;
      }
      this.resetTemp(formType);
    },
    resetTemp(formType) {
      if(formType==='pointForm'){
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
          this.$swal.fire({
            title: "確定要為此會員加/扣點數嗎?",
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonText: "取消",
            confirmButtonText: "確定",
          }).then((result)=>{
            if (result.isConfirmed){
              let apiName = "";
              const integersResult  = Math.sign(this.pointsTemp.pointNumber)
    
              if( integersResult === 1 ){ //新增點數
                apiName = "addPoints"
              }
              if( integersResult === -1 ){ //扣點
                apiName = "cancelPoints"
                this.pointsTemp.pointNumber = Math.abs(this.pointsTemp.pointNumber)
              }
              this.$api.members[apiName](this.pointsTemp).then(() => {
                this.$swal.fire({
                  title: "成功",
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false,
                });
                this.closeDialog("pointForm");
                this.getList();
              });
            }
          })
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
          console.log(result);
          this.temp = JSON.parse(JSON.stringify(result));
        }
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
  },
};
</script>
<style lang="scss" scoped>
.memberPage{
  ::v-deep .filter-container{
    .exportBtn{
      margin-left: 5px;
      &>span{
        display: flex;
        align-items: center;
        .iconfont{
          transform: scale(1.3);
        }
      }
    }
  }
  .app-container{
    .el-table__body-wrapper{
      .enable{
        color: green;
      }
      .disenable{
        color: red;
      }
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
  ::v-deep .pointRecordDialog{
    .el-dialog__body{
      height: 70vh;
      // overflow-y: scroll;
      .used{
        color: red;
      }
      .notUsed{
        color: green;
      }
      .cancel{
        color: gray;
      }
      
    }
  }
}
</style>
