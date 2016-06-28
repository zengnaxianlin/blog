'use strict';

$.support.cors = true;                                  // 解决IE8/9 Ajax跨域请求问题

$(function() {

  

  // 获取文章列表删除按钮类名，当点击删除按钮触发删除事件
  $('.postDel').click(function(e) {
    var target = $(e.target),
        id = target.data('id'),  // 获取点击的id值
        tr = $('.item-id-' + id);

    $.ajax( {
      type : 'DELETE',
      url : '/admin/post/list?id=' + id
    })
    .done(function(result) {
      // 如果服务器返回json数据中success = 1，并且删除行存在，则将该行数据删除
      if(result.success === 1 && tr) {
        tr.remove();
      }
    });
  });

  // 获取文章热门歌单列表页删除按钮类名，当点击删除按钮触发删除事件
  $('.programmeDel').click(function(e) {
    var target = $(e.target),
        id = target.data('id'),  // 获取点击的id值
        tr = $('.item-id-' + id);

    $.ajax( {
      type: 'DELETE',
      url: '/admin/post/postprogramme/list?id=' + id
    })
    .done(function(result) {
      // 如果服务器返回json数据中success = 1，并且删除行存在，则将该行数据删除
      if(result.success === 1 && tr) {
        tr.remove();
      }
    });
  });

  // 获取文章分类列表删除按钮类名，当点击删除按钮触发删除事件
  $('.postCayDel').click(function(e) {
    var target = $(e.target),
        id = target.data('id'),  // 获取点击的id值
        tr = $('.item-id-' + id);

    $.ajax( {
      type: 'DELETE',
      url: '/admin/post/postCategory/list?id=' + id
    })
    .done(function(result) {
      // 如果服务器返回json数据中success = 1，并且删除行存在，则将该行数据删除
      if(result.success === 1 && tr) {
        tr.remove();
      }
    });
  });
});
