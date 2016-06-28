'use strict';

$(function() {
  //列表页分页
  var currentPage = parseInt($('#page').attr('data-currentPage')),
      totalPage = parseInt($('#page').attr('data-totalPage'));
  // 生成页码函数
  page({
    id: '#page',
    currentPage: currentPage,
    totalPage: totalPage,
    search: '/admin/post/list?'+'&p='
  });
});
