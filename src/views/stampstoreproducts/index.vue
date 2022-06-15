<template>
    <div class="flex-column">
        <sticky :className="'sub-navbar'">
            <div class="filter-container">
                <el-input @keyup.enter.native="handleFilter" size="mini" style="width: 200px;" class="filter-item" :placeholder="'名稱'" v-model="listQuery.key"> </el-input>
                <el-button class="filter-item" size="mini" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
                <permission-btn size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
            </div>
        </sticky>

        <div class="app-container flex-item">
            <div class="bg-white" style="height: 100%;">
                <el-table ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 60px)" @row-click="rowClick" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" align="center" width="55"> </el-table-column>
                 <el-table-column min-width="50px" label="類別序號" prop="categoryId"></el-table-column>
<el-table-column min-width="50px" label="類別名稱" prop="categoryName"></el-table-column>
<el-table-column min-width="50px" label="商家名稱" prop="storeName"></el-table-column>
<el-table-column min-width="50px" label="集章商品名稱" prop="productName"></el-table-column>
<el-table-column min-width="50px" label="兌換點數" prop="points"></el-table-column>
<el-table-column min-width="50px" label="庫存量" prop="inventory"></el-table-column>
<el-table-column min-width="50px" label="是否可用"><template slot-scope="scope"><span>{{scope.row.state === 1 ? "是" : "否"}}</span></template></el-table-column>

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
                        <el-col :span='24'>
<el-form-item label='類別序號' prop='categoryId'>
<el-select  v-model="temp.categoryId" placeholder="請選擇類別序號"  ><el-option label="請選擇" value="請選擇"></el-option></el-select>
</el-form-item>
</el-col>
<el-col :span='24'>
<el-form-item label='類別名稱' prop='categoryName'>
<el-input type="text" v-model="temp.categoryName" size="small" placeholder="請輸入類別名稱" ></el-input>
</el-form-item>
</el-col>
<el-col :span='24'>
<el-form-item label='商家名稱' prop='storeName'>
<el-input type="text" v-model="temp.storeName" size="small" placeholder="請輸入商家名稱" ></el-input>
</el-form-item>
</el-col>
<el-col :span='24'>
<el-form-item label='集章商品名稱' prop='productName'>
<el-input type="text" v-model="temp.productName" size="small" placeholder="請輸入集章商品名稱" ></el-input>
</el-form-item>
</el-col>
<el-col :span='24'>
<el-form-item label='兌換點數' prop='points'>
<el-input-number   v-model="temp.points" placeholder="請輸入兌換點數" size="small"  ></el-input-number>
</el-form-item>
</el-col>
<el-col :span='24'>
<el-form-item label='庫存量' prop='inventory'>
<el-input-number   v-model="temp.inventory" placeholder="請輸入庫存量" size="small"  ></el-input-number>
</el-form-item>
</el-col>
<el-col :span='24'>
<el-form-item label='狀態(上架/下架)' prop='state'>
<el-switch  v-model="temp.state" active-text="是" inactive-text="否" ></el-switch>
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
    import pbMixins from "@/mixins/permissionBtn.js";
    import waves from '@/directive/waves' // 水波紋指令
    import Sticky from '@/components/Sticky'
    import permissionBtn from '@/components/PermissionBtn'
    import Pagination from '@/components/Pagination'
    import elDragDialog from '@/directive/el-dragDialog'
    import extend from '@/extensions/delRows.js'


    const formTemplate = {
       id:"",
categoryId:"",
categoryName:"",
storeName:"",
productName:"",
points:0,
inventory:0,
state:false,

     };

    export default {
        name: 'stampStoreProduct',
        components: { Sticky, permissionBtn, Pagination },
        directives: {
            waves,
            elDragDialog,
        },
        mixins: [pbMixins,extend],
        data() {
            
            return {
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
                dialogStatus: '',
                textMap: {
                    update: '編輯',
                    create: '添加',
                },
                rules: {
                    categoryId:[{required: true, message: '必填欄位', trigger: 'blur' }],
categoryName:[{required: true, message: '必填欄位', trigger: 'blur' }],
storeName:[{required: true, message: '必填欄位', trigger: 'blur' }],
productName:[{required: true, message: '必填欄位', trigger: 'blur' }],
points:[{required: true, message: '必填欄位', trigger: 'blur' }],
inventory:[{required: true, message: '必填欄位', trigger: 'blur' }],
state:[{required: true, message: '必填欄位', trigger: 'blur' }],

                },
            }
        },
        mounted() {
            this.getList()
        },
        methods: {

            rowClick(row) {
                this.$refs.mainTable.clearSelection()
                this.$refs.mainTable.toggleRowSelection(row)
            },
            handleSelectionChange(val) {
                this.multipleSelection = val
            },
            onBtnClicked: function (domId, callback) {
                console.log('you click:' + domId)
                switch (domId) {
                    case 'btnAdd':
                        this.handleCreate()
                        break
                    case 'btnEdit':
                        if (this.multipleSelection.length !== 1) 
                        {
                            this.$swal.fire({
                    title: '只能選中一個進行編輯',
                    icon: 'error',
                    timer:2000,
showConfirmButton:false,
                })
                            return
                        }
                        this.handleUpdate(this.multipleSelection[0])
                        break
                    case 'btnDel':
                        if (this.multipleSelection.length < 1) {
                            this.$swal.fire({
                    title: '至少刪除一個',
                    icon: 'error',
                    timer:2000,
showConfirmButton:false,
                })
                           
                            return
                        }
                        this.handleDelete(this.multipleSelection)
                        break
                    case 'btnExport':
                        this.$refs.mainTable.exportExcel('資源文件', callback)
                        break
                    default:
                        break
                }
            },
            getList() {
                this.listLoading = true
                this.$api.stampStoreProducts.getList(this.listQuery).then((response) => {
                    const {data,count} = response;
                    this.list = data
                    this.total = count
                    this.listLoading = false
                })
            },
            handleFilter() {
                this.listQuery.page = 1
                this.getList()
            },
            handleSizeChange(val) {
                this.listQuery.limit = val
                this.getList()
            },
            handleCurrentChange(val) {
                this.listQuery.page = val.page
                this.listQuery.limit = val.limit
                this.getList()
            },
            handleModifyStatus(row, disable) {
                // 模擬修改狀態
                this.$swal.fire({
                    title: '操作成功',
                    icon: 'success',
                    timer:1500,
showConfirmButton:false,
                })
                row.disable = disable
            },
            resetTemp() {
                this.temp = JSON.parse(JSON.stringify(formTemplate)) // copy obj
            },
            handleCreate() {
                // 彈出添加框
                this.resetTemp()
                this.dialogStatus = 'create'
                this.dialogFormVisible = true
                this.$nextTick(() => {
                    this.$refs['ruleForm'].clearValidate()
                })
            },
            createData() {
                // 保存提交
                this.$refs['ruleForm'].validate((valid) => {
                    if(valid){
                    this.$api.stampStoreProducts.add(this.temp).then(() => {
                        this.list.unshift(this.temp)
                        this.dialogFormVisible = false
                        this.$swal.fire({
                    title: '成功',
                    icon: 'success',
                    timer:2000,
showConfirmButton:false,
                })
                       
                    })
                }
                })
            },
            handleUpdate(row) {
                // 彈出編輯框
                this.temp = Object.assign({}, row) // copy obj
                this.dialogStatus = 'update'
                this.dialogFormVisible = true
                this.$nextTick(() => {
                    this.$refs['ruleForm'].clearValidate()
                })
            },
            updateData() {
                // 更新提交
                this.$refs['ruleForm'].validate((valid) => {
                    if(valid){
                    const tempData = Object.assign({}, this.temp)
                    this.$api.stampStoreProducts.update(tempData).then(() => {
                        for (const v of this.list) {
                            if (v.id === this.temp.id) {
                                const index = this.list.indexOf(v)
                                this.list.splice(index, 1, this.temp)
                                break
                            }
                        }
                        this.dialogFormVisible = false
                        this.$swal.fire({
                    title: '成功',
                    icon: 'success',
                    timer:2000,
showConfirmButton:false,
                })
                      
                    })
                }
                })
            },
            handleDelete(rows) {
                // 多行刪除
                this.delrows('stampStoreProducts', rows)
            },
        },
    }
</script>
