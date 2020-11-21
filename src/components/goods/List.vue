<template>
    <div class="list">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 添加与搜索用户 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddGood">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表 -->
            <el-table :data="goodsList" border stripe max-height="690px">
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="商品名称" prop="goods_name"></el-table-column>
              <el-table-column label="商品价格(元)" prop="goods_price" width="160px"></el-table-column>
              <el-table-column label="商品重量" prop="goods_weight" width="160px"></el-table-column>
              <el-table-column label="创建时间" prop="add_time" width="220px">
                  <template slot-scope="scope">
                      {{scope.row.add_time | dateFormat}}
                  </template>
              </el-table-column>
              <el-table-column label="操作" width="120px">
                  <template slot-scope="scope">
                        <!-- 修改商品信息按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGood(scope.row.goods_id)"></el-button>
                        <!-- 删除商品按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="delGood(scope.row.goods_id)"></el-button>
                  </template>
              </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[8, 10, 12, 14]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 编辑商品弹窗 -->
        <el-dialog
        title="编辑商品"
        :visible.sync="editDialogVisible"
        width="40%">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item label="商品名称">
                <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="name">
                <el-input v-model="editForm.goods_price"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editGoodSub">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 请求接口的请求参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
            },
            // 存储商品列表数据
            goodsList:[],
            // 总条数
            total: 0,
            // 编辑商品弹窗
            editDialogVisible: false,
            // 修改商品的对象
            editForm: {
                goods_name: '',
                goods_price: 0,
            },
            // 修改商品的校验
            editFormRules:{
                goods_price: [
                    {required: true, message: '请输入商品价格！', trigger: 'blur'},
                    {min:0}
                ]
            }
        }
    },
    created() {
        this.getGoodsList();
    },
    methods: {
        async getGoodsList() {
            const {data:res} = await this.service.get('goods', {params: this.queryInfo})
            console.log(res);
            if(res.meta.status !== 200) return this.$message.error("获取商品列表数据失败!");
            this.goodsList = res.data.goods;
            this.total = res.data.total;
        },
        // 一页几条
        handleSizeChange(Newsize) {
            this.queryInfo.pagesize = Newsize;
            this.getGoodsList();
        },
        // 跳转到哪一页 --最新的页码值
        handleCurrentChange(Newnum) {
            this.queryInfo.pagenum = Newnum;
            this.getGoodsList();
        },
        // 删除商品按钮
        async delGood(id) {
             // console.log(id);
            // 为防止用户误操作，在删除前进行提示
            const confirmData = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch( err => {
                return err
            })
            // 如果用户确认删除，返回字符串confirm, 如果用户取消删除，返回字符串cancel
            if(confirmData !== 'confirm') return this.$message.error("已取消删除");
            // 调用接口，删除商品
            const {data:res} = await this.service.delete('goods/' + id);
            if(res.meta.status !== 200) return this.$message.error("删除商品失败!");
            // 删除以后再重新获取列表数据
            this.getGoodsList();
        },
        // 添加商品的单击事件
        goAddGood(){
            this.$router.push('/home/goods/add');
        },
        // 编辑商品的事件
        async editGood(role) {
            const {data:res} = await this.service.get('goods/' + role);
            console.log(res);
            if(res.meta.status !== 200){
                return this.$message.error("获取商品列表数据失败")
            }
            this.editForm = res.data;
            // 打开弹窗
            this.editDialogVisible = true;
        },
        // 编辑商品提交
        editGoodSub() {
            console.log(this.editForm);
             // 先进行预验证
             this.$refs.editFormRef.validate( async  valid => {
                 if(!valid) return
                // 为真就请求数据接口
                const {data:res} = await this.service.put(`goods/${this.editForm.goods_id}`, this.editForm);
                console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error("编辑商品失败!")
                }
                this.getGoodsList();
                // 关闭窗口
                this.editDialogVisible = false;
             })
        },
    },
}
</script>

<style lang="scss">
    .list{
        .el-table{
            margin: 20px 0;
        }
        .el-pagination{
            text-align: center;
        }
    }
</style>