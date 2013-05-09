/**
 * Pitchcare 360 spinner!
 *
 * Simple to use.
 * To make a spinner with the default values:
 * Create an <ul> with a unique ID, then put each image tag (in order) in it's own <li> tag
 * Then, simple add the following JS:
 * $(document).ready(function() {
 *   $('#YOUR_UL_ID').pitchcare360()
 * })
 *
 */

;(function($) {
  'use strict'
  var Pitchcare360 = function (element, options) {
    var pc360    = this,
      i          = 0,
      spinner    = $(element),
      settings   = $.extend({}, $.fn.pitchcare360.defaults, options),
      images     = spinner.children().length,
      width      = spinner.children(':first').children(':first').css('width').replace(/[^0-9]+/g, '') ||
        settings.defaultWidth,
      height     = spinner.children(':first').children(':first').css('height').replace(/[^0-9]+/g, '') ||
        settings.defaultHeight,
      totalWidth = parseInt((width.replace(/[^0-9]+/, '') * images) + 10, 10),
      loops      = 0,
      inLoop     = false,
      wasLooping = false,
      isDragging = false,
      spinLoop,
      wrapperContent,
      wrapperContainer
    // Begin pc360 functions
    pc360.init = function () {
      // Make sure we're invisible until loaded
      spinner.css({
        'list-style': 'none',
        'margin':     0,
        'padding':    0
      }).fadeIn(500)
      spinner.children().each(function () {
        $(this).attr('id', spinner.attr('id') + '-pc360-image-' + i)
        $(this).css({
          'float':  'left',
          'margin':  0,
          'padding': 0
        })
        if (settings.startImage > 0 && i <= settings.startImage) {
          $(this).css({
            'display': 'none'
          })
        }
        i++
      })
      if (settings.startImage > 0) {
        i = settings.startImage
      }
      // Wrap the <ul> in some container divs for styling
      spinner.wrap(
        '<div class="pc360-container"><div class="pc360-content" /></div>'
      )
      // Get the wrappers, so each instance has it's own
      wrapperContainer = spinner.parent().closest('div.pc360-container')
      wrapperContent = spinner.parent().closest('div.pc360-content')
      // Append a zoom button to the spinners parent (which should be a <span id="main-image" />)
      if (settings.enableZoom) {
        wrapperContainer.parent().append(
          'Click and drag to rotate<br>' +
          '<a class="pc360-zoom" href="#"><img src="' + settings.zoomImage + '"></a>'
        )
        // Now some mouse events for the zoom zoom button!
        $('.pc360-zoom').on({
          'click': function () {
            pc360.zoom()
            return false
          }
        })
        // That whacky IE puts a border on our lovely zoom image :(
        $('.pc360-zoom img').css({
          'border': 0
        })
      }
      wrapperContainer.css({
        'width':    parseInt(width, 10) + 'px',
        'height':   parseInt(height, 10) + 'px',
        'overflow': 'hidden',
        'padding':  0,
        'margin':   0
      })
      wrapperContent.css({
        'width':   totalWidth + 'px',
        'padding': 0,
        'margin':  0
      })
      if (settings.initialLoops !== 0 || settings.loopForever) {
        pc360.startLoop()
      }
    }
    pc360.startLoop = function () {
      spinLoop = setInterval(function () {
        inLoop = true
        if (loops > settings.initialLoops && settings.initialLoops > 0) {
          pc360.stopLoop()
          return
        }
        if (i >= (images - 1)) {
          loops++
          i = 0
          spinner.children().css({'display': 'inline'})
        } else {
          $('#' + spinner.attr('id') + '-pc360-image-' + i).css({'display': 'none'})
          i++
        }
      }, settings.loopDelay)
    }
    pc360.stopLoop = function () {
      clearTimeout(spinLoop)
      inLoop = false
    }
    pc360.addCounter = function () {
      i++
      if (i > images) {
        i = 0
      }
    }
    pc360.subCounter = function () {
      i--
      if (i < 0) {
        i = images
      }
    }
    // The zoom zoom function
    pc360.zoom = function () {
      if (!settings.enableZoom) {
        return false
      }
      var spinnerContent = '',
        startAt = 0,
        newWidth,
        newHeight,
        tmpSpinner = spinner,
        zoomElement = $('<ul></ul>'),
        tempImg = $("<img />").attr(
          'src',
          $(spinner.html()).find('img:first').attr('src').split(settings.thumbnailURL).join(settings.largeURL)
        ).load(function() {
          if (!this.complete || typeof this.naturalWidth === "undefined" || this.naturalWidth === 0) {
            zoomContent = '<p>An error occured</p>'
          } else {
            newWidth = this.naturalWidth
            newHeight = this.naturalHeight
          }
          $(tmpSpinner.html()).find('img').each(function () {
            $('<li></li>').append(
              $('<img>').attr(
                'src',
                $(this).attr('src').split(settings.thumbnailURL).join(settings.largeURL)
              ).css({
                'width':  newWidth + 'px',
                'height': newHeight + 'px',
                'display': $(this).css('display')
              })
            ).appendTo(zoomElement)
          })
          $(tmpSpinner.html()).filter('li').each(function (index, e) {
            if ($(this).css('display') === 'none') {
              startAt = index
            }
          })
          var zoomContent = '<ul id="zoomSpinner">' +
            zoomElement.html() +
            '</ul>' +
            '<br>Click and drag to rotate' +
            '<br><a href="#" onClick="return false" class="pc360-close">Close</a>'
          if ($('.pc360-zoom-divs').length) {
            $('.pc360-zoom-divs').fadeIn(500, function () {
              $('.pc360-zoom-child').html(zoomContent)
              $('#zoomSpinner').pitchcare360({
                initialLoops: 0,
                loopDelay: 100,
                enableZoom: false,
                defaultWidth: newWidth,
                defaultHeight: newHeight,
                startImage: startAt
              })
            })
            $('.pc360-close').on({
              'click': function () {
                $('.pc360-zoom-divs').fadeOut(500, function () {
                  $(document).off({'keydown': null})
                  return false
                })
              }
            })
            return
          }
          $('<div></div>').attr({
            'class': 'pc360-zoom-divs'
          }).css({
            'top':              0,
            'left':             0,
            'display':          'none',
            'position':         'fixed',
            'z-index':          settings.firstZindex,
            'width':            '100%',
            'height':           '100%',
            'opacity':          '0.8',
            'background-color': '#000'
          }).html(' ').appendTo('body').fadeIn(500, function () {
            $('<div></div>').attr({
              'class': 'pc360-zoom-divs pc360-zoom-child'
            }).html(
              zoomContent
            ).css({
              'margin':           'auto',
              'top':              '0',
              'left':             '0',
              'right':            '0',
              'bottom':           '0',
              'width':            '750px',
              'height':           '650px',
              'display':          'none',
              'position':         'fixed',
              'z-index':          settings.secondZindex,
              'padding':          '10px',
              'overflow':         'visible',
              'text-align':       'center',
              'vertical-align':   'center',
              'transition':       'all 0.5s ease-in-out',
              'background-color': '#fff'
            }).appendTo('body').fadeIn(500, function () {
              setTimeout(function () {
                $('.pc360-zoom-child').css({
                  'width':  parseInt($('#zoomSpinner').children().children('img:first').css('width'), 10) + 'px',
                  'height': (parseInt($('#zoomSpinner').children().children('img:first').css('height'), 10) + 45) + 'px'
                })
              }, 500)
              $('#zoomSpinner').pitchcare360({
                initialLoops: 0,
                loopDelay: 100,
                enableZoom: false,
                defaultWidth: newWidth,
                defaultHeight: newHeight,
                startImage: startAt
              })
              $('.pc360-close').on({
                'click': function () {
                  $('.pc360-zoom-divs').fadeOut(500, function () {
                    $(document).off({'keydown': null})
                    return false
                  })
                }
              })
            })
            $(document).on({
              'keydown': function (e) {
                if (e.keyCode === 27) {
                  $('.pc360-zoom-divs').fadeOut(500, function () {
                    $(document).off({'keydown': null})
                  })
                }
              }
            })
          }).on({
            'click': function() {
              $('.pc360-zoom-divs').fadeOut(500, function () {
                $(document).off({'keydown': null})
              })
            }
          })
        })
      return
    }
    // This looks untidy but we only want the click/drag even on the main <ul>
    spinner.children().on({
      'click': function (e) {
        e.preventDefault()
      },
      'mousedown': function (e) {
        e.preventDefault()
      }
    })
    spinner.children().children().on({
      'click': function (e) {
        e.preventDefault()
      },
      'mousedown': function (e) {
        e.preventDefault()
      }
    })
    // Mouse events, yay!
    spinner.on({
      'mouseover': function () {
        if (inLoop) {
          pc360.stopLoop()
          wasLooping = true
          return
        }
      },
      'mouseout': function () {
        if (inLoop) {
          return
        }
        if (wasLooping) {
          pc360.startLoop()
          wasLooping = false
        }
      },
      'mousedown': function (downEvent) {
        var mousePosition = downEvent.pageX
        $(window).on({
          'mousemove': function (moveEvent) {
            if (moveEvent.pageX < mousePosition && (mousePosition-moveEvent.pageX) > 10) {
              // Moving the mouse left
              if (i === 0 || i >= (images-1)) {
                spinner.children().css({'display': 'inline'})
              }
              $('#' + spinner.attr('id') + '-pc360-image-' + (i)).css({'display': 'none'})
              pc360.addCounter()
              mousePosition = moveEvent.pageX
            } else {
              if (moveEvent.pageX > mousePosition && (moveEvent.pageX-mousePosition) > 10) {
                // Moving the mouse right
                if (i >= images) {
                  spinner.children().not(':last').css({'display': 'none'})
                }
                pc360.subCounter()
                $('#' + spinner.attr('id') + '-pc360-image-' + (i)).css({'display': 'inline'})
                
                mousePosition = moveEvent.pageX
              }
            }
            isDragging = true
            $(window).on({
              'mouseup': function () {
                $(window).off({'mousemove': null})
              }
            })
          }
        })
      },
      'mouseup': function () {
        var wasDragging = isDragging
        isDragging = false
        $(window).off({'mousemove': null})
        if (wasDragging) {
          // Dragged
        } else {
          // Clicked
          pc360.zoom()
          return false
        }
      }
    })
    // Run the init function, and return so can be chained
    pc360.init()
    return this
  }

  $.fn.pitchcare360 = function (options) {
    return this.each(function () {
      var element = $(this)
      if (element.data('pitchcare360')) {
        return element.data('pitchcare360')
      }
      var pitchcare360 = new Pitchcare360(this, options)
      element.data('pitchcare360', pitchcare360)
    })
  }

  // Either edit these defaults, or set them when calling the plugin
  // The main plugin code shouldn't need to be adjusted
  $.fn.pitchcare360.defaults = {
    loopForever:    false,
    enableZoom:     true,
    startImage:     0,
    initialLoops:   2,
    loopDelay:      150,
    defaultWidth:   250,
    defaultHeight:  250,
    firstZindex:    9998,
    secondZindex:   9999,
    thumbnailURL:   '/pitchcare/media.php?hash=1/',
    largeURL:       '/pitchcare/media.php?hash=L/',
    zoomImage:      '//media.pitchcare.com/O/hhLa9H3wYHZuzRPlxOpd.png'
  }

})(jQuery);
