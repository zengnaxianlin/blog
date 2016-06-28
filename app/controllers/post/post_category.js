'use strict';

var mongoose = require('mongoose'),
    PostCategory = mongoose.model('PostCategory'),      // 引入音乐分类模型
    PostProgramme = mongoose.model('PostProgramme'),              // 引入近期热门歌单区域模型
    _ = require('underscore');                            // 该模块用来对变化字段进行更新

// 音乐分类后台录入页控制器
exports.new = function(req, res) {
  // 输出当前全部的音乐榜单
  PostProgramme.find({},function(err, postprogrammes) {
    res.render('post/post_category_admin', {
      title:'文章后台分类录入页',
      logo:'post',
      postprogrammes:postprogrammes,
      postCategory:{}
    });
  });
};

// 保存音乐分类控制器
exports.save = function(req, res) {
  var postCategoryObj = req.body.postCategory,      // 获取当前填写的音乐分类
      postCatId = postCategoryObj._id,              // 如果存在则是对已存在音乐分类的更新
      postCatName = postCategoryObj.name,           // 输入的分类名称
      postprogrammeId = postCategoryObj.postprogramme,       // 获取填写的音乐榜单分类ID
      postprogrammeName = postCategoryObj.postprogrammeName; // 获取榜单分类名
  // 如果musicCatId值存在，则说明是对已存在音乐分类数据进行更新
  if (postCatId) {
    // 查找原音乐分类
    PostCategory.findById(postCatId,function(err,_postCat) {
      if(err) {
        console.log(err);
      }
      // 如果输入后歌曲榜单与原歌曲榜单不同，则说明更新了音乐榜单
      if (postprogrammeId.toString() !== _postCat.postprogramme.toString()) {
        // 如果原歌曲榜单存在
        if (_postCat.postprogramme.length > 0) {
          PostProgramme.findById(_postCat.postprogramme,function(err,_oldPostProgramme) {
            if (err) {
              console.log(err);
            }
            // 在原歌曲榜单的musicCategories属性中找到该歌曲分类的musicCatId值并将其删除
            var index = _oldPostProgramme.postCategories.indexOf(postCatId);
            _oldPostProgramme.postCategories.splice(index,1);
            _oldPostProgramme.save(function(err) {
              if (err) {
                console.log(err);
              }
            });
          });
        }
        // 找到音乐分类对应的新歌曲榜单
        PostProgramme.findById(postprogrammeId,function(err,_newPostProgramme) {
          if (err) {
            console.log(err);
          }
          // 将其musicCatId值添加到musicCategories属性中并保存
          _newPostProgramme.postCategories.push(postCatId);
          _newPostProgramme.save(function(err) {
            if (err) {
              console.log(err);
            }
          });
        });
      }
      // 使用underscore模块的extend函数更新修改的音乐分类字段
      _postCat = _.extend(_postCat,postCategoryObj);
      _postCat.save(function(err) {
        if(err){
          console.log(err);
        }
        res.redirect('/admin/post/postprogramme/list');
      });
    });
  // 如果不是更新音乐分类，并且输入了音乐分类名称
  }else if(postCatName) {
    // 查找输入的音乐分类名称是否已存在
    PostCategory.findOne({name:postCatName}, function(err,_postCatName) {
      if(err) {
        console.log(err);
      }
      if (_postCatName) {
        console.log('文章分类已存在');
        res.redirect('/admin/post/postprogramme/list');
      }else {
        // 创建一个新音乐分类数据
        var postCategory = new PostCategory({
          name:postCatName
        });
        postCategory.save(function(err, _newPostCategory) {
          if (err) {
            console.log(err);
          }
          // 如果选择了热门榜单分类
          if(postprogrammeId) {
            PostProgramme.findById(postprogrammeId,function(err, postprogramme) {
              if(err) {
                console.log(err);
              }
              // 将该音乐分类添加到榜单分类的属性中
              postprogramme.postCategories.push(_newPostCategory._id);
              postprogramme.save(function(err) {
                if(err) {
                  console.log(err);
                }
                // 新建音乐分类的programme指向该榜单
                _newPostCategory.postprogramme = postprogrammeId;
                _newPostCategory.save(function(err) {
                  if(err) {
                    console.log(err);
                  }
                });
                res.redirect('/admin/post/postprogramme/list');
              });
            });
          // 输入新的音乐榜单分类
          }else if(postprogrammeName) {
            PostProgramme.findOne({name:postprogrammeName}, function(err, _postprogramme) {
              if(err) {
                console.log(err);
              }
              if(_postprogramme) {
                console.log('文章榜单分类已存在');
                res.redirect('/admin/post/postprogramme/list');
              }else {
                var newPostProgramme = new PostProgramme({
                  name:postprogrammeName,
                  postCategories:_newPostCategory._id
                });
                // 保存新创建的音乐榜单分类
                newPostProgramme.save(function(err, _newPostProgramme) {
                  if (err) {
                    console.log(err);
                  }
                  if (_newPostCategory) {
                    // 将新创建的音乐榜单保存，programme的ID值为对应的分类ID值
                    // 这样可通过populate方法进行相应值的索引
                    _newPostCategory.postprogramme = _newPostProgramme._id;
                    _newPostCategory.save(function(err) {
                      if(err) {
                        console.log(err);
                      }
                    });
                  }
                  res.redirect('/admin/post/postprogramme/list');
                });
              }
            });
          }else {
            res.redirect('/admin/post/postprogramme/list');
          }
        });
      }
    });
  // 如果只输入了榜单名称
  }else if(postprogrammeName) {
    // 查找输入的榜单名称是否已存在
    PostProgramme.findOne({name:postprogrammeName}, function(err, _postprogramme) {
      if(err) {
        console.log(err);
      }
      if(_postprogramme) {
        console.log('文章榜单分类已存在');
        res.redirect('/admin/post/postprogramme/list');
      }else {
        var newPostProgramme = new PostProgramme({
          name:postprogrammeName
        });
        // 保存新创建的音乐榜单分类
        newPostProgramme.save(function(err) {
          if (err) {
            console.log(err);
          }
          res.redirect('/admin/post/postprogramme/list');
        });
      }
    });
  // 其他操作值重定向到list页
  }else {
    res.redirect('/admin/post/postprogramme/list');
  }
};

// 音乐分类列表页控制器
exports.list = function(req, res) {
  PostCategory
    .find({})
    .populate({
      path:'posts',
      select:'title image singer version summary pv',
    })
    .exec(function(err, postCategories) {
      if(err) {
        console.log(err);
      }
      res.render('post/post_category_list', {
        title:'文章分类列表页',
        logo:'post',
        postCategories:postCategories
      });
    });
};

// 豆瓣音乐分类详细页面控制器
exports.detail = function(req) {
  var _id = req.params.id;
  // 音乐用户访问统计，每次访问音乐详情页，PV增加1
  PostCategory.update({_id:_id},{$inc:{pv:1}},function(err) {
    if(err) {
      console.log(err);
    }
  });
};

// 更新音乐分类控制器
exports.update = function(req,res) {
  var _id = req.params.id;
  PostCategory.findById(_id, function(err,postCategory) {
    PostProgramme.find({}, function(err,postprogrammes) {
      if(err) {
        console.log(err);
      }
      res.render('post/post_category_admin', {
        title:'文章后台更新页',
        logo:'post',
        postCategory:postCategory,
        postprogrammes:postprogrammes
      });
    });
  });
};

// 音乐分类列表删除音乐控制器
exports.del = function(req, res) {
  // 获取客户端Ajax发送的URL值中的id值
  var id = req.query.id;
  if(id) {
    // 如果id存在则服务器中将该条数据删除并返回删除成功的json数据
    PostCategory.remove({_id:id}, function(err) {
      if(err) {
        console.log(err);
      }
      res.json({success:1});
    });
  }
};
