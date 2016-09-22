// Device.js
// (c) 2014 Matthew Hudson
// Device.js is freely distributable under the MIT license.
// For all details and documentation:
// http://matthewhudson.me/projects/device.js/

(function() {

  var device,
    previousDevice,
    addClass,
    documentElement,
    find,
    handleOrientation,
    hasClass,
    orientationEvent,
    removeClass,
    userAgent;

  // Save the previous value of the device variable.
  previousDevice = window.device;

  device = {};

  // Add device as a global object.
  window.device = device;

  // The <html> element.
  documentElement = window.document.documentElement;

  // The client user agent string.
  // Lowercase, so we can use the more efficient indexOf(), instead of Regex
  userAgent = window.navigator.userAgent.toLowerCase();

  // Main functions
  // --------------

  device.ios = function () {
    return device.iphone() || device.ipod() || device.ipad();
  };

  device.iphone = function () {
    return !device.windows() && find('iphone');
  };

  device.ipod = function () {
    return find('ipod');
  };

  device.ipad = function () {
    return find('ipad');
  };

  device.android = function () {
    return !device.windows() && find('android');
  };

  device.androidPhone = function () {
    return device.android() && find('mobile');
  };

  device.androidTablet = function () {
    return device.android() && !find('mobile');
  };

  device.blackberry = function () {
    return find('blackberry') || find('bb10') || find('rim');
  };

  device.blackberryPhone = function () {
    return device.blackberry() && !find('tablet');
  };

  device.blackberryTablet = function () {
    return device.blackberry() && find('tablet');
  };

  device.windows = function () {
    return find('windows');
  };

  device.windowsPhone = function () {
    return device.windows() && find('phone');
  };

  device.windowsTablet = function () {
    return device.windows() && (find('touch') && !device.windowsPhone());
  };

  device.fxos = function () {
    return (find('(mobile;') || find('(tablet;')) && find('; rv:');
  };

  device.fxosPhone = function () {
    return device.fxos() && find('mobile');
  };

  device.fxosTablet = function () {
    return device.fxos() && find('tablet');
  };

  device.meego = function () {
    return find('meego');
  };

  device.cordova = function () {
    return window.cordova && location.protocol === 'file:';
  };

  device.nodeWebkit = function () {
    return typeof window.process === 'object';
  };

  device.mobile = function () {
    return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego();
  };

  device.tablet = function () {
    return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet();
  };

  device.desktop = function () {
    return !device.tablet() && !device.mobile();
  };

  device.television = function() {
    var i, tvString;

    television = [
      "googletv",
      "viera",
      "smarttv",
      "internet.tv",
      "netcast",
      "nettv",
      "appletv",
      "boxee",
      "kylo",
      "roku",
      "dlnadoc",
      "roku",
      "pov_tv",
      "hbbtv",
      "ce-html"
    ];

    i = 0;
    while (i < television.length) {
      if (find(television[i])) {
        return true;
      }
      i++;
    }
    return false;
  };

  device.portrait = function () {
    return (window.innerHeight / window.innerWidth) > 1;
  };

  device.landscape = function () {
    return (window.innerHeight / window.innerWidth) < 1;
  };

  // Public Utility Functions
  // ------------------------

  // Run device.js in noConflict mode,
  // returning the device variable to its previous owner.
  device.noConflict = function () {
    window.device = previousDevice;
    return this;
  };

  // Private Utility Functions
  // -------------------------

  // Simple UA string search
  find = function (needle) {
    return userAgent.indexOf(needle) !== -1;
  };

  // Check if documentElement already has a given class.
  hasClass = function (className) {
    var regex;
    regex = new RegExp(className, 'i');
    return documentElement.className.match(regex);
  };

  // Add one or more CSS classes to the <html> element.
  addClass = function (className) {
    var currentClassNames = null;
    if (!hasClass(className)) {
      currentClassNames = documentElement.className.replace(/^\s+|\s+$/g, '');
      documentElement.className = currentClassNames + " " + className;
    }
  };

  // Remove single CSS class from the <html> element.
  removeClass = function (className) {
    if (hasClass(className)) {
      documentElement.className = documentElement.className.replace(" " + className, "");
    }
  };

  // HTML Element Handling
  // ---------------------

  // Insert the appropriate CSS class based on the _user_agent.

  if (device.ios()) {
    if (device.ipad()) {
      addClass("ios ipad tablet");
    } else if (device.iphone()) {
      addClass("ios iphone mobile");
    } else if (device.ipod()) {
      addClass("ios ipod mobile");
    }
  } else if (device.android()) {
    if (device.androidTablet()) {
      addClass("android tablet");
    } else {
      addClass("android mobile");
    }
  } else if (device.blackberry()) {
    if (device.blackberryTablet()) {
      addClass("blackberry tablet");
    } else {
      addClass("blackberry mobile");
    }
  } else if (device.windows()) {
    if (device.windowsTablet()) {
      addClass("windows tablet");
    } else if (device.windowsPhone()) {
      addClass("windows mobile");
    } else {
      addClass("desktop");
    }
  } else if (device.fxos()) {
    if (device.fxosTablet()) {
      addClass("fxos tablet");
    } else {
      addClass("fxos mobile");
    }
  } else if (device.meego()) {
    addClass("meego mobile");
  } else if (device.nodeWebkit()) {
    addClass("node-webkit");
  } else if (device.television()) {
    addClass("television");
  } else if (device.desktop()) {
    addClass("desktop");
  }

  if (device.cordova()) {
    addClass("cordova");
  }

  // Orientation Handling
  // --------------------

  // Handle device orientation changes.
  handleOrientation = function () {
    if (device.landscape()) {
      removeClass("portrait");
      addClass("landscape");
    } else {
      removeClass("landscape");
      addClass("portrait");
    }
    return;
  };

  // Detect whether device supports orientationchange event,
  // otherwise fall back to the resize event.
  if (Object.prototype.hasOwnProperty.call(window, "onorientationchange")) {
    orientationEvent = "orientationchange";
  } else {
    orientationEvent = "resize";
  }

  // Listen for changes in orientation.
  if (window.addEventListener) {
    window.addEventListener(orientationEvent, handleOrientation, false);
  } else if (window.attachEvent) {
    window.attachEvent(orientationEvent, handleOrientation);
  } else {
    window[orientationEvent] = handleOrientation;
  }

  handleOrientation();

  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(function() {
      return device;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = device;
  } else {
    window.device = device;
  }

}).call(this);
/*!
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2015 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.7
 *
 */

(function($, window, document, undefined) {
    var $window = $(window);

    $.fn.lazyload = function(options) {
        var elements = this;
        var $container;
        var settings = {
            threshold       : 0,
            failure_limit   : 0,
            event           : "scroll",
            effect          : "show",
            container       : window,
            data_attribute  : "original",
            skip_invisible  : false,
            appear          : null,
            load            : null,
            placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
        };

        function update() {
            var counter = 0;

            elements.each(function() {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if ($.abovethetop(this, settings) ||
                    $.leftofbegin(this, settings)) {
                        /* Nothing. */
                } else if (!$.belowthefold(this, settings) &&
                    !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                } else {
                    if (++counter > settings.failure_limit) {
                        return false;
                    }
                }
            });

        }

        if(options) {
            /* Maintain BC for a couple of versions. */
            if (undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit;
            }
            if (undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed;
            }

            $.extend(settings, options);
        }

        /* Cache container as jQuery as object. */
        $container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function() {
                return update();
            });
        }

        this.each(function() {
            var self = this;
            var $self = $(self);

            self.loaded = false;

            /* If no src attribute given use data:uri. */
            if ($self.attr("src") === undefined || $self.attr("src") === false) {
                if ($self.is("img")) {
                    $self.attr("src", settings.placeholder);
                }
            }

            /* When appear is triggered load original image. */
            $self.one("appear", function() {
                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    $("<img />")
                        .bind("load", function() {

                            var original = $self.attr("data-" + settings.data_attribute);
                            $self.hide();
                            if ($self.is("img")) {
                                $self.attr("src", original);
                            } else {
                                $self.css("background-image", "url('" + original + "')");
                            }
                            $self[settings.effect](settings.effect_speed);

                            self.loaded = true;

                            /* Remove image from array so it is not looped next time. */
                            var temp = $.grep(elements, function(element) {
                                return !element.loaded;
                            });
                            elements = $(temp);

                            if (settings.load) {
                                var elements_left = elements.length;
                                settings.load.call(self, elements_left, settings);
                            }
                        })
                        .attr("src", $self.attr("data-" + settings.data_attribute));
                }
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function() {
                    if (!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });

        /* Check if something appears when window is resized. */
        $window.bind("resize", function() {
            update();
        });

        /* With IOS5 force loading images when navigating with back button. */
        /* Non optimal workaround. */
        if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
            $window.bind("pageshow", function(event) {
                if (event.originalEvent && event.originalEvent.persisted) {
                    elements.each(function() {
                        $(this).trigger("appear");
                    });
                }
            });
        }

        /* Force initial check if images should appear. */
        $(document).ready(function() {
            update();
        });

        return this;
    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };

    $.rightoffold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    };

    $.abovethetop = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };

    $.leftofbegin = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };

    $.inviewport = function(element, settings) {
         return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
     };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend($.expr[":"], {
        "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
        "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
        "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
        /* Maintain BC for couple of versions. */
        "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); }
    });

})(jQuery, window, document);
jQuery(document).ready(function($) {
	$('body').on('click', '.burger', function(event) {
		event.preventDefault();
		$('.navigation').toggleClass('navigation--open');
	});
	$('body').on('click', '.dot-strip__input', function(event) {
		switch ($(this).attr('id')) {
			case 'dotCar':
				$('.dot-strip__runner').attr('data-pos', 'one');
				break;
			case 'dotLorry':
				$('.dot-strip__runner').attr('data-pos', 'two');
				break;
			case 'dotBus':
				$('.dot-strip__runner').attr('data-pos', 'three');
				break;
		}
	
		$(this)
			.closest('.slider')
			.find('.slide-pack')
			.attr('data-slider-pos', $(this).attr('data-dot-pos'));
	});
	// ../blocks/driver-form/selects.js
	var BecomeDriverSerializer 	=	{
		first_name				: 'string',
		last_name				: 'string',
		email						: 'string',
		phone						: 'string',
		how_did_you_know		: 'unnecessary',
		car_year					: 'number',
		car_state				: 'string',
		car_brand				: 'string',
		car_model				: 'string',
		car_color				: 'string',
		avg_mileage_day		: 'number',
		avg_mileage_weekend	: 0,
		comment					: 'unnecessary',
	};
	
	
	function sendForm(page) {
		var linkTo = {
			root: 'http://dev.jata.ru'
		};
		$.ajax({
			url: linkTo.root + '/api/v1/accounts/becomedriver',
			type: 'POST',
			data: BecomeDriverSerializer,
		})
		.done(function() {
			$('.message--success').addClass('message--show');
	
			// переключить страницу
			$('.driver-form').attr('data-page', '1');
	
			// очистка полей формы
			$('[data-field-type]')
				.each(function(index, el) {
					$(this)
						.val('')
						.attr('data-filled', 'false')
						.attr('data-correct', 'null');
				});
	
			console.log('form has beed sent');
		})
		.fail(function(data) {
			$('.message--fail').addClass('message--show');
			// console.log(BecomeDriverSerializer);
			if (data.responseText) {
				console.log('servers answer:\n',data.responseText);
			} else {
				console.log('UFO have interrupted our server\'s work\nwe\'l try to fix it');
			}
		});
	}
	
	$('body').on('click', '[data-way]', function(event) {
		event.preventDefault();
		
		var
			page							=	$(this).closest('.driver-form'),
			thisPage						=	page.attr('data-page'),
			currentPage					=	$('.driver-form__page[data-page=\''+ thisPage +'\']'),
			nextPage						=	+thisPage + 1,
			prevPage						=	+thisPage - 1;
	
		if ($(this).attr('data-way') === 'prev') {
			switch (prevPage) {
				case 1:
					page.attr('data-page', '1');
					break;
				case 2:
					page.attr('data-page', '2');
					break;
				default:
					break;
			}
		} else {
			var
				allCorrect	= false,
				dataPage		= $('.driver-form').attr('data-page');
	
			switch (dataPage) {
				// проверка полей на первой странице
				case '1':
						// так как поле "как вы о нас узнали" не участвует в обходе, запишем его вручную
						BecomeDriverSerializer.how_did_you_know = $('#how_did_you_know').val();
					
				case '2':
					// на этой странице найти все поля и перебрать
					currentPage
						.find('[data-mask]')
						.each(function(index, el) {
							// если это поле невалидно (пусто)
							if (($(this).length) && ($(this).attr('data-correct') !== 'true')) {
								// найти все поля (снова) и перебрать
								currentPage
									.find('[data-mask]')
									.each(function(index, el) {
										// если это не отмечено как корректное
										if ($(this).attr('data-correct') !== 'true') {
											// отметить как ошибочное
											$(this).attr('data-correct', 'false');
										}
									});
	
								// все плохо
								allCorrect = false;
								// прервать перебор
								return false;
							// если все норм
							} else {
								// записать данные в объект
								BecomeDriverSerializer[$(this).attr('id')] = $(this).val();
	
								// присвоить переменной тру
								allCorrect = true;
							}
						});
	
					// почистим номер телефона
					BecomeDriverSerializer.phone = BecomeDriverSerializer.phone.replace(/\D/g, '');
	
						// console.log(BecomeDriverSerializer.phone);
					break;
	
	
					// // на этой странице найти все инпуты и перебрать
					// currentPage
					// 	.find('.select__input')
					// 	.each(function(index, el) {
					// 		// если ничего не выбрано в поле
					// 		if ($(this).attr('data-val') === 'none') {
					// 			// найти снова все инпуты и перебрать
					// 			currentPage
					// 				.find('.select__input')
					// 				.each(function(index, el) {
					// 					if ($(this).attr('data-val') === 'none') {
					// 						$(this).attr('data-correct', 'false');
					// 					}
					// 				});
	
					// 			// все плохо
					// 			allCorrect = false;
					// 			// пошли все нафиг
					// 			return false;
					// 		// если все норм
					// 		} else {
					// 			// записать данные в объект
					// 			if (($(this).attr('id') === 'car_brand') || ($(this).attr('id') === 'car_model')) {
					// 				// тут выбор слать айди или строку
					// 				BecomeDriverSerializer[$(this).attr('id')] = $(this).attr('data-id');
					// 			} else {
					// 				BecomeDriverSerializer[$(this).attr('id')] = $(this).attr('data-val');
					// 			}
									
					// 			// пока все норм
					// 			allCorrect = true;
					// 		}
					// 	});
					// break;
	
				// проверка полей на третьей странице
				case '3':
					// на этой странице найти все поля и перебрать
					currentPage
						.find('[data-mask]')
						.each(function(index, el) {
							// если это поле невалидно (пусто)
							if (($(this).length) && ($(this).attr('data-correct') !== 'true')) {
								// найти все поля (снова) и перебрать
								currentPage
									.find('[data-mask]')
									.each(function(index, el) {
										// если это не "как вы о нас узнали" и не отмечено как корректное
										if ($(this).attr('data-correct') !== 'true') {
											// отметить как ошибочное
											$(this).attr('data-correct', 'false');
										}
									});
	
								// все плохо
								allCorrect = false;
								// прервать перебор
								return false;
							// если все норм
							} else {
								// найти все поля опять, обойти
								currentPage
									.find('[data-filled]')
									.each(function(index, el) {
										// записать данные в объект
										BecomeDriverSerializer[$(this).attr('id')] = $(this).val();
									});
								// присвоить переменной тру
								allCorrect = true;
							}
						});
					break;
				default:
					console.log('wrong page number');
					break;
			}
	
			// если все поля на странице правильно заполнены
			if (allCorrect === true) {
				switch (nextPage) {
					// на первой странице
					case 2:
						// переключить страницу
						page.attr('data-page', '2');
						// сбросить переменную
						allCorrect = false;
						break;
					// на второй странице
					case 3:
						// переключить страницу
						page.attr('data-page', '3');
						// сбросить переменную
						allCorrect = false;
						// перевести год в число
						BecomeDriverSerializer.car_year = +BecomeDriverSerializer.car_year;
						break;
					// на третьей странице
					case 4:
						
						// запустить функцию отправки формы
						sendForm($('.driver__form'));
						// сбросить переменную
						allCorrect = false;
						// перевести пробег в число
						BecomeDriverSerializer.avg_mileage_weekend = +BecomeDriverSerializer.avg_mileage_weekend;
						break;
					default:
						console.log('wrong next page number');
						break;
				}
			}
		}
	});
	function numberFormat(num) {
		num = num.replace(/\D/g, '');
		return num; 
	}
	
	function yearFormat(num) {
		num = num.replace(/\D/g, '');
	
		if (num.length >= 4) {
			num = num.slice(0, 4);
		}
		return num;
	}
	
	function telFormat(num) {
		num = num.replace(/\D/g, '');
	
		var tel;
	
		if(num.length <= 11) {
			switch(num.length) {
				case 0:
					tel = '+7 (';
					break;
				case 1:
					if(num[0] != 7) {
						tel = '+7 (' + num[0];
					} else {
						tel = '+7 (';
					}
					break;
				case 2:
					tel = '+7 (' + num[1];
					break;
				case 3:
					tel = '+7 (' + num[1] + num[2];
					break;
				case 4:
					tel = '+7 (' + num[1] + num[2] + num[3];
					break;
				case 5:
					tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4];
					break;
				case 6:
					tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5];
					break;
				case 7:
					tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6];
					break;
				case 8:
					tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7];
					break;
				case 9:
					tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7] + num[8];
					break;
				case 10:
					tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7] + num[8] + '-' + num[9];
					break;
				case 11:
					tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7] + num[8] + '-' + num[9] + num[10];
					break;
			}
		} else {
			tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7] + num[8] + '-' + num[9] + num[10];
		}
	
		return tel;
	}
	
	$('body').on('blur', '.input__input', function(event) {
		if ($(this).val() !== '') {
			$(this).attr('data-filled', 'true');
		} else {
			$(this).attr('data-filled', 'false');
		}
	
		// console.log(/.+@.+\..+/i.test($(this).val()))
	});
	
	// /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/
	
	$('body').on('keyup', '[data-mask=\'tel\']', function() {
		$(this).val(telFormat($(this).val()));
	});
	
	$('body').on('keyup', '[data-mask=\'year\']', function() {
		$(this).val(yearFormat($(this).val()));
	});
	
	$('body').on('click', '[data-mask=\'tel\']', function() {
		$(this).val(telFormat($(this).val()));
	});
	
	$('body').on('keyup', '[data-mask=\'number\']', function() {
		$(this).val(numberFormat($(this).val()));
	});
	
	$('body').on('blur', '[data-mask]', function(event) {
		switch ($(this).attr('data-mask')) {
			case 'email':
				if (/.+@.+\..+/i.test($(this).val())) {
					$(this).attr('data-correct', 'true');
				} else {
					$(this).attr('data-correct', 'false');
				}
				break;
	
			case 'tel':
				// /^([\+]+)*[0-9\x20\x28\x29\-]{7,11}$/
				if ($(this).val().length === 18) {
					$(this).attr('data-correct', 'true');
				} else {
					$(this).attr('data-correct', 'false');
				}
				break;
	
			case 'name':
				if (/^[a-zA-Zа-яёА-ЯЁ][a-zA-Zа-яёА-ЯЁ0-9-_\.]{1,20}$/.test($(this).val())) {
					$(this).attr('data-correct', 'true');
				} else {
					$(this).attr('data-correct', 'false');
				}
				break;
	
			case 'empty':
				if ($(this).val() !== '') {
					$(this).attr('data-correct', 'true');
				} else {
					$(this).attr('data-correct', 'empty');
				}
				break;
	
			case 'text':
				if ($(this).val() !== '') {
					$(this).attr('data-correct', 'true');
				} else {
					$(this).attr('data-correct', 'false');
				}
				break;
	
			case 'number':
				if ($(this).val() !== '') {
					$(this).attr('data-correct', 'true');
				} else {
					$(this).attr('data-correct', 'false');
				}
				break;
	
			case 'year':
				if ($(this).val() !== '' &&
					parseInt($(this).val()) >= 1900 &&
					parseInt($(this).val()) <= new Date().getFullYear()) {
					$(this).attr('data-correct', 'true');
				} else {
					$(this).attr('data-correct', 'false');
				}
				break;
	
		}
	});
	
	$('body').on('input', '[data-mask]', function(event) {
		$(this).attr('data-correct', 'null');
	});
	$('#map').lazyload({
		threshold	: 200,
		effect		: 'fadeIn',
	});
	$('body').on('click', '.message__bg, .message__close', function(event) {
		event.preventDefault();
		
		$(this)
			.closest('.message')
			.removeClass('message--show');
	});
	$('body').on('mouseenter', '.pin', function(event) {
		event.preventDefault();
		
		$(this)
			.removeClass('pin--show')
			.css('z-index', '2')
			.siblings()
			.removeClass('pin--show')
			.css('z-index', '1');
	});
	
	var sec	= 55555;
	
	function countdown() {
		$('[data-clock=\'h\']').text(Math.floor(sec/3600));
		$('[data-clock=\'m\']').text(Math.floor(sec%3600/60));
		$('[data-clock=\'s\']').text(Math.floor(sec%3600%60));
	
		sec += 1;
	}
	
	function twoNumbers(number) {
		if (number < 10) {
			number = '0' + number.toString();
		}
		return number;
	}
	
	if ($('html').hasClass('desktop')) {
		var newDate = new Date();
	
		newDate.setDate(newDate.getDate());
	
		var	hours = new Date().getHours(),
				minutes = new Date().getMinutes(),
				seconds = new Date().getSeconds();
	
		$('[data-clock=\'h\'').text(hours);
		$('[data-clock=\'m\'').text(minutes);
		$('[data-clock=\'s\'').text(seconds);
	
		setInterval(function() {
	
			hours = new Date().getHours();
			
			$('[data-clock=\'h\'').text(twoNumbers(hours));
	
			minutes = new Date().getMinutes();
			
			$('[data-clock=\'m\'').text(twoNumbers(minutes));
	
			seconds = new Date().getSeconds();
			
			$('[data-clock=\'s\'').text(twoNumbers(seconds));
		}, 1000);
	} else {
		$('[data-clock=\'h\']').text(Math.floor(sec/3600) < 10 ? '0' + Math.floor(sec/3600) : Math.floor(sec/3600));
		$('[data-clock=\'m\']').text(Math.floor(sec%3600/60) < 10 ? '0' + Math.floor(sec%3600/60) : Math.floor(sec%3600/60));
		$('[data-clock=\'s\']').text(Math.floor(sec%3600%60) < 10 ? '0' + Math.floor(sec%3600%60) : Math.floor(sec%3600%60));
	
		sec += 1;
	
		setInterval(countdown, 1000);
	}
	$('.questions__item').eq(1).hide();
	
	$('body').on('click', '.main-btn--hdiw', function(event) {
		event.preventDefault();
		
		if (!$(this).hasClass('main-btn--active')) {
			$(this)
				.addClass('main-btn--active')
				.siblings()
				.removeClass('main-btn--active');
		
			$('.questions__item')
				.eq($(this).index() - 2)
				.fadeIn(300)
				.siblings()
				.fadeOut(300);
	
			$('.questions__item')
				.find('.question__body')
				.slideUp(300);
		}
	});
	
	$('body').on('click', '.question__header', function(event) {
		event.preventDefault();
		
		$(this)
			// .closest('.question__header')
			.siblings('.question__body')
			.slideToggle(300)
			.closest('.question')
			.siblings('.question')
			.find('.question__body')
			.slideUp(300);
	});
	$('body').on('click', '.scroll-btn', function(event) {
		event.preventDefault();
		
		$('html, body')
			.animate({
				scrollTop: $(this).closest('.section').outerHeight()
			}, 700);
	});
	var searchAnimationStarted = 0;
	
	$(window).scroll(function(event) {
		if (($('.search').length) && ($(window).scrollTop() >= $('.search').offset().top - $(window).height() + $('.search').height() / 2) && (searchAnimationStarted !== 1)) {
			$('.search').addClass('search--animate');
			searchAnimationStarted = 1;
		}
	});
	$('body').on('click', '.select__input', function(event) {
		if (!$(this).closest('.select--open').length) {
			$('.select--open')
				.removeClass('select--open');
	
			$(this)
				.closest('.select')
				.addClass('select--open');
		} else {
			$(this)
				.closest('.select')
				.removeClass('select--open');
		}
	});
	
	$('body').on('click', '.select__variant', function(event) {
		var linkTo = {
			root: 'https://jata.ru'
		};
		if ($(this).attr('data-val') === 'no-items') {
			$(this)
				.closest('.select')
				.removeClass('select--open');
		} else if ($(this).closest('.select').find('input').attr('id') !== 'car_brand') {
			$(this)
				.closest('.select__variants')
				.siblings('.select__input')
				.val($(this).text())
				.attr('data-val', $(this).attr('data-val'))
				.attr('data-id', $(this).attr('data-id'))
				.attr('data-correct', 'null')
				.closest('.select')
				.removeClass('select--open');
		} else {
			$.ajax({
				url: linkTo.root + '/api/v1/vehicles/brands/'+$(this).attr('data-id')+'/',
				type: 'GET',
				dataType: 'json',
				// data: {pk: $('#car_brand').attr('data-val')},
			})
			.done(function(data) {
				console.log('got ' + data.models.length + ' models');
	
				$('[data-content=\'models\']')
					.html('');
	
				if (data.models.length > 0) {
					data.models.forEach(function(element, index) {
						$('[data-content=\'models\']')
							.append('<li class=\'select__variant\' data-val=\''+element.name+'\' data-id=\''+element.id+'\'>'+element.name+'</li>');
					});
				} else {
					$('[data-content=\'models\']')
						.append('<li class=\'select__variant\' data-val=\'no-items\'>Марок не найдено</li>');
				}
	
				carModels = data.models;
	
				return carModels;
			})
			.fail(function() {
				console.log('error on getting models');
			});
	
			$(this)
				.closest('.select__variants')
				.siblings('.select__input')
				.val($(this).text())
				.attr('data-val', $(this).attr('data-val'))
				.attr('data-id', $(this).attr('data-id'))
				.attr('data-correct', 'null')
				.closest('.select')
				.removeClass('select--open');
	
			$('#car_model')
				.val($('#car_model').attr('data-placeholder'))
				.attr('data-val', 'none');
		}
	});
	
	$('body').on('keyup', '.select__input', function(event) {
		if ($(this).siblings('.select__variants').attr('data-content') === 'brands') {
	
			$('[data-content=\'brands\']').html('');
	
			var thisVal = $(this).val();
	
			carBrands.forEach(function(element, index) {
				if (element.name.toLowerCase().indexOf($('[data-content=\'brands\']').prev('input').val().toLowerCase()) !== -1) {
					$('[data-content=\'brands\']')
						.append('<li class=\'select__variant\' data-id=\''+
							element.id+
							'\' data-val=\''+
							element.name+
							'\'>'+
							element.name+
							'</li>');
				}
			});
	
			if (!$('[data-content=\'brands\']').html().length) {
				$('[data-content=\'brands\']')
						.append('<li class=\'select__variant\' data-id=\'null\' data-val=\'no-items\'>Нет совпадений</li>');
			}
		} else if ($(this).siblings('.select__variants').attr('data-content') === 'models') {
	
			$('[data-content=\'models\']').html('');
	
			var thisVal = $(this).val();
	
			carModels.forEach(function(element, index) {
				if (element.name.toLowerCase().indexOf($('[data-content=\'models\']').prev('input').val().toLowerCase()) !== -1) {
					$('[data-content=\'models\']')
						.append('<li class=\'select__variant\' data-id=\''+
							element.id+
							'\' data-val=\''+
							element.name+
							'\'>'+
							element.name+
							'</li>');
				}
			});
	
			if (!$('[data-content=\'models\']').html().length) {
				$('[data-content=\'models\']')
						.append('<li class=\'select__variant\' data-id=\'null\' data-val=\'no-items\'>Нет совпадений</li>');
			}
		}
	});
	$('body').on('click', '[data-pag-pos]', function(event) {
		event.preventDefault();
	
		$(this)
			.addClass('slide-pack__pag--active')
			.siblings()
			.removeClass('slide-pack__pag--active')
			.closest('.slide-pack__pags')
			.siblings('[data-slider-pos]')
			.attr('data-slider-pos', $(this).attr('data-pag-pos'));
	});
	var
		mobileOne	= $('#tablet').attr('data-mob-x1'),
		mobileTwo	= $('#tablet').attr('data-mob-x2'),
		mobileThree	= $('#tablet').attr('data-mob-x3'),
		tabletOne	= $('#tablet').attr('data-tab-x1'),
		tabletTwo	= $('#tablet').attr('data-tab-x2'),
		tabletThree	= $('#tablet').attr('data-tab-x3');
	
	if (window.devicePixelRatio >= 3) {
		if ($('html').hasClass('mobile')) {
			$('#tablet').attr('data-original', mobileThree);
		} else {
			$('#tablet').attr('data-original', tabletThree);
		}
	} else if (window.devicePixelRatio >= 2) {
		if ($('html').hasClass('mobile')) {
			$('#tablet').attr('data-original', mobileTwo);
		} else {
			$('#tablet').attr('data-original', tabletTwo);
		}
	} else  {
		if ($('html').hasClass('mobile')) {
			$('#tablet').attr('data-original', mobileOne);
		} else {
			$('#tablet').attr('data-original', tabletOne);
		}
	}
	
	$('#tablet').lazyload({
		threshold	: 200,
		effect		: 'fadeIn',
	});
	// function videoLoading(argument) {
	// 	if (!$('html').hasClass('mobile')) {
	// 		$('[data-video-src]')
	// 			.attr('src', $('[data-video-src]').attr('data-video-src'));
	// 		console.log('qwe')
	// 	}
	// }
	
	// videoLoading();
	
	// $(window).resize(function(event) {
	// 	videoLoading();
	// });
	$('body').on('click', '.wd-slider__pag', function(event) {
		event.preventDefault();
		$(this)
			.addClass('wd-slider__pag--active')
			.siblings()
			.removeClass('wd-slider__pag--active');
		if ($(this).index() === 1) {
			$(this)
				.closest('.wd-slider')
				.addClass('wd-slider--two');
		} else {
			$(this)
				.closest('.wd-slider')
				.removeClass('wd-slider--two');
		}
	});
});

var gallery = {

	// ПЕРЕМЕННЫЕ
	// контейнер
	container		: $('.gallery'),

	// список всех имеющихся картинок
	allItems			: [],

	// картинки для добавления в ДОМ
	itemsToPush		: [],

	// загружаются ли сейчас фотки
	isLoading		: false,

	// лоадер
	loader			: $('.gallery__loading'),

	// кнопка подгрузки
	moreBtn			: $('.gallery__btn'),

	// должна ли галерея продолжать подгружать фотки
	isWorking		: true,

	// ФУНКЦИИ
	// начало загрузки фоток
	loadingStart	: function() {
		if (gallery.isWorking) {
			gallery.isLoading = true;

			gallery.loader
				.removeClass('gallery__loading--first')
				.show();
		}

		gallery.moreBtn.hide();
	},
	
	// конец загрузки фоток
	loadingEnd		: function(callback) {
		if (gallery.isWorking) {
			gallery.isLoading = false;

			gallery.loader.hide();
			// gallery.moreBtn.show();

			callback();
		}
	},

	// картинок больше нет, прекращение загрузок
	fullStop			: function() {
		gallery.isWorking = false;

		gallery.loader.hide();
		// gallery.moreBtn.hide();
	},

	// получение списка картинок
	getItems			: function(callback) {
		var linkTo = {
			root: 'https://jata.ru'
		};
		gallery.loadingStart();

		jQuery(document).ready(function($) {
			$.ajax({
				url: linkTo.root + '/api/v1/gallery',
				type: 'POST',
				data: {tags: 'main'},
			})
			.done(function(data) {
				gallery.allItems = data.reverse();

				callback();
			})
			.fail(function(data) {
				console.log('список картинок не получен :(');
				gallery.loader.text('Сервер жадничает :(');
			});
		});
	},

	// первая загрузка фоток
	firstPushing	: function(callback) {
		var linkTo = {
			root: 'https://jata.ru'
		};
		if (gallery.allItems.length >= 30) {
			gallery.itemsToPush	=	gallery.allItems.splice(gallery.allItems.length - 31, 30);
		} else {
			gallery.itemsToPush = gallery.allItems;
		}

		for(var i = 0, length1 = gallery.itemsToPush.length; i < length1; i++){
			gallery.itemsToPush[i] = '<div data-url=\''+ linkTo.root +
				(gallery.itemsToPush[i]) + '\' class=\'gallery__item\'><img src=\'' + linkTo.root +
				(gallery.itemsToPush[i]) + '\' alt><div class=\'gallery__darkness\'></div></div>';
		}

		if (gallery.isWorking) {
			gallery.itemsToPush = $(gallery.itemsToPush.join(''));

			gallery.container
				.masonry({
					columnWidth			: '.gallery__item',
					isAnimated			: true,
					isInitLayout		: true,
					isResizable			: true,
					itemSelector		: '.gallery__item',
					percentPosition	: true,
					singleMode			: true,
				})
				.append(gallery.itemsToPush);

			gallery.itemsToPush
				.hide()
				.imagesLoaded()
				.progress(function(imgLoad, image) {
					var $item = $(image.img).parents('.gallery__item');

					$item.show();

					gallery.container
						.masonry('appended', $item)
						.masonry();
				})
				.done(function() { 
					callback();
				});

			gallery.itemsToPush = [];
		}
	},

	// любая последующая загрузка фоток
	otherPushing		: function(callback) {
		var linkTo = {
			root: 'https://jata.ru'
		};
		if (gallery.allItems.length >= 10) {
			gallery.itemsToPush	=	gallery.allItems.splice(gallery.allItems.length - 11, 10);
		} else {
			gallery.itemsToPush = gallery.allItems;
			gallery.allItems = [];
		}

		for(var i = 0, length1 = gallery.itemsToPush.length; i < length1; i++){
			gallery.itemsToPush[i] = '<div data-url=\'' + linkTo.root +
				(gallery.itemsToPush[i]) + '\' class=\'gallery__item\'><img src=\'' + linkTo.root +
				(gallery.itemsToPush[i]) + '\' alt><div class=\'gallery__darkness\'></div></div>';
		}

		if (gallery.isWorking) {
			gallery.loadingStart();

			gallery.itemsToPush = $(gallery.itemsToPush.join(''));

			gallery.container
				.append(gallery.itemsToPush);

			gallery.itemsToPush
				.hide()
				.imagesLoaded()
				.progress(function(imgLoad, image) {
					var $item = $(image.img).parents('.gallery__item');

					$item.show();

					gallery.container
						.masonry('appended', $item)
						.masonry();
				})
				.done(function() { 
					callback();
				});

			gallery.itemsToPush = [];
		}
	},

	// запуск подгрузки по скроллу
	scrollLoad		: function() {
		if (gallery.isWorking) {
			var
				pageHeight		=	$(document).height(),
				windowHeight	=	$(window).height(),
				windowScroll	=	$(window).scrollTop();

			var leftToBottom =	pageHeight - windowHeight - windowScroll;

			if (!gallery.isLoading && leftToBottom <= 150) {
				console.log('scrollLoad')
				gallery.otherPushing(function() {
					gallery.loadingEnd(gallery.scrollLoad);
					if (gallery.allItems.length === 0) {
						gallery.fullStop();
					}
				});
			}
		}
	}
};

jQuery(document).ready(function($) {
	if ($('.gallery').length) {
		gallery.getItems(function() {
			gallery.firstPushing(function() {
				gallery.loadingEnd(gallery.scrollLoad);
			});
		});

		$('body').on('click', '.gallery__btn', function(event) {
			event.preventDefault();
			
			gallery.otherPushing(function() {
				gallery.loadingEnd(gallery.scrollLoad);
			});
		});

		$(window).scroll(function(event) {
			gallery.scrollLoad();
		});

		$('body').on('click', '.gallery__item', function(event) {
			$('.gallery__modal')
				.html('<img src=\'' +
					$(this).attr('data-url') +
					'\' alt=\'\'>')
				.closest('.gallery__bg')
				.show();
		});

		$('body').on('click', '.gallery__bg', function(event) {
			$(this).hide();
		});
	}
});
// ../blocks/gallery/g2.js
// ../blocks/gallery/g3.js


function scrollBtn() {
	if ($(window).scrollTop() >= 800) {
		$('.up-btn').addClass('up-btn--show');
	} else {
		$('.up-btn').removeClass('up-btn--show');
	}
}

if ($('.up-btn').length) {
	$(document).ready(function() {
		scrollBtn();
	});

	$(window).scroll(function() {
		scrollBtn();
	});

	$('body').on('click', '.up-btn', function(event) {
		$('html, body')
			.stop()
			.animate({
				scrollTop: 0
			}, $(window).scrollTop()/4);
	});
}
if ($('#yaMap').length) {
	ymaps.ready(init);
	var
		map,
		point;
}

function init(){ 
	map = new ymaps.Map('yaMap', {
		center	: [
			59.93159322233984,
			30.375144682556122
		],
		zoom		: 13,
		controls	: [
			'zoomControl',
		],
	});

	var
		redIcon	=	ymaps.templateLayoutFactory
							.createClass('<div class=\'ya-map__icon ya-map__icon--red\'></div>'),
		blueIcon	=	ymaps.templateLayoutFactory
							.createClass('<div class=\'ya-map__icon ya-map__icon--blue\'></div>');

	pointOne = new ymaps.Placemark(
		[
			59.92022975962769,
			30.372955999999977
		], {
			hintContent			: 'Точка для оклейки',
			balloonContent		: 'СПб, Кременчугская ул., д.8',
		}, {
			iconLayout			: blueIcon,
			iconShape			: {
				type			: 'Rectangle',
				coordinates	: [
					[
						-7,
						-40
					], [
						33,
						0
					]
				]
			}
		}
	);

	pointTwo = new ymaps.Placemark(
		[
			59.94484093771931,
			30.38859016684016
		], {
			hintContent			: 'Главный офис',
			balloonContent		: 'СПб, Суворовский проспект, 65б, офис 16',
		}, {
			iconLayout			: redIcon,
			iconShape			: {
				type			: 'Rectangle',
				coordinates	: [
					[
						-7,
						-40
					], [
						33,
						0
					]
				]
			}
		}
	);

	map.behaviors.disable('scrollZoom');

	map.geoObjects.add(pointOne);
	map.geoObjects.add(pointTwo);
}