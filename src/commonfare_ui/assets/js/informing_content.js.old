
var handleContent = function ($, block) {

  if(!block.size()) return;
  if(block.is(".processed")) return;
  block.addClass("processed");

  var termItem = block.find(".views-row")

  if(termItem.size() <= 1) return;

  var getNextIdx = function(dir, curr_idx) {

    if (curr_idx === undefined) {
      curr_idx = termItem.index(termItem.filter(':visible').eq(0));
    }

    var idx = curr_idx + dir

    if(idx == termItem.size())
      idx = 0;
    if(idx == -1)
      idx = termItem.size() - 1;

    return idx
  }

  termItem.hide().eq(0).show()

  termItem.find('.title a').on('click', false)
  termItem.on("click", function(ev) {
    document.location = $(this).find('.title a').attr('href')
    return false
  })

  termItem.hammer({
    dragLockToAxis: true,
    dragBlockHorizontal: true
  }).bind("swipeleft swiperight", function (ev) {

    var dir = ev.type == "swipeleft" ? 1 : -1;

    var curr_idx = termItem.index($(ev.target));
    var idx = getNextIdx(dir, curr_idx)

    var curr = termItem.eq(curr_idx)
    var next = termItem.eq(idx)

    next.show()
    curr.css({
      position: "absolute"
    }).animate({
      left: dir === 1 ? -100 : 100,
      opacity: 0
    }, 200, function () {

      curr.hide().css({
        position: "inherit",
        left: 0,
        right: 0,
        opacity: 1
      });

    })


    return true;
  });

}

var setTitle = function($, title) {

  var c = $('#mobile-title')
  if (c.size()) {
    c.empty()
    c.append(title)
    return
  }

  c = $("<div id='mobile-title'></div>")
  c.append(title)
  $(".region-header").append(c)

};

var setContentHeight = function($) {
  var ww = $(".welfare-wrapper")
  ww.height(window.informing.getContentHeight() - 120)
}

//entry point for informing
Drupal.behaviors.informing_content_list = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $("#block-commonfare-content .welfare-info");

      if(!block.size()) return

      if(!isMobile()) {

        var termItem = block.find(".views-row")
        termItem.find('.title a').on('click', false)
        termItem.on("click", function(ev) {
          document.location = $(this).find('.title a').attr('href')
          return false
        })

        // align blocks height
        var maxh = 0
        var w = block.find('.welfare-wrapper')
        w.each(function() {
          var _h = $(this).height()
          maxh = _h > maxh ? _h : maxh
        })

        w.height(maxh)

        return
      }

      if(block.is(".processed-c")) return
      block.addClass("processed-c")

      handleContent($, block)

      var title = $("#page-title h1").text()
      setTitle($, title)

      setContentHeight($)

    })
  }
};

Drupal.behaviors.informing_content_node = {
  attach: function (context, settings) {
    jQuery(function ($) {

      if(!isMobile()) return;

      var block = $("body.page-node-type-welfare-organization");

      if(!block.size()) return
      if(block.is(".processed-nn")) return
      block.addClass("processed-nn")

      var title = $(".field--name-field-tags .field__item a").text()
      var term = $('.taxonomy-term');
      if (term.size()) {
        var tid = term.attr('id').split('-')[2]
        var link = informing.getLink(tid);
        title = $("<a href='"+ link +"'>"+ title +"</a>")
        setTitle($, title)
      }
    })
  }
};
