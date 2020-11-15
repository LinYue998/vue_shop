<template>
    <div class="users">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 添加与搜索用户 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = !addDialogVisible">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表表格 -->
            <el-table
            :data="usersList"
            :border="true"
            :stripe="true"
            style="width: 100%">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column
                    prop="username"
                    label="姓名">
                </el-table-column>
                <el-table-column
                    prop="email"
                    label="邮箱">
                </el-table-column>
                <el-table-column
                    prop="mobile"
                    label="电话">
                </el-table-column>
                <el-table-column
                    prop="role_name"
                    label="角色">
                </el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="SwitchInfo(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作"
                    width="180px">
                    <template slot-scope="scope">
                        <!-- 修改用户信息按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUser(scope.row.id)"></el-button>
                        <!-- 删除用户按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setAllotDialog(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 8]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
            <!-- 添加用户 -->
            <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="30%"
            @close="addDialog">
                <!-- 主体内容 -->
                <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="addForm.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="addForm.password"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="addForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                        <el-input v-model="addForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部内容 -->
                <span slot="footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="adduser">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 修改用户信息 -->
            <el-dialog
            title="修改用户信息"
            :visible.sync="editDialogVisible"
            width="30%"
            @close="editDialog">
                <!-- 主体内容 -->
                <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="editForm.username" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="editForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                        <el-input v-model="editForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部内容 -->
                <span slot="footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editUserInfo">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 分配角色 -->
            <el-dialog
            title="分配角色"
            :visible.sync="allotUserDialogVisible"
            width="40%">
            <div class="user_tit">
                <p>当前的用户:&nbsp;{{userInfo.username}}</p>
                <p>当前的角色:&nbsp;{{userInfo.role_name}}</p>
                <p>分配新角色:
                    <el-select v-model="setNewUserId" placeholder="请选择新角色">
                        <el-option
                        v-for="item in allUserList"
                        :key="item.id"
                        :label="item.roleName"
                        :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="allotUserDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleName">确 定</el-button>
            </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        // 自定义邮箱验证
        let cheakEmail = (rule, value, call) => {
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

            if(regEmail.test(value)){
                // 合法的邮箱
                return call()
            }
            // 不合法的邮箱
            call(new Error('请输入合法的邮箱地址！'))
        };

        // 自定义手机验证
        let cheakMobile = (rule, value, call) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

            if(regMobile.test(value)){
                // 合法的电话号
                return call()
            }
            // 不合法的手机号
            call(new Error('请输入合法的手机号！'))
        };
        return {
            //需要提交的数据   
            queryInfo:{
                query: '',
                //当前页  
                pagenum: 1,
                //一页的条数   
                pagesize: 5,
            },
            //存放获取到的用户数据   
            usersList: [],
            //总数   
            total: 0,
            // 控制添加用户的显示与隐藏
            addDialogVisible: false,
            // 存储添加用户的表单
            addForm:{
                username: '',
                password: '',
                email: '',
                mobile: '',
            },
            // 添加用户表单的验证规则
            addFormRules:{
                username: [
                    { required: true, message: '请输入用户名！', trigger: 'blur' },
                    { min: 3, max: 8, message: '用户名长度在 3 到 8 个字符之间', trigger: 'blur' }
                          ],
                password: [
                    {required: true, message: '请输入密码！', trigger: 'blur'},
                    { min: 6, max: 15, message: '密码长度在 6 到 15 个字符之间', trigger: 'blur' }
                ],
                email: [
                    {required: true, message: '请输入邮箱地址！', trigger: 'blur'},
                    {validator: cheakEmail, trigger: 'blur'}
                ],
                mobile: [
                    {required: true, message: '请输入手机号！', trigger: 'blur'},
                    {validator: cheakMobile, trigger: 'blur'}
                ],

            },
            // 控制修改用户信息的显示与隐藏
            editDialogVisible: false,
            // 存储修改用户信息的表单
            editForm:[],
            // 修改用户信息表单的验证规则
            editFormRules:{
                email: [
                    {required: true, message: '请输入邮箱地址！', trigger: 'blur'},
                    {validator: cheakEmail, trigger: 'blur'}
                ],
                mobile: [
                    {required: true, message: '请输入手机号！', trigger: 'blur'},
                    {validator: cheakMobile, trigger: 'blur'}
                ],
            },
            // 控制分配角色的显示与隐藏
            allotUserDialogVisible: false,
            // 保存当前用户信息
            userInfo: {},
            // 分配新角色绑定的对象 -- 已选中的角色id
            setNewUserId: '',
            // 存放获取到的角色列表
            allUserList: [],
        }
    },
    created() {
       this.getUserList();
    },
    methods: {
        // 获取所有用户列表
        async getUserList() {
          const {data : res} = await this.service.get('users', {params : this.queryInfo});
          console.log(res)
          if(res.meta.status !== 200) return this.$message({
                message: res.meta.msg,
                type: 'error',
                duration: 1500
          });
          this.usersList = res.data.users;
          this.total = res.data.total;
          this.$message({
                message: res.meta.msg,
                type: 'success',
                duration: 1500
          })
        },
        // 一页几条
        handleSizeChange(Newsize) {
            this.queryInfo.pagesize = Newsize;
            this.getUserList();
        },
        // 跳转到哪一页 --最新的页码值
        handleCurrentChange(Newnum) {
            this.queryInfo.pagenum = Newnum;
            this.getUserList();
        },
        // 监听switch的状态
        SwitchInfo(userInfo) {
            console.log(userInfo);
            this.service.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        },
        // 监听对话框关闭后，清空表单
        addDialog() {
            this.$refs.addFormRef.resetFields();
        },
        // 点击按钮，添加新用户
        adduser() {
            this.$refs.addFormRef.validate(valid => {
                if(!valid) return
                // 请求接口
                this.service.post('users', this.addForm)
                // 将对话框关闭
                this.addDialogVisible = false;
                // 重新获取数据
                this.getUserList();
            })
        },

        // 点击按钮,打开修改用户信息的对话框--根据 ID 查询用户信息
        async editUser(id) {
            const {data:res} = await this.service.get('users/' + id);
            if(res.meta.status !== 200) return this.$message.error('res.meta.msg')
            // 正确就将获取到的值赋给表单
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        // 监听修改用户信息对话框关闭后，清空表单
        editDialog() {
            this.$refs.editFormRef.resetFields();
        },
        // 点击按钮,修改用户信息
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                if(!valid) return
                // 请求接口
                const {data:res} = await this.service.put('users/' + this.editForm.id, 
                {email:this.editForm.email,
                 mobile:this.editForm.mobile})

                if(res.meta.status !== 200) return this.$message.error(res.meta.msg)

                // 将对话框关闭
                this.editDialogVisible = false;
                // 刷新数据列表
                this.getUserList();
                // 提示修改成功
                this.$message.success(res.meta.msg)
            })
        },
        // 点击按钮，删除当前用户信息 --- 通过ID进行删除
        async deleteUser(id) {
            // console.log(id);
            // 为防止用户误操作，在删除前进行提示
            const confirmData = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch( err => {
                return err
            })
            // 如果用户确认删除，返回字符串confirm, 如果用户取消删除，返回字符串cancel
            if(confirmData !== 'confirm') return this.$message.error("已取消删除");
            // 调用接口，删除用户
            const {data : res} = await this.service.delete('users/' + id);
            if(res.meta.status !== 200) return;
            this.$message.success("已删除用户");
            // 删除以后再重新获取列表数据
            this.getUserList();
        },
        // 分配角色按钮
        async setAllotDialog(userInfo) {
            // 将当前的用户信息保存下来
            this.userInfo = userInfo;
            // 获取到角色列表
            const {data:res} = await this.service.get('roles');
            if(res.meta.status !== 200) return;
            // 正确就将其存放到allUserList数组中
            this.allUserList = res.data;

            // 打开分配角色弹窗
            this.allotUserDialogVisible = true;
        },
        // 点击按钮,分配新角色
        async saveRoleName() {
            // 判断用户有没有选择新角色
            if(!this.setNewUserId) return this.$message.error("请选择新用户!");
            const {data:res} = await this.service.put(`users/${this.userInfo.id}/role`, 
            {rid : this.setNewUserId});
            if(res.meta.status !== 200) return this.$message.error("分配新角色失败！");
            this.getUserList();
            // 关闭前清空新获取的id,便于下次使用
            this.setNewUserId = '';
            this.allotUserDialogVisible = false;
        },
    },
}
</script>

<style lang="scss" scoped>
   .users{
       .el-table{
           margin-top: 20px;
       }
       .el-pagination{
           margin-top: 20px;
           text-align: center;
       }
       .user_tit{
           p{
               padding-bottom: 20px;
           }
       }
   }
</style>