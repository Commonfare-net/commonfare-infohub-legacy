


var getHeight = function() {
  var h = window.informing.getContentHeight()
  return Math.floor( h / 2)
}

// handle UI for the section groups interaction
var handleWelfareGroup = function($, block) {

  var wrappers = block.find(".views-field-nothing");

  var doTap = function (e) {

    if (e) {
      var btn = $(e.target)
      if(btn.is(".term-details") || btn.parent().is(".term-details")) {

        var tid = btn.data("tid") || btn.parent().data("tid");
        var link = window.informing.getLink(tid)

        document.location.pathname = link
        return false;
      }
    }

    var el = $(this);
    var p = el.parents(".views-field-nothing")
    var isActive = p.is(".active")

    wrappers.removeClass('active');
    if(isActive) {
      p.removeClass("active")
    } else {

      var o = $("#block-views-block-welfare-measure-sections-block-1-2").offset();
      var po = p.offset();

      p.addClass("active")
      p.height(getHeight() * 2).css({
        top: -1 * (po.top - o.top),
        left: -1 * (po.left - o.left)
      });
    }

    return false;
  }

  var termItem = block.find(".term-item a.wrapper")
  // handle swipe
  termItem.hammer({
    dragLockToAxis: true,
    dragBlockHorizontal: true
  }).bind("swipeleft swiperight", function (ev) {

    var dir = ev.type == "swipeleft" ? 1 : -1;
    var idx = termItem.index($(ev.target));

    idx = idx + dir

    if(idx == termItem.size())
      idx = 0;
    if(idx == -1)
      idx = termItem.size() - 1;

    doTap.call(termItem.eq(idx)[0])

    return true;
  });

  termItem.on("click", doTap);
};

var setHeight = function($, block) {

  var v = $('.views-field-nothing')
  if(!v.size()) return

  v.height(getHeight())

  v.find('.title').css({
    paddingTop: Math.floor(v.eq(0).height() * .45)
  })
}

//entry point for informing
Drupal.behaviors.informing_groups = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $("#block-views-block-welfare-measure-sections-block-1-2");

      if(!block.size()) return;

      if(!isMobile()) {

        block.find('.wrapper').each(function() {
          var tid = $(this).find('.term-details').data("tid");
          var link = window.informing.getLink(tid);
          $(this).prop('href', link)
        })

        return;
      }

      if(block.is(".processed")) return;
      block.addClass("processed");

      handleWelfareGroup($, block)
      setHeight($, block)

    })
  }
};
