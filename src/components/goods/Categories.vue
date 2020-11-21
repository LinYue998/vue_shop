<template>
    <div class="categories">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <!-- 添加分类按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCate">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <tree-table :data="cateList" :columns="columns"
            :show-row-hover="false" :selection-type="false"
            :show-index="true" index-text="#"
            :expand-type="false" border>
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序 -->
                <template slot="issort" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="isbutton" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scope.row)">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页组件 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 5, 8, 10]"
            :page-size="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类弹窗 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addDialogVisible"
        width="40%"
        @close="addCateDialogClose">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称:" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类:" prop="cat_pid">
                <!-- options用来指定数据源
                     props用来指定配置对象
                     v-model用来存放选中的父级分类id数组 -->
                <el-cascader
                v-model="selectCatekeys"
                :options="parentCateList"
                :props="casParentCate"
                @change="parentChangeKeys"
                clearable></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCateSub">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 修改分类的弹窗 -->
        <el-dialog
        title="修改分类"
        :visible.sync="editDialogVisible"
        width="40%"
        @close="editCateDialogClose">
        <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
            <el-form-item label="分类名称:" prop="cat_name">
                <el-input v-model="editCateForm.cat_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCateSub">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 请求接口传递的参数
            queryInfo: {
                type: 3,
                // 当前页码值
                pagenum: 1,
                // 每页显示条数
                pagesize: 5,
            },
            // 商品分类数据列表 -- 默认为空
            cateList: [],
            // 总条数
            total: 0,
            // 表格各列的配置
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 使用自定义模板
                    type: 'template',
                    // 自定义模板名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    // 使用自定义模板
                    type: 'template',
                    // 自定义模板名称
                    template: 'issort'
                },
                {
                    label: '操作',
                    // 使用自定义模板
                    type: 'template',
                    // 自定义模板名称
                    template: 'isbutton'
                },
            ],
            // 控制添加分类弹窗的显示与隐藏
            addDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm:{
                // 将要添加分类的名称
                cat_name: '',
                //添加分类的父级id，0则表示父级为0.添加一级分类
                cat_pid: 0,
                 //添加分类的等级，0则表示添加一级分类
                cat_level: 0,
            },
            // 分类弹窗中分类名称的校验规则
            addCateFormRules:{
                cat_name:[
                    {required: true, message: '请输入分类名称！', trigger: 'blur'}
                ]
            },
            // 获取到的父级分类数据列表
            parentCateList: [],
            // 级联选择器的配置对象
            casParentCate: {
                // 次级菜单的展开方式
                expandTrigger: 'hover',
                // 指定选项的值为选项对象的某个属性值
                value: 'cat_id',
                // 指定选项标签为选项对象的某个属性值
                label: 'cat_name',
                // 指定选项的子选项为选项对象的某个属性值
                children: 'children',
                checkStrictly: 'true'
            },
            // 选中的父级分类id数组
            selectCatekeys: [],

            // 编辑分类
            // 存放编辑分类的对象
            editCateForm:{},
            // 控制编辑分类弹窗的显示与隐藏
            editDialogVisible: false,
            // 编辑分类输入框的校验规则
            editCateFormRules:{
                cat_name:[
                    {required: true, message: '请输入分类名称！', trigger: 'blur'}
                ]
            },
        }
    },
    created() {
        this.getCateList();
    },
    methods: {
        // 获取商品分类数据列表
        async getCateList() {
            const {data : res} = await this.service.get('categories', {params : this.queryInfo});
            console.log(res);
            // 进行判断
            if(res.meta.status !== 200) return this.$message.error("获取商品分类数据失败！");
            // 将获取到的数据存储到cateList
            this.cateList = res.data.result;
            // 将获取到的总条数存储到total
            this.total = res.data.total;
        },
        // 监听pagesize的改变 -- 每页条数
        handleSizeChange(newValue) {
            this.queryInfo.pagesize = newValue;
            this.getCateList();
        },
        // 监听pagenum的改变 -- 当前页
        handleCurrentChange(newSize) {
            this.queryInfo.pagenum = newSize;
            this.getCateList();
        },
        // 添加分类按钮的单击事件
        showAddCate() {
            // 在打开添加分类弹窗前获取到数据列表
            this.getParentList();
            this.addDialogVisible = true;
        },
        // 获取父级分类数据列表
        async getParentList() {
            // 因为只需要获取到二层分类列表，所以将type的值固定为2
            const {data:res} = await this.service.get('categories', {params : {type:2}});
            console.log(res);
            if(res.meta.status !== 200) return this.$message.error('获取父级分类数据列表失败!')
            this.parentCateList = res.data;
        },
        // 添加分类的表单数据对象赋值
        parentChangeKeys() {
            console.log(this.selectCatekeys);
            // 通过判断选中的父级分类id数组长度来进行新添加分类的id
            if(this.selectCatekeys.length > 0){
                // 父级分类的id
                this.addCateForm.cat_pid = this.selectCatekeys[this.selectCatekeys.length-1];
                // 当前分类id赋值
                this.addCateForm.cat_level = this.selectCatekeys.length;
            } else {
                // 父级分类id
                this.addCateForm.cat_pid = 0;
                // 当前分类id
                this.addCateForm.cat_level = 0;

            }
        },
        // 添加分类弹窗的关闭事件
        addCateDialogClose() {
            // 清空引用的数据
            this.$refs.addCateFormRef.resetFields();
            // 清空父级分类id数组
            this.selectCatekeys = [],
            // 清空添加分类的表单数据对象
            this.addCateForm.cat_pid = 0;
            this.addCateForm.cat_level = 0;
        },
        // 点击按钮，添加分类
        addCateSub() {
            this.$refs.addCateFormRef.validate(async valid => {
                // console.log(valid)
                if(!valid) return
                // 请求接口
                const {data:res} = await this.service.post('categories', this.addCateForm);
                if(res.meta.status !== 201) return this.$message.error("添加新分类失败!")
                // 重新获取数据列表
                this.getCateList();
                // 关闭弹窗
                this.addDialogVisible = false;
            })
        },
        // 点击按钮，通过id查询分类
        async editCate(role) {
            // 将弹窗打开
            this.editDialogVisible = true;
            console.log(role);
            // 请求接口
            const {data:res} = await this.service.get('categories/' + role.cat_id);
            if(res.meta.status !== 200) return this.$message.error("获取数据失败!");
            this.editCateForm = res.data;
        },
        // 编辑分类弹窗的关闭事件
        editCateDialogClose() {
            // 清空引用的数据
            this.$refs.editCateFormRef.resetFields();
        },
        // 编辑分类的提交
        editCateSub() {
            // 先进行预验证
            this.$refs.editCateFormRef.validate(async valid => {
                // console.log(valid)
                if(!valid) return
                // 为真就请求数据接口
                const {data:res} = await this.service.put('categories/' + this.editCateForm.cat_id,
                {cat_name:this.editCateForm.cat_name});
                if(res.meta.status !== 200) return this.$message.error("编辑分类名称失败!");
                // 重新获取一下分类数据列表
                this.getCateList();
                // 关闭弹窗
                this.editDialogVisible = false;
            })
        },
        // 点击删除按钮，删除当前的分类
        async delCate(role) {
            // 为防止用户误操作，在删除前进行提示
            const confirmData = await this.$confirm('此操作将永久删除该分类名称, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch( err => {
                return err
            });
            // 如果用户确认删除，返回字符串confirm, 如果用户取消删除，返回字符串cancel
            if(confirmData !== 'confirm') return this.$message.error("已取消删除");
            // 调用接口,删除用户
            const {data:res} =  await this.service.delete('categories/' + role.cat_id);
            if(res.meta.status !== 200) return this.$message.error("删除分类失败!");
            // 删除以后，重新获取数据列表
            this.getCateList();
        },
    },
}
</script>

<style lang="scss" scoped>
    .categories{
        .el-row{
            margin-bottom: 20px;
        }
        .el-pagination{
            margin-top: 20px;
            text-align: center;
        }
        .el-cascader{
            width: 100%;
        }
    }
</style>