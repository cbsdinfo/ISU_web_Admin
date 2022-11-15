<template>
  <div class="memberPurchaseHistory">
    <template v-if="listQuery.PartnerStoreId"> 
      <div class="table">
        <h3 class="">會員消費紀錄</h3>
        <template>
          <el-date-picker v-model="filterDateRange" type="daterange" value-format = "yyyy-MM-dd" size="mini" @change="changeDateRange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          ></el-date-picker>
          <el-table ref="mainTable" :data="list" border fit highlight-current-row style="width: 100%" height="calc(100% - 200px)">
            <el-table-column min-width="150px" label="會員ID" prop="memberId" align="center"></el-table-column>
            <el-table-column min-width="150px" label="消費日期" prop="StoreDate" align="center"></el-table-column>
            <el-table-column min-width="150px" label="時間" prop="createDate" align="center"></el-table-column>
            <el-table-column min-width="150px" label="店名" prop="storeName" align="center"></el-table-column>
            <el-table-column min-width="150px" label="消費金額" prop="storeAmount" align="center"></el-table-column>
            <el-table-column min-width="150px" label="消費品名" prop="invoiceItems" align="center"></el-table-column>
          </el-table>
          <pagination :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
        </template>
      </div>
    </template>
    <div v-if="list.length===0 && !listQuery.PartnerStoreId">
      <p>請先綁定景點商家</p>
    </div>
    
  </div>
</template>

<script>
  import Pagination from "@/components/Pagination";
  export default {
     components: { Pagination },
    data() {
      return {
        total:0,
        filterDateRange:[],
        list:[
          {
            id:'12314',//序號
            MemberId:'MemberId',//會員ID
            PartnerStoreId:'123456',//合作商家ID
            partnerStoreName:'unipapa',//合作商家名稱
            ObtainWays:'發票登入',//獲取方式
            TreasureCoin:'1000寶幣',//寶幣
            StoreName:'unipapa',//店家名稱
            StoreSn:"asdasd",//店家編號
            StoreAmount:'1000$',//店家消費金額
            StoreDate:'22-10-30',//店家消費日期
            StoreInvoice:'',//店家發票號碼
            Invoiclterms:'',//發票品項
            CreateDate:'22-11-15'//創建日期
          }
        ],
        listQuery:{
          PartnerStoreId:"",
          StartDate:"2022-11-01",
          EndDate:"",
          page:1,
          limit:10,
          key:""
        }
      }
    },
    methods: {
      handleCurrentChange(val) {
        this.listQuery.page = val.page;
        this.listQuery.limit = val.limit;
        this.getList();
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
      handleFilter() {
        this.listQuery.page = 1;
        this.getList();
      },
      getPartnerStoreId(){
        // return new Promise((resolve)=>{

          this.$api.login.getUserProfile().then((res)=>{
            const{code,result} = res
            if(code===200){
              let handleName = result.name.split(',')
              if(handleName.length>1){
            
                const partnerStoreId = handleName[0]
                this.listQuery.PartnerStoreId = partnerStoreId
                // console.log('this.listQuery',this.listQuery);
                this.getList()
              }
              if(handleName.length===1){
               
                this.$swal.fire({
                  icon: "warning",
                  title: "請先綁定景點商家",
                  timer: 1500,
                  showConfirmButton: false,
                });
              }  
            }
          })
        // })
      },
      getList(){
        console.log('getList');
        this.$api.partnerStores.consumptionRecordLoad(this.listQuery).then((res)=>{
         
          const { code , data,count } = res
          if(code===200){
            this.list = data
            this.total = count 
          }
        })
      }
    },
    mounted() {
      this.listQuery.StartDate = this.$dayjs().format("YYYY-MM-DD")
      this.listQuery.EndDate = this.$dayjs().format("YYYY-MM-DD")
      this.filterDateRange.push(this.listQuery.StartDate)
      this.filterDateRange.push(this.listQuery.EndDate)
      this.getPartnerStoreId()
      //this.getList()
    },
  }
</script>

<style lang="scss" scoped>
.memberPurchaseHistory{
  width: 100%;
  height: 100%;
  .table{
    height: 100%;
    h3{
      text-align: center;
    }
    .noData{
      padding: 30px 0px;
      width: 100%;
      text-align: center;
    }
  }
}
</style>