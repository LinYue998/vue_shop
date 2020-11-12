<template>
    <div class="rights">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 权限列表表格 -->
            <el-table border :data = "rightList" stripe height="750px">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="权限名称" prop="authName"></el-table-column>
                <el-table-column label="路径" prop="path"></el-table-column>
                <el-table-column label="权限等级" prop="level">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
                        <el-tag type="warning" v-else>三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 用于存放获取到的用户权限数据
            rightList: [],
        }
    },
    created() {
        this.getRightsData();
    },
    methods: {
        async getRightsData() {
            // 请求接口，获取数据
            const {data:res} = await this.service.get('rights/list')
            if(res.meta.status !== 200) return this.$message.error('获取用户权限数据失败！');

            // 获取成功,弹出提示，并将其存放在rightData里面
            this.rightList = res.data;
        },
    },
}
</script>

<style lang="scss" scoped>
    
</style>