
var parseUrl = function(href) {
  var parser = document.createElement('a');
  parser.href = href
  return parser
}

var getQueryString = function() {
  var a= {};
  document.location.search.substr(1).split('&').map(function(e) { return e.split('=') }).map(function(e) { if(e[0])  a[e[0]] = e[1] });
  return a
}

var commonfareTranslate = function (t) {
  var t1 = Drupal.t(t)
  if(t1 === t) {
    if(drupalSettings.commonfare_ui && drupalSettings.commonfare_ui.i18n && drupalSettings.commonfare_ui.i18n[t]) {
      t1 = drupalSettings.commonfare_ui.i18n[t]
    }
  }
  return t1
}

var loadCurrentLanguage = function (fn) {
  return jQuery(function ($) {
    $.get('/lang')
      .then(function (res) {
        fn(null, JSON.parse(res).lang)
      })
      .fail(function (err) {
        fn(err)
      })
  })
}

var getSupportedLanguages = function () {
  var langsBlock = jQuery("#block-selettorelingua-2")
  return langsBlock.find("ul.links li").map(function () {
    return jQuery(this).attr('class').replace("is-active", '').replace(" ", '')
  })
}

var getSiteLanguage = function () {
  var qs = getQueryString()
  if(qs.language) {
    return qs.language
  }
  return jQuery("#block-selettorelingua-2").find("li.is-active").eq(0).attr('class').replace('is-active', '').replace(' ', '')
}

var setSelectedLanguage = function (lang) {
  localStorage.language = lang
}

var getSelectedLanguage = function () {
  if(!localStorage.language && localStorage.siteLanguage) {
    setSelectedLanguage(localStorage.siteLanguage)
  }
  // give priority to url modifier!
  var qs = getQueryString()
  if(qs.language) {
    localStorage.language = qs.language
  }
  return localStorage.language
}

var isCurrentLanguage = function (lang) {
  return lang === getSelectedLanguage()
}

Drupal.behaviors.load_lang = {
  attach: function (context, settings) {
    jQuery(function ($) {
      if(!getSelectedLanguage()) {
        loadCurrentLanguage(function (err, lang) {
          if(err) {
            return
          }
          localStorage.siteLanguage = lang
          if(getSiteLanguage() !== lang && getSelectedLanguage() !== getSiteLanguage()) {
            var path = jQuery("#block-selettorelingua-2").find("li." + lang + " a").attr('href')
            console.log("lang redirect %s", path);
            document.location = path
          }
        })
      }
    })
  }
};

// Drupal.behaviors.set_lang = {
//   attach: function (context, settings) {
//     jQuery(function ($) {
//       var lang = getSelectedLanguage()
//       if(lang !== getSiteLanguage())
//         setSelectedLanguage(getSiteLanguage());
//     })
//   }
// };

Drupal.behaviors.informing_toggle_lang = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $(".no-lang-content");
      if(!block.size()) return
      if(block.is(".processed-no-lang-content")) return
      block.addClass("processed-no-lang-content")

      block.hide().removeClass('hidden')

      var getLangCode = function (lang) {
        switch(lang) {
          case "it":
            lang = "it"
            break;
          case "ne":
            lang = "nl"
            break;
          case "hr":
            lang = "hr"
            break;
        }
        return lang
      }

      var formItem = $(".country-form form [name='field_country_value'] option:selected");
      var formLang = formItem.val()

      // console.warn("form %s", formLang);
      if(formLang === 'All' || formLang === 'nl' || getSelectedLanguage() === 'en') {
        block.hide()
        return
      }

      var cards = $('.card-content .views-field-langcode .field-content')
      if(!cards.size()) {
        block.hide()
        return
      }

      cards
        .each(function () {
          var lang = getLangCode($(this).text().toLowerCase())
          // console.warn("cotnent lang code: %s", lang);
          if(getSelectedLanguage() !== lang)
            block.show()
        })

    })
  }
}

var lastLangRequested = null
Drupal.behaviors.informing_country_form = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $(".country-form form");

      if(!block.size()) return
      if(block.is(".processed-country-form")) return
      block.addClass("processed-country-form")

      var formSelect = block.find('select')
      var countrySelector = $('.country-selector')

      // formSelect.change(function(ev) {
      //   var val = $(this).val()
      //   console.warn("Current form val: %s", val);
      // })

      var lbl = countrySelector.find('.btn .label')
      var opts = block.find('select option')

      var label = countrySelector.find('.btn .label')
      var curr = countrySelector.find('.btn .curr')

      var lang = getSelectedLanguage()

      localStorage.originalMsg = localStorage.originalMsg || label.text()
      var setLanguage = localStorage.country
      var sel = opts.filter(':selected')

      if(sel.size()) {

        var txt = sel.text()
        if(sel.val() === 'All') {

          if(lang && lang !== 'en') {
            setLanguage = lang
          } else {
            label.text(commonfareTranslate("Please select the country of your interest"))
            block.parent().find('.card-item').remove()
          }

        } else {
          label.text(commonfareTranslate(localStorage.originalMsg))
          curr.text(sel.text())
        }

      }

      opts.each(function () {
        var match = countrySelector.find('.dropdown-menu li a[href="#' + $(this).attr('value') + '"]')
        if(match.size()) {
          match.text($(this).text())
        }
      })

      countrySelector.find('.dropdown-menu li a')
        .on("click", function () {

          var lang = $(this).attr("href").substr(1)
          formSelect.val(lang)
          block.find('input[type="submit"]').trigger('click')
          localStorage.country = lang

          return false;
        })


      block.hide()
      countrySelector.removeClass('hidden')

      if(setLanguage) {
        setTimeout(function() {

          if (lastLangRequested === setLanguage)
            return

          lastLangRequested = setLanguage
          countrySelector.find('.dropdown-menu li a[href="#' + setLanguage + '"]').trigger('click')
        }, 300)
      }

    })
  }
};
Drupal.behaviors.informing_translator = {
  attach: function (context, settings) {
    jQuery(function ($) {

      $('.copyright')

      var block = $([
        ".node-navigation .next .label .label",
        ".node-navigation .prev .label .label",
        ".country-selector .btn .label",
        ".language-selector .btn .label",
        ".button_how a.btn",
        ".no-lang-content",
        ".select_country_msg > h4",
        ".copyright-text a"
      ].join(", "));
      if(!block.size()) return
      if(block.is(".processed-translator")) return
      block.addClass("processed-translator")

      block.each(function () {
        var t1 = commonfareTranslate($(this).text())
        $(this).text(t1)
      })

    })
  }
}

Drupal.behaviors.informing_desktyop_small_h = {
  attach: function (context, settings) {
    jQuery(function ($) {

      if(isMobile()) return

      var block = $(".commonfare-homepage > section");

      if($(window).height() >= 820)
        block.removeClass('small-height')
      else
        block.addClass("small-height")

    })
  }
}

Drupal.behaviors.informing_breadcrumb_rewarp = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $(".breadcrumb");
      if(!block.size()) return
      if(block.is(".processed-breadcrumb")) return
      block.addClass("processed-breadcrumb")

      var info_a = $('#main-menu li:eq(1) a')
      var tag_a = $('.block-views-blocktaxonomy-term-item-block-2 .term-item .term-name a')
      var lis = [
        '<ol>',
          '<li><a href="' + info_a.attr('href') + '">' + info_a.text() + '</a><span class="glue"> &gt; </span></li>',
          '<li><a href="' + tag_a.attr('href') + '">' + tag_a.text() + '</a></li>',
        '</ol>'
      ]

      block.find('ol,ul').hide()
      block.append(lis.join(''))

    })
  }
}

Drupal.behaviors.informing_mobile_accordion = {
  attach: function (context, settings) {
    jQuery(function ($) {

      if(!isMobile()) return

      var block = $(".path-taxonomy .card-content .card-item");
      if(!block.size()) return
      if(block.is(".processed-mobile-menu")) return
      block.addClass("processed-mobile-menu")

      block.find('h4').on("click", function () {

        if($(this).parent().next().is(':visible')) {
          document.location = block.find('h4').parent().next().next().find('a').attr('href')
        }

        var title = block.find('h4')
        title.find("i").removeClass("fa-caret-down").addClass("fa-caret-right")
        var p = title.parent().next()
        p.hide()
        p.next().hide()
        p.next().next().hide()
        p.parent().removeClass('is-open')

        title = $(this)
        title.find("i").removeClass("fa-caret-right").addClass("fa-caret-down")
        var t = title.parent()
        t.show()
        t.next().show()
        t.next().next().show()
        t.parent().addClass('is-open')

        return false
      })

    })
  }
}

Drupal.behaviors.informing_home_fit_vertical = {
  attach: function (context, settings) {
    jQuery(function ($) {

      if(isMobile()) return

      var block = $("body.path-frontpage");
      if(!block.size()) return
      if(block.is(".processed-fit-center")) return
      block.addClass("processed-fit-center")

      var h = (($(window).height() - $('.about-main-header').height()) / 2) - (block.find("#wrapper").height() / 2)
      block.find("#wrapper").css({
        'padding-top': h + 'px'
      })

    })
  }
}

Drupal.behaviors.informing_mobile_menu = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $(".mobile-menu");
      if(!block.size()) return
      if(block.is(".processed-mobile-menu")) return
      block.addClass("processed-mobile-menu")

      block.on("click", function () {
        $(".mobile-menu-item").show()
      })

      $(".mobile-menu-item .close-button").on("click", function () {
        $(".mobile-menu-item ").fadeOut()
      })


    })
  }
}

Drupal.behaviors.informing_home_scrolling = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var selector = ".commonfare-homepage"
      var block = $(selector);
      if(!block.size()) return
      if(block.is(".processed-commonfare-homepage")) return
      block.addClass("processed-commonfare-homepage")

      var alist = $(".menu-base-theme li a");
      var mm = $('.mobile-menu-item')

      alist.eq(isMobile() ? 0 : 1).parent().addClass("active")
      $('.copyright').hide()

      var scrollInstance = onePageScroll(selector, {
        sectionContainer: "section", // sectionContainer accepts any kind of selector in case you don't want to use section
        easing: "ease", // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in",
        // "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
        animationTime: 1000, // AnimationTime let you define how long each section takes to animate
        pagination: true, // You can either show or hide the pagination. Toggle true for show, false for hide.
        updateURL: false, // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
        beforeMove: function (index) {
          index *= 1

          if(mm.size() && mm.is(':visible')) {
            mm.hide()
          }

          if(index !== 1) {
            $('.about-main-header').fadeOut()
            $('.main-header').fadeIn()
          }

          if(index !== 3) {
            $('div.copyright').fadeOut()
          }

        }, // This option accepts a callback function. The function will be called before the page moves.
        afterMove: function (index) {

          index *= 1

          if(index === 1) {
            $('.about-main-header').fadeIn()
            $('.main-header').fadeOut()
          }

          if(index === 3) {
            $('div.copyright').fadeIn()
          }

          alist.parent().removeClass("active")
          var idx = 1;
          alist.eq(index - idx).parent().addClass("active")

        }, // This option accepts a callback function. The function will be called after the page moves.
        loop: false, // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
        keyboard: true, // You can activate the keyboard controls
        responsiveFallback: false, // You can fallback to normal page scroll by defining the width of the browser in which
        // you want the responsive fallback to be triggered. For example, set this to 600 and whenever
        // the browser's width is less than 600, the fallback will kick in.
        direction: "vertical" // You can now define the direction of the One Page Scroll animation. Options available are "vertical" and "horizontal". The default value is "vertical".
      });

      $('body').height($(window).height())
      // $('body').width($(window).width())

      $('body').addClass('with-onepager');

      var amheader = $('.about-main-header')
      amheader.show()
      $('.main-header').hide()

      $("#about .button_how").on('click', function () {
        // document.location = document.location.toString().substr(0, document.location.toString().indexOf("#")) + "#get-informed"
        moveDown(selector)
      })

      alist.on('click', function () {

        var idx = alist.index(this)

        alist.parent().removeClass("active")
        alist.eq(idx).parent().addClass("active")

        try {
          moveTo(selector, idx + 1)
        } catch(e) {
          console.warn(e);
        }

        return false
      })


      switch(document.location.hash) {
        case "#about":
          moveTo(selector, 1)
          break
        case "#get-informed":
          moveTo(selector, 2)
          break
        case "#participate":
          moveTo(selector, 3)
          break;
      }

    })
  }
};

Drupal.behaviors.informing_language_selector = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $(".language-selector");

      if(!block.size()) return
      if(block.is(".processed-language-selector")) return
      block.addClass("processed-language-selector")

      var langsBlock = $("#block-selettorelingua-2")
      var langsList = langsBlock.find("li")

      // load the default language
      getSelectedLanguage()

      var showCurrentLang = function (lang) {
        lang = lang || getSelectedLanguage()
        var curr = block.find('.dropdown-menu li a[href="#' + lang + '"]').eq(0).text()
        // console.warn(curr, '---', lang)
        block.find('.curr').each(function () {
          $(this).text(curr)
        })
      }

      block.find('.dropdown-menu li a').on('click', function () {
        var lang = $(this).data('lang')
        langsList.each(function () {
          if($(this).hasClass(lang)) {
            setSelectedLanguage(lang)
            showCurrentLang(lang)

            var dest = $(this).find("a").attr("href")
            var url = parseUrl(dest)
            url.search = "?language=" + lang
            dest = url.href

            // console.log("redirecting %s", dest);
            document.location = dest
          }
        })
        return false
      })

      var isCurrent = isCurrentLanguage(getSiteLanguage())
      if(localStorage.language && !isCurrent) {
        console.log("lang set %s but current differ!", localStorage.language, getSiteLanguage());
        block.find('.dropdown-menu li a[href="#' + localStorage.language + '"]').trigger('click')
      }

      showCurrentLang();

    })
  }
};

Drupal.behaviors.informing_link_cards = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $(".card-content .card-item .wrapper");

      if(!block.size()) return
      if(block.is(".processed-nn")) return
      block.addClass("processed-nn")

      block.on('click', function () {
        document.location.hash = '2'
        document.location = $(this).find(".views-field-name a").attr("href") + '?language=' + getSelectedLanguage();
        return false
      })

    })
  }
};
Drupal.behaviors.informing_node_next_prev = {
  attach: function (context, settings) {
    jQuery(function ($) {

      var block = $("#block-views-block-measure-list-by-term-block-1");

      if(!block.size()) return
      if(block.is(".processed-nnd")) return
      block.addClass("processed-nnd")

      var ilist = block.find('.item-list')
      var alist = ilist.find('ul > li a');
      var title = $('.region-page-title h1 > span').text()
      var current_path = document.location.pathname

      var nextLink = null,
        prevLink = null;
      var currentIndex = 0
      var listLength = alist.size()

      alist.each(function (i, el) {
        if($(this).attr('href') === current_path) {
          currentIndex = i
        }
      })

      var n = $('.node-navigation')
      var next = n.find('.next')
      var prev = n.find('.prev')

      if(currentIndex === 0) {
        prev.hide()
      } else {
        var aprev = alist.eq(currentIndex - 1)
        prevLink = aprev.attr("href")
        prev.find('.title').text(aprev.text())
      }

      if(currentIndex === listLength - 1) {
        next.hide()
      } else {
        var anext = alist.eq(currentIndex + 1)
        nextLink = anext.attr("href")
        next.find('.title').text(anext.text())
      }

      next.on('click', function () {
        if(nextLink === null) return false
        document.location = nextLink + '?language=' + getSelectedLanguage()
      })
      prev.on('click', function () {
        if(prevLink === null) return false
        document.location = prevLink + '?language=' + getSelectedLanguage()
      })

      block.find('.hidden').removeClass("hidden")
      ilist.hide()

    })
  }
};
