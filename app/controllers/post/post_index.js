'use strict';

/* 文章首页交互 */
var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),                  // 文章数据模型
    PostCategory = mongoose.model('PostCategory'),  // 引入文章分类模型
    PostProgramme = mongoose.model('PostProgramme'), // 引入近期热门文章区域模型
    fs = require('fs'),                               // 读写文件模块
    path = require('path');                           // 路径模块

/* 文章首页 */
exports.index = function(req,res) {
  var albumName = req.query.albumName,                // 获取前端技术区分类请求名称
      kuangName = req.query.kuangName,                // 获取前端框架区分类请求名称
      hotProName = req.query.hotProName,              // 获取近期热门文章分类请求名称
      hotSongs = req.query.hotSongs;                  // 获取本周热文榜区分类请求名称
  // 如果是前端技术部分发送Ajax请求
  if(albumName) {
    PostCategory
      .findOne({name:albumName})
      .populate({
        path:'posts',
        select:'title image poster',
        options:{limit:10}                               //限制最多8条数据
      })
      .exec(function(err,postCategory) {
        if(err){
          console.log(err);
        }
        res.json({data:postCategory});
      });
  // 如果是前端框架部分发送Ajax请求
  }else if(kuangName){
    PostCategory
      .findOne({name:kuangName})
      .populate({
        path:'posts',
        select:'title image poster',
        options:{limit:10}                               //限制最多8条数据
      })
      .exec(function(err,postCategory) {
        if(err){
          console.log(err);
        }
        res.json({data:postCategory});
      });
  }else if(hotProName) {
    PostProgramme
      .findOne({name:hotProName})
      .populate({
        path:'postCategories',
        select:'name posts',
        options:{limit:6}                               //限制最多6条数据
      })
      .exec(function(err,postprogramme) {
        if(err){
          console.log(err);
        }
        // 获取后台语言php、nodejs等文章分类
        if(postprogramme) {
          var postCategories = postprogramme.postCategories, // 查找该榜单包含的文章分类 
              dataPosts = [],
              count = 0,
              len = postCategories.length; 
          for(var i = 0; i < len; i++) {
            // 查找每个分类下对应的文章
            PostCategory
              .findOne({_id:postCategories[i]._id})
              .populate({
                path:'posts',
                select:'title image',
                options:{limit:3}                               //限制最多3条数据
              })
              .exec(function(err,posts) {
                if(err){
                  console.log(err);
                }
                count++;
                dataPosts.push(posts);
                // 如果查询完毕则返回查找到的榜单和文章分类数据
                if(count === len){
                  res.json({data:dataPosts,dataPro:postprogramme});
                }
              });
          }
        }else {
          res.json({data:postprogramme});
        }
      });     // 如果是后台语言部分发送Ajax请求
  // 如果是本周单曲榜部分发送Ajax请求
  }else if(hotSongs) {
    PostCategory
      .findOne({name:hotSongs})
      .populate({
        path:'posts',
        select:'title image singer pv',
        options:{limit:10}                               //限制最多10条数据
      })
      .exec(function(err,postCategory){
        if(err){
          console.log(err);
        }
        res.json({data:postCategory});
      });
  // 没有Ajax请求，则是渲染整个文章首页
  }else{
    // 获取文章顶部轮播图文件夹中图片数量
    var newPath = path.join(__dirname,'../../../public/libs/images/post/gallery'),
        dirList = fs.readdirSync(newPath),
        fileList = [],
        reg = /^(.+)\.(jpg|bmp|gif|png)$/i;  // 通过正则匹配图片
    // 获取文章首页轮播图文件夹下图片 
    dirList.forEach(function(item) {
      if(reg.test(item)){
        fileList.push(item);
      }
    });
    // 文章分类查找
    PostCategory
      .find({})
      .populate('posts')
      .exec(function(err,postCategories){
        if(err){
          console.log(err);
        }
        // 近期热门歌单区域歌曲分类查找
        PostProgramme
          .find({})
          .populate({
            path:'postCategories',
            select:'name posts',
            options:{limit:8}                       // 限制最多8条数据
          })
          .exec(function(err,postprogrammes) {
            if(err){
              console.log(err);
            }
            res.render('post/post_index',{
              title:'文章首页',
              logo:'post',                         // 显示文章logo
              postCategories:postCategories,      // 返回查询到的全部歌曲分类
              postprogrammes:postprogrammes,      // 返回查询到的近期热门歌单数量
              fileList:fileList                     // 首页轮播图图片数量
            });
          });
      });
  }
};

/* 文章分类及文章搜索 */
exports.search = function(req,res) {
  var catId = req.query.cat || '',                  // 获取文章分类更多查询串ID
      proId = req.query.pro || '',                  // 近期热门歌单部分更多查询串ID
      q = req.query.q || '',                        // 获取搜索框提交内容
      page = req.query.p || 0,                      // 获取页面
      count = 6,
      index = page * count;                         // 每页展示6条数据
      
  page = parseInt(req.query.p, 10) || 0;
  // 如果包含catId，则是点击了相应的文章分类标题，进入results页面显示相应文章分类的文章
  if(catId) {
    // 文章分类功能
    PostCategory
      .find({_id:catId})
      .populate({
        path:'posts',
        select:'title image'
    })
    .exec(function(err, postCategories) {
      if(err) {
        console.log(err);
      }
      if(postCategories) {
        var postCategory = postCategories[0] || {},  // 查询到的文章分类
        posts = postCategory.posts || [],           // 分类中包含的文章
        results = posts.slice(index, index + count);  // 分类页面每页显示的文章数量

        res.render('post/post_results', {
          title:'文章分类列表页面',
          logo:'post',
          keyword:postCategory.name,                  // 分类名称
          currentPage:(page + 1),                      // 当前页
          query:'cat=' + catId,                        // 切换到另一页
          totalPage:Math.ceil(posts.length / count),  // 总页数，需向上取整
          posts:results                               // 查询到文章分类下所含的文章
        });
      }
    });
  // 近期热门歌单区歌单分类功能
  }else if(proId) {
    PostProgramme
      .find({_id:proId})
      .populate({
        path:'postCategories',
        select:'name posts'
    })
    .exec(function(err, postCategories) {
      if(err) {
        console.log(err);
      }
      if(postCategories) {
        // 查询近期热门歌单中每个文章分类
        var postCats = postCategories[0].postCategories || {},
            dataPosts = [],
            count = 0,
            len = postCats.length;
        for(var i = 0; i < len; i++) {
          PostCategory
            .findOne({_id:postCats[i]._id})
            .populate({
              path:'posts',
              select:'title image',
            })
            .exec(function(err,posts) {
              count ++;
              if(err) {
                console.log(err);
              }
              dataPosts.push(posts);

              if(count === len) {
                // 分类页面每页显示的文章数量
                // results = dataMusics.slice(index, index + count);
                res.render('post/post_results', {
                  title:'近期热门文章分类列表页面',
                  logo:'post',
                  keyword:postCategories[0].name,               // 分类名称
                  currentPage:(page + 1),                        // 当前页
                  query:'pro=' + proId,                          // 切换到另一页
                  totalPage:Math.ceil(dataPosts.length / count),// 总页数，需向上取整
                  postCats:dataPosts                      // 查询到文章分类下所含的文章
                });
              }
            });
        }
      }
    });
  }else {
    // 文章搜索功能
    Post
      .find({title: new RegExp(q + '.*', 'i')})     // 通过正则匹配查询文章的名称
      .exec(function(err, posts) {
        if (err) {
          console.log(err);
        }
        var results = posts.slice(index, index + count);
        res.render('post/post_results', {
          title:'文章搜索结果列表页面',
          logo:'post',
          keyword:q,
          currentPage:(page + 1),
          query:'q=' + q,
          totalPage:Math.ceil(posts.length / count),
          posts:results
        });
      });
  }
};
