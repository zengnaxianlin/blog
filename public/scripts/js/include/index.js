'use strict';

$(function(){
    $('.linav').hover(function() {
        $(this).children('.navbar-brand').removeClass('padding');
        $(this).children('ul').show();    
    }, function() {
      $(this).children('ul').hide();
      $(this).children('.navbar-brand').addClass('padding');
    });
    $('.navbar-header a').click(function(event) {
    $(this).addClass('active').siblings('a').removeClass('active');
  });
});