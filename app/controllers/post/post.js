'use strict';

var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),                       // 文章数据模型
    PostComment = mongoose.model('PostComment'),         // 文章评论模型
    PostCategory = mongoose.model('PostCategory'),       // 文章分类模型
    _ = require('underscore'),                             // 该模块用来对变化字段进行更新
    fs = require('fs'),                                    // 读写文件模块
    path = require('path');                                // 路径模块

/* 详细页面控制器 */
exports.detail = function(req,res) {
  var _id = req.params.id;
  // 文章用户访问统计，每次访问文章详情页，PV增加1
  Post.update({_id:_id},{$inc:{pv:1}},function(err) {
    if(err){
      console.log(err);
    }
  });
  // PostComment存储到数据库中的_id值与相应的Post _id值相同
  Post.findById(_id,function(err,post) {
    // 查找该_id值所对应的评论信息   
    PostComment
      .find({post:_id})
      .populate('postCategory','name')
      .populate('from','name')
      .populate('reply.from reply.to','name')              // 查找评论人和回复人的名字
      .exec(function(err,comments) {
        res.render('post/post_detail', {
          title:'文章详情页',
          logo:'post',
          post:post,
          comments:comments
        });
      });
  });
    
};

/* 后台录入控制器 */
exports.new = function(req,res) {
  PostCategory.find({},function(err,postCategories) {
    if (err) {
      console.log(err);
    }
    res.render('post/post_admin', {
      title:'文章后台录入页',
      logo:'post',
      postCategories:postCategories,
      post:{}
    });
  });
};

/* 存储海报控制器 */
exports.savePoster = function(req, res, next) {
  var imageData = req.files.uploadPostImage,                 // 上传文件
      filePath = imageData.path,                              // 文件路径
      originalFilename = imageData.originalFilename;          // 原始名字

  if(originalFilename) {
    fs.readFile(filePath, function(err,data) {
      if(err) {
        console.log(err);
      }
      var timestamp = Date.now(),                             // 获取时间
          type = imageData.type.split('/')[1],                // 获取图片类型 如jpg png
          image = timestamp + '.' + type,                     // 上传海报新名字
          // 将新创建的海报图片存储到/public/upload 文件夹下
          newPath = path.join(__dirname,'../../../','/public/upload/post/' + image);

      // 写入文件
      fs.writeFile(newPath,data,function(err) {
        if(err){
          console.log(err);
        }
        req.image = image;
        next();
      });
    });
  }else {
    // 没有自定义上传海报
    next();
  }
};

/* 后台录入控制器 */
exports.save = function(req,res) {
  var id = req.body.post._id,                        // 如果是更新文章则获取到该文章ID值
      postObj = req.body.post,                      // 获取文章新建表单发送的数据
      postCategoryId = postObj.postCategory,       // 获取文章所属分类ID值
      postCategoryName = postObj.postCategoryName; // 获取文章所属分类名称
  // 如果有自定义上传海报  将postObj中的海报地址改成自定义上传海报的地址
  if(req.image){
    postObj.image = req.image;
  }
  /*if(req.contents){
    postObj.contents =  htmlspecialchars(req.contents);
  }*/
  // 如果id值存在，则说明是对已存在的数据进行更新
  if(id) {
    Post.findById(id,function(err,_post) {
      if(err) {
        console.log(err);
      }
      // 如果输入后文章分类与原文章分类不同，则说明更新了文章分类
      if (postObj.postCategory.toString() !== _post.postCategory.toString()) {
        // 找到文章对应的原文章分类
        PostCategory.findById(_post.postCategory,function(err,_oldCat) {
          if (err) {
            console.log(err);
          }
          // 在原文章分类的posts属性中找到该文章的id值并将其删除
          var index = _oldCat.posts.indexOf(id);
          _oldCat.posts.splice(index,1);
          _oldCat.save(function(err) {
            if (err) {
              console.log(err);
            }
          });
        });
        // 找到文章对应的新文章分类
        PostCategory.findById(postObj.postCategory,function(err,_newCat) {
          if (err) {
            console.log(err);
          }
          // 将其id值添加到posts属性中并保存
          _newCat.posts.push(id);
          _newCat.save(function(err) {
            if (err) {
              console.log(err);
            }
          });
        });
      }
      // 使用underscore模块的extend函数更新文章变化的属性
      _post = _.extend(_post,postObj);
      _post.save(function(err,_post) {
        if(err){
          console.log(err);
        }
        res.redirect('/post/' + _post._id);
      });
    });
  // 如果表单中填写了文章名称 则查找该文章名称是否已存在
  }else if(postObj.title) {
    Post.findOne({title:postObj.title},function(err,_post) {
      if (err) {
        console.log(err);
      }
      if (_post) {
        console.log('文章已存在');
        res.redirect('/admin/post/list');
      }else {
        // 创建一个文章新数据
        var newPost = new Post(postObj);
        newPost.save(function(err,_newPost) {
          if(err){
            console.log(err);
          }
          // 选择了文章所属的文章分类
          if(postCategoryId) {
            PostCategory.findById(postCategoryId,function(err,_postCategory) {
              if(err){
                console.log(err);
              }
              _postCategory.posts.push(_newPost._id);
              _postCategory.save(function(err) {
                if(err){
                  console.log(err);
                }
                res.redirect('/post/' + _newPost._id);
              });
            });
          // 输入新的文章分类
          }else if(postCategoryName) {
            // 查找文章分类是否已存在
            PostCategory.findOne({name:postCategoryName}, function(err, _postCategoryName) {
              if(err) {
                console.log(err);
              }
              if(_postCategoryName) {
                console.log('文章分类已存在');
                res.redirect('/admin/post/postCategory/list');
              }else {
                //创建新的文章分类
                var postCategory = new PostCategory({
                  name:postCategoryName,
                  posts:[_newPost._id]
                });
                // 保存新创建的文章分类
                postCategory.save(function(err,postCategory) {
                  if (err) {
                    console.log(err);
                  }
                  // 将新创建的文章保存，postCategory的ID值为对应的分类ID值
                  // 这样可通过populate方法进行相应值的索引
                  _newPost.postCategory = postCategory._id;
                  _newPost.save(function(err,post) {
                    if (err) {
                      console.log(err);
                    }
                    res.redirect('/post/' + post._id);
                  });
                });
              }
            });
          }else {
            res.redirect('/admin/post/list');
          }
        });
      }
    });
  // 没有输入文章名称 而只输入了文章分类名称
  }else if(postCategoryName) {
    // 查找文章分类是否已存在
    PostCategory.findOne({name:postCategoryName}, function(err, _postCategoryName) {
      if(err) {
        console.log(err);
      }
      if(_postCategoryName) {
        console.log('文章分类已存在');
        res.redirect('/admin/post/postCategory/list');
      }else {
        // 创建新的文章分类
        var postCategory = new PostCategory({
          name:postCategoryName
        });
        // 保存新创建的文章分类
        postCategory.save(function(err) {
          if (err) {
            console.log(err);
          }
          res.redirect('/admin/post/postCategory/list');
        });
      }
    });
  // 没有输入文章名称或分类则重定向到该页
  }else {
    console.log('需要输入文章分类或音乐名称');
    res.redirect('/admin/post/new');
  }
};

/* 更新文章控制器 */
exports.update = function(req,res) {
  var _id = req.params.id;

  Post.findById(_id,function(err,post) {
    PostCategory.find({},function(err,postCategories) {
      if(err){
        console.log(err);
      }
      res.render('post/post_admin',{
        title:'文章后台更新页',
        logo:'post',
        post:post,
        postCategories:postCategories
      });
    });
  });
};

/* 文章列表控制器 */
exports.list = function(req,res)  {
  var page = parseInt(req.query.p, 10) || 0, // 获取页面
      count = 20,
      index = page * count;                  // 每页展示20条数据
  Post.find({})
    .populate('postCategory','name')
    .exec(function(err,posts){
      if(err){
        console.log(err);
      }
      var results = posts.slice(index, index + count); // 分类页面每页显示的电影数量
      res.render('post/post_list',{
        title:'文章列表页',
        logo:'post',
        currentPage:(page + 1),                        // 当前页
        totalPage:Math.ceil(posts.length / count),     // 总页数，需向上取整
        posts:results
      });
    });
};

/* 音乐列表删除音乐控制器 */
exports.del = function(req,res) {
  // 获取客户端Ajax发送的URL值中的id值
  var id = req.query.id;
  // 如果id存在则服务器中将该条数据删除并返回删除成功的json数据
  if(id) {
    Post.findById(id, function(err,post) {        // 查找该条音乐信息
      if(err) {
        console.log(err);
      }
      // 查找包含这条音乐的音乐分类
      PostCategory.findById(post.postCategory, function(err, postCategory) {
        if(err) {
          console.log(err);
        }
        // 在音乐分类musics数组中查找该值所在位置
        if(postCategory) {
          var index = postCategory.posts.indexOf(id);
          postCategory.posts.splice(index,1);          // 从分类中删除该数据
          postCategory.save(function(err) {             // 对变化的音乐分类数据进行保存
            if(err) {
              console.log(err);
            }
          });
        }
        Post.remove({_id:id}, function(err) {    			 // 音乐模型中删除该电影数据
          if(err) {
            console.log(err);
          }
          res.json({success:1});                  			 // 返回删除成功的json数据给游览器
        });
      });
    });
  }
};
