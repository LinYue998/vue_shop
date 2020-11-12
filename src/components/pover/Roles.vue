<template>
    <div class="roles">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 添加用户按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addUser">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表表格 -->
            <el-table border :data = "rolesList" stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id"
                        :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="deleteRights(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二三级权限 -->
                            <el-col :span="19">
                                <el-row v-for="(item2, i2) in item1.children" :key="item2.id"
                                :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                                    <!-- 渲染二级菜单 -->
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="deleteRights(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 渲染三级菜单 -->
                                    <el-col :span='18'>
                                        <el-tag type="warning" closable v-for="(item3) in item2.children" :key="item3.id" @close="deleteRights(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 修改用户信息按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUser(scope.row.id)">编辑</el-button>
                        <!-- 删除用户按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)">删除</el-button>
                        <!-- 分配用户权限按钮 -->
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="allotPower(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色的对话框与修改角色的对话框 -->
        <el-dialog
        :title="state ? '添加角色' : '修改角色'"
        :visible.sync="dialogAddUser"
        width="30%"
        @close="closeForm">
            <el-form :model="comForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="comRoleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="comRoleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogAddUser = false">取 消</el-button>
                <el-button type="primary" @click="sureFormUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限对话框 -->
        <el-dialog
        title="分配权限"
        :visible.sync="powerDialogVisible"
        width="40%">
        <el-tree :data="allPowerList" :props="treeProps" show-checkbox node-key="id" 
        default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="powerDialogVisible=false">取 消</el-button>
            <el-button type="primary" @click="allPower">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 用于存放获取到的角色列表数据
            rolesList: [],
            // 控制添加角色对话框的显示与隐藏
            dialogAddUser: false,
            // 添加用户的表单
            addForm:{
                roleName: '',
                roleDesc: '',
            },
            // 修改用户的表单 -- 重新向后台获取数据(通过ID查询角色--更加安全)
            editForm:{},
            // 用来判断是添加用户弹窗还是修改用户弹窗
            state: true,
            // 用户名的校验规则
            addFormRules:{
                roleName: [
                    { required: true, message: '请输入用户名称', trigger: 'blur' },
                    { min: 2, max: 6, message: '用户名称长度在 2 到 6 个字符', trigger: 'blur' }
                ],
            },
            // 控制权限分配对话框的显示与隐藏
            powerDialogVisible: false,
            // 用来存放所有权限列表
            allPowerList: [],
            // 树形控件的属性绑定对象
            treeProps: {
                label: 'authName',
                children: 'children',
            },
            // 存放当前角色的id值 -- 用于后面的权限添加
            RoleId: '',
            // 默认勾选节点数组
            defKeys: [],
        }
    },
    created() {
        this.getRolesData();
    },
    computed: {
        // 用于绑定表单，是添加表单还是修改用户表单
        comForm() {
            return this.state ? this.addForm : this.editForm;
        },
        // 用于绑定表单，是添加表单的用户名称还是修改用户表单的用户名称
        comRoleName: {
            get() {
                return this.state ? this.addForm.roleName : this.editForm.roleName;  
            },
            set(newValue) {
                // console.log(newValue);
                if(this.state == true){
                    this.addForm.roleName = newValue;
                } else {
                    this.editForm.roleName = newValue;
                }
            }
            
        },
        // 用于绑定表单，是添加表单的用户描述还是修改用户表单的用户描述
        comRoleDesc: {
            get() {
                return this.state ? this.addForm.roleDesc : this.editForm.roleDesc;
            },
            set(newValue) {
                if(this.state == true){
                    this.addForm.roleDesc = newValue;
                } else{
                    this.editForm.roleDesc = newValue;
                }
            },
        }
    },
    methods: {
        async getRolesData() {
            const {data:res} = await this.service.get('roles');
            console.log(res);
            //  进行判断
            if(res.meta.status !== 200) return this.$message.error("获取数据失败！");
            // 将获取到的数据存放到rolesList
            this.rolesList = res.data;
        },
        // 点击按钮，打开添加用户对话框
        addUser() {
            this.dialogAddUser = true;
            this.state = true;
        },
        // 点击按钮，打开修改用户对话框
        async editUser(id) {
            // console.log(id);
            this.state = false;
            const {data:res} = await this.service.get('roles/' + id);
            if(res.meta.status !== 200) return;
            // 正确就将获取到的值赋给表单
            this.editForm = res.data;
            // console.log(this.editForm);
            this.dialogAddUser = true;
        },
        // 点击取消按钮,关闭对话框，清除表单验证
        closeForm() {
            this.$refs.addFormRef.resetFields();
        },
        // 点击确定按钮,关闭对话框，添加新用户或者修改用户
        async sureFormUser() {
            if(this.state){
                // 调用添加接口
                const {data:res} = await this.service.post('roles', this.addForm);
                if(res.meta.status !== 201) return;
                this.$message.success("创建成功！");
                this.getRolesData();
            } else {
                // 调用修改接口
                const {data:res} = await this.service.put('roles/' + this.editForm.roleId,
                {roleName:this.editForm.roleName, roleDesc:this.editForm.roleDesc});
                if(res.meta.status !== 200)return;
                this.$message.success("修改成功！");
                this.getRolesData(); 
            }
            this.dialogAddUser = false;
        },
        // 点击删除按钮,删除当前用户 -- 通过id进行删除
        async deleteUser(id) {
            // 为防止用户误操作，在删除前进行提示
            const confirmData = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch( err => {
                return err
            });
            // 如果用户确认删除，返回字符串confirm, 如果用户取消删除，返回字符串cancel
            if(confirmData !== 'confirm') return this.$message.error("已取消删除");
            // 调用接口,删除用户
            const {data : res} = await this.service.delete('roles/' + id);
            if(res.meta.status !== 200) return;
            this.$message.success("已删除用户");
            // 删除以后再重新获取列表数据
            this.getRolesData();
        },
        // 通过id删除用户权限
        async deleteRights(role, rightid) {
            // 为防止用户误操作，在删除前进行提示
            const confirmData = await this.$confirm('此操作将永久删除该用户权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch( err => {
                return err
            });
            // 如果用户确认删除，返回字符串confirm, 如果用户取消删除，返回字符串cancel
            if(confirmData !== 'confirm') return this.$message.error("已取消删除");
            // 调用接口,进行权限删除
            const {data:res} = await this.service.delete(`roles/${role.id}/rights/${rightid}`);
            if(res.meta.status !== 200) return;
            this.$message.success("删除权限成功！");
            // 删除后重新获取列表数据
            // this.getRolesData();
            // res中已经包含了最新的数据，所以没必要重新获取整个列表的数据
            role.children = res.data;
        },
        // 点击分配权限按钮,打开弹窗，
        async allotPower(role) {
            // 打开前先将defKeys数组清空
            this.defKeys = [];
            // 将当前的角色ID进行保存，以便于后面给角色添加权限使用
            this.RoleId = role.id;
            // 请求接口,获取所有权限
            const {data:res} = await this.service.get('rights/tree');
            if(res.meta.status !== 200) return;
            // console.log(res.data);
            this.$message.success('获取所有权限列表成功！');
            this.allPowerList = res.data;
            // 递归获取三级节点的id
            this.getLeafKeys(role, this.defKeys)
            // 打开弹窗
            this.powerDialogVisible = true;
        },
        // 通过递归来获取角色下所有三级权限的id，并保存到defKeys数组里面
        getLeafKeys(node, arr) {
            // 如果当前节点不包含children属性，则是三级节点
            if(!node.children) {
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                this.getLeafKeys(item, arr)
            })
        },
        // 点击确定按钮,给角色授权
        async allPower() {
            // 先获取到选中与半选中权限的id --- (getCheckedKeys为选中的,getHalfCheckedKeys为半选中的)
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ];
            // 将获取到的id以“,”形式进行分割;
            const idStr = keys.join(","); 
            // console.log(idStr);
            // 调用接口 --roleId(我们在打开弹窗的时候，就将角色id进行保存)
            const {data:res} = await this.service.post(`roles/${this.RoleId}/rights`, {rids : idStr});
            if(res.meta.status !== 200){
                return this.$message.error("更新失败！")
            } else {
                this.$message.success("更新成功！");
                // 重新获取数据列表
                this.getRolesData();
                // 将当前的角色id删除,以便于保存下一个角色的id
                this.RoleId = '';
                // 将弹窗关闭
                this.powerDialogVisible = false;
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    .roles{
        .el-table{
            margin-top: 20px;
        }
        .el-tag{
            margin: 10px;
        }
        .bdtop{
            border-top: 1px solid #eee;
        }
        .bdbottom{
            border-bottom: 1px solid #eee;
        }
        .vcenter{
            display: flex;
            align-items: center;
        }
    }
</style>