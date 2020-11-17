<template>
    <div class="params">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 提示 -->
            <el-alert
                title="注意：只允许为第三级分类设置相关参数!"
                type="warning"
                show-icon
                :closable='false'>
            </el-alert>
            <!-- 商品分类的级联选择 -->
            <el-row>
                <el-col>
                    <span>选择商品分类:</span>
                    <el-cascader
                    v-model="selectedKeys"
                    :options="paramsList"
                    :props="paramsProps"
                    @change="handleParamsChange"></el-cascader>
                </el-col>
            </el-row>
            <!-- 分类参数的标签页 -->
            <el-tabs v-model="activeName" @tab-click="handleTabsClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isTabsBtn" @click="addParams">添加参数</el-button>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isTabsBtn" @click="addParams">添加属性</el-button>
                </el-tab-pane>
                <!-- 标签页下方的表单 -->
                <el-table :data="isAnyData" border stripe>
                        <!-- 展开列 -->
                        <el-table-column  type="expand">
                            <template slot-scope="scope">
                                <el-tag
                                v-for="(item,i) in scope.row.attr_vals"
                                :key="i"
                                closable
                                @close="handleClose(i,scope.row)">
                                {{item}}
                                </el-tag>
                                <!-- 给参数添加新的子项 -->
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="editParams(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
            </el-tabs>
            <!-- 添加分类的对话框 -->
            <el-dialog
            :title="'添加' + isTitleText"
            :visible.sync="addDialogVisible"
            width="40%"
            @close='addRulesClose'>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="isTitleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParamsSub">确 定</el-button>
            </span>
            </el-dialog>
            <!-- 编辑分类的对话框 -->
            <el-dialog
            :title="'修改' + isTitleText"
            :visible.sync="editDialogVisible"
            width="40%"
            @close='editRulesClose'>
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="isTitleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParamsSub">确 定</el-button>
            </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            paramsList:[],
            // paramsProps为级联选择器的配置对象
            paramsProps: {
                expandTrigger: 'hover',
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            // selectedKeys为双向绑定的id
            selectedKeys: [],
            // Tabs默认选中的标签页 -- 被激活的标签页
            activeName: 'many',
            // 存储动态参数的数据
            manyListData: [],
            // 存储静态属性的数据
            onlyListData: [],
            // 控制添加分类对话框的显示与隐藏
            addDialogVisible: false,
            // 添加分类对话框的数据
            addForm: {
                attr_name : '',
            },
            // 表单的校验规则
            addFormRules:{
                attr_name:[
                    { required: true, message: '请输入参数名称!', trigger: 'blur' }
                ]
            },
            // 控制编辑分类对话框的显示与隐藏
            editDialogVisible: false,
            // 添加分类对话框的数据
            editForm: {
                attr_name : '',
            },
            // 表单的校验规则
            editFormRules:{
                attr_name:[
                    { required: true, message: '请输入参数名称!', trigger: 'blur' }
                ]
            },
        }
    },
    created() {
        this.getParamsList();
    },
    methods: {
        // 获取级联选择器的数据
        async getParamsList() {
            const {data:res} = await this.service.get('categories');
            if(res.meta.status !== 200) return this.$message.error("获取数据失败");
            this.paramsList = res.data;
        },
        // 级联选择器的值发生变化，调用这个函数
        handleParamsChange() {
            console.log(this.selectedKeys);
            this.getParamsListData();
            
        },
        // 标签页的点击事件
        handleTabsClick() {
            console.log(this.activeName);
            this.getParamsListData();
        },
        // 获取参数列表的数据
        async getParamsListData() {
            // 控制选择器选择的范围，只能选三级
            if(this.selectedKeys.length !== 3){
                this.selectedKeys = [];
                this.manyListData = [];
                this.onlyListData = [];
                return;
            }
            console.log(this.selectedKeys);
            // 如果selectedKeys的长度等于3，请求数据接口
            const {data:res} = await this.service.get(`categories/${this.isSelectedId}/attributes`, {params:{sel:this.activeName}});
            if(res.meta.status !== 200) return this.$message.error("获取数据失败!请先选择商品分类!");
            console.log(res.data);
            // 循环参数下的每一项
            res.data.forEach( item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                // 控制自己得文本框与按钮的显示与隐藏
                item.inputVisible = false;
                // 控制自己文本框的数据
                item.inputValue = '';
                // 不这么处理，会有bug，因为每一个按钮与输入框共用一个布尔值，这是将它们独立了起来
            });
            // 通过判断是动态参数还是静态属性，将数据分开存放
            if(this.activeName === 'many'){
                this.manyListData = res.data;
            } else {
                this.onlyListData = res.data;
            }
        },
        // 添加参数的点击事件
        addParams() {
            this.addDialogVisible = true;
        },
        // 对话框关闭时，调用这个函数，清除校验规则
        addRulesClose() {
            this.$refs.addFormRef.resetFields();
        },
        // 点击确定按钮，添加参数
        addParamsSub() {
            // 进行预验证
            this.$refs.addFormRef.validate(async valid => {
                if(!valid) return;
                // 请求接口,
                const {data:res} = await this.service.post(`categories/${this.isSelectedId}/attributes`,{
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName,
                });
                if(res.meta.status !== 201) return this.$message.error("添加参数失败!");
                // 重新获取参数列表数据
                this.getParamsListData();
                // 关闭对话框
                this.addDialogVisible = false;
            })
        },
        // 对话框关闭时，调用这个函数，清除校验规则
        editRulesClose() {
            this.$refs.editFormRef.resetFields();
        },
        // 编辑按钮
        async editParams(attr_id) {
            const {data:res} = await this.service.get(`categories/${this.isSelectedId}/attributes/${attr_id}` ,{
                params:{attr_sel: this.activeName}
            });
            if(res.meta.status !== 200) return this.$message.error("获取参数失败!");
            this.editForm = res.data;
            // 打开对话框
            this.editDialogVisible = true;
        },
        // 编辑分类的对话框确定按钮的点击事件
        editParamsSub() {
             // 进行预验证
            this.$refs.editFormRef.validate(async valid => {
                if(!valid) return;

                const {data:res} = await this.service.put(`categories/${this.isSelectedId}/attributes/${this.editForm.attr_id}`,
                {attr_name: this.editForm.attr_name, attr_sel: this.activeName});
                if(res.meta.status !== 200) return this.$message.error('更新失败!');
                this.getParamsListData();
                this.editDialogVisible = false;
            })
        },
        // 删除参数按钮的点击事件
        async deleteParams(attr_id) {
            // 为防止用户误操作，在删除前进行提示
            const confirmData = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch( err => {
                return err
            });
            // 如果用户确认删除，返回字符串confirm, 如果用户取消删除，返回字符串cancel
            if(confirmData !== 'confirm') return this.$message.error("已取消删除");
            // 请求接口，删除参数
            const {data:res} = await this.service.delete(`categories/${this.isSelectedId}}/attributes/${attr_id}`);
            if(res.meta.status !== 200) return this.$message.error("删除失败!");
            this.getParamsListData();
        },
        // 文本框失去焦点，或者按下enter键触发
        async handleInputConfirm(row) {
            // 判断输入的值
            if(row.inputValue.trim().length === 0){
                row.inputValue = '';
                row.inputVisible = false;
                return
            }
            // 如果没有return，则证明输入的内容，需要做后续处理
            row.attr_vals.push(row.inputValue.trim());
            row.inputValue = '';
            row.inputVisible = false;
            
            // 请求接口，提交数据
            this.tagAttrValue(row);
            
        },
        // 标签数据的
        async tagAttrValue(row) {
            const {data:res} = await this.service.put(`categories/${this.isSelectedId}/attributes/${row.attr_id}`,
            {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' '),
            });
            if(res.meta.status !== 200) return this.$message.error('更新失败!');
        },
        // 删除tag标签
        handleClose(i,row) {
            row.attr_vals.splice(i,1);
            this.tagAttrValue(row);
        },
        // 点击按钮，显示文本输入框
        showInput(row) {
            row.inputVisible = true;
            // 使文本框获得焦点
            // $nextTick方法是使页面上的元素重新渲染了以后，才会指定回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
    },
    computed: {
        // 控制分类参数标签页下的按钮禁用状态
        // 如果按钮要被禁用，返回true，否则返回false
        isTabsBtn() {
            if(this.selectedKeys.length !== 3){
                return true
            }
            return false
        },
        // 用来获取selectedKeys的最后一个id值 -- 作为请求接口的参数
        isSelectedId() {
            if(this.selectedKeys.length === 3){
                return this.selectedKeys[2];
            } else {
                return null;
            }
        },
        // 用来判断是动态参数还是静态属性数据
        isAnyData() {
            if(this.activeName === 'many'){
                return this.manyListData;
            } else {
                return this.onlyListData
            }
        },
        // 用来确定添加分类对话框的标题
        isTitleText() {
            if(this.activeName === "many"){
                return "动态参数"
            }
            return "静态属性"
        },
    },
}
</script>

<style lang="scss">
    .params{
        .el-row{
            margin: 20px 0;
            .el-cascader{
                margin-left: 10px;
            }
        }
        .el-table{
            margin-top: 20px;
        }
        .el-tag{
            margin: 5px 10px;
        }
        .input-new-tag{
            width: 100px;
        }
    }
</style>