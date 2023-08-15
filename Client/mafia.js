jQuery.fn.selectbox = function(options) {

    var settings = {
        className: 'jquery-selectbox',
        animationSpeed: 50,
        listboxMaxSize: 20,
        replaceInvisible: false
    };

    var commonClass = 'jquery-custom-selectboxes-replaced';
    var listOpen = false;
    var showList = function(listObj) {
        var selectbox = listObj.parents('.' + settings.className + '');
        listObj.slideDown(settings.animationSpeed, function(){
            listOpen = true;
        });
        selectbox.addClass('selecthover');
        jQuery(document).bind('click', onBlurList);
        return listObj;
    };
    var hideList = function(listObj) {
        var selectbox = listObj.parents('.' + settings.className + '');
        listObj.slideUp(settings.animationSpeed, function(){
            listOpen = false;
            jQuery(this).parents('.' + settings.className + '').removeClass('selecthover');
        });
        jQuery(document).unbind('click', onBlurList);
        return listObj;
    };
    var onBlurList = function(e) {
        var trgt = e.target;
        var currentListElements = jQuery('.' + settings.className + '-list:visible').parent().find('*').andSelf();
        if(jQuery.inArray(trgt, currentListElements)<0 && listOpen) {
            hideList( jQuery('.' + commonClass + '-list') );
        }
        return false;
    };

    /* Processing settings */
    settings = jQuery.extend(settings, options || {});
    /* Wrapping all passed elements */
    return this.each(function(i) {
        var _this = jQuery(this);
        if(_this.filter(':visible').length === 0 && !settings.replaceInvisible)
            return;
        var replacement = jQuery(
            '<div class="' + settings.className + ' ' + commonClass + '">' +
            '<div id="morebnt_'+i+'" class="' + settings.className + '-moreButton" />' +
            '<div class="' + settings.className + '-list ' + commonClass + '-list" />' +
            '<span class="' + settings.className + '-currentItem" />' +
            '</div>'
        );
        jQuery('option', _this).each(function(k,v){
            var v = jQuery(v);
            var str = v.attr('title').replace(/\[/g,'<').replace(/\]/g,'>');
            var classn = v.attr('className');
            if(!str){
                str = 	v.text();
            }
            var check_option_state = false;
            check_option_state = v.attr('disabled');
            var listElement =  jQuery('<span rel="'+v.text()+'" class="' + settings.className + '-item value-'+v.val()+' item-'+k+'">' + str + '</span>');
            listElement.click(function () {
                if (classn === 'jumplink') {
                    window.location = v.val();
                    return;
                } else {
                    var thisListElement = jQuery(this);
                    var thisReplacment = thisListElement.parents('.'+settings.className);
                    var thisIndex = thisListElement[0].className.split(' ');
                    for( k1 in thisIndex ) {
                        if(/^item-[0-9]+$/.test(thisIndex[k1])) {
                            thisIndex = parseInt(thisIndex[k1].replace('item-',''), 10);
                            break;
                        }
                    };
                    var thisValue = thisListElement[0].className.split(' ');
                    for( k1 in thisValue ) {
                        if(/^value-.+$/.test(thisValue[k1])) {
                            thisValue = thisValue[k1].replace('value-','');
                            break;
                        }
                    };
                    if (check_option_state === false) {
                        var thisTitle = thisListElement.attr('rel');
                        thisReplacment
                            .find('.' + settings.className + '-currentItem')
                            .text(thisTitle);
                        thisReplacment
                            .find('select')
                            .val(thisValue)
                            .triggerHandler('change');
                        var thisSublist = thisReplacment.find('.' + settings.className + '-list');
                        if(thisSublist.filter(":visible").length > 0) {
                            hideList( thisSublist );
                        }else{
                            showList( thisSublist );
                        }
                    }
                }
            }).bind('mouseenter',function(){
                if(check_option_state === false){
                    jQuery(this).addClass('listelementhover');
                }
            }).bind('mouseleave',function(){
                if(check_option_state === false){
                    jQuery(this).removeClass('listelementhover');
                }
            });
            jQuery('.' + settings.className + '-list', replacement).append(listElement);
            if(v.filter(':selected').length > 0) {
                if(check_option_state === false){
                    jQuery('.'+settings.className + '-currentItem', replacement).text(v.text());
                }
            }
        });
        replacement.find('.' + settings.className + '-currentItem, .' + settings.className + '-moreButton').click(function(){
            var thisMoreButton = jQuery(this);
            var otherLists = jQuery('.' + settings.className + '-list')
                .not(thisMoreButton.siblings('.' + settings.className + '-list'));
            hideList( otherLists );
            var thisList = thisMoreButton.siblings('.' + settings.className + '-list');
            if(thisList.filter(":visible").length > 0) {
                hideList( thisList );
            }else{
                showList( thisList );
            }
        }).bind('mouseenter',function(){
            // jQuery(this).addClass('morebuttonhover');
            $('#morebnt_'+i).addClass('morebuttonhover');
            //alert(i);
        }).bind('mouseleave',function(){
            $('#morebnt_'+i).removeClass('morebuttonhover');
        });
        _this.hide().replaceWith(replacement).appendTo(replacement);
        var thisListBox = replacement.find('.' + settings.className + '-list');
        var thisListBoxSize = thisListBox.find('.' + settings.className + '-item').length;
        if(thisListBoxSize > settings.listboxMaxSize)
            thisListBoxSize = settings.listboxMaxSize;
        if(thisListBoxSize === 0)
            thisListBoxSize = 1;
        var thisListBoxWidth = Math.round(_this.width() + 5);
        /*
        if(jQuery.browser.safari)
            thisListBoxWidth = thisListBoxWidth * 0.94;
        //replacement.css('width', thisListBoxWidth + 'px');
        thisListBox.css({
            width: Math.round(thisListBoxWidth-5) + 'px',
            height: thisListBoxSize + 'em'
        });*/
    });
};
(function($) {
    var TIP_DIM = {
        w : 0,
        h : 0
    };
    var BLINKER_STATE = 0;
    var current = '';
    var old_menu_id  = '';
    $.fn.extend({
        ttip: {
            tooltipType:'smarttip',
            tooltipClass:'stip',
            tooltipNum: 0
        },
        initTooltip: function(settings) {
            $.ttip = $.extend({},$.ttip,settings);
            ttpContainer = $('#tt');
            var i=0;
            this.each(function() {
                this.ttip = $.extend({},$.ttip,{tooltipNum:i});
                i++;
            }).bind('mouseover', showTooltip )
                .bind('click', clickObject );
        },

        //tooltip plugin
        /*tooltip: function(event) {
                var html = $(this).data('jsonTooltip');
                if ($.isEmptyObject(html)) {
                        html=makeJsonTooltip($(this));
                        $(this).data('jsonTooltip',html);
                        $(this)
                                .bind('mousemove', moveTooltip )
                                .bind('mouseout', hideTooltip );
                }
                ttpContainer.html('<span class="stip" style="margin:0;padding:0;left:0;top:0;">' + html + '</span>')
                                        .css('visibility','visible');
                TIP_DIM.w = ttpContainer.width();
                TIP_DIM.h = ttpContainer.height();
                Locate(event);
        },*/
        //init
        jsonInit: function() {
            return this.each(function() {
                $(this).jsonData();
            });
        }
    });

    $.maxZIndex = $.fn.maxZIndex = function(opt) {
        /// <summary>
        /// Returns the max zOrder in the document (no parameter)
        /// Sets max zOrder by passing a non-zero number
        /// which gets added to the highest zOrder.
        /// </summary>
        /// <param name="opt" type="object">
        /// inc: increment value,
        /// group: selector for zIndex elements to find max for
        /// </param>
        /// <returns type="jQuery" />
        var def = { inc: 10, group: "*" };
        $.extend(def, opt);
        var zmax = 0;
        $(def.group).each(function() {
            var cur = parseInt($(this).css('z-index'));
            zmax = cur > zmax ? cur : zmax;
        });
        if (!this.jquery)
            return zmax;

        return this.each(function() {
            zmax += def.inc;
            $(this).css("z-index", zmax);
        });
    };

    $.fn.jsonData= function(setData, selector) {

        var el=this;
        if (!el.hasClass('json')) {
            el=el.find('.json');
        }
        if($.isEmptyObject($(el).data('jsonData')) || !$.isEmptyObject(setData)) {
            if ($.isEmptyObject(setData)) {
                json=$.parseJSON($(el).attr('rel'));
            } else {
                json=setData;
            }
            if ($.isEmptyObject(json)) {
                $(el).removeData('jsonData');
                return false;
            }
            $(el).data('jsonData', json);
            if (json.tooltip === false) {
                $(el).tooltip().flush();
            } else
            if (typeof json.tooltip !== 'undefined') {
                //tooltip init
                $(el).tooltip().flush();
                $(el).tooltip().bind();
            }
        } else {
            json=$(el).data('jsonData');
        }
        return json;
    };

    $.fn.tooltip= function() {
        var self=this;
        var container=$('#tt');
        return {
            bind: function() {
                return self.each(function() {
                    $(this).unbind('mouseenter').bind('mouseenter',$(this).tooltip().mouseover);
                });
            },
            unbind: function() {
                container.empty().hide();
                return self.each(function() {
                    $(this).unbind('mouseenter').unbind('mouseleave').unbind('mousemove');
                });
            },
            mouseover: function (event) {
                var hide = false;
                try {
                    if ($.ui.ddmanager.current.helper.length > 0) {
                        hide=true;
                    }
                } catch(err) {};
                if (hide === true) {
                    return;
                }

                var html = $(self).tooltip().htmlData();
                container
                    .html('<span class="stip" style="margin:0;padding:0;left:0;top:0;">' + html + '</span>')
                    .maxZIndex();
                if (container.find('.countdown').length > 0) {
                    container.find('.countdown').countdownClock({format:'short', locale_days:'days'});
                }
                container.show();
                TIP_DIM.w = container.width();
                TIP_DIM.h = container.height();
                $(self).tooltip().followMouse(event);
            },
            htmlData: function() {
                var html = $(self).data('tooltip');
                if ($.isEmptyObject(html)) {
                    html = makeJsonTooltip($(self));
                    $(self).data('tooltip',html);
                    $(self)
                        .bind('mousemove', $(self).tooltip().mousemove )
                        .bind('mouseleave', $(self).tooltip().mouseout );
                }
                return html;
            },
            mousemove: function(event) {
                $(self).tooltip().followMouse(event);
            },
            followMouse: function(event) {
                if(CACHED_WINDOW.ie){
                    var x=event.pageX-CACHED_WINDOW.x,y=event.pageY-CACHED_WINDOW.y;
                }else{
                    var x=event.pageX,y=event.pageY;
                }
                $(self).tooltip().follow(x, y);
            },
            mouseout: function() {
                container.empty().hide();
            },
            flush: function() {
                $(self).removeData('tooltip');
            },
            follow: function(x,y) {
                if(DIRECTION === 'rtl'){
                    container.css({left: ( x > TIP_DIM.w +15 )? (x -CACHED_WINDOW.rx-TIP_DIM.w-15)+'px' : (elPosX = x-CACHED_WINDOW.rx + 15)+'px'});
                }else{
                    container.css({left: ( CACHED_WINDOW.w  > (x+TIP_DIM.w+15) )? x+15+'px' : (x-TIP_DIM.w - 15)+'px'});
                }
                container.css({top: ( CACHED_WINDOW.h+CACHED_WINDOW.y- CACHED_WINDOW.ry < (y + 5 + TIP_DIM.h) ) ? (y + CACHED_WINDOW.ry - TIP_DIM.h-5)+'px' : (y+CACHED_WINDOW.ry+5)+'px'});
            }
        };
    };

    function sortModalWindowsZindex(aW, bW) {
        var a = $(aW).css('z-index'); var b = $(bW).css('z-index');
        if( isFinite(a) && isFinite(b) ) {
            return  b - a;
        }
        else if( isFinite(a) ) { // window a' z-index is auto
            return 1;
        }
        else if( isFinite(b) ) { // window b' z-index is auto
            return -1;
        }
    };

    $.modal = function () {
        var container=$("#windows-modal");
        container.unbind('click').bind('click',function(e) {
            if ( (this===e.target) || $(e.target).hasClass('mclose_') || $(e.target).hasClass('del') || $(e.target).hasClass('ok-locked')  || $(e.target).hasClass('ok-locked')) {
                var cWindow = null;
                if(this !== e.target) { // close button clicked
                    var cWindow = $(e.target).parents(".window-modal:first");
                    cWindow.hide();
                }

                var remaining = [];
                $.each($(container).children(), function(index, value) {
                        if($(value).css('display')==='block')
                            remaining.push( $(value) );
                    }
                );
                remaining.sort(sortModalWindowsZindex); // sort by z-index so the top/last window is closed
                if(!cWindow && remaining.length) {
                    remaining.pop().hide();
                }

                if (remaining.length === 0) container.hide();

                return false;
            }
        });

        var mWindows={
            extra: {
                selector:'#window-modal-extra',
                prepare: function(element) {
                    var jsonData=$(element).jsonData();
                    //console.log(jsonData);
                    mWindow=container.find(this.selector);
                    try {
                        //mWindow.find('.item-container').html('<div style="width:50px;height:50px;" class="'+jsonData.class+'"></div>');
                        mWindow.find('.item-container').html('<div style="width:50px;height:50px;" class="'+jsonData['class']+'"></div>');
                    } catch(err){};
                    if (typeof jsonData['class'] === 'undefined' || jsonData['class'].length<1) {
                        mWindow.find('.item-container').remove();
                    }
                    if (jsonData.wildform) {
                        mWindow.find('.window-buttons').hide();
                        mWindow.find('.item-info').html(jsonData.wildform.replace(/\[/g,'<').replace(/\]/g,'>'));
                    } else {

                        mWindow.find('.window-buttons').show();
                        mWindow.find('.item-info').html(jsonData.bbcode.replace(/\[/g,'<').replace(/\]/g,'>'));

                        var windowForm=mWindow.find('.window-form');
                        windowForm.attr({'action':jsonData.url});
                        if (jsonData.form) {
                            if (jsonData.form['method'] === 'post') {
                                windowForm.attr('method','post');
                            } else {
                                windowForm.attr('method','get');
                            }
                        } else {
                            windowForm.attr('method','get');
                        }
                        windowForm.find('input:not([type=submit])').not('[name=z]').remove();
                        if (jsonData.form) {
                            if (jsonData.form['inputs']) {
                                $.each(jsonData.form['inputs'], function(index, value) {
                                    windowForm.append('<input type="hidden" name="'+index+'" value="'+value+'" />');
                                });
                            }
                        }
                    }
                }
            },
            single: {
                selector: '#window-modal-single',
                prepare: function (settings) {
                    var defaults = {
                        callback:false,
                        item:null,
                        action: 'sell'
                    };

                    settings = $.extend(true, {}, defaults, settings);

                    var item = settings.item;
                    var mWindow = container.find(this.selector);
                    var htmlTooltip = $(item).find('.json').tooltip().htmlData();
                    var jsonData = $(item).jsonData();
                    var itemInfo = mWindow.find('.item-info');
                    itemInfo.html(htmlTooltip);

                    var action = settings.action;
                    var actionData = mWindow.jsonData()[action];

                    mWindow.find('.single-t').empty().html(actionData['txt']);
                    var price_title = mWindow.find('.price-block h1:first').toggleClass('warn', false);
                    var quantity_title = mWindow.find('.slider h1:first').toggleClass('warn', false);

                    if (actionData['price'] === true) {
                        var price_block = mWindow.find('.price');
                        price_block.attr('class', 'price ' + actionData['price_type']);
                        price_block.find('input').val(0);
                        price_title.toggleClass('warn',true);
                        mWindow.toggleClass('window-modal-single-price', true);
                    } else {
                        price_title.toggleClass('warn',false);
                        mWindow.toggleClass('window-modal-single-price', false);
                    }

                    if (jsonData['disable_locked'] === 1 && jsonData['required_level_ok'] === -1) {
                        mWindow.find('.window-buttons').hide();
                        mWindow.find('.window-buttons-locked').show();
                        mWindow.toggleClass('window-modal-single-price',false).toggleClass('window-modal-single-quantity',false);
                        return this;
                    } else {
                        mWindow.find('.window-buttons').show();
                        mWindow.find('.window-buttons-locked').hide();
                    }

                    if (jsonData['stackable']) {
                        // alert('466');

                        mWindow.toggleClass('window-modal-single-quantity',true);

                        var total = mWindow.find('.total-h');
                        var total_time = mWindow.find('.total-time-h');
                        if (actionData['total']) {
                            var credits;
                            var cash;
                            var init_price_block = function () {
                                if (price_block) {
                                    if (actionData['price_type']==='cash') {
                                        cash=price_block.find('input').val();
                                        if (isNaN(cash)) {
                                            cash=0;
                                        }
                                        if (cash===0) {
                                            price_title.toggleClass('warn',true);
                                        } else {
                                            price_title.toggleClass('warn',false);
                                        }
                                    }
                                    if (actionData['price_type']==='cred') {
                                        credits=price_block.find('input').val();
                                        if (isNaN(credits)) {
                                            credits=0;
                                        }
                                        if (credits===0) {
                                            price_title.toggleClass('warn',true);
                                        } else {
                                            price_title.toggleClass('warn',false);
                                        }
                                    }
                                } else {
                                    credits=parseFloat(jsonData[action+'_credits']);
                                    cash=parseFloat(jsonData[action+'_cash']);
                                }
                                time=parseInt(jsonData['time']);
                            };
                            init_price_block();
                            total.closest('h2').show();
                            if (!isNaN(time)) {
                                total_time.closest('h2').show();
                            } else {
                                total_time.closest('h2').hide();
                            }

                            var price = function (value) {
                                total.empty();
                                if (!isNaN(credits)) {
                                    total.append('<span class="cred">'+Math.ceil(value*credits)+'</span>');
                                }
                                if (!isNaN(cash)) {
                                    total.append('<span class="cash">'+no2str(Math.ceil(value*cash))+'</span>');
                                }
                                if (!isNaN(time)) {
                                    total_time.empty();
                                    total_time.append('<span class="time">'+$.formatTime(value*time)+'</span>');
                                }
                            };
                            if (price_block) {
                                price_block.find('input').unbind('keyup').bind('keyup', function () {
                                    init_price_block();
                                    price(slider.slider('value'));
                                });
                            }
                            price(1);
                        } else {
                            total.closest('h2').hide();
                            total_time.closest('h2').hide();
                        }
                        var right_q=mWindow.find('.right-q');
                        right_q.val(1).unbind('keyup').bind('keyup',function(e) {
                            var tmp=parseInt($(e.currentTarget).val());
                            if (isNaN(tmp)) {
                                tmp=0;
                            }
                            tmp=Math.max(0,tmp);
                            tmp=Math.min(tmp,jsonData['quantity']);
                            slider.slider('value',tmp);
                            if (tmp === 0) {
                                quantity_title.toggleClass('warn',true);
                            } else {
                                quantity_title.toggleClass('warn',false);
                            }
                            if (actionData['total']) {
                                price(tmp);
                            }
                        });

                        var slider = mWindow.find('.item-quantity');
                        // alert('556');
                        slider.slider({
                            min: 0,
                            max: jsonData['quantity'],
                            value: 1,
                            slide: function(event, ui) {
                                right_q.val(ui.value);
                                if (actionData['total']) {
                                    price(ui.value);
                                }
                                if (parseInt(ui.value) === 0) {
                                    quantity_title.toggleClass('warn',true);
                                } else {
                                    quantity_title.toggleClass('warn',false);
                                }
                            }
                        });

                        if (jsonData['quantity'] <= 1) {
                            mWindow.find('.slider').hide();
                        } else {
                            mWindow.find('.slider').show();
                        }

                    } else {
                        mWindow.toggleClass('window-modal-single-quantity',false);
                        if (price_block) {
                            price_block.find('input').unbind('keyup').bind('keyup',function() {
                                if (parseInt($(this).val())>0) {
                                    price_title.toggleClass('warn',false);
                                } else {
                                    price_title.toggleClass('warn',true);
                                }
                            });
                        }
                    }
                    var clicked_buy = false;
                    mWindow.find('.window-buttons input.ok').val(actionData['txt']).unbind('click').bind('click', function () {
                        // console.log('general.js 598');
                        // console.log(jsonData);

                        if (jsonData['stackable']) {
                            if (slider.slider('value') > 0 && price_title.hasClass('warn') === false) {
                                if (actionData['url']) {
                                    if(clicked_buy == false) {
                                        window.location = actionData['url']+jsonData[actionData['field_id']]+'/'+slider.slider('value')+'?'+REQ_PAIR;
                                    }
                                    clicked_buy = true;
                                }
                                else if (settings.callback !== false) {
                                    //console.log('604' + settings.callback);
                                    if(clicked_buy == false) {
                                        settings.callback(jsonData, (slider) ? slider.slider('value') : 1, price_block ? price_block.find('input').val() : false);
                                        $.modal().hide();
                                        clicked_buy = true;
                                    }
                                }
                            }
                        } else {
                            if (price_title.hasClass('warn') === false) {
                                if (actionData['url']) {
                                    if(clicked_buy == false) {
                                        window.location = actionData['url'] + jsonData[actionData['field_id']] + '?' + REQ_PAIR;
                                        clicked_buy = true;
                                    }
                                }
                                else if (settings.callback !== false) {
                                    if(clicked_buy == false) {
                                        settings.callback(jsonData, (slider)?slider.slider('value'):1, price_block?price_block.find('input').val():false);
                                        $.modal().hide();
                                        clicked_buy = true;
                                    }
                                }
                            }
                        }
                    });
                    return this;

                }
            },
            inventory: {
                selector: '#window-modal-inventory',
                prepare: function (item, jsonArmed, jsonInventory) {
                    // alert('a');
                    var mWindow = container.find(this.selector);

                    item = item.clone();
                    var jsonData=item.jsonData();
                    delete jsonData['stackable'];
                    delete jsonData['quantity'];
                    delete jsonData['quantity_txt'];
                    item.find('.inmb').remove();
                    mWindow.find('.item-container').empty().html(item.clone()).jsonData(jsonData);

                    var min=0, value=0, max=0;

                    if (!isNaN(parseInt(jsonArmed.quantity))) {
                        value=parseInt(jsonArmed.quantity);
                    }
                    if (!isNaN(parseInt(jsonInventory.quantity))) {
                        max=value+parseInt(jsonInventory.quantity);
                    } else {
                        max=value;
                    }

                    var left_q=mWindow.find('.left-q');
                    var right_q=mWindow.find('.right-q');

                    var slider = mWindow.find('.item-quantity');
                    // alert('652');

                    left_q.val(value);
                    right_q.val(max-value);

                    slider.slider({
                        min: min,
                        max: max,
                        value: max-value,
                        slide: function(event, ui) {
                            left_q.val(max-ui.value);
                            right_q.val(ui.value);
                        }
                    });
                    keypress = function (e) {
                        var tmp = parseInt($(e.currentTarget).val());
                        if (isNaN(tmp)) {
                            tmp = 0;
                        }
                        tmp = Math.max(0,tmp);
                        tmp = Math.min(tmp,max);
                        if($(e.currentTarget).hasClass('left-q')) {
                            right_q.val(max-tmp);
                        } else {
                            left_q.val(max-tmp);
                        }
                        slider.slider('value' ,right_q.val());
                    };
                    $(left_q).unbind('keyup').bind('keyup',keypress);
                    $(right_q).unbind('keyup').bind('keyup',keypress);

                    headclick = function (e) {
                        var tmp=max-slider.slider('value');
                        var target;
                        if ($(e.currentTarget).hasClass('left-h')) {
                            if (e.type==='dblclick') {
                                tmp=min;
                            } else {
                                tmp+=1;
                            }
                        } else {
                            if (e.type==='dblclick') {
                                tmp=max;
                            } else {
                                tmp-=1;
                            }
                        }
                        if (e.type==='click') {
                            tmp=Math.max(0,tmp);
                            tmp=Math.min(max, tmp);
                        }
                        slider.slider('value',max-tmp);
                        left_q.val(tmp);
                        right_q.val(max-tmp);
                    };
                    mWindow.find('.left-h,.right-h').unbind('click').bind('click',headclick);
                    var clicked = false;
                    mWindow.find('input.ok').unbind('click').bind('click',function() {

                        var
                            tmp_value=max-slider.slider('value'),
                            tmp_q=Math.abs(value-tmp_value);
                        if (tmp_value>value) {
                            if(clicked == false) {
                                window.location='/inventory/arm/'+jsonData['id']+'/'+tmp_q+'?'+REQ_PAIR;
                                clicked = true;
                            }
                        } else if (tmp_value<value) {
                            if(clicked == false) {
                                window.location='/inventory/disarm/'+jsonData['type_id']+'/'+tmp_q+'?'+REQ_PAIR;
                                clicked = true;
                            }
                        } else {
                            $.modal().hide();
                        }
                    });


                }
            },
            mwars: {
                selector: '#window-modal-mwars',
                prepare: function(item) {
                    var mWindow = container.find(this.selector);
                    var itemData= item.jsonData();

                    mWindow.find('.item-start').html(makeJsonTooltipItem(itemData));
                    var itemData= $.extend({}, itemData);

                    //Selector => Address
                    var boxList = {
                        'window-upgrade-credits':{'key': 'credits_price', 'url': 'buy-credits'},
                        'window-upgrade-connection':{'key': 'connections_price', 'url': 'buy-connections'},
                        'window-upgrade-vip':{'key': 'vip_days_price', 'url': 'buy-vip'},
                        'window-upgrade-cards':{'key': 'personal_cards_price', 'url': 'buy-cards'},
                        'window-upgrade-chests':{'key': 'chests_price', 'url': 'buy-chests'},
                        'window-upgrade-hearts':{'key': 'hearts_price', 'url': 'buy-hearts'},
                        'window-upgrade-bullets':{'key': 'bullets_price', 'url': 'buy-bullets'}
                    };

                    mWindow.find('#credit-price').html(itemData.credits_price);
                    mWindow.find('#vip-price').html(itemData.vip_days_price);
                    mWindow.find('#cards-price').html(itemData.personal_cards_price);
                    mWindow.find('#connections-price').html(itemData.connections_price);
                    mWindow.find('#chests_price').html(itemData.chests_price);
                    mWindow.find('#hearts_price').html(itemData.hearts_price);
                    mWindow.find('#bullets_price').html(itemData.bullets_price);

                    for (var selector in boxList) {
                        var obj = boxList[selector];

                        // console.log(obj);

                        if (parseInt(itemData[obj.key],10) === 0 || isNaN(parseInt(itemData[obj.key], 10))) {
                            mWindow.find('.'+selector).parent().unbind().hide();
                            continue;
                        }

                        var domElement = mWindow.find('.'+selector).parent();
                        var attr = domElement.attr('rel');
                        if (typeof attr === 'undefined' || attr === false) {
                            domElement.attr('rel', obj.url);
                        }

                        mWindow.find('.'+selector).parent().show().unbind().click(function(evt){
                            /*var firstChild = $(this).children();
                            var url = $(firstChild[0]).attr('rel');*/
                            var url = $(this).attr('rel');
                            window.location='/mwars/'+url+'/'+itemData['type_item_id']+'?'+REQ_PAIR;
                        });
                    }
                }
            },
            mwars_bet: {
                selector: '.mwars-bet-modal:not([id]^=wmc-mwars-bet-)'
            },
            upgrade: {
                selector: '#window-modal-upgrade',
                prepare: function (item) {
                    var mWindow=container.find(this.selector);
                    var itemData=item.jsonData();
                    var v29 = false;

                    if (mWindow.find('#v_29').length > 0 ) {
                        v29 = true;
                    }

                    mWindow.find('.item-start').html(makeJsonTooltipItem(itemData));
                    var itemData=$.extend({}, itemData);
                    itemData['upgrade']=parseInt(itemData['upgrade_upgrade']);
                    itemData['attack']=parseInt(itemData['upgrade_attack']);
                    itemData['attackp']=parseInt(itemData['upgrade_attackp']);
                    mWindow.find('.item-upgrade').html(makeJsonTooltipItem(itemData));

                    if (v29) {
                        mWindow.find('.item-start').find('span.attack').append('<span class="green"> + ' + itemData.attack_bonus + '</span>');
                        mWindow.find('.item-start').find('span.respect').append('<span class="green"> + 1</span>');
                        mWindow.find('#credit-price').html(itemData.upgrade_credits);
                        mWindow.find('#connections-price').html(itemData.upgrade_connections);
                    }

                    if (itemData['upgrade_power']) { mWindow.find('.item-start').find('span.stat_power').append('<span class="green"> + ' + no2str(itemData.upgrade_power) + ' </span>'); }
                    if (itemData['upgrade_health']) { mWindow.find('.item-start').find('span.stat_health').append('<span class="green"> + ' + no2str(itemData.upgrade_health) + ' </span>'); }
                    if (itemData['upgrade_agility']) { mWindow.find('.item-start').find('span.stat_agility').append('<span class="green"> + ' + no2str(itemData.upgrade_agility) + ' </span>'); }
                    if (itemData['upgrade_caution']) { mWindow.find('.item-start').find('span.stat_caution').append('<span class="green"> + ' + no2str(itemData.upgrade_caution) + ' </span>'); }
                    if (itemData['upgrade_reflex']) { mWindow.find('.item-start').find('span.stat_reflex').append('<span class="green"> + ' + no2str(itemData.upgrade_reflex) + ' </span>'); }
                    if (itemData['upgrade_block']) { mWindow.find('.item-start').find('span.stat_block').append('<span class="green"> + ' + no2str(itemData.upgrade_block) + ' </span>'); }



                    var cash=parseInt(itemData['upgrade_cash']);
                    var cred=parseInt(itemData['upgrade_cred']);

                    var upgradePrice=mWindow.find('.upgrade-h');
                    upgradePrice.empty();

                    if (cred>0) {
                        upgradePrice.append('<span class="cred">'+cred+'</span>');
                    }
                    if (cash>0) {
                        upgradePrice.append('<span class="cash">'+no2str(cash)+'</span>');
                    }

                    var upgradeCard=mWindow.find('.window-upgrade-card');
                    if (upgradeCard.length>0) {
                        var upgradeNoCard=mWindow.find('.window-upgrade-nocard');
                        var cardData=$('.icards-upgrade-'+itemData['upgrade_upgrade']).jsonData();
                        if (cardData) {
                            upgradeCard.show();
                            upgradeNoCard.hide();
                            if (v29) {
                                var card_img=upgradeCard.find('.pad_item');
                            } else {
                                var card_img=upgradeCard.find('.card-img');
                            }


                            upgradeCard.find('.inmb').html(cardData.quantity);
                            card_img.attr('src',StaticServer+"/srv/"+WORLD+"/item/"+cardData.type_id+".jpg");

                            if (v29) {
                                var cardElement = mWindow.find('.window-upgrade-card');
                            } else {
                                var cardElement = mWindow.find('input.card');
                            }

                            cardElement.unbind('click').bind('click',function() {
                                if (isNaN(itemData['id'])) {
                                    window.location='/inventory/upgrade-armed-card/'+itemData['type_id']+'/'+cardData['id']+'?'+REQ_PAIR;
                                } else {
                                    window.location='/inventory/upgrade-card/'+itemData['id']+'/'+cardData['id']+'?'+REQ_PAIR;
                                }
                            });
                        } else {
                            upgradeCard.hide();
                            upgradeNoCard.show();
                        }
                    }

                    mWindow.find('input.ok').unbind('click').bind('click',function() {
                        if (isNaN(itemData['id'])) {
                            window.location='/inventory/upgrade-armed/'+itemData['type_id']+'?'+REQ_PAIR;
                        } else {
                            window.location='/inventory/upgrade/'+itemData['id']+'?'+REQ_PAIR;
                        }
                    });

                    if (v29) {
                        mWindow.find('.window-upgrade-credits').click(function(el){
                            if (isNaN(itemData['id'])) {
                                window.location='/inventory/upgrade-armed-credits/'+itemData['type_id']+'?'+REQ_PAIR;
                            } else {
                                window.location='/inventory/upgrade-credits/'+itemData['id']+'?'+REQ_PAIR;
                            }
                        });

                        mWindow.find('.window-upgrade-connections').click(function(el){
                            if (isNaN(itemData['id'])) {
                                window.location='/inventory/upgrade-armed-connections/'+itemData['type_id']+'?'+REQ_PAIR;
                            } else {
                                window.location='/inventory/upgrade-connections/'+itemData['id']+'?'+REQ_PAIR;
                            }
                        });
                    }
                }
            },
            cards: {
                selector: '#window-modal-cards',
                prepare: function(item) {
                    var mWindow = container.find(this.selector);
                    var itemData = item.jsonData();

                    if (typeof itemData.type_id !== 'undefined') {
                        itemData.type_id = parseInt(itemData.type_id);
                    }

                    if (typeof itemData.umax !== 'undefined') {
                        itemData.umax = parseInt(itemData.umax);
                    }


                    // console.log('-cards');
                    // console.log(itemData);

                    if (0) {
                        delete itemData.quantity;
                        delete itemData.inmb;
                        delete itemData.stackable;

                        mWindow.find('.item-use').html(makeJsonTooltipItem(itemData));

                        var inputOK = mWindow.find('input.ok');

                        if (item.hasClass('icards-upgrade')) {
                            inputOK.hide();
                        } else {
                            inputOK.unbind('click').bind('click',function() {
                                window.location = '/inventory/use/' + itemData['id'] + '?' + REQ_PAIR;
                            });
                        }
                    }
                    ////////////////////////////////////////////////////////////////
                    else {
                        var left_q = mWindow.find('.left-q');
                        var right_q = mWindow.find('.right-q');
                        var slider = mWindow.find('.item-quantity');
                        var quantity_title = mWindow.find('.slider').find('h1:first');

                        var min=0, value=1, max=parseInt(itemData['quantity']);
                        left_q.val(value);
                        right_q.val(value);

                        if (itemData.group_id === 8 && isset(NO_DRAG) ) {
                            for (var x in NO_DRAG) {
                                if (NO_DRAG[x] === itemData.type_id ) {
                                    max = 1;
                                    break;
                                }
                            }
                        }

                        var init_quantity_block = function () {
                            var q = parseInt(right_q.val());
                            if (isNaN(q)) q = 1;
                            if (q>max) q = max;
                            if (q<min) q = min;
                            right_q.val(q);

                            slider.slider({
                                min: min,
                                max: max,
                                value: q,
                                slide: function(event, ui) {
                                    right_q.val(ui.value);
                                    if (parseInt(ui.value) === 0) {
                                        quantity_title.toggleClass('warn', true);
                                    } else {
                                        quantity_title.toggleClass('warn', false);
                                    }
                                }
                            });
                            mWindow.find('.slider').show();
                        };

                        init_quantity_block();

                        right_q.unbind('keyup').bind('keyup',function() {
                            init_quantity_block();
                        });

                        if (typeof itemData.umax !== 'undefined') {
                            max = itemData.umax;
                        } else {
                            switch (itemData.type_id) {
                                case 803:
                                case 804:
                                case 805:
                                case 806:
                                case 813:
                                case 814:
                                case 815:
                                case 832:
                                case 833:
                                case 834:
                                case 835:
                                case 842:
                                case 843:
                                    max = 1;
                                    break;
                            }
                        }

                        // alert('992');
                        var inputMax = mWindow.find('input.ok.max');

                        if (max < 2) {
                            mWindow.find('.slider').hide();
                            inputMax.hide();
                        } else {
                            inputMax.show();
                        }

                        mWindow.find('.item-use').html(makeJsonTooltipItem(itemData));

                        var inputOK = mWindow.find('input.ok');

                        if (item.hasClass('icards-upgrade')) {
                            inputOK.hide();
                            inputMax.hide();
                            mWindow.find('.slider').hide();
                        } else {
                            inputOK.unbind('click').bind('click',function () {
                                if (slider.slider('value')>0 && quantity_title.hasClass('warn') === false) {
                                    window.location = '/inventory/use/' + itemData['id'] + '/' + slider.slider('value') + '/?' + REQ_PAIR;
                                }
                            });
                            inputMax.unbind('click').bind('click',function () {
                                window.location = '/inventory/use/' + itemData['id'] + '/' + itemData['quantity'] + '/?' + REQ_PAIR;
                            });
                        }
                    }
                }
            },
            package: {
                selector: '#window-modal-package',
                prepare: function () {
                    var mWindow = container.find(this.selector);
                    mWindow.find('.window-buttons input.ok').unbind('click').bind('click',function() {
                        $.modal().hide();
                    });
                }
            },
            level: {
                selector: '#window-modal-level',
                prepare: function() {
                    var mWindow = container.find(this.selector);
                    mWindow.find('.json').jsonInit();
                }
            },
            attack: {
                selector: '#window-modal-attack',
                prepare: function (settings) {
                    var defaults = {
                        callback:false,
                        item:null,
                        action: 'sell'
                    };
                    settings = $.extend(true, {}, defaults, settings);

                    var item=settings.item;

                    var mWindow=container.find(this.selector);
                    var htmlTooltip=$(item).find('.json').tooltip().htmlData();
                    var jsonData=$(item).jsonData();
                    var itemInfo=mWindow.find('.item-info');
                    itemInfo.html(htmlTooltip);

                    var action=settings.action;
                    var actionData=mWindow.jsonData()[action];

                    mWindow.find('.single-t').empty().html(actionData['txt']);

                    if (actionData['price'] === true) {
                        var price_block=mWindow.find('.price');
                        price_block.attr('class','price '+actionData['price_type']);
                        price_block.find('input').val(0);
                        mWindow.toggleClass('window-modal-single-price',true);
                    } else {
                        mWindow.toggleClass('window-modal-single-price',false);
                    }

                    if (jsonData['stackable']) {
                        mWindow.toggleClass('window-modal-single-quantity',true);
                        var total = mWindow.find('.total-h');
                        if (actionData['total']) {
                            var credits;
                            var cash;
                            var init_price_block = function () {
                                if (price_block) {
                                    if (actionData['price_type'] === 'cash') {
                                        cash=price_block.find('input').val();
                                        if (isNaN(cash)) {
                                            cash=0;
                                        }
                                    }
                                    if (actionData['price_type'] === 'cred') {
                                        credits=price_block.find('input').val();
                                        if (isNaN(credits)) {
                                            credits=0;
                                        }
                                    }
                                } else {
                                    credits=parseFloat(jsonData[action+'_credits']);
                                    cash=parseFloat(jsonData[action+'_cash']);
                                }
                            };
                            init_price_block();
                            total.closest('h2').show();
                            var price = function (value) {
                                total.empty();
                                if (!isNaN(credits)) {
                                    total.append('<span class="cred">'+Math.ceil(value*credits)+'</span>');
                                }
                                if (!isNaN(cash)) {
                                    total.append('<span class="cash">'+no2str(Math.ceil(value*cash))+'</span>');
                                }
                            };
                            if (price_block) {
                                price_block.find('input').unbind('keyup').bind('keyup',function() {
                                    init_price_block(),
                                        price(slider.slider('value'));
                                });
                            }
                            price(1);
                        } else {
                            total.closest('h2').hide();
                        }
                        var right_q = mWindow.find('.right-q');
                        right_q.val(1).unbind('keyup').bind('keyup', function (e) {
                            var tmp = parseInt($(e.currentTarget).val());
                            if (isNaN(tmp)) {
                                tmp=0;
                            }
                            tmp = Math.max(0,tmp);
                            tmp = Math.min(tmp,jsonData['quantity']);
                            slider.slider('value',tmp);
                            if (actionData['total']) {
                                price(tmp);
                            }
                        });
                        var slider = mWindow.find('.item-quantity');
                        slider.slider({
                            min: 0,
                            max: jsonData['quantity'],
                            value: 1,
                            slide: function (event, ui) {
                                right_q.val(ui.value);
                                if (actionData['total']) {
                                    price(ui.value);
                                }
                            }
                        });
                    } else {
                        mWindow.toggleClass('window-modal-single-quantity',false);
                    }

                    mWindow.find('input.ok').val(actionData['txt']).unbind('click').bind('click',function() {
                        if (jsonData['stackable']) {
                            if (slider.slider('value') === 0) {
                                $.modal().hide();
                            } else {
                                if (actionData['url']) {
                                    window.location=actionData['url']+jsonData[actionData['field_id']]+'/'+slider.slider('value')+'?'+REQ_PAIR;
                                } else if (settings.callback !== false) {
                                    settings.callback(jsonData, (slider)?slider.slider('value'):1, price_block?price_block.find('input').val():false);
                                    $.modal().hide();
                                }
                            }
                        } else {
                            if (actionData['url']) {
                                window.location=actionData['url']+jsonData[actionData['field_id']]+'?'+REQ_PAIR;
                            } else if (settings.callback !== false) {
                                settings.callback(jsonData, (slider)?slider.slider('value'):1, price_block?price_block.find('input').val():false);
                                $.modal().hide();
                            }
                        }
                    });
                    return this;
                }
            },
            faction :{
                selector: '#window-modal-faction',
                prepare: function (settings) {

                    var defaults={
                        callback:false,
                        item:null,
                        action: null
                    };

                    settings=$.extend(false, {}, defaults, settings);

                    var item=settings.item;

                    var mWindow=container.find(this.selector);
                    var jsonData=$(item).jsonData();
                    var itemInfo=mWindow.find('.item-info');

                    $.each($(mWindow), function(i, value) {
                            var cWidth = $(value).width();
                            $(value).css('margin-left', '-'+(cWidth/2+19)+'px');
                        }
                    );
                    console.log(settings);
                    return this;
                }
            },
            custom: {
                selector: '.window-modal:not([id]^=wmc-)',
                prepare: function (settings) {

                    var defaults={
                        callback:false,
                        item:null,
                        action: null
                    };

                    settings=$.extend(true, {}, defaults, settings);

                    var item=settings.item;

                    var mWindow=container.find(this.selector);
                    var jsonData=$(item).jsonData();
                    var itemInfo=mWindow.find('.item-info');

                    $.each($(mWindow), function(i, value) {
                            var cWidth = $(value).width();
                            $(value).css('margin-left', '-'+(cWidth/2+19)+'px');
                        }
                    );

                    return this;
                }
            }
        };
        return {
            show: function(type, modal_id) {
                var mWindow=mWindows[type];
                if (typeof modal_id !== "undefined") {
                    mWindow['selector'] = '#wmc-'+modal_id;

                    container.maxZIndex().show().find(mWindow['selector']).maxZIndex().show();
                } else {
                    //mWindow['selector'] = '';
                    container.maxZIndex().show().find(mWindow['selector']).show().siblings().not(mWindow['selector']).hide();
                }

                return mWindow;
            },
            hide: function() {
                container.hide();
            }
        };
    };


    function showTooltip(event) // called on hover
    {
        var tooltipHTML = '';
        element = this;
        if($(element).data('tooltipHTML') ) {
            tooltipHTML = $(element).data('tooltipHTML');
        } else {
            var attrTitle = element.title;
            if( attrTitle ) {
                $(element).data('tooltip', attrTitle);
                //tooltipHTML = prepareTooltipContent(element, attrTitle, element.ttip.tooltipType);
                tooltipHTML = prepareTooltipContent(element);
                $(element).data('tooltipHTML', tooltipHTML);
                element.title = '';
                $(element).bind('mousemove', moveTooltip )
                    .bind('mouseout', hideTooltip );
            }else{
                $(element).unbind('mouseover');
                return;
            }
        }

        // applies for map-tooltips/menus only
        if (element.ttip.tooltipType === 'mapObjects'){
            var classAttribute = $(element).attr("className");
            var classes = classAttribute.split(" ");
            $(element).removeClass(classes[1]);
            $(element).addClass(classes[1]+'_over');
            element.classNameTT = classes[1];
        }

        ttpContainer
            .html('<span class="'+element.ttip.tooltipClass+'" style="margin:0;padding:0;left:0;top:0;">' + tooltipHTML + '</span>')
            .maxZIndex();
        if (ttpContainer.find('.countdown').length > 0) {
            ttpContainer.find('.countdown').countdownClock({format:'short', locale_days:'days'});
        }
        ttpContainer.show();
        TIP_DIM.w = ttpContainer.width();
        TIP_DIM.h = ttpContainer.height();
        Locate(event);
    }
    function moveTooltip(event)
    {
        Locate(event);
    }
    function hideTooltip(event, current)
    {
        if (typeof current === 'undefined') {
            current = $(this).get(0);
        }
        if (current.ttip.tooltipType==='mapObjects') {
            $(this).removeClass(current.classNameTT+'_over');
            $(this).addClass(current.classNameTT);
        }
        ttpContainer.empty().hide();
    }
    function clickObject(event)
    {
        current = this;
        hideTooltip(event, current);
        if (current.ttip.tooltipType === 'mapObjects') {
            $(".cmenu").each(function() {
                $(this).css("visibility", "hidden");
            });
            if (typeof current.tooltipMenu === 'undefined') {
                var menu_content = prepareMenuContent(current.ttip.tooltipNum);
                $(menu_content).appendTo('body');
                current.tooltipMenu = true;
                //console.log($(current).ttip);

                var menu_id = $("#menu_"+current.ttip.tooltipNum);
                $(".utt", menu_id).initTooltip({
                    tooltipType:'avatar',
                    tooltipClass:'utip'
                });

                menu_id.hover(function(e){
                    $("#menu_"+current.ttip.tooltipNum+" tr").hover(function(e){
                        $(this).css('background-color', '#666666');
                    }, function(){
                        $(this).css('background-color', '');
                    });
                }, function(){
                    menu_id.css("visibility", 'hidden');
                });
            } else {
                var menu_id = $("#menu_"+current.ttip.tooltipNum);
            }
            LocateMenu(event,menu_id);
        }

        // context menu (inventory)
        var ctx_menu = $($(current).parent('.ctx_menu').get(0)).attr('rel');
        if(ctx_menu) ctx_menu = ctx_menu.replace(/\[/g,'<').replace(/\]/g,'>');

        if (ctx_menu) {
            if (typeof current.tooltipMenu === 'undefined') {
                //var menu_content = '<table id="menu_'+current.ttip.tooltipNum+'" class="cmenu"><tr><th class="title">'+ctx_menu_array[0]+'</small></th></tr>'+menu_items+'</table>';
                var menu_content = '<div id="menu_'+current.ttip.tooltipNum+'" class="invMenu">'+ctx_menu+'</div>';

                $(menu_content).appendTo('body');
                current.tooltipMenu = true;
                var menu_id = $("#menu_"+current.ttip.tooltipNum);
                //console.log(menu_id);

                $(".utt", menu_id).initTooltip({
                    tooltipType:'avatar',
                    tooltipClass:'utip'
                });

                menu_id.hover(function(e){$("#menu_"+current.ttip.tooltipNum+" tr").hover(function(e){
                        $(this).css('background-color', '#666666');
                    }, function(){
                        $(this).css('background-color', '');
                    });
                    },
                    function(){
                        menu_id.css("visibility", 'hidden');
                    });
            }
            else{
                var menu_id = $("#menu_"+current.ttip.tooltipNum);
            }
            //console.log(event);
            LocateMenu(event,menu_id);
        }

    }
    function prepareMenuContent(el){

        if (typeof MAP === 'undefined') {
            return '';
        }
        var curent_object = MAP.data[el];
        var str = '';
        var str_next = '';
        var rows = '';
        var num_rows = curent_object.length;

        tdnum='';
        if(curent_object[0][0]==='m'){
            if(curent_object[0][1]) var f1 = curent_object[0][1]; else var f1 = '';
            if(curent_object[0][2]) var f2 = '<span class="attack">'+curent_object[0][2]+'</span>'; else var f2 = '';
            if(curent_object[0][6]) var f2 = '<span class="respect">'+curent_object[0][6]+'</span>'; // npcs that have respect do not have attack
            if(curent_object[0][3]) var f3 = '<br/><small>'+curent_object[0][3]+'</small>'; else var f3 = '';
            if(curent_object[0][4]) var f4 = curent_object[0][4]+'.'; else var f4 = '';
            if(MAP.map==='city'){
                if(curent_object[0][5]) var f5 = curent_object[0][5]+'/'; else var f5 = '';
            }else{
                if(curent_object[0][5]) var f5 = curent_object[0][5]+''; else var f5 = '';
            }
            for(k=1;k<num_rows;k++){
                str_next += buildNPCTableRow(curent_object[k],f4,f5);
            }
            str = '<table id="menu_'+el+'" class="cmenu" cellspacing="0" cellpadding="0">';
            str += '<tr><th colspan="'+tdnum+'" class="title">'+f1+' '+f2+' '+f3+'</th></th></tr>';
            str += str_next;
            str += '</table>';
            return str;
        }else{
            if(curent_object[0][1]) var f1 = curent_object[0][1]; else var f1 = '';
            if(curent_object[0][2]) var f2 = '<span class="attack">'+curent_object[0][2]+'</span>'; else var f2 = '';
            if(curent_object[0][3]) var f3 = '<br/><small>'+curent_object[0][3]+'</small>'; else var f3 = '';
            if(curent_object[0][4]) f2 = '<span class="'+curent_object[0][4]+'">'+curent_object[0][2]+'</span>';
            if(curent_object[0][5]==='n' && curent_object[0][3]) f3= curent_object[0][3];
            for(k=1;k<num_rows;k++){
                str_next += buildBuildingTableRow(curent_object[k]);
            }
            str = '<table id="menu_'+el+'" class="cmenu" cellspacing="0" cellpadding="0">';
            str += '<tr><th colspan="3" class="title">'+f1+' '+f2+' '+f3+'</th></th></tr>';
            str += str_next;
            str += '</table>';
            return str;
        }
    }
    function buildNPCTableRow(r, f4, f5) {
        var mmaptype = 'map';
        if (typeof MAP !== 'undefined') {
            mmaptype = (MAP.map === 'city') ? 'city/' : MAP.map;
        }
        var td = '';
        tdnum = 1;
        if (r[2]) { td += '<td><a class="st" href="/'+mmaptype+'/'+f5+f4+r[0]+'?z='+req_id+'">'+r[2]+'</a></td>'; tdnum++; }
        if (r[3]) { td += '<td><a class="ch" href="/'+mmaptype+'/'+f5+f4+r[0]+'?z='+req_id+'">'+r[3]+'</a></td>'; tdnum++; }
        if (r[4]) { td += '<td><a class="rs" href="/'+mmaptype+'/'+f5+f4+r[0]+'?z='+req_id+'">'+r[4]+'</a></td>'; tdnum++; }
        var tr = '<tr>';
        tr += '<th><a href="/'+mmaptype+'/'+f5+f4+r[0]+'?z='+req_id+'">'+r[1]+'</a></th>';
        tr += td;
        tr += '</tr>';
        return tr;
    }
    function buildBuildingTableRow(r){
        var td = '';
        var td2 = '';
        tdnum = 1;
        if (r[2]) var r2 = ' class="'+r[2]+'"'; else var r2='';
        if (r[3]) var r3 = ' onclick=\'return confirm("'+r[3]+'");\''; else var r3='';
        if (r[4]) var r4 = " title='"+r[4].replace(/\#/g,':')+"'"; else var r4='';
        if (r[8]) {
            if(r[7]) var r7 = 'class="'+r[7]+'"'; else var r7='';
            td2 = '<td ><a href="/'+r[0]+'?z='+req_id+'" '+r7+'>'+r[8]+'</a></td>';
        } else {
            tdnum++;
        }
        if (r[6]) {
            if(r[5]) var r5 = 'class="'+r[5]+'"'; else var r5='';
            if(tdnum!==1){ var clsp='colspan="'+tdnum+'"';}else{ var clsp=''; }
            td += '<td '+clsp+'><a href="/'+r[0]+'?z='+req_id+'" '+r5+'>'+r[6]+'</a></td>';
            tdnum=1;
        }else{
            tdnum++;
        }
        if(r[9]) var r9 = 'class="'+r[9]+'"'; else var r9 = '';
        var tr = '<tr>';
        if(tdnum!==1){ var clsp='colspan="'+tdnum+'"';}else{ var clsp=''; }
        tr += '<th '+clsp+' '+r9+'><a href="/'+r[0]+'?z='+req_id+'" '+r2+r3+r4+'>'+r[1]+'</a></th>';
        tr += td + td2;
        tr += '</tr>';
        return tr;
    }
    function prepareTooltipContent(element){
        var str='';
        var ttype = element.ttip.tooltipType;
        var title = $(element).data('tooltip');

        if( !$.isEmptyObject($(element).jsonData())) {
            str = makeJsonTooltip(element, title, ttype);
            return str;
        }
        else if( ttype === 'smarttip') {
            str = title.replace(/\[/g,'<').replace(/\]/g,'>');
            return str;
        }
        else if(ttype === 'avatar') {
            var p = title.split(':');
            str = "<table><tr>";
            if(p[0] === 'u')	{
                var path = StaticServer+'/srv/'+WORLD+'/avt/';
                if(p[2]) str += "<td><img src='"+path+p[2]+".gif' alt='' class='avt'/></td>";

                if(p[7]){
                    str += "<td><b class='"+p[8]+"'>"+p[7]+"</b>&nbsp;<b class='cc"+p[3]+"'> </b> <br/>";
                }else{
                    str += "<td><b class='cc"+p[3]+"'>"+p[1]+"</b><br/>";
                }
                if(p[4]) str += "<b class='respect'>"+p[4]+"</b><br/>";
                if(p[5]) str += "<b class='victory'>"+p[5]+"</b><br/>";
                if(p[6]) str += "<b class='loss'>"+p[6]+"</b>";
                str += "</td>";
            }else{
                var path = StaticServer+'/srv/'+WORLD+'/gavt/';
                if(p[0]!=='g' && p[0]!=='u') str += "<td>"+p[0]+"</td>";
                if(p[1]) str += "<td><img src='"+path+p[1]+".gif' alt='' class='avt'/></td>";
                str += "<td>";
                if(p[2]) str += "<b class='respect'>"+p[2]+"</b><br/>";
                if(p[5] && p[5]!=='') str += "<b class='gang'>"+p[5]+"</b><br/>";
                if(p[3]) str += "<b class='victory'>"+p[3]+"</b><br/>";
                if(p[4]) str += "<b class='loss'>"+p[4]+"</b>";
                str += "</td>";
            }
            str += "</tr></table>";
            return str;
        }
        else if(ttype === 'sms'){
            var p = title.split(';');
            for(i=0; i<p.length; i++){
                var kv = p[i].split(':');
                str += $.trim(kv[0])+" - <b>"+$.trim(kv[1])+"</b><br/>";
            }
            return str;
        }
        else if(ttype === 'mapObjects'){
            var t = title.split(':');
            str = t[0];
            if(parseInt(t[1]))
            {
                var gs = (t[1] < 100)?'galert':(t[1] < 250)?'gwarn':'gok';
                var glife = Math.round(t[1]/10);
                str += "<div class='blife'><div class='gwrap'><div class='ggauge'><div class='"+gs+"' style='width:"+glife+"%'></div></div><em>"+t[1]+"</em></div></div>";
            }
            if(t[2]!==null && typeof t[2] !== "undefined") str += "<div class='top10'>"+t[2]+"</div>";
            return str;
        }
    }
    function Locate(event){
        var d = document.getElementById('tt');
        if(!d) return;
        var pos = mouseXY(event);
        if(DIRECTION === 'rtl'){
            d.style.left = ( pos[0] > TIP_DIM.w +15 )? (pos[0]-CACHED_WINDOW.rx-TIP_DIM.w-15)+'px' : (elPosX = pos[0]-CACHED_WINDOW.rx + 15)+'px';
        }else{
            d.style.left = ( CACHED_WINDOW.w  > (pos[0]+TIP_DIM.w+15) )? pos[0]+15+'px' : (pos[0]-TIP_DIM.w - 15)+'px';
        }
        d.style.top = ( CACHED_WINDOW.h+CACHED_WINDOW.y- CACHED_WINDOW.ry < (pos[1] + 5 + TIP_DIM.h) ) ? (pos[1] + CACHED_WINDOW.ry - TIP_DIM.h-5)+'px' : (pos[1]+CACHED_WINDOW.ry+5)+'px';
    }
    function LocateMenu(event,menu_id){
        var elPosX = 0;
        var elPosY = 0;
        TIP_DIM.w = menu_id.width();
        TIP_DIM.h = menu_id.height();
        var pos = mouseXY(event);
        if( CACHED_WINDOW.h+CACHED_WINDOW.y - CACHED_WINDOW.ry < (pos[1]- CACHED_WINDOW.ry - 10 + TIP_DIM.h) ) elPosY = pos[1] + CACHED_WINDOW.ry - TIP_DIM.h+10; else elPosY = pos[1] + CACHED_WINDOW.ry-10;
        if(DIRECTION==='rtl'){
            if( pos[0] > TIP_DIM.w -10){
                elPosX = pos[0]-CACHED_WINDOW.rx-TIP_DIM.w + 10 ;
            }else{
                elPosX = pos[0]-CACHED_WINDOW.rx - 10;
            }
        }else{
            if( CACHED_WINDOW.w  > (pos[0]+TIP_DIM.w-10)){
                elPosX = pos[0] - 10;
            }else{
                elPosX = pos[0]-TIP_DIM.w+10 ;
            }
        }
        menu_id.css({   left: elPosX,
            top:  elPosY,
            visibility : 'visible'
        });
    }
    function mouseXY(e){
        if(CACHED_WINDOW.ie){
            var x=e.pageX-CACHED_WINDOW.x,y=e.pageY-CACHED_WINDOW.y;
        }else{
            var x=e.pageX,y=e.pageY;
        }
        return [x,y];
    }
    $.fn.doBlink = function () {
        BLINKER = $(this);
        if (BLINKER_STATE === 0) {
            BLINKER_STATE++;
            setTimeout(function () {
                BLINKER.doBlink();
            }, 4000);
        } else {
            if (BLINKER_STATE++%2 === 0) {
                BLINKER.css({opacity:0.01, filter:'alpha(opacity=1)'});
                setTimeout(function () {
                    BLINKER.doBlink();
                }, 200);
            }
            else {
                BLINKER.css({opacity:1,filter:'alpha(opacity=100)'});
                setTimeout(function () {
                    BLINKER.doBlink();
                }, 500); // blinker
            }
        }
    };

    // coins fix, trade market lock fix
    // need jquery cookie library in js/jquery.cookie.js
    $.removeCookie('coin');

    $.fn.DuplicateWindow = function () {
        var localStorageTimeout = (5) * 1000; // 15,000 milliseconds = 15 seconds.
        var localStorageResetInterval = (1/2) * 1000; // 10,000 milliseconds = 10 seconds.
        var localStorageTabKey = 'my-application-browser-tab';
        var sessionStorageGuidKey = 'browser-tab-guid';

        var ItemType = {
            Session: 1,
            Local: 2
        };

        function setCookie(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }
        function getCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        function GetItem(itemtype) {
            var val = "";
            switch (itemtype) {
                case ItemType.Session:
                    val = window.name;
                    break;
                case ItemType.Local:
                    val = decodeURIComponent(getCookie(localStorageTabKey));
                    if (val == undefined)
                        val = "";
                    break;
            }
            return val;
        }

        function SetItem(itemtype, val) {
            switch (itemtype) {
                case ItemType.Session:
                    window.name = val;
                    break;
                case ItemType.Local:
                    setCookie(localStorageTabKey, val);
                    break;
            }
        }

        function createGUID() {
            this.s4 = function () {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            };
            return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
        }

        /**
         * Compare our tab identifier associated with this session (particular tab)
         * with that of one that is in window name Storage (the active one for this browser).
         * This browser tab is good if any of the following are true:
         * 1.  There is no cookie Storage Guid yet (first browser tab).
         * 2.  The window name Storage Guid matches the cookie Guid.  Same tab, refreshed.
         * 3.  The window name Storage timeout period has ended.
         *
         * If our current session is the correct active one, an interval will continue
         * to re-insert the window name Storage value with an updated timestamp.
         *
         * Another thing, that should be done (so you can open a tab within 15 seconds of closing it) would be to do the following (or hook onto an existing onunload method):
         *      window.onunload = () => {
                        localStorage.removeItem(localStorageTabKey);
              };
         */
        function TestIfDuplicate() {
            //console.log("In testTab");
            var sessionGuid = GetItem(ItemType.Session) || createGUID();
            SetItem(ItemType.Session, sessionGuid);

            var val = GetItem(ItemType.Local);
            var tabObj = (val == "" ? null : JSON.parse(val)) || null;
            //console.log(val);
            //console.log(sessionGuid);
            //console.log(tabObj);

            // If no or stale tab object, our session is the winner.  If the guid matches, ours is still the winner
            if (tabObj === null || (tabObj.timestamp < (new Date().getTime() - localStorageTimeout)) || tabObj.guid === sessionGuid) {
                function setTabObj() {
                    //console.log("In setTabObj");
                    var newTabObj = {
                        guid: sessionGuid,
                        timestamp: new Date().getTime()
                    };
                    SetItem(ItemType.Local, JSON.stringify(newTabObj));
                }
                setTabObj();
                setInterval(setTabObj, localStorageResetInterval);//every x interval refresh timestamp in cookie
                return false;
            } else {
                // An active tab is already open that does not match our session guid.
                return true;
            }
        }

        window.IsDuplicate = function () {
            var duplicate = TestIfDuplicate();
            console.log("Is Duplicate: "+ duplicate);
            return duplicate;
        };

        $(window).bind("beforeunload", function () {
            if (TestIfDuplicate() == false) {
                SetItem(ItemType.Local, "");
            }
        })
    }
    $(window).DuplicateWindow();

})(jQuery);

function checkCoinsSubmit(e) {
    var coin = $.cookie('coin', Number);
    if (typeof coin !== 'undefined') {
        e.preventDefault();
        setTimeout(function() {
            $.removeCookie('coin');
        }, 20000);
    } else {
        $.cookie('coin', 1, { expires: 7, path: '/', domain: Conf.cookieDomain});
    }
};

function attachTradeAddToOffer() {
    if (0) { alert('attachTradeAddToOffer'); }
    var tradeAddToOffer = $('form#tradeAddToOffer');
    if (tradeAddToOffer.length > 0) {
        if (0) { alert('attachTradeAddToOffer'); }
        tradeAddToOffer.unbind('submit').bind('submit', checkCoinsSubmit);
    }
}

function attachMarketAddSale() {
    if (0) { alert('attachMarketAddSale'); }
    var marketAddSale = $('form#marketAddSale');
    if (marketAddSale.length > 0) {
        if (0) { alert('attachMarketAddSale'); }
        marketAddSale.unbind('submit').bind('submit', checkCoinsSubmit);
    }
};

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length ; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function createCookie(name,value,days)
{
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; domain="+COOKIE_DOMAIN+"; path=/";
    //if(GID==105) alert(name+"="+value+expires+"; path=/");
    //console.log("createCookie " + name+"="+value+expires+"; domain="+COOKIE_DOMAIN+"; path=/");
}
function onDocClick(e)
{
    //if(GID==105) alert('click!');
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY) {
        posx = e.clientX + CACHED_WINDOW.x;
        posy = e.clientY + CACHED_WINDOW.y;
    }
    var cc = Math.floor(posy*10000 + posx*1.0);
    createCookie('clickcoords',posy*10000 + posx);
}

function mapInit()
{
    $('a[class^=spot]','#map').initTooltip({
        tooltipType:'mapObjects',
        tooltipClass:''
    });
}

function smarttipInit(area)
{
    if (area === null) {
        area = "#bg-wall";
    }

    $(".smarttip", area).initTooltip({
        tooltipType:'smarttip',
        tooltipClass:'stip'
    });
}

function jsonInit(area)
{
    if (area === null) {
        area = "#bg-wall";
    }

    $(".json",area).jsonInit();
}
function buyExtraInit() {
    $('.buy_extra').click(function() {
        $.modal().show('extra').prepare($(this));
    });
}
function avatarInit(area)
{
    if (area === null) {
        area = "#bg-wall";
    }

    $("a.nad",area).initTooltip({
        tooltipType:'avatar',
        tooltipClass:'utip'
    });
    $("a.gang",area).initTooltip({
        tooltipType:'avatar',
        tooltipClass:'utip'
    });
    $("a.utt",area).initTooltip({
        tooltipType:'avatar',
        tooltipClass:'utip'
    });
}
function formatsmsInit()
{
    $(".sms",'#bg-wall').initTooltip({
        tooltipType:'sms',
        tooltipClass:'utip'
    });
}

$(document).ready(function() {
    if ($().jScrollPane) {
        $('.scroll-pane').jScrollPane({
            showArrows: true,
            maintainPosition:true,
            verticalGutter: 0,
            horizontalGutter: 0
        });
    }

    $('<div id="tt" class="tooltip" style="display:none;"></div>').appendTo('body');
    refreshCachedWindow();
    // tooltip
    mapInit();
    smarttipInit();
    jsonInit();
    buyExtraInit();
    avatarInit();
    formatsmsInit();
    //tablecellInit();
    //itemInit();
    // blinker
    $('#blinker').doBlink();
    ModalWindowInit();

    createCookie('clickcoords',0);
    $(document).click( function(e) {
        onDocClick(e);
    });

    setTimeout(function(){ $('#flid').css({'display':'inline'}); }, 30);
    $(document).find('.cbxmain').click(function(){
        var checked = $(this).attr("checked");
        var arr_name = this.name.replace('[all]', '[]');
        tmp = $(this).parents('table:first').find('input[type=checkbox][name^='+arr_name+']').attr({"checked":checked});
    });
    $(".customselect").show().selectbox();
    if(typeof(NO_COUNTER) === 'undefined') {
        if(typeof(COUNTER_UID)!=='undefined') {
            if(COUNTER_UID!=='') {
                var gaJsHost = (("https:" === document.location.protocol) ? "https://ssl." : "http://www.");
                //Load script
                jQuery.getScript(gaJsHost + "google-analytics.com/ga.js", function () {
                    try {
                        var pageTracker = _gat._getTracker(COUNTER_UID);//"UA-9110286-1"
                        pageTracker._trackPageview();
                    }
                    catch(err){}
                });
            }
        }
    }
    $(".marketWr a").click(function(e){
        $('.marketWr a').removeClass("selected");
        var cname = "#" + $(this).attr("class");
        $('#marketTable').html($(cname).html());
        $(cname).show();
        $(this).addClass("selected");
    });
    /* read qmsg */
    function bind_msg_click()
    {
        $('.qmsgo').each(function(i,n){
            $(n).click(function () {
                var mid = $(this).attr('mid');
                $.ajax({
                    type: "GET",
                    //url: "http://" + location.host + "/qmsg/markoneread?mid=" + mid,
                    url: window.location.protocol + '//' + location.host + "/qmsg/markoneread?mid=" + mid,
                    success: function(html){
                        //alert( html );
                        $('.quick-msg').children().remove();
                        $('.quick-msg').append(html);
                        bind_msg_click();
                    }
                });
            });
        });
    }
    bind_msg_click();

    /* poll answer */
    /*
    function bind_poll_click()
    {
        // bind the click event just once
        $('.polla').one('click', function () {
        var pid = $(this).attr('pid');
        var oid = $(this).attr('oid');
        $.ajax({
            type: "GET",
            url: "http://" + location.host + "/poll/vote/" + pid + "/" + oid + "/poll?z=" + req_id,
            success: function (html) {
            $('#poll').fadeOut(300, function () {
                $('#poll').html(html);
                $('#poll').fadeIn('slow', function() {
                bind_poll_click();

                $('.smarttip', '#poll').initTooltip({
                    tooltipType: 'smarttip',
                    tooltipClass: 'stip'
                });
                });
            });
            }
         });
        });
    }

    bind_poll_click();
    */
});
$(window).resize(function() {
    refreshCachedWindow();
});
$(window).scroll(function() {
    refreshCachedWindow();
});
function refreshCachedWindow(){
    // get cached document properties
    if ($.browser.msie) CACHED_WINDOW.ie = true;
    if (CACHED_WINDOW.ie) {
        CACHED_WINDOW.x = $(window).scrollLeft(),
            CACHED_WINDOW.y = $(window).scrollTop(),
            CACHED_WINDOW.w = $(window).width(),
            CACHED_WINDOW.h = $(window).height(),
            CACHED_WINDOW.rx = $(document).width() - CACHED_WINDOW.w - CACHED_WINDOW.x -20	,
            CACHED_WINDOW.ry = CACHED_WINDOW.y;
    } else {
        CACHED_WINDOW.x = $(window).scrollLeft(),
            CACHED_WINDOW.y = $(window).scrollTop(),
            CACHED_WINDOW.w = $(window).width(),
            CACHED_WINDOW.h = $(window).height(),
            CACHED_WINDOW.rx = 0,
            CACHED_WINDOW.ry = 0;
    }
}
var CACHED_WINDOW = {
    // cached window properties
    w : 0,
    h : 0,
    x : 0,
    y : 0,
    rx : 0,
    ry : 0,
    ie: false
};
//GOOGLE TRANSLATION
function translateText(text, to_lang, callback, obj)
{
    if (text.length > 0 && to_lang.length > 0) {
        google.language.detect(text, function (result) {
            if (!result.error) {
                lang = result.language;
                google.language.translate(text, lang, to_lang, function(result) {
                    if(result.translation) {
                        if (typeof callback === "function") {
                            callback.call(null, result.translation, lang, to_lang, obj);
                        }
                    }
                });
            }
        });
    }
}

function showPromoHint(hintText)
{
    if (hintText.length > 0) {
        $('div#hint-container').append("<div class='promo-hint-container'><div id='promo-hint' class='promo-hint'>" + hintText + "</div></div>");
        $('#promo-hint').toggle();
    }
}

function openWindow(url, setArr)
{
    if (!setArr || typeof setArr === 'undefined') {
        setArr = ['menubar=no', 'resizable=no', 'width=382', 'height=465', 'status=no', 'toolbar=no'];
    }

    var date = new Date();
    var windowName = 'wnd_'+date.getTime();

    var wndHandle = window.open(url, windowName, setArr.join(', '));
    return wndHandle;
}

try{document.execCommand("BackgroundImageCache", false, true);}catch(e){}
/* all */
function checkall(form_id, checkall_id, checkbox_array_name){
    if (!document.getElementById) return;
    var frm = document.getElementById(form_id);
    var checkall = document.getElementById(checkall_id);
    if (!(frm && checkall)) return;
    for (var i=0; i<frm.elements.length; i++) {
        var cbx = frm.elements[i];
        if(cbx.name === checkbox_array_name) cbx.checked = checkall.checked;
    }
}
/* msg.mod.php */
function set_recp(name){
    if (name) {
        var s = document.getElementById(name);
        var d = document.getElementById('recp');
        if(s && d) d.value = s.value;
    }
    var s1 = document.getElementById('friends');
    if (s1) s1.value='';
    var s2 = document.getElementById('strangers');
    if (s2) s2.value='';
}
/* base.tpl.php */
function toggleid(id){
    var e = document.getElementById(id);
    if (e) {
        if(e.style.display === 'block') e.style.display = 'none';
        else e.style.display = 'block';
    }
}
function showid(id){
    var e = document.getElementById(id);
    if (e) e.style.display = 'block';
}
function hideid(id){
    var e = document.getElementById(id);
    if (e) e.style.display = 'none';
}
function nextid(current_id, next_id){
    hideid(current_id);
    showid(next_id);
    return false;
}
/* chat.mod.php */
function toggleChatScroll () {
    if (typeof MafiaChat !== "undefined") {
        // return MafiaChat.toggleChatScroll();
    }
    // old depricated
    var e = document.getElementById("chat-messages");
    if (e) {
        if (e.className === "chat-messages") {
            e.className = "chat-messages-scroll";
        } else {
            e.className = "chat-messages";
        }
    }
    return false;
}
function refreshChat() {
    var cr = document.getElementById('chat_refresher');
    cr.submit();
    setTimeout('refreshChat()', 10000);
}
function onBeforeSendMessage(){
    var _msg = document.getElementById('_msg');
    var msg = document.getElementById('msg');
    if(!_msg || !msg) return;
    msg.value = _msg.value;
    _msg.value = '';
    setTimeout('focusById("_msg")',150);
    return true;
}
function focusById(id){
    var e = document.getElementById(id);
    if (e) {
        if(e.focus) e.focus();
        else if(e.setActive) e.setActive();
    }
}
function onGoToPage(){
    var pnum = document.getElementById('pnum');
    var linktpl = document.getElementById('linktpl');
    if (pnum) {
        var page = parseInt(pnum.value);
        if(page === NaN || page<0) page=1;
        arr = linktpl.value.split('%p');
        document.location.href = arr.join(page);
    }
    return false;
}

function onBeforeSearch(new_search) {
    var stype = document.getElementById('search[type]');
    var bprice = document.getElementById('search[b_price]');
    var tprice = document.getElementById('search[t_price]');
    var item_type = document.getElementById('item_type');
    var item = item_type.value;
    var gotopagefrm = document.getElementById('gotopage');
    if (stype || bprice || tprice) {
        var stype = parseInt(stype.value);
        var bprice = parseInt(bprice.value);
        var tprice = parseInt(tprice.value);
        if (stype === NaN || stype<0) stype=0.0;
        if (bprice === NaN || bprice<0) bprice=0.0;
        if (tprice === NaN || tprice<0) tprice=0.0;
        var args = gotopagefrm.value.split('/');
        args[3]=stype+','+bprice+','+tprice;
        if (new_search) {
            args[4] = 0;
            result = false;
        } else {
            result = true;
        }
        document.location.href = args[0] + "/" + args[1] + "/" + args[2] + "/" + item + "/" + args[3] + "/" + args[4];
    }
    return result;
}
// Common functions
var _BROWSER = 0; // Unknown browser
var _IE = 2;
var _MOZILLA = 3;
var _OPERA = 3;

function checkBrowser(string) {
    var detect = navigator.userAgent.toLowerCase();
    place = detect.indexOf(string) + 1;
    return place;
}
if (checkBrowser('msie')) _BROWSER=_IE;
else if(checkBrowser('opera')) _BROWSER=_OPERA;
//else if(checkBrowser('msie')) _BROWSER=_OPERA;

function random_int(min, max){
    var range = max-min+1;
    return (Math.floor( Math.random()*Math.pow(10,("" + range).length)) % range) + parseInt(min);
}
function toggle_display(id){
    var e = document.getElementById(id);
    if(e) e.style.display = (e.style.display === '' || e.style.display === ' ' || e.style.display === 'none') ? 'block' : 'none';
    return false;
}
function hide_msg_box(id){
    var e = document.getElementById(id);
    if(e) e.style.display = (e.style.display === '' || e.style.display === ' ' || e.style.display === 'block') ? 'none' : 'block';
    return false;
}

function confirmMove() {
    var msg_form = document.getElementById('msg');
    if(!msg_form) return false;
    else msg_form.action = '?q=msg/move/inbox';
    return true;
}

function secureConfirm(msg,secure_text) {
    var default_text='';
    var ret = window.prompt(msg,default_text);
    if (ret) {
        secure_text = secure_text.toLowerCase();
        ret = ret.toLowerCase();

        if (ret === 'OK') ret = 'ok';
        if (secure_text === 'OK') secure_text = 'ok';
        // console.log('ret '+ret);
        // console.log('secure_text '+secure_text);
        return (ret===secure_text);
    }
    else {
        return false;
    }
}

function replacesel(oTextbox, sText) {
    var isOpera = navigator.userAgent.indexOf("Opera") > -1;
    var isIE = navigator.userAgent.indexOf("MSIE") > 1 && !isOpera;
    var isMoz = navigator.userAgent.indexOf("Mozilla/5.") === 0 && !isOpera;

    oTextbox = document.getElementById(oTextbox);
    if(!oTextbox) return;

    oTextbox.focus();
    if (isIE) {
        var oRange = document.selection.createRange();
        oRange.text = sText;
        oRange.collapse(true);
        oRange.select();
    }
    else //if (isMoz)
    {
        var iStart = oTextbox.selectionStart;
        oTextbox.value = oTextbox.value.substring(0, iStart) + sText + oTextbox.value.substring(oTextbox.selectionEnd, oTextbox.value.length);
        oTextbox.setSelectionRange(iStart + sText.length, iStart + sText.length);
    }
    oTextbox.focus();
}

function copyValById(from, to) {
    var el_from = document.getElementById(from);
    var el_to = document.getElementById(to);
    if(el_from && el_to)
        el_to.value = el_from.value;
}

function setRadioByIdIfVal(id,editbox_id){
    var editbox = document.getElementById(editbox_id);
    if (editbox)
        if (editbox.value+0 !== 0)
            setRadioById(id);
}

function setRadioById(id){
    var radio = document.getElementById(id);
    if(radio) radio.checked=1;
}

/* Shows/hides particular html element that corresponds to a radio control */
var _LAST_CLICKED_RADIO = null;
var _LAST_CLICKED_RADIO_BOX = null;
function ShowIfRadio(radio_id,element_id){
    var radio = document.getElementById(radio_id);
    var element = document.getElementById(element_id);

    if (_LAST_CLICKED_RADIO && _LAST_CLICKED_RADIO_BOX) {
        _ShowIfRadio(_LAST_CLICKED_RADIO,_LAST_CLICKED_RADIO_BOX);
    }

    if (_ShowIfRadio(radio,element)) {
        _LAST_CLICKED_RADIO = radio;
        _LAST_CLICKED_RADIO_BOX = element;
    }
}

function _ShowIfRadio(radio,element) {
    if (radio && element) {
        if (radio.checked === 1 || radio.checked === true) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
        return true;
    }
    return false;
}

function trim(s){
    var l=0; var r=s.length -1;
    while(l < s.length && s[l] === ' ') {	l++; }
    while(r > l && s[r] === ' ') {	r-=1;	}
    return s.substring(l, r+1);
}
//Expand/Collapse help bar
function toggle_help(expand){
    var help_short = $('div.help-short');
    var help_long = $('div.help-long');
    if (expand === 0) {
        help_short.css('display','block');
        help_long.css('display','none');
    } else {
        help_short.css('display','none');
        help_long.css('display','block');
    }
    return false;
}
//Expand/Collapse extra box
function toggle_extra(expand, extra){
    var button_expand = $('#'+extra+'-expand');
    var button_hide = $('#'+extra+'-hide');
    var box = $('tr.'+extra+'-box');
    if (expand === 0) {
        button_expand.css('display','block');
        button_hide.css('display', 'none');
        box.css('display','none');
    } else {
        button_expand.css('display','none');
        button_hide.css('display', 'block');
        box.css('display','table-row');
    }
    return false;
}
// countdown clock
var clocks = new Array(),
    clocksCount = 0,
    clockIntervalHandle = null,
    TIME_CLIENT=Math.ceil(new Date().getTime()/1000);

//-------------------------------------------------------------------------------------------------
;(function(jQuery){
    jQuery.fn.extend({
        csets : {
            format: 'short',
            locale_days: 'days'
        },
        cClockInit: function (settings) {
            $(this).csets = $.extend($(this).csets, settings);
            var setTimeout = false;
            var curTime = Math.ceil(new Date().getTime() / 1000);
            var refresh = settings["refresh"];
            localStorage.setItem("cref", refresh);
            $(this).each(function () {
                var self = this;
                if (!($(this).data('clockSet') === true)) {
                    if (setTimeout === false && clockIntervalHandle === null) {
                        setTimeout = true;
                    }
                    $(this).data('clockSet',true);

                    //Set the Daytime to work with
                    self.display = $(this);
                    var rel_attr = $(this).attr('rel');
                    var rel_attr_arr = rel_attr.split(',');
                    if (rel_attr_arr[1]>0) {
                        self.period = rel_attr_arr[0]*1.0;
                        self.targetTime = rel_attr_arr[1]*1.0;
                    } else {
                        self.period = rel_attr_arr[1]*1.0;
                        self.targetTime = TIME+parseInt(rel_attr_arr[0]);
                    }
                    self.timeDrift = self.serverStartTime - self.startTime;
                    if (self.targetTime > curTime) {
                        $(this).html($.formatTime((self.targetTime - TIME)));
                    } else {
                        $(this).html('00:00:00');
                        if(refresh == "1") {
                            window.location.reload();
                        }
                    }
                    clocks[clocksCount] = this;
                    clocksCount++;
                }
            });
            //ъпдейтва часовниците (ай ся дай ся)
            if (setTimeout === true) {
                // old clockIntervalHandle=window.setTimeout($(this).clockWatcher, 500);
                clockIntervalHandle=window.setTimeout($(this).clockWatcher(), 1000);
            }
        },
        clockWatcher : function () {
            var curTime = Math.ceil(new Date().getTime() / 1000);
            var refresh = localStorage.getItem("cref");
            var stopInterval = true;
            for (var i = 0; i < clocksCount; ++i) {
                // console.log('_tick');
                // Този часовник е спрян
                var clock = clocks[i];
                if (!clock) continue;

                if (clock.targetTime > 0) {
                    clock.remainingTime = (clock.targetTime - TIME) - (curTime - TIME_CLIENT);
                }

                //console.log("a"+refresh);
                //make sure success hasn't been reached
                if (clock.remainingTime < 0) {
                    //спирам да го ъпдейтвам тоя часовник
                    clocks[i] = null;
                    //и последно 10 - всичко става нули
                    clock.display.html('00:00:00');

                    clock.display.trigger('countDownFinished', clock);
                    if(refresh == "1") {
                        window.location.reload();
                    }
                }
                else {
                    // дай новите стойности
                    var seconds = clock.remainingTime;
                    // console.log(seconds);
                    var day = (Math.floor(seconds/86400));
                    var hrs = (Math.floor(seconds/3600))%24;
                    var min = (Math.floor(seconds/60))%60;
                    var sec = (Math.floor(seconds/1))%60;

                    // Малко нулички
                    hrs = (hrs+'').length<2?'0'+hrs:hrs;
                    min = (min+'').length<2?'0'+min:min;
                    sec = (sec+'').length<2?'0'+sec:sec;

                    // console.log(jQuery(this).csets.format);
                    // ъпдейт на часовника
                    var days = '';
                    if (day > 0) days = day+' '+$(this).csets.locale_days+' ';
                    clock.display.html(days+hrs+':'+min+':'+sec);

                    // след малко пак ще ъпдейтвам
                    stopInterval = false;
                }
            }
            // old if (!stopInterval) clockIntervalHandle = window.setTimeout($(this).clockWatcher, 500);
            if (!stopInterval) clockIntervalHandle = window.setTimeout($(this).clockWatcher, 1000);
            //else console.log('Stop machines!');
        }
    });

    jQuery.formatTime = function (timestamp) {
        var seconds = timestamp;
        // console.log(seconds);
        var day = (Math.floor(seconds/86400));
        var hrs = (Math.floor(seconds/3600))%24;
        var min = (Math.floor(seconds/60))%60;
        var sec = (Math.floor(seconds/1))%60;

        // Малко нулички
        hrs = (hrs+'').length<2?'0'+hrs:hrs;
        min = (min+'').length<2?'0'+min:min;
        sec = (sec+'').length<2?'0'+sec:sec;

        // console.log(jQuery(this).csets.format);
        // ъпдейт на часовника
        var days='';
        if (day > 0) days = day+' '+LOCALE_DAYS_CAPTION+' ';
        return days+hrs+':'+min+':'+sec;
    };

    //Init
    jQuery.fn.countdownClock = jQuery.fn.cClockInit;

})(jQuery);

//-------------------------------------------------------------------------------------------------
//liveNumbers
var numbers = new Array(),
    numbersCount = 0,
    numbersIntervalHandle = null;
;(function(jQuery)
{
    jQuery.fn.extend(
        {
            // <span class='whatever' rel='10,20,3600'>10</span>
            // each hour the initial value of 10 goes up by 20
            liveNumberInit: function(settings)
            {
                jQuery(this).each(function()
                {
                    var self = this;
                    //Set the Daytime to work with
                    self.settings = settings;
                    self.display = jQuery(this);
                    var rel_attr = jQuery(this).attr('rel');
                    var rel_attr_arr = rel_attr.split(',');
                    self.startNumber = rel_attr_arr[0]*1.0;
                    self.precision = Math.floor(rel_attr_arr[1]*1.0);
                    self.delta = rel_attr_arr[2]*1.0;
                    self.period = rel_attr_arr[3]*1.0;
                    self.ttl = Math.floor(rel_attr_arr[4]*1.0);
                    self.max = rel_attr_arr[5]*1.0;

                    self.startTime = new Date().valueOf();
                    self.serverStartTime = TIME;
                    self.timeDrift = self.serverStartTime - self.startTime;
                    numbers[numbersCount] = this;
                    numbersCount++;
                });
                //ъпдейтва часовниците (ай ся дай ся)
                window.setTimeout(jQuery(this).liveNumberWatcher, 500);
            },
            liveNumberWatcher : function()
            {
                var curTime = new Date().valueOf();

                var stopInterval = true;
                var total = 0;
                for(var i=0; i<numbersCount; ++i)
                {
                    //console.log('_tick');
                    //Този часовник е спрян
                    var clock = numbers[i];
                    if(!clock) continue;

                    var passedTime = Math.floor((curTime-clock.startTime)/1000); // в sec
                    var newNumber = clock.startNumber + passedTime * clock.delta/clock.period;

                    if ((clock.max > 0) && (clock.max <= newNumber)) {
                        total += Math.floor(clock.max);
                        continue;
                    }
                    else if(passedTime > clock.ttl) {
                        //make sure success hasn't been reached
                        newNumber = clock.startNumber + clock.ttl * clock.delta/clock.period;
                        //total += newNumber.toFixed(clock.precision)*1.0;
                        total += Math.floor(newNumber);
                        //numbers[i] = null; //спирам да го ъпдейтвам тоя часовник
                    }
                    else if(newNumber < 0) {
                        //numbers[i] = null; //спирам да го ъпдейтвам тоя часовник
                        clock.display.html('0'); //и последно 10 - всичко става нули
                    }
                    else {
                        clock.display.html(Math.floor(newNumber));
                        total += Math.floor(newNumber);
                        stopInterval = false; //след малко пак ще ъпдейтвам
                    }
                }

                $("#"+clock.settings.sumId).html(Math.floor(total));
                if(!stopInterval) window.setTimeout(jQuery(this).liveNumberWatcher, 5000);
                //else console.log('Stop machines!');
            }
        });

    //Init
    jQuery.fn.liveNumber = jQuery.fn.liveNumberInit;

})(jQuery);


/* xs terms iframe - login page */

$(document).ready(function() {
    $('#more_terms_link').click(function(e) {
        $('<div id="boxes"><div id="termsdialog" class="window"><table width="100%" border="0" cellspacing="0" cellpadding="15"><tr><td class="l"><h2 id="termsdialog_title"></h2></td><td class="r"><a href="#" id="termsclose" class="exit-btn close"/></a></td></tr></table><iframe width="950" style="margin:0 10px;" height="550" frameborder="0" scrolling="no" id="termsdialog_content"></iframe></div><div id="mask"></div></div>').appendTo('body');
        // alert('aaa');
        //Cancel the link behavior
        e.preventDefault();
        //Get the A tag
        var hrf = $(this).attr('href');
        var title = $(this).attr('title');

        //Get the screen height and width
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();

        //Set heigth and width to mask to fill up the whole screen
        $('#mask').css({'width':maskWidth,'height':maskHeight});

        //transition effect
        $('#mask').show();
        $('#mask').fadeTo("slow",0.8);

        //Get the window height and width
        var winH = $(window).height();
        var winW = $(window).width();

        var modalWidth = $('#termsdialog').width();
        var modalHeight = $('#termsdialog').height();


        //Set the popup window to center
        $('#termsdialog').css('top',  130);
        $('#termsdialog').css('left', winW/2-$('#termsdialog').width()/2);

        // load content
        $('#termsdialog').show();
        $("#termsdialog_content").attr('src',hrf);
        $('#termsdialog_title').html(title);
        $('#termsdialog')
            .bind('dragstart',function( event ){
                return $(event.target).is(' table tr:first');
            })
            .bind('drag',function( event ){
                $( this ).css({
                    top: event.offsetY,
                    left: event.offsetX
                });
            });
        //if close button is clicked
        $('#termsclose').click(function (e) {
            //Cancel the link behavior
            $('#mask').hide();
            $('.window').hide();
            return false;
        });

        //if mask is clicked
        $('#mask').click(function () {
            $(this).hide();
            $('.window').hide();
            return false;
        });

        return false;
    });

    /*if (WORLD == 'bg.4' || WORLD == 'lv2.1')
    {
        $('#bg-wall').find('.bgwrapper:first').click(function(evt) {
            if (evt.target == this)
            {
                window.open('http://www.duel.bg/?aff_id=3', '_blank');
            }
        });
    }*/

});

/* valid mail popup */
$(document).ready(function() {
    var $emailInput = $('#login-content #uemail');
    var $emailPopup = $('#login-content .mbody_absolute.valid_mail_popup');

    $emailInput.focus(function() {
        $emailPopup.css('visibility', 'visible');
    });

    $emailInput.blur(function() {
        $emailPopup.css('visibility', 'hidden');
    });
});

function ModalWindowInit()
{
    showModalWindow();
}

function showModalWindow(modal_id, faction = false)
{
    if(faction == true) {
        var type = 'faction';
    } else {
        var type = 'custom';
    }
    if (typeof modal_id === 'undefined') {
        var modal_set = $('.window-modal:not([id]^=wmc-)');
    } else {
        var modal_set = $('#wmc-'+modal_id);
        //console.log(modal_id);
        //console.log(modal_set);
    }
    if (modal_set.length > 0) {
        //console.log(modal_set);
        $.modal().show(type, modal_id).prepare();
        jsonInit(modal_set); // init tooltips in modal window
        smarttipInit(modal_set);
        avatarInit(modal_set);
    }
    return modal_set;
}

function ajaxRefreshCredits()
{
    var action = '/payments/refresh-credits';
    var amountContainer = $('span[class=credit-info-new]').find('b');
    var current = parseInt(amountContainer.html());
    var params = {
        'current': current
    };
    $.post(action, params, function(data){
        if( data.do_refresh ) {
            amountContainer.fadeOut(400, function(){ $(this).html(data.new_amount);}).fadeIn(400).fadeOut(200).fadeIn(200);
        }
    }, 'json');
}


function makeJsonTooltip(element)
{
    var obj = $(element).data('jsonData') || null;
    if(obj.tooltip === 'item') {
        return makeJsonTooltipItem(obj);
    }
    else if (obj.tooltip === 'smarttip') {
        return obj.bbcode.replace(/\[/g,'<').replace(/\]/g,'>');
    }
}

function makeJsonTooltipItem(obj)
{
    var i = 0;
    var stats = [];
    stats[i++] = "<b class='"+obj.classs+"'>"+obj.name+"</b>";

    var img_overlay = '';
    var img = "<img src='"+StaticServer+"/srv/"+WORLD+"/item/"+obj.type_id+".jpg' class='item' style='width:100px;height:100px;'/>";

    if (obj.stamina) stats[i++] = obj.stamina_txt+": <span class='stamina'>"+obj.stamina+"</span>";
    if (obj.life) stats[i++] = obj.life_txt+": <span class='life'>"+obj.life+"</span>";
    if (obj.toxicity) stats[i++] = obj.toxicity_txt+": <span class='toxic'>"+obj.toxicity+"</span>";
    if (obj.sexapeal) stats[i++] = obj.sexapeal_txt+": <span class='sexapeal'>"+obj.sexapeal+"</span>";

    if (obj.health) stats[i++] = obj.health_txt+": <span class='stat_health'>"+no2str(obj.health)+"</span>";
    if (obj.power) stats[i++] = obj.power_txt+": <span class='stat_power'>"+no2str(obj.power)+"</span>";
    if (obj.agility) stats[i++] = obj.agility_txt+": <span class='stat_agility'>"+no2str(obj.agility)+"</span>";
    if (obj.caution) stats[i++] = obj.caution_txt+": <span class='stat_caution'>"+no2str(obj.caution)+"</span>";
    if (obj.reflex) stats[i++] = obj.reflex_txt+": <span class='stat_reflex'>"+no2str(obj.reflex)+"</span>";
    if (obj.block) stats[i++] = obj.block_txt+": <span class='stat_block'>"+no2str(obj.block)+"</span>";

    if (isset(obj.top_attack) && obj.top_attack > 0) {
        if (obj.attack) stats[i++] = obj.attack_txt+": <span class='attack'>"+no2str(obj.attack)+"</span> ~ <span class='attack'>"+no2str(obj.top_attack)+"</span>";
    } else {
        if (obj.attack) stats[i++] = obj.attack_txt+": <span class='attack'>"+no2str(obj.attack)+"</span>";
    }

    if (obj.attackp) stats[i++] = obj.attack_txt+": <span class='attack'>+"+(obj.attackp)+"%</span>";
    if (obj.uniq_desc) stats[i++] = "<span class='levelup'>"+obj.uniq_desc+"</span>";
    if (obj.time) stats[i++] = obj.time_txt+": <span class='time'>"+$.formatTime(obj.time)+"</span>";
    //if(!isNaN(obj.upgrade)) {
    if (isset(obj.upgrade)) {
        stats[i++] = obj.upgrade_txt+": <span class='respect'>"+obj.upgrade+"/"+obj.max_upgrade+"</span>";
        if (obj.classs.indexOf("v29") > 0 ) {
            img_overlay = "<div class='inmb'><span class='star_big'>"+obj.upgrade+" </span></div>";
        } else {
            img_overlay = "<div class='iupl iupl_"+obj.upgrade+"'></div>";
        }
    }
    if (obj.stackable === '1') {
        var quantity_val = 0;
        if (isFinite(obj.quantity_available)) {
            quantity_val = no2str(obj.quantity_available)+'/'+no2str(obj.quantity);
        } else {
            quantity_val = no2str(obj.quantity);
        }
        stats[i++] = obj.quantity_txt+": <span class='"+obj.classs+"'>"+quantity_val+"</span>";
        if (obj.qtyred === '1') {
            img_overlay = "<div class='inmb bgred'>"+quantity_val+"</div>";
        } else {
            img_overlay = "<div class='inmb'>"+quantity_val+"</div>";
        }
    }

    if (!isNaN(obj.remaining)) {
        stats[i++] = obj.remaining_txt+": <span class='"+obj.classs+"'>"+obj.remaining+"</span>";
    }

    if (isFinite(obj.next_available)) {
        stats[i++] = obj.next_available_txt+": <span class='time countdown' rel='"+obj.next_available+",-1'>"+$.formatTime(obj.next_available)+"</span>";
    }
    if (!isNaN(obj.required_level)) {
        var reqlvlclass = (obj.required_level_ok>0)?'':'red';
        stats[i++] = "<span class='"+reqlvlclass+"'>"+obj.required_level_txt+": <span class='level'>"+obj.required_level+"</span></span>";
    }
    if (!isNaN(obj.bonus_type)) {
        if(obj.bonus_disabled) {
            stats[i++] = "<span style='color: red;'>"+obj.bonus_title+": <span class='difc' style='color: yellowgreen;text-decoration: line-through;text-decoration-color: red;'>"+obj.bonus_txt+"</span></span>";
        } else {
            stats[i++] = "<span>"+obj.bonus_title+": <span class='difc' style='color: yellowgreen;'>"+obj.bonus_txt+"</span></span>";
        }
    }
    if (obj.info) {
        stats[i++] = "<span class='itip'>"+obj.info+"</span>";
    }

    if (obj.sell_cash || obj.sell_credits) {
        var price = '';
        if (obj.sell_credits) price += "<span class='cred'>"+no2str(obj.sell_credits)+"</span> ";
        if (obj.sell_cash) price += "<span class='cash'>"+no2str(obj.sell_cash)+"</span> ";
        //if(obj.sell_connections) price += "<span class='connections'>"+no2str(obj.sell_connections)+"</span> ";
        stats[i++] = obj.sell_txt+": "+price;
    }
    if (obj.buy_old_cash || obj.buy_old_credits) {
        var price = '';
        if(obj.buy_old_credits) price += "<span class='cred'>"+no2str(obj.buy_old_credits)+"</span> ";
        if(obj.buy_old_cash) {
            if ((obj.buy_old_cash % 1) === 0) {
                buy_old_cash = no2str(obj.buy_old_cash);
            } else {
                buy_old_cash = obj.buy_old_cash;
            }
            price += "<span class='cash'>"+buy_old_cash+"</span> ";
        }
        stats[i++] = "<span class='strike'>"+obj.buy_old_txt+": "+price+"</span>";
        img_overlay += "<div class='ipercent-sticker'><div class='ipercent'>-"+obj.promo_percent+"&#37;</div></div>";
        //img_overlay += "<div class='ipercent'>-"+obj.promo_percent+"&#37;</div>";
    }
    if (obj.buy_cash || obj.buy_credits || obj.buy_connections) {
        var price = '';
        if(obj.buy_credits) price += "<span class='cred'>"+no2str(obj.buy_credits)+"</span> ";
        if(obj.buy_connections && obj.buy_connections>0) price += "<span class='connections'>"+no2str(obj.buy_connections)+"</span> ";
        if(obj.buy_cash) {
            if ((obj.buy_cash % 1) === 0) {
                buy_cash = no2str(obj.buy_cash);
            } else {
                buy_cash = obj.buy_cash;
            }
            price += "<span class='cash'>"+buy_cash+"</span> ";
        }
        stats[i++] = obj.buy_txt+": "+price;
    }

    if (parseInt(obj.group_id) === 21 && obj.item_upgrade) {
        img = "<img src='"+StaticServer+"/srv/"+WORLD+"/item/"+obj.type_id+"-"+obj.item_upgrade+".jpg' class='item' style='width:100px;height:100px;'/>";
    }

    if (typeof obj.image_override !== 'undefined' && obj.image_override.length > 0) {
        img = "<img src='"+StaticServer+"/"+obj.image_override+"' class='item' style='width:100px;height:100px;'/>";
    }

    if (obj.qtyred === '1') {
        stats[i++] = '<div><span>' + obj.qtyredmsg + '</span></div>';
    }

    // buy_credits + buy_cash
    // sell_cash

    /*
    if(in_array($item_group_id, array(CAR,DOG,GUN,UNIQ))) {
        $img_overlay = "<div class='iupl iupl_".($upgrade+0)."'></div>";
    } else if ($setup->stackable) {
        $img_overlay = "<div class='inmb'>".no2k($quantity)."</div>";
    }

    if(isset($it['info']))	{
        $rows[] = "<span class='itip'>".tf($lang,$it['info'])."</span>";
    }
    */
    return "<table><tr><td><div class='trp'>"+img_overlay+img+"</div></td><td class='item-stats'>"+stats.join("<br/>")+"</td></tr></table>";
}

function no2k(val)
{
    if(10000000000000 < val) return Math.round(val/1000000000000)+'T';
    if(10000000000 < val) return Math.round(val/1000000000)+'G';
    if(10000000 < val) return Math.round(val/1000000)+'M';
    if(10000 < val) return Math.round(val/1000)+'k';
    return Math.round(val);
}

function k2no(val){
    var str_end = val.substring(substring.length-1,substring.length);
    if(str_end === 'k' ) return parseInt(val)*1000;
    if(str_end === 'M' ) return parseInt(val)*1000000;
    if(str_end === 'G' ) return parseInt(val)*1000000000;
    if(str_end === 'T' ) return parseInt(val)*1000000000000;
    return parseInt(val);
}

function no2str(a) {
    var d = '&nbsp;';
    a = Math.round(a);
    e = a + '';
    f = e.split('.');
    if (!f[0]) {
        f[0] = '0';
    }
    if(d !== '' && f[0].length > 3) {
        h = f[0];
        f[0] = '';
        for(j = 3; j < h.length; j+=3) {
            i = h.slice(h.length - j, h.length - j + 3);
            f[0] = d + i +  f[0] + '';
        }
        j = h.substr(0, (h.length % 3 === 0) ? 3 : (h.length % 3));
        f[0] = j + f[0];
    }
    return f[0];
}
function str2no(val){
    var regExp = /\s+/g;
    val = val.replace(regExp,'');
    return parseInt(val);
}

function isset () {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: FremyCompany
    // +   improved by: Onno Marsman
    // +   improved by: Rafał Kukawski
    // *     example 1: isset( undefined, true);
    // *     returns 1: false
    // *     example 2: isset( 'Kevin van Zonneveld' );
    // *     returns 2: true
    var a = arguments,
        l = a.length,
        i = 0,
        undef;

    if (l === 0) {
        throw new Error('Empty isset');
    }

    while (i !== l) {
        if (a[i] === undef || a[i] === null) {
            return false;
        }
        i++;
    }
    return true;
}

function logger(variable) {
    console.log(variable);
}
var is_click = false;
function iclick(url) {

    if(is_click == false) {
        window.location = url + '?' + REQ_PAIR;
        is_click = true;
    }
}

function wantedCost() {

    var blasts = $("input[name='wanted[blast]']").val();
    var credits = $("input[name='wanted[credits]']").val();

    var total = blasts * credits;

    $("#costs").text(total);
}

function invTabs() {
    $("#inventar a").each(function() {
        $(this).find(".tab-title").hide();
        if ($(this).hasClass("active")) {
            $(this).find(".tab-title").show();
        }
        $(".contrabandist_slots").show();
    });

    $("#invent a").each(function() {
        $(this).find(".tab-title").hide();
        if ($(this).hasClass("active")) {
            $(this).find(".tab-title").show();
        }
        $(".contrabandist_slots").show();
    });
}

$("#inventar a").click(function() {
    $(".inventory_slots").hide();
    var rel = $(this).attr('rel');
    $("#"+rel).show();
    $("#inventar a").each(function() {
        $(this).removeClass("active");
    });
    $(this).addClass("active");
    invTabs();
});

$("#invent a").click(function() {
    $("#guns").hide();
    $("#cars").hide();
    $("#dogs").hide();
    var rel = $(this).attr('rel');
    $("#"+rel).show();
    $("#invent a").each(function() {
        $(this).removeClass("active");
    });
    $(this).addClass("active");
    invTabs();
});

invTabs();