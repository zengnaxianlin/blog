'use strict';

var MovieIndex = require('../app/controllers/movie/movie_index'), 	// 电影首页控制器
	User = require('../app/controllers/user/user'),	  		// 用户模块路由控制器
	Movie = require('../app/controllers/movie/movie'),   	// 电影模块路由控制器
	MovieComment = require('../app/controllers/movie/movie_comment'),// 电影评论控制器
	Category = require('../app/controllers/movie/movie_category'),// 电影分类控制器
	City = require('../app/controllers/movie/movie_city'),     // 电影院分类控制器

	// 音乐首页模块路由控制器
	MusicIndex = require('../app/controllers/music/music_index'), // 音乐首页控制器
	Music = require('../app/controllers/music/music'),  		// 音乐模块路由控制器
	// 音乐分类控制器
	MusicCategory = require('../app/controllers/music/music_category'),
	// 音乐热门榜单控制器
	Programmer = require('../app/controllers/music/music_programme'),
	MusicComment = require('../app/controllers/music/music_comment'), // 音乐评论控制器

	// 文章首页模块路由控制器
	PostIndex = require('../app/controllers/post/post_index'), 		// 文章首页控制器
	Post = require('../app/controllers/post/post'),   		// 文章模块路由控制器
	// 文章分类控制器
	PostCategory = require('../app/controllers/post/post_category'),
	// 文章热门榜单控制器
	PostProgrammer = require('../app/controllers/post/post_programme'),
	PostComment = require('../app/controllers/post/post_comment'), // 文章评论控制器

	multipart = require('connect-multiparty'),					// 处理文件上传中间件
	multipartMiddleware = multipart();


module.exports = function(app){
	// 用户登录处理
	app.use(function(req,res,next){
		app.locals.user = req.session.user; // 将session中保存的用户名存储到本地变量中
		next();
	});

	/*============== 公共路由 ==============*/
	// 用户注册路由
	app.get('/signup',User.showSignup);
	app.post('/user/signup',User.signup);
	// 用户登陆路由
	app.get('/signin',User.showSignin);
	app.get('/user/signin',User.signin);
	// 用户登出路由
	app.get('/logout',User.logout);
	// 验证码路由
	app.get('/captcha',User.captcha);
	// 用户列表路由
	app.route('/admin/user/list')
			 .get(User.signinRequired,User.adminRequired,User.list)
			 .delete(User.del);

	/*============== 电影网站路由 ==============*/
	// 电影主页路由
	app.get('/movieIndex',MovieIndex.index);

	// 首页电影搜索结果页
	app.get('/movie/results',MovieIndex.search);

	// 电影广告页
	app.get('/fullpage',MovieIndex.fullpage);

	// 电影详细页面路由
	app.route('/movie/:id')
			 .get(Movie.detail)
			 .delete(MovieComment.del);

	// User.signinRequired 用户登录控制   User.adminRequired 用户权限控制

	// 用户评论路由
	app.post('/admin/movie/movieComment',User.signinRequired,MovieComment.save);

	// 更新电影路由
	app.get('/admin/movie/update/:id',User.signinRequired,User.adminRequired,Movie.update);

	// 电影录入页路由
	app.route('/admin/movie/new')
			 .get(User.signinRequired,User.adminRequired,Movie.new)
			 .post(multipartMiddleware,User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save);

	// 电影列表路由
	app.route('/admin/movie/list')
			 .get(User.signinRequired,User.adminRequired,Movie.list)
			 .delete(Movie.del);

	// 电影分类录入页路由
	app.route('/admin/movie/movieCategory/new')
			 .get(User.signinRequired,User.adminRequired,Category.new)
			 .post(User.signinRequired,User.adminRequired,Category.save);

	// 电影分类列表页路由
	app.route('/admin/movie/movieCategory/list')
		 	 .get(User.signinRequired,User.adminRequired,Category.list)
			 .delete(Category.del);

	// 电影院搜索路由
	app.route('/admin/movie/city/new')
			 .get(User.signinRequired,User.adminRequired,City.new)
			 .post(User.signinRequired,User.adminRequired,City.save);

	// 电影院搜索路由
	app.route('/admin/movie/city/list')
			 .get(User.signinRequired,User.adminRequired,City.list)
			 .delete(City.del);

	/*============== 音乐网站路由 */	
	// 音乐主页路由
	app.get('/musicIndex',MusicIndex.index);

	// 音乐搜索结果页
	app.get('/music/results',MusicIndex.search);

	// 音乐详细页面路由
	app.route('/music/:id')
		 	 .get(Music.detail)
			 .delete(MusicComment.del);

	// 用户评论
	app.post('/admin/music/musicComment',User.signinRequired,MusicComment.save);

	// 更新音乐路由
	app.get('/admin/music/update/:id',User.signinRequired,User.adminRequired,Music.update);

	// 后台录入路由
	app.route('/admin/music/new')
		 .get(User.signinRequired,User.adminRequired,Music.new)
		 .post(multipartMiddleware,User.signinRequired, User.adminRequired, Music.savePoster, Music.save);

	// 音乐列表路由
	app.route('/admin/music/list')
			 .get(User.signinRequired,User.adminRequired,Music.list)
			 .delete(Music.del);

	// 音乐分类录入页路由
	app.route('/admin/music/musicCategory/new')
			 .get(User.signinRequired,User.adminRequired,MusicCategory.new)
			 .post(User.signinRequired,User.adminRequired,MusicCategory.save);

	// 音乐分类列表页路由
	app.get('/admin/music/musicCategory/list',User.signinRequired,User.adminRequired,MusicCategory.list);

	// 音乐分类更新路由
	app.get('/admin/music/musicCategory/update/:id',User.signinRequired,User.adminRequired,MusicCategory.update);

	// 音乐分类列表删除路由
	app.delete('/admin/music/musicCategory/list',MusicCategory.del);

	// 音乐热门榜单路由
	app.route('/admin/music/programme/list')
			 .get(User.signinRequired,User.adminRequired,Programmer.list)
			 .delete(Programmer.del);

	/*============== 文章网站路由 */	
	// 文章主页路由
	app.get('/',PostIndex.index);

	// 文章搜索结果页
	app.get('/post/results',PostIndex.search);

	// 文章详细页面路由
	app.route('/post/:id')
		 	 .get(Post.detail)
			 .delete(PostComment.del);

	// 用户评论
	app.post('/admin/post/postComment',User.signinRequired,PostComment.save);

	// 更新文章路由
	app.get('/admin/post/update/:id',User.signinRequired,User.adminRequired,Post.update);

	// 后台录入路由
	app.route('/admin/post/new')
		 .get(User.signinRequired,User.adminRequired,Post.new)
		 .post(multipartMiddleware,User.signinRequired, User.adminRequired, Post.savePoster, Post.save);


	// 文章列表路由
	app.route('/admin/post/list')
			 .get(User.signinRequired,User.adminRequired,Post.list)
			 .delete(Post.del);

	// 文章分类录入页路由
	app.route('/admin/post/postCategory/new')
			 .get(User.signinRequired,User.adminRequired,PostCategory.new)
			 .post(User.signinRequired,User.adminRequired,PostCategory.save);

	// 文章分类列表页路由
	app.get('/admin/post/postCategory/list',User.signinRequired,User.adminRequired,PostCategory.list);

	// 文章分类更新路由
	app.get('/admin/post/postCategory/update/:id',User.signinRequired,User.adminRequired,PostCategory.update);

	// 文章列表删除路由
	app.delete('/admin/post/postCategory/list',PostCategory.del);

	// 文章热门榜单路由
	app.route('/admin/post/postprogramme/list')
			 .get(User.signinRequired,User.adminRequired,PostProgrammer.list)
			 .delete(PostProgrammer.del);

};
