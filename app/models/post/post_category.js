'use strict';

var mongoose = require('mongoose'),
    PostCategorySchema = require('../../schemas/post/post_category');

//使用mongoose的模型方法编译生成模型
var PostCategory = mongoose.model('PostCategory',PostCategorySchema);

//将模型构造函数导出
module.exports = PostCategory;
