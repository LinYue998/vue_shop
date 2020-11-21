<template>
    <div class="order">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 数据列表 -->
            <el-table :data="orderList"
            style="width: 100%" border stripe>
                 <el-table-column type="index" label="#"></el-table-column>
                 <el-table-column label="订单编号" prop="order_number" width="300px"></el-table-column>
                 <el-table-column label="订单价格" prop="order_price"></el-table-column>
                 <el-table-column label="是否付款" prop="pay_status">
                     <template slot-scope="scope">
                         <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                         <el-tag type="danger" v-else>未付款</el-tag>
                     </template>
                 </el-table-column>
                 <el-table-column label="是否发货" prop="is_send">
                     <template slot-scope="scope">
                         {{scope.row.is_send}}
                     </template>
                 </el-table-column>
                 <el-table-column label="下单时间" prop="create_time">
                     <template slot-scope="scope">
                         {{scope.row.create_time | dateFormat}}
                     </template>
                 </el-table-column>
                 <el-table-column label="操作" width="120px">
                     <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCityData"></el-button>
                     <el-button type="success" icon="el-icon-location" size="mini"></el-button>
                 </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 8, 10, 12]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
            <!-- 修改地址对话框 -->
            <el-dialog
            title="修改地址"
            :visible.sync="editCityDialogVisible"
            width="40%"
            @close="editHandleClose">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
                <el-form-item label="省市区/县" prop="city1">
                   <el-cascader
                    v-model="editForm.city1"
                    :options="cityData"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="city2">
                    <el-input v-model="editForm.city2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCityDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCityDialogVisible = false">确 定</el-button>
            </span>
            </el-dialog>
            <!-- 物流信息对话框 -->
            <el-dialog
            title="物流进度"
            :visible.sync="progressVisible"
            width="40%">
                <span>123456</span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
    data() {
        return {
            // 请求接口的参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize:8,
            },
            // 获取到的订单数据列表
            orderList: [],
            // 总数
            total: 0,
            // 控制修改地址的显示隐藏
            editCityDialogVisible: false,
            // 修改地址表单
            editForm:{
                city1:[],
                city2: '',
            },
            cityData: cityData,
            // 校验规则
            editFormRules:{
                city1:[
                    {required: true, message: '请选择省市区/县地址', trigger: 'blur' }
                ],
                city2:[
                    {required: true, message: '请输入详细地址', trigger: 'blur' }
                ]
            },
            // 控制物流进度的显示隐藏
            progressVisible: false,
            // 物流信息的列表
            progressList: [],
        }
    },
    created() {
        this.getOrderList();
    },
    methods: {
        async getOrderList() {
            const {data:res} = await this.service.get('orders', {params : this.queryInfo});
            if(res.meta.status !== 200){
                return this.$message.error("获取订单数据列表失败!");
            }
            this.orderList = res.data.goods;
            this.total = res.data.total;
            console.log(this.orderList);
        },
        handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getOrderList();
        },
        handleCurrentChange(newNum) {
            this.queryInfo.pagenum = newNum;
            this.getOrderList();
        },
        // 修改省市区的单击事件
        editCityData() {
            this.editCityDialogVisible = true;
        },
        // 对话框关闭时触发的函数
        editHandleClose() {
            this.$refs.editFormRef.resetFields();
        },
        // async progressData() {
        //     const {data:res} = await this.service.get('/kuaidi/804909574412544580');
        //     if(res.meta.status !== 200){
        //         return this.$message.error("获取物流信息失败!")
        //     }
        //     this.progressList = res.data;
        //     console.log(this.progressList);
        //     this.progressVisible = true;
        // },
    },
}
</script>

<style lang="scss">
    .order{
        .el-table{
            margin: 20px 0;
        }
        .el-pagination{
            text-align: center;
        }
        .el-cascader{
            width: 100%;
        }
    }
</style>