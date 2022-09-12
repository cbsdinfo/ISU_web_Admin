<template>
  <div class="flex-column memberPage">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 功能按鈕 -->
        <section>
          <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
          <!-- <json-excel :fetch="exportTest" :fields="exportTest_json_fields" name="會員列表" style="display: inline-block;">
            <el-button v-if="hasButton('btnExportFile')" class="exportBtn" type="primary" size="mini">
              匯出列表
            </el-button>
          </json-excel> -->
          
        </section>
        <!-- 篩選 -->
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
        <el-input v-model="listQuery.key" @keyup.enter.native="handleFilter" @change="handleFilter" size="mini" style="width: 200px" class="filter-item" :placeholder="'請輸入姓名'"> </el-input>
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
              <span>{{ scope.row.releaseDate | dateTimeFormatToDate }}</span>
            </template>
          </el-table-column>
          <el-table-column width="100px" label="開卡日期" prop="openCardDate" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.openCardDate?$dayjs(scope.row.openCardDate).format("YYYY-MM-DD"):'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="120px" label="剩餘點數" prop="points" align="center"></el-table-column>

          <el-table-column min-width="250px" :label="'操作'" align="center">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button v-if="hasButton('btnPreview')" @click="handleUpdate(scope.row,'preview')" type="primary" size="mini">檢視</el-button>
                <el-button v-if="hasButton('btnEdit') && hasButton('highestAuthorityRole')" @click="handleUpdate(scope.row,'update')" type="primary" size="mini">編輯</el-button>
                <el-button v-if="hasButton('pointsAddOrCancel') && hasButton('highestAuthorityRole')" @click="openPointsDialog(scope.row)" size="mini" type="white" >加/扣點</el-button>
                <el-button v-if="hasButton('pointsUsedOrCancelRecord') && hasButton('highestAuthorityRole')" @click="openRecord(scope.row,'memberPointsUseOrCancelLoad')" size="mini" type="white">使用/取消點數紀錄</el-button>
                <el-button v-if="hasButton('pointsGetRecord') && hasButton('highestAuthorityRole')" @click="openRecord(scope.row,'memberPointsLoad')" size="mini" type="white">獲得點數紀錄</el-button>
                <el-button v-if="hasButton('couponRecord') && hasButton('highestAuthorityRole')" @click="openRecord(scope.row,'memberCouponLoad')" size="mini" type="white">優惠券紀錄</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- 匯出點數已使用及取消紀錄 -->
    <el-dialog class="dialog-mini memberDialog" @close="closeDialog('exportPointUsedAndCancel')" width="600px" :title="textMap[dialogStatus]" :visible="exportPointUsedAndCancelVisible" :close-on-click-modal="false" :lock-scroll="true">
      
      <el-date-picker v-model="exportPointUsedAndCancelDateRange" type="daterange" value-format = "yyyy-MM-dd" size="mini"
        range-separator="至"
        start-placeholder="入會開始日期"
        end-placeholder="入會結束日期"
      ></el-date-picker>

      <json-excel :fetch="pointUsageRecordFetchData" :fields="pointUsedAndCancel_json_fields" name="會員點數已使用及取消紀錄" style="display: inline-block;">
        <el-button v-if="hasButton('exportPointGet')" class="exportBtn" type="primary" size="mini">
          匯出
        </el-button>
      </json-excel>
    </el-dialog>

    <!-- 匯出點數取得紀錄 -->
    <el-dialog class="dialog-mini memberDialog" @close="closeDialog('exportPointGet')" width="600px" :title="textMap[dialogStatus]" :visible="exportPointGetVisible" :close-on-click-modal="false" :lock-scroll="true">
      
      <el-date-picker v-model="exportPointGetDateRange" type="daterange" value-format = "yyyy-MM-dd" size="mini"
        range-separator="至"
        start-placeholder="入會開始日期"
        end-placeholder="入會結束日期"
      ></el-date-picker>

      <json-excel :fetch="pointGetRecordFetchData" :fields="pointGet_json_fields" name="會員點數取得紀錄" style="display: inline-block;">
        <el-button v-if="hasButton('exportPointGet')" class="exportBtn" type="primary" size="mini">
          匯出
        </el-button>
      </json-excel>
    </el-dialog>

    <!-- 會員新增,編輯彈窗 -->
    <el-dialog class="dialog-mini memberDialog" @close="closeDialog('addForm')" width="600px" :title="textMap[dialogStatus]" :visible="dialogFormVisible" :close-on-click-modal="false" :lock-scroll="true">
      <el-form class="dialogContent" label-width="120px" :model="temp" :rules="rules" ref="ruleForm" size="medium">
        <el-row :gutter="8">
            <!-- 會員圖片 -->
            <el-col v-if="dialogStatus==='add'||dialogStatus==='update'" :span="24">
              <el-form-item label="會員圖片">
                <upload-image @successUploadImg="successUploadImg" @deleteImg="deleteImg" 
                  :uploadLimit="1" 
                  :imagesPropAry="imagesPropAry"
                />
              </el-form-item>
            </el-col>
            <el-col v-if="dialogStatus==='preview'" :span="24">
              <el-form-item label="會員圖片">
                <template v-if="temp.avatarPicture">
                  <div class="previewImgWrap">
                    <img :src="`${imgUrl}${imagePathAry[0].path}`" alt="">
                  </div>
                </template>
                <template v-else>
                  <img v-if="temp.gender==='男'" src="../../assets/member/man-icon.png" alt="">
                  <img v-if="temp.gender==='女'" src="../../assets/member/feman-icon.png" alt="">
                  <img v-if="temp.gender==='其他'" src="../../assets/member/other-icon.png" alt="">
                </template>
              </el-form-item>
            </el-col>
            <!-- 姓名 -->
            <el-col :span="24">
              <el-form-item label="姓名" prop="name">
                <el-input type="text" v-model.trim="temp.name" size="small" placeholder="請輸入姓名" :disabled="dialogStatus==='preview'"></el-input>
              </el-form-item>
            </el-col>
            <!-- 電話(帳號) -->
            <el-col :span="24">
                <el-form-item label="電話(帳號)" prop="telephone">
                  <el-input type="text" autocomplete='off' v-model.trim="temp.telephone" size="small" placeholder="請輸入電話(帳號)" :disabled="dialogStatus==='preview'"></el-input>
                </el-form-item>
            </el-col>
            
            <!-- 密碼 -->
            <!-- 判斷不能用v-if,調用resetFields()會報錯 -->
            <el-col v-show="dialogStatus==='add'" :span="24">
              <el-form-item label="密碼" prop="password">
                <!-- 多一個隱藏的input是為了避免瀏覽器自動帶入帳號密碼 -->
                <input type="password" name="txtPassword" style="display:none">
                <el-input v-model.trim="temp.password" type="password" name="txtPassword" autocomplete="new-password" :disabled="dialogStatus==='update'" size="small" placeholder="請輸入密碼"></el-input>
              </el-form-item>
            </el-col>
         
            <!-- 性別 -->
            <el-col :span="24">
              <el-form-item label="性別" prop="gender">
                <el-select @blur="validateBlurSelect('gender')" v-model="temp.gender" class="itemWidth" placeholder="請選擇性別" size="small" :disabled="dialogStatus==='preview'">
                  <el-option v-for="item in sexySelectLists" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <!-- 國籍 -->
            <el-col :span="24">
              <el-form-item label="國籍" prop="citizenship">
                <el-radio v-model="temp.citizenship" label="本國籍" @change="changeCitizenship" :disabled="dialogStatus==='preview'">本國籍</el-radio>
                <el-radio v-model="temp.citizenship" label="外國籍" @change="changeCitizenship" :disabled="dialogStatus==='preview'">外國籍</el-radio>
              </el-form-item>
            </el-col>
            <!-- 信箱 -->
            <el-col :span="24">
              <el-form-item label="Email" prop="email">
                <el-input type="text" v-model="temp.email" size="small" placeholder="請輸入Email" :disabled="dialogStatus==='preview'"></el-input>
              </el-form-item>
            </el-col>
            <!-- 自我介紹 -->
            <el-col :span="24">
              <el-form-item label="自我介紹">
                <el-input  v-model="temp.introduction" type="textarea" :rows="3" size="small" placeholder="請輸入自我介紹" :disabled="dialogStatus==='preview'"></el-input>
              </el-form-item>
            </el-col>
            <!-- 生日 -->
            <el-col :span="24">
              <el-form-item label="生日" prop="birthday">
                  <el-date-picker type="date" v-model="temp.birthday" placeholder="請選擇生日" value-format="yyyy-MM-dd" size="small" :disabled="dialogStatus==='preview'"></el-date-picker>
              </el-form-item>
            </el-col>
            <!-- 興趣 -->
            <el-col :span="24">
              <el-form-item label="興趣">
                <el-select v-model="interestSelected" multiple placeholder="請選擇興趣" :disabled="dialogStatus==='preview'">
                  <el-option v-for="item in interestSelectList" 
                    :key="item.id"
                    :label="item.title"
                    :value="item.id">
                  </el-option>
                </el-select>
                <!-- <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="temp.interest" placeholder="請輸入興趣"></el-input> -->
              </el-form-item>
            </el-col>
            <!-- 聯絡資訊 -->
            <el-col :span="24">
              <el-form-item label="聯絡資訊">
                <el-input type="text" v-model="temp.contactInformation" size="small" placeholder="請輸入Line、IG等等" :disabled="dialogStatus==='preview'"></el-input>
              </el-form-item>
            </el-col>
            <!-- 地址 -->
            <el-col :span="24">
              <el-form-item label="地址">
                <el-input type="text" v-model="temp.address" size="small" placeholder="請輸入地址" :disabled="dialogStatus==='preview'"></el-input>
              </el-form-item>
            </el-col>
            <!-- 卡別 -->
            <el-col :span="24">
              <el-form-item label="卡別">
                <el-input type="text" v-model="temp.cardLevel" size="small" :disabled="true"></el-input>
              </el-form-item>
            </el-col>
            <!-- 狀態(上架/下架) -->
            <el-col :span="24">
              <el-form-item label="狀態(是否啟用)">
                <el-switch v-model="temp.state" active-text="是" inactive-text="否" :disabled="dialogStatus==='preview'"></el-switch>
              </el-form-item>
            </el-col>
          <!-- </template> -->
          <template v-if="dialogStatus==='update' || dialogStatus==='preview'">
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
        <el-button @click="closeDialog('addForm')" size="mini">取消</el-button>
        <el-button v-if="dialogStatus==='update' || dialogStatus==='add'" @click="submit" size="mini" type="primary">確認</el-button>
      </div>
    </el-dialog>

    <!-- 會員加/扣點彈窗 -->
    <el-dialog class="dialog-mini" @close="closeDialog('pointForm')" width="600px" :title="textMap[dialogStatus]" :visible.sync="memberPointVisible" :close-on-click-modal="false" :lock-scroll="true">
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
      <!-- 使用/取消點數紀錄 -->
      <template v-if="dialogStatus==='memberPointsUseOrCancelLoad'">
        <el-select @change="recordLoad(dialogStatus)" v-model="recordListQuery.State" class="itemWidth" placeholder="請選擇點數狀態" size="small">
          <el-option v-for="item in pointsStateSelect" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-table :key="tableKey" :data="recordList" v-loading="recordListLoading" border fit highlight-current-row style="width:100%" height="calc(100% - 84px)">
          
          <el-table-column min-width="120px" label="商家名稱" prop="storeName" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.storeName?scope.row.storeName:'-'}}</span>
            </template>
          </el-table-column>
          
          <el-table-column min-width="120px" label="操作點數人員" prop="createUserName" align="center"></el-table-column>

          <el-table-column min-width="150px" label="點數異動操作" prop="state" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.state===1">使用</span>
              <span v-if="scope.row.state===2">取消</span>
            </template>
          </el-table-column>

          <el-table-column min-width="150px" label="點數異動數量" prop="point" align="center">
            <template slot-scope="scope">
              <span class="redText">-{{scope.row.point}}</span>
            </template>
          </el-table-column>

          <el-table-column width="180px" label="點數異動時間" prop="createDate" align="center"></el-table-column>

          <el-table-column width="180px" label="點數來源" prop="sourceStoreName" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.sourceStoreName?scope.row.sourceStoreName:"後台管理員"}}</span>
            </template>
          </el-table-column>

        </el-table>
      </template>
      <!-- 獲取點數紀錄 -->
      <template v-if="dialogStatus==='memberPointsLoad'">
        <el-table :key="tableKey" :data="recordList" v-loading="recordListLoading" border fit highlight-current-row style="width:100%" height="calc(100% - 84px)">

          <el-table-column min-width="120px" label="商家名稱" prop="storeName" align="center">
            <template slot-scope="scope">
              <span :class="pointEndDateTextColor(scope.row)">{{scope.row.storeName?scope.row.storeName:'-'}}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="120px" label="操作點數人員" prop="createUserName" align="center"></el-table-column>
          <el-table-column min-width="120px" label="點數是否到期" prop="pointEndDate" align="center">
            <template slot-scope="scope">
              <span :class="pointEndDateTextColor(scope.row)">{{checkPointEndDate(scope.row.pointEndDate)}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" label="獲取點數" prop="getPoint" align="center">
            <template slot-scope="scope">
              <span class="greenText" :class="pointEndDateTextColor(scope.row)">+{{scope.row.getPoint}}</span>
            </template>
          </el-table-column>
          
          <el-table-column min-width="120px" label="獲取點數時間" prop="createDate" align="center"></el-table-column>
          <el-table-column min-width="120px" label="點數到期時間" prop="pointEndDate" align="center"></el-table-column>

        </el-table>
      </template>
      <!-- 優惠券紀錄 -->
      <template v-if="dialogStatus==='memberCouponLoad'">
        <el-select @change="recordLoad(dialogStatus)" v-model="recordListQuery.State" class="itemWidth" placeholder="請選擇點數狀態" size="small">
          <el-option v-for="item in couponStateSelect" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-table :key="tableKey" :data="recordList" v-loading="recordListLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 84px)">
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
          <el-table-column min-width="120px" label="使用人員" prop="modifyUserName" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.modifyUserName?scope.row.modifyUserName:'-'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="180px" label="使用時間" prop="modifyDate" align="center">
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
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import extend from "@/extensions/delRows.js";
import JsonExcel from "vue-json-excel";
import uploadImage from "@/components/UploadImage";

const formTemplate = {
  id: "",
  avatarPicture:"",//會員圖片
  introduction:"",//自我介紹
  contactInformation:"",//聯絡資訊
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
  components: { Sticky, permissionBtn, Pagination,JsonExcel,uploadImage },
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
      const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;// eslint-disable-line
      const isEmail = this.temp[rule.field].match(emailRule);
      if (isEmail || (!this.rules.email[0].require && !value)) {
        return callback();
      }
      return callback(new Error("信箱格式不正確"));
    };
    return {
      exportPointUsedAndCancelDateRange:[],
      exportPointGetDateRange:[],
      imgUrl: process.env.VUE_APP_BASE_IMG_URL,
      imagePathAry:[],
      imagesPropAry:[],
      filterDateRange:null,
      couponRecordList:[],
      recordList:[],
      memberPointVisible:false,
      recordPointVisible:false,
      exportPointUsedAndCancelVisible:false,
      exportPointGetVisible:false,
      isValidateEmail:"",
      pointUsedAndCancel_json_fields: {
        '會員id': 'memberId',
        '會員名稱':'memberName',
        '時間': 'createDate',
        '飯店':'storeName',
        '集章數量':'point',
        '狀態':'state'
      },
      pointGet_json_fields: {
        '會員id': 'memberId',
        '會員名稱':'memberName',
        '發放時間': 'createDate',
        '發放飯店':'storeName',
        '發放集章數量':'getPoint',
      },
      exportTest_json_fields:{
        '會員ID': 'id',
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
      },
      pointRules:{
        pointNumber: [
          { required: true, message: "必填欄位", trigger: ["blur","change"] },
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
          label:"使用/取消",
          value:0
        },
        {
          label:"使用",
          value:1
        },
        {
          label:"取消",
          value:2
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
      interestSelectList:[
        {
          id:1,
          title:"SUP"
        },
        {
          id:2,
          title:"自行車"
        },
        {
          id:3,
          title:"登山"
        },
        {
          id:4,
          title:"露營"
        },
        {
          id:5,
          title:"潛水"
        },
        {
          id:6,
          title:"溯溪"
        },
        {
          id:7,
          title:"電影"
        },
        {
          id:8,
          title:"美食"
        },
        {
          id:9,
          title:"歷史文化"
        },
        {
          id:10,
          title:"科學"
        },
        {
          id:11,
          title:"品酒"
        },
        {
          id:12,
          title:"品茶"
        },
        {
          id:13,
          title:"美術"
        },
        {
          id:14,
          title:"建行"
        },
        {
          id:15,
          title:"跑步"
        },
        {
          id:16,
          title:"烹飪"
        },
        {
          id:17,
          title:"手作體驗"
        },
        {
          id:18,
          title:"自拍"
        },
        {
          id:19,
          title:"咖啡"
        },
        {
          id:20,
          title:"植物"
        },
        {
          id:21,
          title:"語言交換"
        },
        {
          id:22,
          title:"獨木舟"
        },
        {
          id:23,
          title:"攀岩"
        },
        {
          id:24,
          title:"文化體驗"
        },
        {
          id:25,
          title:"飛行傘"
        }
      
      ],
      interestSelected:[],
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      recordTotal:0,
      total: 0,
      recordListLoading:true,
      listLoading: true,
      recordListQuery: {// 點數,優惠券共用
        MemberId:"",
        page:1,
        limit:20,
        State:undefined, //點數狀態,0=>全部 ; 1=>已使用 ; 2=>取消, //優惠券狀態,null=>全部;false=>未使用;true=>已使用
        key:""
      },
      listQuery: { // 查詢條件
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
        preview:"檢視",
        add: "新增",
        pointsAddOrCancel:"加/扣會員點數",
        pointsUsedOrCancelRecord:"使用/取消點數紀錄",
        pointsGetRecord:"獲取店數紀錄",
        couponRecord:"優惠券紀錄",
        exportPointGet:"匯出會員點數取得紀錄",
        exportPointUsedAndCancel:'匯出點數已使用及取消紀錄'
      },
    };
  },
  computed:{
    memberState(){
      return ((state)=>{
        let className = "greenText"
        if(!state){
          className = 'redText'
        }
        return className
      })
    },
    pointColor(){
      return ((actionType,pointNumbers)=>{
        let className = ''
        if(actionType==='add'){
          className = 'greenText'
        }
        if(actionType==='cancel' && pointNumbers>0){
          className = 'redText'
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
    },
    checkPointEndDate(){
      return ((pointEndDate)=>{
        let stateText = "可使用(尚未到期)"
        if(!this.$dayjs().isBefore(this.$dayjs(pointEndDate))){
          stateText = "無法使用(已到期)"
        }
        return stateText
      })
    },
    pointEndDateTextColor(){
      return ((row)=>{
        let className = "greenText"
        if(!this.$dayjs().isBefore(this.$dayjs(row.pointEndDate))){
          className = "grayText"
        }
        return className
      })
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    deleteImg(imgPath){
      this.imagePathAry = this.imagePathAry.filter(item=>item.path !== imgPath)
      if(this.imagePathAry.length>0){
        this.temp.avatarPicture = JSON.stringify(this.imagePathAry)
      }else{
        this.temp.avatarPicture = ""
      }
    },
    successUploadImg(successUploadResult){
      successUploadResult.forEach(item => {   
        this.imagePathAry.push({
          path:item.filePath,
          id:item.id
        })
      });
      this.temp.avatarPicture = JSON.stringify(this.imagePathAry)
    },
    changeDateRange(){
      if(this.filterDateRange){
        const [startDate,endDate] = this.filterDateRange
        this.listQuery.StartDate = startDate
        this.listQuery.EndDate = endDate
      }
      if(!this.filterDateRange){
        this.listQuery.StartDate = ""
        this.listQuery.EndDate = ""
      }
      this.handleFilter()
    },
    //匯出,測試
    // async exportTest(){
    //   this.listLoading = true;
    //   let handleData = []
    //   let requestTemp = JSON.parse(JSON.stringify(this.listQuery))
    //   requestTemp.limit = 999;
    //   //this.listQuery.limit = 9999999;
    //   let result = await this.$api.members.getList(requestTemp)
    //   const { code,data } = result;
    //   if(code===200){
    //     // if(data.length===0){
    //     //   this.$swal.fire({
    //     //     title: "沒有符合的資料可匯出",
    //     //     icon: "warning",
    //     //     timer: 2000,
    //     //     showConfirmButton: false,
    //     //   });
    //     //   return
    //     // }
    //     handleData = data.map((item)=>{
    //       let handleInterest = null;
    //       item.address = item.address?item.address:'-';
    //       item.cardLevel = item.cardLevel?item.cardLevel:'-';
    //       item.email = item.email?item.email:'-';
    //       item.birthday = this.$dayjs(item.birthday).format('YYYY-MM-DD');
    //       item.interest = handleInterest;
    //       item.state = item.state?'啟用':'停用';
    //       item.createDate = this.$dayjs(item.createDate).format('YYYY-MM-DD');
    //       item.openCard = item.openCard?'是':'否';
    //       item.openCardDate = item.openCardDate?item.openCardDate:'-';
    //       item.openCardHotel = item.openCardHotel?item.openCardHotel:'-';
    //       item.sendBirthdayDate = item.sendBirthdayDate?this.$dayjs(item.sendBirthdayDate).format('YYYY-MM-DD'):'-';
    //       return item
    //     })
    //     this.listLoading = false;
    //     return handleData
    //   }
    // },
    //匯出,取得所有會員使用或取消資料
    async pointUsageRecordFetchData(){
      if(this.exportPointUsedAndCancelDateRange.length===0){
        this.$swal.fire({
          title: "請選擇匯出資料區間",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false,
        });
        return
      }else{
        this.listLoading = true;
        let handleData = [];
        const [startDate,endDate] = this.exportPointUsedAndCancelDateRange
        let requestTemp ={
          state:0,
          startDate,
          endDate
        }
        let result = await this.$api.members.memberPointsUseOrCancelAll(requestTemp)
        const { code,data } = result;

        if(code === 200){
          if(data.length===0){
            this.$swal.fire({
              title: "區間內無資料可匯出",
              icon: "warning",
              timer: 2000,
              showConfirmButton: false,
            });
            this.listLoading = false;
            return
          }
          handleData = data.map((item)=>{
            item.memberId = '`'+item.memberId;
            item.point = `${'-'}${item.point}`
            item.createDate = this.$dayjs(item.createDate).format('YYYY-MM-DD');
            item.storeName = item.storeName?item.storeName:'後台';
            item.state = item.state===1?'已使用':'取消'
            return item
          })
          this.listLoading = false;
          return handleData
        }
      
      }
    },
    //匯出,取得所有會員點數紀錄
    async pointGetRecordFetchData(){

      if(this.exportPointGetDateRange.length===0){
        this.$swal.fire({
          title: "請選擇匯出資料區間",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false,
        });
        return
      }else{
        this.listLoading = true;
        let handleData = [];
        const [startDate,endDate] = this.exportPointGetDateRange
        let requestTemp ={
          startDate,
          endDate
        }

        let result = await this.$api.members.memberPointsAll(requestTemp)
        const { code,data } = result;

        if(code === 200){
          if(data.length===0){
            this.$swal.fire({
              title: "區間內無資料可匯出",
              icon: "warning",
              timer: 2000,
              showConfirmButton: false,
            });
            this.listLoading = false;
            return
          }
          handleData = data.map((item)=>{
            item.memberId = '`'+item.memberId;
            // item.memberId = JSON.parse(JSON.stringify(item.memberId));
            item.createDate = this.$dayjs(item.createDate).format('YYYY-MM-DD');
            item.storeName = item.storeName?item.storeName:'後台';
            return item
          })
          this.listLoading = false;
          return handleData
        }
      
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
      if(type==='memberPointsLoad' || type==='memberCouponLoad'){ //優惠券API,撈全部狀態state = null
        this.recordListQuery.State = null 
      }
      if(type==='memberPointsUseOrCancelLoad'){
        //點數API,撈全部狀態state = 0 
        this.recordListQuery.State = 0 
      }
      this.recordLoad()
    },
    recordLoad(){
      this.recordListLoading = true;
      this.$api.members[this.dialogStatus](this.recordListQuery).then((res)=>{
        this.recordListLoading = false;
        const { code,count,data} = res
        if(code===200){
          this.recordList = data;
          this.recordTotal = count
        }
      })
    },
    openExportDialog(type){
      this.dialogStatus = type
      if(type==='exportPointGet'){
        this.exportPointGetVisible = true
      }
      if(type==='exportPointUsedAndCancel'){
        this.exportPointUsedAndCancelVisible = true
      }
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
        case "exportPointGet":
          this.openExportDialog('exportPointGet')
          break;
        case "exportPointUsedAndCancel":
          this.openExportDialog('exportPointUsedAndCancel')
          break;
      }
    },
    getList() {
      this.listLoading = true;
      this.$api.members.getList(this.listQuery).then((response) => {
        this.listLoading = false;
        const { data, count,code } = response;
        if(code === 200){
          this.list = data;
          this.total = count;
        }
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
      if(formType === 'pointForm'){
        this.memberPointVisible = false;
        this.resetTemp(formType);
      }
      if(formType === 'addForm'){
        this.dialogFormVisible = false;
        this.resetTemp(formType);
      }
      if (formType === 'exportPointGet'){
        this.exportPointGetVisible = false;
        this.exportPointGetDateRange = []
      }
      if (formType === 'exportPointUsedAndCancel'){
        this.exportPointUsedAndCancelVisible = false;
        this.exportPointUsedAndCancelDateRange = []
      }
      
      
    },
    resetTemp(formType) {
      if(formType === 'pointForm'){
        this.$refs["pointsRuleForm"].resetFields();
        this.pointsTemp = JSON.parse(JSON.stringify(pointsFormTemplate));
      }
      if(formType === 'addForm'){
        this.$refs["ruleForm"].resetFields();
        this.temp = JSON.parse(JSON.stringify(formTemplate));
        this.interestSelected = [];
        this.imagePathAry=[];
        this.imagesPropAry=[];
        this.dialogStatus=''
      }
    },
    // 新增(談窗)
    handleCreate() {
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
      this.rules.password[0].required = true
    },
    //點數加/扣點
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
              this.$api.members[apiName](this.pointsTemp).then((res) => {
                if(res){
                  const {code} = res
                  if(code===200){
                    this.$swal.fire({
                      title: "成功",
                      icon: "success",
                      timer: 2000,
                      showConfirmButton: false,
                    });
                    this.closeDialog("pointForm");
                    this.getList();
                  }
                }
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
          //篩選出興趣
          let interestResult = this.interestSelectList.filter((item)=>this.interestSelected.includes(item.id))
          if(interestResult.length>0){
            this.temp.interest = JSON.stringify(interestResult)
          }
          this.$api.members[apiName](this.temp).then((res) => {
            const {code} = res
            if(code===200){
              this.$swal.fire({
                title: "成功",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
              this.closeDialog("addForm");
              this.getList();
            }
          });
        }
      });
    },
    // 編輯彈窗
    handleUpdate(row,actionType) {
      this.$api.members.get({ id: row.id }).then((res) => {
        const { code, result } = res;
        if (code === 200) {
          this.rules.password[0].required = false
          this.temp = JSON.parse(JSON.stringify(result));
          if(this.temp.interest){
            let interestAry = JSON.parse(this.temp.interest)
            this.interestSelected = interestAry.map(item=>item.id)
          }
          if(this.temp.avatarPicture){
            this.imagePathAry = JSON.parse(this.temp.avatarPicture);
            this.imagesPropAry = JSON.parse(this.temp.avatarPicture);
          }
        }
      });
      this.dialogStatus = actionType;
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
      .buttonFlexBox{
        min-height: 100px;
        display: flex;
        flex-wrap: wrap;
        // justify-content: flex-start;
        justify-content: center;
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
      .used,.redText{
        color: red;
      }
      .notUsed,.greenText{
        color: green;
        font-weight: 600;
      }
      .cancel,.grayText{
        color: darkgray;
      }
      
    }
  }
  ::v-deep .memberDialog{
    .previewImgWrap{
      width: 150px;
      height: 150px;
      img{
        object-fit: cover;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
