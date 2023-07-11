/* Add here all your JS customizations */
function cloneButtonWithMetrikaParams(selector, additionalClass, metrikaEvent) {
    var element = $(selector).clone();
    if(!element) {
        return;
    }
    element.removeAttr('data-name data-event data-param-id data-autoload-need_product');
    element.addClass(additionalClass);
    $(selector).after(element[0]);
    $(selector).hide();
    $('.'+additionalClass).on('click', function() {
        dataLayer.push({'event': metrikaEvent});
        ym(56290675, 'reachGoal', metrikaEvent);
        $(selector).trigger('click');
    });
}

$(function() {
    $('body').on('click', '.outer-event-register', function(){
        let link = $(this)[0].dataset.href;
        if (typeof link !== 'undefined') {
            window.open(link, '_blank');
        }
    });
    $('body').on('click', '.inner-event-register', function(){
        $('.inner-register-form').attr('style', 'display: block;');
        //$('.inner-event-register').attr('style', 'display: none;');
    });

    cloneButtonWithMetrikaParams(
        '.sidearea .ask_a_question span[data-name="question"]', 
        'left-block-ask', 
        'openfaqleft'
    );
    
    cloneButtonWithMetrikaParams(
        '.right_dok span[data-name="question"]', 
        'right-block-ask', 
        'openfaqright'
    );
    
    cloneButtonWithMetrikaParams(
        '.order-block span.btn[data-name="question"]', 
        'order-block-ask', 
        'openfaq'
    );

    $( ".reg-selector")
    .selectmenu().on().selectmenu( "menuWidget" )
            .addClass( "overflow--145" )
            .addClass( "selector_list" )
            .addClass( "scrollbar-outer" );

    $( ".reg-selector--width-355")
    .selectmenu().on().selectmenu( "menuWidget" )
            .addClass( "overflow--145" )
            .addClass( "selector_list" )
            .addClass( "scrollbar-outer" )
            .addClass( "width-355" );
            

    jQuery.validator.addMethod("emailExt", function(value, element, param) {
        return value.match(/^[a-zA-ZА-ЯЁа-яё0-9_\.%\+\-]+@[a-zA-ZА-ЯЁа-яё0-9\.\-]+\.[a-zA-ZА-ЯЁа-яё]{2,}$/);
    },'Неверный формат!');
    jQuery.validator.addMethod("birthday", function(value, element, param) {
		var now = new Date();
		var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
		var myDate = new Date(value.replace(pattern,'$3-$2-$1'));
        //return value.match(/^(0?[1-9]|[12][0-9]|3[0-1])[/., -](0?[1-9]|1[0-2])[/., -](19|20)?\d{2}$/);
		return this.optional(element) || myDate < now;
    },'Некорректная дата');
	jQuery.validator.addMethod("lengthNotEqual", function(value, element, param) {
		return value.length != param;
	}, "Должно быть 10 или 12 символов!");
});


$(document).ready(function(){
    $('.scrollbar-outer').scrollbar();
    $('#registraion-page-form #input_PERSONAL_BIRTHDAY').inputmask("99.99.9999",{ showMaskOnHover: false,});
    $('.main-form #PERSONAL_BIRTHDAY').inputmask("99.99.9999",{ showMaskOnHover: false,});

    $('.select-drop__label').on('click', function(){
        $(".ui-selectmenu-text").trigger('click');
    });

    $( ".reg-selector" ).selectmenu().on( "selectmenuselect", function( event, ui ) {
        if (ui.item.index === 0) {
            return;
        } 
        $('.select-drop.error').css('border', 'none');
        $('.select-drop.error label').remove();
        $(this).closest(".animated-labels").addClass("input-filed");
    });
    setTimeout(function () {
        $(".animated-labels input,.animated-labels textarea").trigger('focusout');
    }, 200);

    $(document).off('click', '.js_send-sms-again');
    $(document).on('click', '.js_send-sms-again', function(event){
        event.preventDefault();
    });
    $(document).off('click', '.js_send-sms-again.active');
    $(document).on('click', '.js_send-sms-again.active', function(event){
        var sendAgainButton = $(this);
        var smsType = sendAgainButton.data('type');
        var errorBlock = $(this).closest('.form-group').find('.tooltip');
        var phoneInput = $(this).closest('form').find('[name*=PHONE]');
        var request = BX.ajax.runComponentAction('itc:ajax.sms.controller', 'trySendSms', {
            mode:'class',
            data: {
                phone: phoneInput.val(),
                smsType: smsType,
                forceSend: true
            }
        }).then (function (response) {
            var text = '';
            var decodedData = JSON.parse(response.data);
            if (decodedData.SUCCESS) {
                text += decodedData.TEXT_MESSAGE;

                if (decodedData.HAS_ATTEMPTS) {
                    sendAgainButton.removeClass('active').addClass('inactive');
                    sendAgainButton = $('.js_send-sms-again.inactive');
                    var secondsInTimer = Number(sendAgainButton.data('seconds'));
                    if (!secondsInTimer) {
                        secondsInTimer = 60;
                    }
                    var timeStamp = (new Date()).getTime() + secondsInTimer*1000;

                    sendAgainButton.countdown({
                        timestamp   : timeStamp,
                        callback    : function(minutes, seconds){
                            if (minutes <= 0 && seconds <= 0) {
                                if (sendAgainButton.hasClass('inactive')) {
                                    sendAgainButton.removeClass('inactive').addClass('active');
                                    sendAgainButton.find('.countdownHolder').remove();
                                }
                            }
                        }
                    });
                } else {
                    sendAgainButton.hide();
                }
            } else {
                if (!decodedData.HAS_ATTEMPTS) {
                    sendAgainButton.hide();
                }
                for (var message in decodedData.ERRORS) {
                    text += decodedData.ERRORS[message]+'<br>';
                }
            }
            errorBlock.html(text);
            errorBlock[0].scrollIntoView({block: "center", behavior: "smooth"});
        }, function (response) {
            var text = 'Что-то пошло не так, повторите попытку позднее';
            errorBlock.html(text);
            errorBlock[0].scrollIntoView({block: "center", behavior: "smooth"});
        });
    });
});

/****************************************************************************/
/*                                                                          */
/*                             Rct Scripts                                  */
/*                                                                          */
/****************************************************************************/

var EffectCoverflowfix = (function() {
    var setTranslate = function(swiper) {
        var swiperWidth = swiper.width;
        var swiperHeight = swiper.height;
        var slides = swiper.slides;
        var slidesSizesGrid = swiper.slidesSizesGrid;

        var params = swiper.params.coverflowEffect;
        var isHorizontal = swiper.isHorizontal();
        var transform = swiper.translate;
        var center = isHorizontal ? -transform + swiperWidth / 4 : -transform + swiperHeight / 2;
        var rotate = isHorizontal ? params.rotate : -params.rotate;
        var translate = params.depth; // Each slide offset from center

        for (var i = 0, length = slides.length; i < length; i += 1) {
            var $slideEl = slides.eq(i);
            var slideSize = slidesSizesGrid[i];
            var slideOffset = $slideEl[0].swiperSlideOffset;
            var centerOffset = (center - slideOffset - slideSize / 2) / slideSize;
            var offsetMultiplier = typeof params.modifier === 'function' ? params.modifier(centerOffset) : centerOffset * params.modifier;
            var rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
            var rotateX = isHorizontal ? 0 : rotate * offsetMultiplier; // var rotateZ = 0

            var translateZ = -translate * Math.abs(offsetMultiplier);
            var stretch = params.stretch; // Allow percentage to make a relative stretch for responsive sliders

            if (typeof stretch === 'string' && stretch.indexOf('%') !== -1) {
                stretch = parseFloat(params.stretch) / 100 * slideSize;
            }

            var translateY = isHorizontal ? 0 : stretch * offsetMultiplier;
            var translateX = isHorizontal ? stretch * offsetMultiplier : 0;
            var scale = 1 - (1 - params.scale) * Math.abs(offsetMultiplier); // Fix for ultra small values
            
            if (Math.abs(translateX) < 0.001) translateX = 0;
            if (Math.abs(translateY) < 0.001) translateY = 0;
            if (Math.abs(translateZ) < 0.001) translateZ = 0;
            if (Math.abs(rotateY) < 0.001) rotateY = 0;
            if (Math.abs(rotateX) < 0.001) rotateX = 0;
            if (Math.abs(scale) < 0.001) scale = 0;

            var slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
            
            if (params.transformEl) {
                $targetEl = $slideEl.find(params.transformEl).css({
                  'backface-visibility': 'hidden',
                  '-webkit-backface-visibility': 'hidden'
                });
            } else {
                $targetEl = $slideEl;
            }

            $targetEl.transform(slideTransform);
            $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
            
            // var slideSize = (swiper.size - (swiper.params.slidesPerView - 1) * swiper.params.spaceBetween) / swiper.params.slidesPerView;
            // $slideEl[0].style['width'] = `${slideSize}px`;
        }
    };

    const setTransition = function(swiper, duration) {
        var transformEl = swiper.params.coverflowEffect.transformEl;
        var $transitionElements = transformEl ? swiper.slides.find(transformEl) : swiper.slides;
        $transitionElements.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
    };

    return {
        setTransition: setTransition,
        setTranslate: setTranslate,
    }
})();

$(function() {
    // index projects slider

    var coverflowOptions = {
        loop: true,
        speed:800,
        slidesPerView: 2,
        grabCursor: true,
        parallax: true, 
        effect: 'coverflowfix',
        // watchSlidesProgress: true,
        coverflowEffect: {
            rotate: 0,
            stretch: 200,
            depth: 300,
            scale: 1,
            modifier: 1,
            slideShadows: false,
            transformEl: null
        },
        navigation: {
            nextEl: '.swiper-coverflow-slider__next',
            prevEl: '.swiper-coverflow-slider__prev',
        },
        on: {
            beforeInit() {
                var swiper = this;
                if (swiper.params.effect === 'coverflowfix') {
                    swiper.classNames.push(`${swiper.params.containerModifierClass}coverflow`);
                    swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
                }
            },
            setTransition(swiper, duration) {
                if (swiper.params.effect === "coverflowfix") {
                    EffectCoverflowfix.setTransition(swiper, duration);
                }
            },
            setTranslate(swiper, translate) {
                if (swiper.params.effect === "coverflowfix") {
                    EffectCoverflowfix.setTranslate(swiper, translate);
                }
            }
        }
    };

    var slideOptions = {
        loop: true,
        speed:800,
        grabCursor: true,
        parallax: true,
        effect: 'slide',
        breakpoints: {
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            0: {
                slidesPerView: 1,
            },
        },
        navigation: {
            nextEl: '.swiper-coverflow-slider__next',
            prevEl: '.swiper-coverflow-slider__prev',
        },
    };

    var el = '.swiper-coverflow-slider .swiper';
    var swiper = null;
    var currentOptions = false;
    var breakpoints = [
        {from: 0, to: 991, options: slideOptions},
        {from: 992, to: 10000, options: coverflowOptions},
    ];

    $(window).on('resize', function() {
        var width = $(window).width();

        for (var i in breakpoints) {
            var bp = breakpoints[i];

            if (width < bp.from || width > bp.to) {
                continue;
            }

            if (currentOptions === bp.options) {
                break;
            }

            currentOptions = bp.options;

            if (swiper !== null) {
                swiper.destroy();
            }
            
            swiper = new Swiper(el, currentOptions);
            window.swipp = swiper
        }
    });

    $(window).trigger('resize');
});

$(function() {
    // index bottom slider

    var el = '.front-advbottom-rct .swiper';
    var options = {
        loop: true,
        speed:800,
        slidesPerView: 1,
        grabCursor: true,
        parallax: true,
        navigation: {
            nextEl: '.front-advbottom-rct__next',
            prevEl: '.front-advbottom-rct__prev',
        },
    };

    var swiper = new Swiper(el, options);
});

$(function() {
    // index top slider

    var el = '.front-advtop-rct .swiper';
    var options = {
        loop: true,
        speed:800,
        slidesPerView: 1,
        grabCursor: true,
        parallax: true,
        navigation: {
            nextEl: '.front-advtop-rct__next',
            prevEl: '.front-advtop-rct__prev',
        },
    };

    var swiper = new Swiper(el, options);
});

$(function() {
    $(".rct-reg-selector").each(function() {
        $(this).selectmenu({
            change: function(event, ui) {
                $(event.target).closest('.animated-labels').addClass('input-filed');
            },
        });
        var width = $(this).selectmenu('widget').width() + 2;
        
        $(this).on().selectmenu('menuWidget').addClass('rct-ui-menu');
        $(this).on().selectmenu('menuWidget').css('max-width', width + 'px  ');
    });
});

$(function() {
    // Index odometer
    var counter = document.querySelector('#rct-numbers');
    var counterNumbers;
    var isInited = false;

    if (counter) {
        counterNumbers = counter.querySelectorAll('.front-numbers-rct__count');

        [].forEach.call(counterNumbers, function(number) {
            number.endValue = parseInt(number.textContent);
            number.innerHTML = '0';
            number.od = new Odometer({
                auto: false,
                duration: 3000,
                el: number,
                value:  0,
                format: '',
                theme: 'minimal'
            });

            number.od.render();
            number.od.update(0);
        });

        window.addEventListener('scroll', function() {
            if (!isInited && window.scrollY + window.innerHeight > counter.offsetTop) {
                setTimeout(function() {
                    [].forEach.call(counterNumbers, function(number) {
                        number.od.update(number.endValue);
                    });
                }, 1200);

                isInited = true;
            }
        });
    }
});

$(function() {
    // Collapse accordion
    $('.item-accordion-wrapper .accordion-head').on('click', function() {
        if (! $(this).attr('href') && ! $(this).attr('data-target')) {
            $(this).parent().toggleClass('opened');
            $(this).parent().find('.panel-collapse').collapse('toggle');
        }
    });
});

$(function() {
	var counters = document.querySelectorAll('.indicator-list-custom');
	var counterNumbers;
	var isInited = false;

	if (counters) {
		counters.forEach(function(counter) {
			if (! counter) return;

			counterNumbers = counter.querySelectorAll('.indicator__count');

			[].forEach.call(counterNumbers, function(number) {
				number.endValue = parseInt(number.textContent);
				number.innerHTML = '0';
				number.od = new Odometer({
					auto: false,
					duration: 3000,
					el: number,
					value:  0,
					format: '',
					theme: 'minimal'
				});
				number.od.render();
				number.od.update(0);
			});
	
			window.addEventListener('scroll', function() {
				if (!isInited && window.scrollY + window.innerHeight > counter.offsetTop) {
					setTimeout(function() {
						[].forEach.call(counterNumbers, function(number) {
							number.od.update(number.endValue);
						});
					}, 1200);
	
					isInited = true;
				}
			});
		});
	}
});