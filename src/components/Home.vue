<template>
    <div>
        <el-button type="info" @click="logoff">退出</el-button>
    </div>
</template>

<script>
export default {
    methods: {
        logoff() {
            // 清除token
            window.sessionStorage.clear();
            // 跳转到登录页面
            this.$router.push('/login')
        }
    }
}
</script>

<style lang="scss" scoped>
    
</style>