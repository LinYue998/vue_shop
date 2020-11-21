<template>
    <div class="add">
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 提示信息 -->
            <el-alert
                title="添加商品信息"
                type="info"
                center
                show-icon
                :closable='false'>
            </el-alert>
            <!-- 步骤条 -->
            <el-steps :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- tabs标签 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px" class="demo-ruleForm">
                <el-tabs v-model="activeIndex" :tab-position="'left'" style="height: 300px;" :before-leave="beforeCateLeave"
                @tab-click="tabCateClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name" style="width: 500px;"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number" :min="0" style="width: 200px;"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number" :min="0" style="width: 200px;"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number" :min="0" style="width: 200px;"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                            v-model="addForm.goods_cat"
                            :options="cateList"
                            :props="cateProps"
                            @change="handleCateChange"
                            style="width: 280px;"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 通过循环，将标签显示出来 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyCateList" :key="item.attr_id">
                            <!-- 渲染出复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="item1"  v-for="(item1, i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <!-- 通过循环，将标签显示出来 -->
                        <el-form-item :label="item.attr_name" v-for="item in onlyCateList" :key="item.attr_id">
                            <!-- 循环出每一个输入框 -->
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action为上传图片的路径 -->
                        <el-upload
                        :action="actionURL"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :on-success="handleSuccess"
                        list-type="picture"
                        :headers="headerObj">
                        <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="goodsBtn" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>    
        </el-card>
        <!-- 图片预览 -->
        <el-dialog
        title="图片预览"
        :visible.sync="imgdialogVisible"
        width="50%">
            <img :src="previewPath" alt="" class="imgWidth">
        </el-dialog>
    </div>
</template>

<script>

import _ from 'lodash';
export default {
    data() {
        return {
            // 将步骤条与tabs标签绑定
            activeIndex: '0',
            // 表单绑定的对象
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                // 商品分类所属的id
                goods_cat: [],
                // 图片上传的数组
                pics: [],
                // 商品介绍
                goods_introduce: '',
                // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
                attrs: [],
            },
            // 表单的校验规则
            addFormRules: {
                goods_name: [
                    {required: true, message: '请输入商品名称', trigger: 'blur'}
                ],
                goods_price: [
                    {required: true, message: '请输入商品价格', trigger: 'blur'}
                ],
                goods_weight: [
                    {required: true, message: '请输入商品重量', trigger: 'blur'}
                ],
                goods_number: [
                    {required: true, message: '请输入商品数量', trigger: 'blur'}
                ],
                goods_cat: [
                    {required: true, message: '请选择商品分类', trigger: 'blur'}
                ]
            },
            // 获取到的商品分类数据
            cateList: [],
            cateProps:{
                expandTrigger: 'hover',
                label: 'cat_name',
                value: 'cat_id',
                children: 'children',
            },
            // 获取到的动态参数列表
            manyCateList: [],
            // 获取到的静态属性列表
            onlyCateList: [],
            // 图片上传的路径
            actionURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传组件的headers请求头
            headerObj: {
                Authorization:window.sessionStorage.getItem('token')
            },
            // 图片预览时
            previewPath: '',
            // 控制图片预览的显示与隐藏
            imgdialogVisible: false,
        }
    },
    created() {
        this.getCateList();
    },
    methods: {
        async getCateList() {
            const {data:res} = await this.service.get('categories');
            if(res.meta.status !== 200) return this.$message.error('获取商品分类数据失败!')
            this.cateList = res.data;
        },
        // 当级联选择器的值发生变化的时候，调用该函数
        handleCateChange() {
            console.log(this.addForm.goods_cat);
            if(this.addForm.goods_cat.length !== 3){
                this.addForm.goods_cat = [];
            }
        },
        // 阻止标签页的切换
        beforeCateLeave(activeName, oldActiveName) {
            // console.log("即将离开的页面为" + oldActiveName);
            // console.log("即将进入的页面为" + activeName);
            if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
                this.$message.error("请先选择商品分类!");
                return false;
            }
        },
        // tab标签页选中的事件
        async tabCateClicked() {
            // 如果标签页的name为1，证明选择的是动态参数
            if(this.activeIndex === '1'){
                const {data:res} = await this.service.get(`categories/${this.isCateId}/attributes`,
                { params : {sel:'many'}});
                console.log(res.data);
                if(res.meta.status !== 200) return this.$message.error("获取动态参数列表失败!");
                // 循环参数下的每一项
                res.data.forEach( item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
            });
                this.manyCateList = res.data;
            } else if(this.activeIndex === '2') {
                const {data:res} = await this.service.get(`categories/${this.isCateId}/attributes`,
                { params : {sel:'only'}});
                console.log(res.data);
                if(res.meta.status !== 200) return this.$message.error("获取动态参数列表失败!");
                console.log(res.data);
                this.onlyCateList = res.data;
            }
        },
        // 处理图片预览的函数
        handlePreview(file) {
            console.log(file);
            // 图片预览不用临时路径
            this.previewPath = file.response.data.url;
            this.imgdialogVisible = true;
        },
        // 处理移除图片的函数
        handleRemove(file) {
            console.log(file);
            // 获取将要删除的图片的临时路径
            const picInfo = file.response.data.tmp_path;
            // 从pics数组中，找到这个图片对应的索引值
            const i = this.addForm.pics.findIndex( x => {
                x.pic === picInfo;
            });
            // 调用数组的splice方法，把图片信息对象，从pics数组中移除
            this.addForm.pics.splice(i, 1);
            console.log(this.addForm.pics);
        },
        // 图片上传成功的函数
        handleSuccess(response) {
            console.log(response);
            // 通过拼接得到一个图片信息对象
            const picInfo = {pic:response.data.tmp_path};
            // 将这个对象push到pics数组中去
            this.addForm.pics.push(picInfo);
            console.log(this.addForm);
        },
        // 添加商品
        addGoods() {
            // 添加前先进行表单预验证
            this.$refs.addFormRef.validate(async valid => {
                if(!valid){
                    return this.$message.error("请填写必要的表单项!");
                }
                // 进行后续的逻辑操作
                // 处理请求参数goods_cat -- 级联选择器是绑定到数组的，传输参数不是数组，因此进行深拷贝
                const form = _.cloneDeep(this.addForm);
                form.goods_cat = form.goods_cat.join(',');
                console.log(form);
                // 处理动态参数
                this.manyCateList.forEach( item => {
                    const arrInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    };
                    this.addForm.attrs.push(arrInfo);
                });
                console.log(this.addForm.attrs);
                // 处理静态属性
                this.onlyCateList.forEach( item => {
                    const arrInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    };
                    this.addForm.attrs.push(arrInfo);
                });
                // 请求接口，添加商品
                const {data:res} = await this.service.post('goods', form);
                if(res.meta.status !== 201){
                    return this.$message.error("添加商品失败!")
                }
                // 成功就通过编程式导航跳转到商品列表
                this.$router.push("/home/goods");
                console.log(this.addForm);
            })
        },
    },
    computed: {
        isCateId() {
            if(this.addForm.goods_cat.length === 3){
                return this.addForm.goods_cat[2];
            }
            return null;
        },
    },
}
</script>

<style lang="scss">
    .add{
        .el-card{
            .el-steps{
                margin: 20px 0;
            }
            .el-checkbox{
                margin: 0 15px 0 0 !important;
            }
        }
        .imgWidth{
            width: 100%;
        }
        .goodsBtn{
            margin-top: 20px;
        }
        input[type=number] {  
            -moz-appearance:textfield;  
        }  
        input[type=number]::-webkit-inner-spin-button,  
        input[type=number]::-webkit-outer-spin-button {  
            -webkit-appearance: none;  
            margin: 0;  
        }
    }
</style>