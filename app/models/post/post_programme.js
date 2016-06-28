'use strict';

var mongoose = require('mongoose'),
    PostProgrammeSchema = require('../../schemas/post/post_programme');

//使用mongoose的模型方法编译生成模型
var PostProgramme = mongoose.model('PostProgramme',PostProgrammeSchema);

//将模型构造函数导出
module.exports = PostProgramme;
