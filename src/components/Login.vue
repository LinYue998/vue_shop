<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="login_tx">
                <img src="../assets/images/tx.png" alt="">
            </div>
            <!-- 登录区域 -->
            <el-form :model="LoginForm" :rules="LoginRules" ref="LoginRef" label-width="0" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input
                    prefix-icon="el-icon-user-solid"
                    v-model="LoginForm.username"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input
                    type="password"
                    prefix-icon="el-icon-lock"
                    v-model="LoginForm.password"></el-input>
                </el-form-item>
                <el-form-item class="form_btn">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="LoginReset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            // 登录表单的数据绑定
            LoginForm: {
                username:'admin',
                password:'123456',
            },
            // 表单的验证规则
            LoginRules: {
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur'},
                    { min: 3, max: 5, message: '用户名长度在 3 到 8 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur'},
                    { min: 6, max: 12, message: '密码长度在 6 到 12 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        // 点击重置按钮，重置表单内容
        LoginReset(){
            // console.log(this);
            this.$refs.LoginRef.resetFields();
        },
        // 点击登录按钮，进行预验证
        login(){
            this.$refs.LoginRef.validate( async valid => {
                if(!valid) return;
                let {data : res} = await this.service.post("login", this.LoginForm);
                // console.log(res);
                if(res.meta.status !== 200) return this.$message({
                    message: res.meta.msg,
                    type: 'error',
                    duration: 1500
                });
                this.$message({
                    message: res.meta.msg,
                    type: 'success',
                    duration: 1500
                });
                // token令牌,将其存放在页面,关闭页面后清空,用于后面的守卫判断
                // 登录之外的接口，必须在登录后才能进行访问
                // console.log(res.data);
                window.sessionStorage.setItem("token", res.data.token)
                // 存储好token以后,跳转到Home页面！
                this.$router.push('/home')
            });
        }
    }
};
</script>

<style lang="scss" scoped>
    .login_container{
        height: 100vh;
        background: url('../assets/images/bg.png') center;
        .login_box{
            width: 450px;
            height: 300px;
            background: #ffffff;
            border-radius: 5px;
            // 居中显示
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
            .login_tx{
                width: 130px;
                height: 130px;
                border: 1px solid #eee;
                border-radius: 50%;
                padding: 10px;
                box-shadow: 0 0 10px #ddd;
                position: absolute;
                left: 50%;
                transform: translate(-50%,-50%);
                background: #ffffff;
                img{
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    user-select: none;
                }
            }
            .login_form{
                position: absolute;
                bottom: 0;
                width: 100%;
                padding: 0 30px;
                box-sizing: border-box;
                .form_btn{
                display: flex;
                justify-content: flex-end;
            }
            }
        }
    }
</style>