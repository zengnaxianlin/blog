'use strict';

var mongoose = require('mongoose'),
    PostSchema = require('../../schemas/post/post');

//使用mongoose的模型方法编译生成模型
var Post = mongoose.model('Post',PostSchema);

//将模型构造函数导出
module.exports = Post;
