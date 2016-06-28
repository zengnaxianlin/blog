'use strict';

var mongoose = require('mongoose'),
    PostCommentSchema = require('../../schemas/post/post_comment'),
    PostComment = mongoose.model('PostComment', PostCommentSchema);

module.exports = PostComment;
