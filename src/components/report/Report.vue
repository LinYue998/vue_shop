<template>
    <div class="report">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
            <div id="main" style="width: 800px;height:500px;"></div>
        </el-card>
    </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
    data() {
        return {
            options: {
                title: {
                text: '用户来源'
                },
                tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                    backgroundColor: '#E9EEF3'
                    }
                }
                },
                grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
                },
                xAxis: [
                {
                    boundaryGap: false
                }
                ],
                yAxis: [
                {
                    type: 'value'
                }
                ]
            }
        }
    },
    created() {},
    async mounted() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));

        // 请求接口
        const {data:res} = await this.service.get('reports/type/1')
        if(res.meta.status !== 200){
            return this.$message.error("获取数据失败!")
        }

        // 指定图表的配置项和数据 -- 将获取的数据与options的选项进行合并
        const result = _.merge(res.data, this.options)

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(result);
    },
    methods: {},
}
</script>

<style lang="scss">
    
</style>