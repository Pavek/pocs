$(function() {
    $('textarea').autoResize({
        onResize: function(h) {
            //$('#ta-container').height(h + 5);
            $('#content').css('margin-bottom', h + 10);
        },
        animate: false,
        extraSpace: 10,
        limit: 75,
        gripper: '#gripper',
        parent: '#container'
    });
});

/*
 * jQuery autoResize (textarea auto-resizer)
 * @copyright James Padolsey http://james.padolsey.com
 * @version 1.04
 */

(function($) {

    $.fn.autoResize = function(options) {

        var settings = $.extend({
            onResize: function() {},
            animate: true,
            animateDuration: 150,
            animateCallback: function() {},
            extraSpace: 20,
            limit: 1000
        }, options);

        // Only textarea's auto-resize:
        this.filter('textarea').each(function() {

            var textarea = $(this);
            var ta_h = textarea.outerHeight();
            var gripper = $(settings.gripper).
                wrap('<div id="wrapper">').
                css({backgroundColor: 'grey'});
            $('#wrapper').css({
                /*border: '1px dotted cyan',*/
                margin: '0 0 ' + ta_h + 'px 0',
                height: settings.limit - ta_h + 'px',
                position: 'relative',
                bottom: ta_h + 'px'

            });
            
            var cur_ta_h, top = null;
            gripper.draggable({
                axis : 'y',
                containment: "parent",
                grid: [0, 13],
                start: function (ev, ui) {
                    $(settings.parent).css({cursor: 'row-resize'});
                    cur_ta_h = textarea.outerHeight();
                    console.log('START: h=' + cur_ta_h);
                },
                stop: function (ev, ui) {
                    $(settings.parent).css({cursor: 'default'});
                },
                drag: function (ev, ui) {
                    if (top === null) {
                        top = ui.position.top;
                        console.log('DRAG: init_t=' + top);
                    }
                    else if (top !== ui.position.top) {
                        var diff = top - ui.position.top,
                            new_h = cur_ta_h + diff;
    
                        console.log('DRAG: h=' + cur_ta_h + ', diff=' + diff + ', new_h=' + new_h);
    
                        top = ui.position.top;
                        cur_ta_h = new_h;
    
                        textarea.height(new_h);
                        settings.onResize.call(this, new_h);
                        console.log('DRAG: set new_h=' + textarea.outerHeight());
                    }
                }
            });
            
            //zIndex: '-1'
            //console.log(settings.limit - $(this).outerHeight() + 'px');
            
            // Get rid of scrollbars and disable WebKit resizing:
            // pag: '\n' insertion doesn't work without 'white-space:pre', see: http://www.fourmilab.ch/fourmilog/archives/2005-04/000510.html
            textarea.css({
                resize: 'none',
                'overflow-y': 'hidden',
                'white-space': 'pre'
            }),

                // Cache original height, for use later:
                // pag: get height from css if element is hidden originally (as in our case).
                // pag: assuming box-sizing: border-box (i.e. css height includes paddings)
                origHeight = textarea.innerHeight() || parseInt(textarea.css('height'), 10);

                // Need clone of textarea, hidden off screen:
                var clone = (function() {

                    // Properties which may effect space taken up by chracters:
                    var props = ['height', 'width', 'lineHeight', 'textDecoration', 'letterSpacing'],
                        propOb = {};

                    // Create object of styles to apply:
                    $.each(props, function(i, prop) {
                        propOb[prop] = textarea.css(prop);
                    });

                    // Clone the actual textarea removing unique properties
                    // pag: insert before original textarea has problem: in IE clone is not resized properly on inserting '\n'
                    // if parent has postion:relative (presumably), thus adding to the end of body (out of relative):
                    return textarea.clone().removeAttr('id').removeAttr('name').css({
                        position: 'absolute',
                        top: 0,
                        left: -9999
                    }).css(propOb).attr('tabIndex', '-1').appendTo("body");

                })(),
                lastScrollTop = origHeight,
                lastVal = '',
                updateSize = function(e, force) {

                    if (!force && lastVal === $(this).val()) {
                        return;
                    }
                    lastVal = $(this).val();

                    // Prepare the clone:
                    clone.height(0).width($(this).width()).val($(this).val()).scrollTop(10000);

                    // Find the height of text:
                    var padding = textarea.innerHeight() - textarea.height();
                    var scrollTop = clone.scrollTop();
                    // origHeight includes padding, scrollTop - not
                    scrollTop = (scrollTop ? scrollTop + padding : origHeight) + settings.extraSpace;

                    // Don't do anything if scrollTop hasn't changed:
                    if (lastScrollTop == scrollTop) {
                        return;
                    }
                    lastScrollTop = scrollTop;

                    // Check for limit:
                    if (scrollTop >= settings.limit) {
                        $(this).css('overflow-y', '');
                        return;
                    }
                    $(this).css('overflow-y', 'hidden'); // otherwise scroll remain in IE and blinks in e.g. FF
                    // Fire off callback:
                    // pag: pass new height, so listener can adjust in advance
                    settings.onResize.call(this, scrollTop);

                    // Either animate or directly apply height:
                    if (settings.animate && textarea.css('display') === 'block') {
                        $(this).stop().animate({
                            height: scrollTop
                        }, settings.animateDuration, settings.animateCallback);
                    } else {
                        $(this).height(scrollTop);
                    }
                };

            // Bind namespaced handlers to appropriate events:
            textarea.unbind('.dynSiz').bind('keyup.dynSiz keydown.dynSiz change.dynSiz', updateSize);
        });

        // Chain:
        return this;
    };

})(jQuery);