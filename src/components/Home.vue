<template>
        <el-container class="home_container">
            <!-- 头部 -->
            <el-header class="home_header">
                <h1>电商后台管理系统</h1>
                <el-button type="info" @click="logoff">退出</el-button>
            </el-header>
            <el-container>
                <!-- 左边导航栏 -->
                <el-aside :width = "isCollapse ? '64px' : '220px'">
                    <!-- 折叠按钮 -->
                    <button class="Collapse_btn" @click="toggle_collapse">|||</button>
                   <el-menu
                    background-color="#313743"
                    text-color="#fff"
                    active-text-color="#00b4d9"
                    :unique-opened = 'true' 
                    :collapse = 'isCollapse'
                    :collapse-transition = 'false'
                    :router = "true"
                    :default-active = "isState">
                    <!-- 一级菜单 -->
                        <el-submenu :index="item.id + ''" v-for="item in menus" :key="item.id">
                            <template slot="title">
                            <i :class="iconsObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                            </template>
                            <!-- 二级菜单 -->
                            <el-menu-item :index=" '/home/' + submenus.path" v-for="submenus in item.children" :key="submenus.id" @click="saveNawState('/home/' + submenus.path)">
                                <template slot="title">
                                    <i class="el-icon-menu"></i>
                                    <span>{{submenus.authName}}</span>
                                </template>
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>
                </el-aside>
                <!-- 内容显示区域 -->
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
</template>

<script>
export default {
    created() {
        this.getMenuList()
        // 页面刷新后,将其从sessionStorage中取出来
        this.isState = window.sessionStorage.getItem('activePath')
    },
    data() {
        return {
            // 用来装取左侧菜单的数据
            menus: [],
            // 一级菜单的图标
            iconsObj: {
                '125': 'fa fa-users',
                '103': 'fa fa-cube',
                '101': 'fa fa-shopping-bag',
                '102': 'fa fa-archive',
                '145': 'fa fa-line-chart',
            },
            // 是否折叠
            isCollapse: false,

            // 被激活的链接地址
            isState: '',
        }
    },
    methods: {
        logoff() {
            // 清除token
            window.sessionStorage.clear();
            // 跳转到登录页面
            this.$router.push('/login')
        },
        // 获取所有菜单
        async getMenuList() {
            // {data : res} 解构赋值
            const {data : res} = await this.service.get('menus')
            console.log(res);
            if(res.meta.status !== 200) return this.$message({
                message: res.meta.msg,
                type: 'error',
                duration: 1500
            });
            this.menus = res.data;
            // console.log(this.menus)
            this.$message({
                message: res.meta.msg,
                type: 'success',
                duration: 1500
            })
        },

        // 点击按钮，左侧菜单进行折叠或展开
        toggle_collapse() {
            this.isCollapse = !this.isCollapse;
        },

        // 保存链接的激活状态
        saveNawState(activePath) {
            window.sessionStorage.setItem('activePath', activePath);
            this.isState = activePath;
        }
    }
}
</script>

<style lang="scss" scoped>
    .home_container{
        height: 100vh;
        .el-header{
            background: #363d40;
            display: -webkit-flex;
            display: flex;
            // 主轴对齐方式
            justify-content: space-between;
            // 交叉轴对齐方式
            align-items: center;
            color: #fff;
            font-size: 24px;
        }
        .el-aside{
            background: #2d353f;
            .Collapse_btn{
                width: 100%;
                height: 25px;
                font-size: 18px;
                background: #615f5f;
                border: none;
                // 点击时的的边框
                outline: none;
                color: #fff;
                cursor: pointer;
            }
            .el-menu{
                border-right: 0;
                .el-submenu i{
                margin-right: 10px;
            }
            }
        }
        .le-main{
            background: #e9edf1;
        }
    }
</style>