(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

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

(function ($, window, document, undefined) {
    var $window = $(window);

    $.fn.lazyload = function (options) {
        var elements = this;
        var $container;
        var settings = {
            threshold: 0,
            failure_limit: 0,
            event: "scroll",
            effect: "show",
            container: window,
            data_attribute: "original",
            skip_invisible: false,
            appear: null,
            load: null,
            placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
        };

        function update() {
            var counter = 0;

            elements.each(function () {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if ($.abovethetop(this, settings) || $.leftofbegin(this, settings)) {
                    /* Nothing. */
                } else if (!$.belowthefold(this, settings) && !$.rightoffold(this, settings)) {
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

        if (options) {
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
        $container = settings.container === undefined || settings.container === window ? $window : $(settings.container);

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function () {
                return update();
            });
        }

        this.each(function () {
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
            $self.one("appear", function () {
                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    $("<img />").bind("load", function () {

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
                        var temp = $.grep(elements, function (element) {
                            return !element.loaded;
                        });
                        elements = $(temp);

                        if (settings.load) {
                            var elements_left = elements.length;
                            settings.load.call(self, elements_left, settings);
                        }
                    }).attr("src", $self.attr("data-" + settings.data_attribute));
                }
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function () {
                    if (!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });

        /* Check if something appears when window is resized. */
        $window.bind("resize", function () {
            update();
        });

        /* With IOS5 force loading images when navigating with back button. */
        /* Non optimal workaround. */
        if (/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)) {
            $window.bind("pageshow", function (event) {
                if (event.originalEvent && event.originalEvent.persisted) {
                    elements.each(function () {
                        $(this).trigger("appear");
                    });
                }
            });
        }

        /* Force initial check if images should appear. */
        $(document).ready(function () {
            update();
        });

        return this;
    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function (element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };

    $.rightoffold = function (element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    };

    $.abovethetop = function (element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold + $(element).height();
    };

    $.leftofbegin = function (element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };

    $.inviewport = function (element, settings) {
        return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) && !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
    };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend($.expr[":"], {
        "below-the-fold": function belowTheFold(a) {
            return $.belowthefold(a, { threshold: 0 });
        },
        "above-the-top": function aboveTheTop(a) {
            return !$.belowthefold(a, { threshold: 0 });
        },
        "right-of-screen": function rightOfScreen(a) {
            return $.rightoffold(a, { threshold: 0 });
        },
        "left-of-screen": function leftOfScreen(a) {
            return !$.rightoffold(a, { threshold: 0 });
        },
        "in-viewport": function inViewport(a) {
            return $.inviewport(a, { threshold: 0 });
        },
        /* Maintain BC for couple of versions. */
        "above-the-fold": function aboveTheFold(a) {
            return !$.belowthefold(a, { threshold: 0 });
        },
        "right-of-fold": function rightOfFold(a) {
            return $.rightoffold(a, { threshold: 0 });
        },
        "left-of-fold": function leftOfFold(a) {
            return !$.rightoffold(a, { threshold: 0 });
        }
    });
})(jQuery, window, document);

},{}],2:[function(require,module,exports){
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
    var i, television;

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

},{}],3:[function(require,module,exports){
'use strict';

var burger = {
	/**
  * инит функция
  */
	init: function init() {
		$('body').on('click', '.burger', function () {
			$('.navigation').toggleClass('navigation--open');
		});
	}
};

module.exports = burger;

},{}],4:[function(require,module,exports){
'use strict';

var dotStrip = {
	/**
  * инит функция
  */
	init: function init() {
		$('body').on('click', '.dot-strip__input', function (event) {
			switch ($(this).closest('.dot-strip__input').attr('id')) {
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

			$(this).closest('.slider').find('.slide-pack').attr('data-slider-pos', $(this).attr('data-dot-pos'));
		});
	}
};

module.exports = dotStrip;

},{}],5:[function(require,module,exports){
'use strict';

var _vars = require('../../compile/vars');

var _vars2 = _interopRequireDefault(_vars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var driverForm = {
	busy: false,
	fieldsCorrect: false,

	data: {
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
		how_did_you_know: '',
		car_year: '',
		car_state: '',
		car_brand: '',
		car_model: '',
		car_color: '',
		avg_mileage_day: '',
		avg_mileage_weekend: '',
		comment: ''
	},
	/**
  * инит функция
  */
	init: function init() {
		var _this = this;

		$('body').on('click', '[data-way]', function (event) {
			event.preventDefault();

			var elem = $(event.target).closest('[data-way]');
			var page = $('.driver-form');
			var dataPage = Number(page.attr('data-page'));
			var currentPage = $('.driver-form__page[data-page=' + dataPage + ']');
			var nextPage = dataPage + 1;
			var prevPage = dataPage - 1;

			if (elem.attr('data-way') === 'prev') {
				if (prevPage === 1 || prevPage === 2) {
					page.attr('data-page', prevPage);
				}
			} else {
				switch (dataPage) {
					case 1:
						_this.data.how_did_you_know = $('#how_did_you_know').val();

					case 2:
						currentPage.find('[data-mask]').each(function (index, el) {
							if ($(el).length && $(el).attr('data-correct') !== 'true') {
								currentPage.find('[data-mask]').each(function (index, el) {
									if ($(el).attr('data-correct') !== 'true') {
										$(el).attr('data-correct', 'false');
									}
								});

								_this.fieldsCorrect = false;
								return false;
							} else {
								_this.data[$(el).attr('id')] = $(el).val();

								_this.fieldsCorrect = true;
							}
						});

						_this.data.phone = _this.data.phone.replace(/\D/g, '');
						break;

					case 3:
						currentPage.find('[data-mask]').each(function (index, el) {
							if ($(el).length && $(el).attr('data-correct') !== 'true') {
								currentPage.find('[data-mask]').each(function (index, el) {
									if ($(el).attr('data-correct') !== 'true') {
										$(el).attr('data-correct', 'false');
									}
								});

								_this.fieldsCorrect = false;

								return false;
							} else {
								currentPage.find('[data-filled]').each(function (index, el) {
									_this.data[$(el).attr('id')] = $(el).val();
								});

								_this.fieldsCorrect = true;
							}
						});
						break;

					default:
						console.log('wrong page number');
						break;
				}

				if (_this.fieldsCorrect) {
					switch (nextPage) {
						// на первой странице
						case 2:
							// переключить страницу
							page.attr('data-page', '2');
							// сбросить переменную
							_this.fieldsCorrect = false;
							break;

						// на второй странице
						case 3:
							// переключить страницу
							page.attr('data-page', '3');
							// сбросить переменную
							_this.fieldsCorrect = false;
							break;

						// на третьей странице
						case 4:
							// запустить функцию отправки формы
							_this.sendForm();
							// сбросить переменную
							_this.fieldsCorrect = false;
							break;

						default:
							console.log('wrong next page number');
							break;
					}
				}
			}
		});
	},

	/**
  * отправка формы на сервер
  */
	sendForm: function sendForm() {
		var _this2 = this;

		if (!this.busy) {
			console.log('start sending form');

			this.busy = true;

			$.ajax({
				url: _vars2.default.server + _vars2.default.api.becomeDriver,
				type: 'POST',
				data: this.data
			}).success(function (result) {
				$('.message--success').addClass('message--show');

				// переключить страницу
				$('.driver-form').attr('data-page', '1');

				// очистка полей формы
				$('[data-field-type]').each(function (index, el) {
					$(el).val('').attr('data-filled', 'false').attr('data-correct', 'null');
				});

				_this2.busy = false;

				console.log('form has beed sent');
			}).fail(function (error) {
				$('.message--fail').addClass('message--show');
				if (error.responseText) {
					console.log('servers answer:\n', error.responseText);
				} else {
					console.log('UFO have interrupted our server\'s work\nwe\'l try to fix it');
				}
				_this2.busy = false;
			});
		}
	}
};

module.exports = driverForm;

},{"../../compile/vars":20}],6:[function(require,module,exports){
'use strict';

var _vars = require('../../compile/vars');

var _vars2 = _interopRequireDefault(_vars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gallery = {
	numToLoad: 20,
	container: $('.gallery'),
	loader: $('.gallery__loading'),
	moreBtn: $('.gallery__btn'),
	busy: true,
	watched: false,

	urls: {
		all: [],
		toPush: []
	},

	items: {
		toPush: null
	},
	/**
  * получение списка изображений
  */
	getUrls: function getUrls() {
		return new Promise(function (result, error) {
			var request = new XMLHttpRequest();
			request.open('POST', _vars2.default.server + _vars2.default.api.gallery);
			request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
			request.onload = function () {
				if (request.status === 200) {
					result(JSON.parse(request.response));
				} else {
					error(Error('Image didn\'t load successfully; error code:' + request.statusText));
				}
			};
			request.onerror = function () {
				error(Error('There was a network error.'));
			};

			request.send(JSON.stringify({ tags: ['main'] }));
		});
	},
	loadStart: function loadStart() {
		this.busy = true;
		this.loader.show();

		$('.section--gallery .section__content').css('padding-bottom', '50px');
	},
	loadEnd: function loadEnd() {
		this.busy = false;
		this.loader.hide();

		$('.section--gallery .section__content').removeAttr('style');
	},

	/**
  * создание картинок в ДОМе
  * @param  {Boolean} isFirst первый ли вызов функции
  */
	makeImgs: function makeImgs(isFirst) {
		var _this = this;

		if (!this.urls.all.length) {
			return;
		}

		if (!isFirst) {
			this.loadStart();
		}

		if (this.urls.all.length >= this.numToLoad) {
			this.urls.toPush = this.urls.all.splice(-this.numToLoad, this.numToLoad);
		} else {
			this.urls.toPush = this.urls.all;
		}

		this.items.toPush = $(this.urls.toPush.join(''));
		this.urls.toPush.length = 0;

		if (isFirst) {
			this.container.masonry({
				columnWidth: '.gallery__item',
				isAnimated: true,
				isInitLayout: true,
				isResizable: true,
				itemSelector: '.gallery__item',
				percentPosition: true,
				singleMode: true
			}).append(this.items.toPush);
		} else {
			this.container.append(this.items.toPush);
		}

		this.items.toPush.hide().imagesLoaded().progress(function (imgLoad, image) {
			var $item = $(image.img).parents('.gallery__item');

			if (_this.loader.hasClass('gallery__loading--first')) {
				_this.loader.removeClass('gallery__loading--first');
			}

			$item.show();

			_this.container.masonry('appended', $item).masonry();
		}).done(function () {
			_this.loadEnd();
			_this.onScroll();

			if (!_this.watched) {
				$(window).scroll(function () {
					_this.onScroll();
				});
			}
		});

		this.items.toPush.length = 0;
	},

	/**
  * навешиваемая на скролл функция
  * запускает подгрузку фоток есди надо
  */
	onScroll: function onScroll() {
		var pageHeight = $(document).height();
		var windowHeight = $(window).height();
		var windowScroll = $(window).scrollTop();
		var leftToBottom = pageHeight - windowHeight - windowScroll;

		if (!this.busy && this.urls.all.length && leftToBottom <= 300) {
			console.log('scroll load');
			this.makeImgs();
		}
	},

	/**
  * инит функция
  */
	init: function init() {
		var _this2 = this;

		$('.gallery__bg').hide();

		this.getUrls().then(function (result) {
			console.log('got images');
			_this2.urls.all = result.reverse();

			_this2.urls.all.forEach(function (elem, i) {
				_this2.urls.all[i] = '<div data-url="' + _vars2.default.server + elem + '" class="gallery__item"><img src="' + _vars2.default.server + elem + '" alt><div class="gallery__darkness"></div></div>';
			});

			_this2.makeImgs(true);
		}, function (error) {
			console.log(error, 'error');
		});

		$('body').on('click', '.gallery__item', function (event) {
			var imgUrl = $(this).attr('data-url');

			$('[data-gal-modal]').attr('src', imgUrl).closest('.gallery__bg').fadeIn(300);
		});

		$('body').on('click', '.gallery__bg', function (event) {
			$(this).fadeOut(300);
		});
	}
};

module.exports = gallery;

},{"../../compile/vars":20}],7:[function(require,module,exports){
'use strict';

var input = {
	/**
  * инит функция
  */
	init: function init() {
		$('body').on('blur', '.input__input', function (event) {
			var elem = $(event.target).closest('.input__input');

			if (elem.val()) {
				elem.attr('data-filled', 'true');
			} else {
				elem.attr('data-filled', 'false');
			}
		});

		$('body').on('keyup', '[data-mask=\'tel\']', function (event) {
			var elem = $(event.target).closest('[data-mask=\'tel\']');

			elem.val(input.format(elem.val(), 'tel'));
		});

		$('body').on('click', '[data-mask=\'tel\']', function (event) {
			var elem = $(event.target).closest('[data-mask=\'tel\']');

			elem.val(input.format(elem.val(), 'tel'));
		});

		$('body').on('keyup', '[data-mask=\'year\']', function (event) {
			var elem = $(event.target).closest('[data-mask=\'year\']');

			elem.val(input.format(elem.val(), 'year'));
		});

		$('body').on('keyup', '[data-mask=\'number\']', function (event) {
			var elem = $(event.target).closest('[data-mask=\'number\']');

			elem.val(input.format(elem.val(), 'number'));
		});

		$('body').on('blur', '[data-mask]', function (event) {
			var elem = $(event.target).closest('[data-mask]');

			switch (elem.attr('data-mask')) {
				case 'email':
					if (/.+@.+\..+/i.test(elem.val())) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				case 'tel':
					// /^([\+]+)*[0-9\x20\x28\x29\-]{7,11}$/
					if (elem.val().length === 18) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				case 'name':
					if (/^[a-zA-Zа-яёА-ЯЁ][a-zA-Zа-яёА-ЯЁ0-9-_\.]{1,20}$/.test(elem.val())) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				case 'empty':
				case 'text':
				case 'number':
					if (elem.val()) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'empty');
					}
					break;

				case 'year':
					if (elem.val() && parseInt(elem.val()) >= 1900 && parseInt(elem.val()) <= new Date().getFullYear()) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;
			}
		});

		$('body').on('input', '[data-mask]', function (event) {
			var elem = $(event.target).closest('[data-mask]');

			elem.attr('data-correct', 'null');
		});
	},

	/**
  * форматирует значение в инпуте
  * @param  {string} data   значение в инпуте
  * @param  {string} format имя формата
  * @return {string}        отформатированное значение
  */
	format: function format(data, _format) {
		switch (_format) {
			case 'number':
				return data.replace(/\D/g, '');

			case 'year':
				data = input.format(data, 'number');

				if (data.length > 4) {
					data = data.slice(0, 4);
				}

				return data;

			case 'tel':
				data = input.format(data, 'number');

				var newData = '';

				if (data.length <= 11) {
					switch (data.length) {
						case 0:
							newData = '+7 (';
							break;
						case 1:
							if (data[0] !== '7') {
								newData = '+7 (' + data[0];
							} else {
								newData = '+7 (';
							}
							break;
						case 2:
							newData = '+7 (' + data[1];
							break;
						case 3:
							newData = '+7 (' + data[1] + data[2];
							break;
						case 4:
							newData = '+7 (' + data[1] + data[2] + data[3];
							break;
						case 5:
							newData = '+7 (' + data[1] + data[2] + data[3] + ') ' + data[4];
							break;
						case 6:
							newData = '+7 (' + data[1] + data[2] + data[3] + ') ' + data[4] + data[5];
							break;
						case 7:
							newData = '+7 (' + data[1] + data[2] + data[3] + ') ' + data[4] + data[5] + data[6];
							break;
						case 8:
							newData = '+7 (' + data[1] + data[2] + data[3] + ') ' + data[4] + data[5] + data[6] + '-' + data[7];
							break;
						case 9:
							newData = '+7 (' + data[1] + data[2] + data[3] + ') ' + data[4] + data[5] + data[6] + '-' + data[7] + data[8];
							break;
						case 10:
							newData = '+7 (' + data[1] + data[2] + data[3] + ') ' + data[4] + data[5] + data[6] + '-' + data[7] + data[8] + '-' + data[9];
							break;
						case 11:
							newData = '+7 (' + data[1] + data[2] + data[3] + ') ' + data[4] + data[5] + data[6] + '-' + data[7] + data[8] + '-' + data[9] + data[10];
							break;
					}
				} else {
					newData = '+7 (' + data[1] + data[2] + data[3] + ') ' + data[4] + data[5] + data[6] + '-' + data[7] + data[8] + '-' + data[9] + data[10];
				}
				return newData;

			default:
				console.log('wrong input format');
				break;
		}
	}
};

module.exports = input;

},{}],8:[function(require,module,exports){
'use strict';

var map = {
	/**
  * инит функция
  */
	init: function init() {
		$('#map').lazyload({
			threshold: 200,
			effect: 'fadeIn'
		});
	}
};

module.exports = map;

},{}],9:[function(require,module,exports){
'use strict';

var message = {
	/**
  * инит функция
  */
	init: function init() {
		$('body').on('click', '.message__bg, .message__close', function (event) {
			event.preventDefault();

			$(event.target).closest('.message').removeClass('message--show');
		});
	}
};

module.exports = message;

},{}],10:[function(require,module,exports){
'use strict';

var pin = {
	sec: 55555,
	hours: new Date().getHours(),
	minutes: new Date().getMinutes(),
	seconds: new Date().getSeconds(),
	/**
  * счетчик, увеличивает время
  */
	countdown: function countdown() {
		$('[data-clock=\'h\']').text(Math.floor(this.sec / 3600));
		$('[data-clock=\'m\']').text(Math.floor(this.sec % 3600 / 60));
		$('[data-clock=\'s\']').text(Math.floor(this.sec % 3600 % 60));

		this.sec += 1;
	},

	/**
  * добавляет к цифре ноль, чтоб получить двузначное число
  * @param  {number} number цифра или число
  * @return {number}        двузначное число
  */
	twoNumbers: function twoNumbers(number) {
		if (number < 10) {
			number = '0' + number.toString();
		}
		return number;
	},

	/**
  * обновляет время
  * вызывается каджую секунду
  */
	setTime: function setTime() {
		var _this = this;

		return function () {
			_this.hours = new Date().getHours();

			$('[data-clock=\'h\'').text(_this.twoNumbers(_this.hours));

			_this.minutes = new Date().getMinutes();

			$('[data-clock=\'m\'').text(_this.twoNumbers(_this.minutes));

			_this.seconds = new Date().getSeconds();

			$('[data-clock=\'s\'').text(_this.twoNumbers(_this.seconds));
		};
	},

	/**
  * инит функция
  */
	init: function init() {
		$('body').on('mouseenter', '.pin', function (event) {
			event.preventDefault();

			var elem = $(event.target).closest('.pin');

			elem.removeClass('pin--show').css('z-index', '2').siblings().removeClass('pin--show').css('z-index', '1');
		});

		if ($('html').hasClass('desktop')) {
			var newDate = new Date();

			newDate.setDate(newDate.getDate());

			$('[data-clock=\'h\'').text(this.hours);
			$('[data-clock=\'m\'').text(this.minutes);
			$('[data-clock=\'s\'').text(this.seconds);

			setInterval(this.setTime, 1000);
		} else {
			$('[data-clock=\'h\']').text(Math.floor(this.sec / 3600) < 10 ? '0' + Math.floor(this.sec / 3600) : Math.floor(this.sec / 3600));

			$('[data-clock=\'m\']').text(Math.floor(this.sec % 3600 / 60) < 10 ? '0' + Math.floor(this.sec % 3600 / 60) : Math.floor(this.sec % 3600 / 60));

			$('[data-clock=\'s\']').text(Math.floor(this.sec % 3600 % 60) < 10 ? '0' + Math.floor(this.sec % 3600 % 60) : Math.floor(this.sec % 3600 % 60));

			this.sec += 1;

			setInterval(this.countdown, 1000);
		}
	}
};

module.exports = pin;

},{}],11:[function(require,module,exports){
'use strict';

var question = {
	/**
  * инит функция
  */
	init: function init() {
		$('.questions__item').eq(1).hide();

		$('body').on('click', '.main-btn--hdiw', function (event) {
			var elem = $(event.target).closest('.main-btn--hdiw');
			event.preventDefault();

			if (!elem.hasClass('main-btn--active')) {
				elem.addClass('main-btn--active').siblings().removeClass('main-btn--active');

				$('.questions__item').eq(elem.index() - 2).fadeIn(300).siblings().fadeOut(300);

				$('.questions__item').find('.question__body').slideUp(300);
			}
		});

		$('body').on('click', '.question__header', function (event) {
			var elem = $(event.target).closest('.question__header');
			event.preventDefault();

			elem.siblings('.question__body').slideToggle(300).closest('.question').siblings('.question').find('.question__body').slideUp(300);
		});
	}
};

module.exports = question;

},{}],12:[function(require,module,exports){
'use strict';

var scrollBtn = {
	/**
  * инит функция
  */
	init: function init() {
		$('body').on('click', '.scroll-btn', function (event) {
			var elem = $(event.target).closest('.scroll-btn');
			event.preventDefault();

			$('html, body').animate({ scrollTop: elem.closest('.section').outerHeight() }, 700);
		});
	}
};

module.exports = scrollBtn;

},{}],13:[function(require,module,exports){
'use strict';

var search = {
	neededScroll: null,
	started: false,
	/**
  * инит функция
  */
	init: function init() {
		var _this = this;

		this.neededScroll = $('.search').offset().top - $(window).height() + $('.search').height() / 2;

		$(window).scroll(function () {
			if ($(window).scrollTop() >= _this.neededScroll && !_this.started) {
				$('.search').addClass('search--animate');
				_this.started = true;
			}
		});
	}
};

module.exports = search;

},{}],14:[function(require,module,exports){
'use strict';

var slidePack = {
	/**
  * инит функция
  */
	init: function init() {
		$('body').on('click', '[data-pag-pos]', function (event) {
			event.preventDefault();

			$(this).addClass('slide-pack__pag--active').siblings().removeClass('slide-pack__pag--active').closest('.slide-pack__pags').siblings('[data-slider-pos]').attr('data-slider-pos', $(this).attr('data-pag-pos'));
		});
	}
};

module.exports = slidePack;

},{}],15:[function(require,module,exports){
'use strict';

var tablet = {
	mobOne: $('#tablet').attr('data-mob-x1'),
	mobTwo: $('#tablet').attr('data-mob-x2'),
	mobThree: $('#tablet').attr('data-mob-x3'),
	tabOne: $('#tablet').attr('data-tab-x1'),
	tabTwo: $('#tablet').attr('data-tab-x2'),
	tabThree: $('#tablet').attr('data-tab-x3'),
	/**
  * запускаемая при загрузке функция
  */
	init: function init() {
		if (window.devicePixelRatio >= 3) {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', this.mobThree);
			} else {
				$('#tablet').attr('data-original', this.tabThree);
			}
		} else if (window.devicePixelRatio >= 2) {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', this.mobTwo);
			} else {
				$('#tablet').attr('data-original', this.tabTwo);
			}
		} else {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', this.mobOne);
			} else {
				$('#tablet').attr('data-original', this.tabOne);
			}
		}

		$('#tablet').lazyload({
			threshold: 200,
			effect: 'fadeIn'
		});
	}
};

module.exports = tablet;

},{}],16:[function(require,module,exports){
'use strict';

var upBtn = {
	/**
  * включает/выключает видимость кнопки
  */
	setVisibility: function setVisibility() {
		if ($(window).scrollTop() >= 800) {
			$('.up-btn').addClass('up-btn--show');
		} else {
			$('.up-btn').removeClass('up-btn--show');
		}
	},

	/**
  * запускаемая при загрузке функция
  */
	init: function init() {
		upBtn.setVisibility();

		$(window).scroll(function () {
			upBtn.setVisibility();
		});

		$('body').on('click', '.up-btn', function () {
			$('html, body').stop().animate({ scrollTop: 0 }, $(window).scrollTop() / 4);
		});
	}
};

module.exports = upBtn;

},{}],17:[function(require,module,exports){
'use strict';

var wdSlider = {
	/**
  * запускаемая при загрузке функция
  */
	init: function init() {
		$('body').on('click', '.wd-slider__pag', function (event) {
			event.preventDefault();

			$(this).addClass('wd-slider__pag--active').siblings().removeClass('wd-slider__pag--active');

			if ($(this).index() === 1) {
				$(this).closest('.wd-slider').addClass('wd-slider--two');
			} else {
				$(this).closest('.wd-slider').removeClass('wd-slider--two');
			}
		});
	}
};

module.exports = wdSlider;

},{}],18:[function(require,module,exports){
'use strict';

var yaMap = {
	points: [],
	map: {},
	/**
  * объявляет точки (надо выполнять после создания карты)
  */
	setPoints: function setPoints() {
		this.points = [{
			coords: [59.92022975962769, 30.372955999999977],
			titles: {
				hintContent: 'Бокс для оклейки',
				balloonContent: 'СПб, Кременчугская ул., д.8'
			},
			params: {
				iconLayout: ymaps.templateLayoutFactory.createClass('<div class=\'ya-map__icon ya-map__icon--blue\'></div>'),

				iconShape: {
					type: 'Rectangle',
					coordinates: [[-7, -40], [33, 0]]
				}
			}
		}, {
			coords: [59.94484093771931, 30.38859016684016],
			titles: {
				hintContent: 'Главный офис',
				balloonContent: 'СПб, Суворовский проспект, 65б, офис 16'
			},
			params: {
				iconLayout: ymaps.templateLayoutFactory.createClass('<div class=\'ya-map__icon ya-map__icon--red\'></div>'),

				iconShape: {
					type: 'Rectangle',
					coordinates: [[-7, -40], [33, 0]]
				}
			}
		}];
	},

	/**
  * создает точку на карте
  * @param {objext} point объект с данными точки
  */
	setPoint: function setPoint(point) {
		this.map.geoObjects.add(new ymaps.Placemark(point.coords, point.titles, point.params));
	},

	/**
  * создает карту
  */
	setMap: function setMap() {
		var _this = this;

		ymaps.ready(function () {
			_this.map = new ymaps.Map('yaMap', {
				center: [59.93159322233984, 30.375144682556122],
				controls: ['zoomControl'],
				zoom: 13
			});

			_this.setPoints();

			_this.points.forEach(function (elem) {
				_this.setPoint(elem);
			});

			_this.map.behaviors.disable('scrollZoom');
		});
	},

	/**
  * инит функция
  */
	init: function init() {
		this.setMap();
	}
};

module.exports = yaMap;

},{}],19:[function(require,module,exports){
'use strict';

var _vars = require('./vars');

var _vars2 = _interopRequireDefault(_vars);

var _driverForm = require('../blocks/driver-form/driver-form');

var _driverForm2 = _interopRequireDefault(_driverForm);

var _input = require('../blocks/input/input');

var _input2 = _interopRequireDefault(_input);

var _message = require('../blocks/message/message');

var _message2 = _interopRequireDefault(_message);

var _burger = require('../blocks/burger/burger');

var _burger2 = _interopRequireDefault(_burger);

var _scrollBtn = require('../blocks/scroll-btn/scroll-btn');

var _scrollBtn2 = _interopRequireDefault(_scrollBtn);

var _wdSlider = require('../blocks/wd-slider/wd-slider');

var _wdSlider2 = _interopRequireDefault(_wdSlider);

var _tablet = require('../blocks/tablet/tablet');

var _tablet2 = _interopRequireDefault(_tablet);

var _search = require('../blocks/search/search');

var _search2 = _interopRequireDefault(_search);

var _pin = require('../blocks/pin/pin');

var _pin2 = _interopRequireDefault(_pin);

var _map = require('../blocks/map/map');

var _map2 = _interopRequireDefault(_map);

var _slidePack = require('../blocks/slide-pack/slide-pack');

var _slidePack2 = _interopRequireDefault(_slidePack);

var _dotStrip = require('../blocks/dot-strip/dot-strip');

var _dotStrip2 = _interopRequireDefault(_dotStrip);

var _question = require('../blocks/question/question');

var _question2 = _interopRequireDefault(_question);

var _upBtn = require('../blocks/up-btn/up-btn');

var _upBtn2 = _interopRequireDefault(_upBtn);

var _yaMap = require('../blocks/ya-map/ya-map');

var _yaMap2 = _interopRequireDefault(_yaMap);

var _gallery = require('../blocks/gallery/gallery');

var _gallery2 = _interopRequireDefault(_gallery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../../bower_components/jquery_lazyload/jquery.lazyload');
require('device.js');

var jata = {
	/**
  * запускаемая при загрузке функция
  */
	ready: function ready() {
		if (document.readyState !== 'loading') {
			this.init();
		} else {
			document.addEventListener('DOMContentLoaded', this.init);
		}
	},

	/**
  * инит функция
  */
	init: function init() {
		_vars2.default.init();
		_burger2.default.init();
		_upBtn2.default.init();

		switch (window.location.pathname) {
			case '/':
				_driverForm2.default.init();
				_input2.default.init();
				_message2.default.init();
				_scrollBtn2.default.init();
				_wdSlider2.default.init();
				break;

			case '/about.html':
				break;

			case '/foradv.html':
				_dotStrip2.default.init();
				_map2.default.init();
				_pin2.default.init();
				_scrollBtn2.default.init();
				_search2.default.init();
				_slidePack2.default.init();
				_tablet2.default.init();
				break;

			case '/contacts.html':
				_yaMap2.default.init();
				break;

			case '/how.html':
				_question2.default.init();
				break;

			case '/gallery.html':
				_gallery2.default.init();
				break;

			default:
				location.href = _vars2.default.server;
				break;
		}
	}
};

jata.ready();

},{"../../bower_components/jquery_lazyload/jquery.lazyload":1,"../blocks/burger/burger":3,"../blocks/dot-strip/dot-strip":4,"../blocks/driver-form/driver-form":5,"../blocks/gallery/gallery":6,"../blocks/input/input":7,"../blocks/map/map":8,"../blocks/message/message":9,"../blocks/pin/pin":10,"../blocks/question/question":11,"../blocks/scroll-btn/scroll-btn":12,"../blocks/search/search":13,"../blocks/slide-pack/slide-pack":14,"../blocks/tablet/tablet":15,"../blocks/up-btn/up-btn":16,"../blocks/wd-slider/wd-slider":17,"../blocks/ya-map/ya-map":18,"./vars":20,"device.js":2}],20:[function(require,module,exports){
'use strict';

var vars = {
	production: false,
	server: '',

	api: {
		becomeDriver: '/api/v1/accounts/becomedriver',
		gallery: '/api/v1/gallery'
	},

	init: function init() {
		this.server = this.production ? 'https://jata.ru' : 'http://dev.jata.ru';
	}
};

module.exports = vars;

},{}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL2pxdWVyeV9sYXp5bG9hZC9qcXVlcnkubGF6eWxvYWQuanMiLCJub2RlX21vZHVsZXMvZGV2aWNlLmpzL2xpYi9kZXZpY2UuanMiLCJzcmMvYmxvY2tzL2J1cmdlci9idXJnZXIuanMiLCJzcmMvYmxvY2tzL2RvdC1zdHJpcC9kb3Qtc3RyaXAuanMiLCJzcmMvYmxvY2tzL2RyaXZlci1mb3JtL2RyaXZlci1mb3JtLmpzIiwic3JjL2Jsb2Nrcy9nYWxsZXJ5L2dhbGxlcnkuanMiLCJzcmMvYmxvY2tzL2lucHV0L2lucHV0LmpzIiwic3JjL2Jsb2Nrcy9tYXAvbWFwLmpzIiwic3JjL2Jsb2Nrcy9tZXNzYWdlL21lc3NhZ2UuanMiLCJzcmMvYmxvY2tzL3Bpbi9waW4uanMiLCJzcmMvYmxvY2tzL3F1ZXN0aW9uL3F1ZXN0aW9uLmpzIiwic3JjL2Jsb2Nrcy9zY3JvbGwtYnRuL3Njcm9sbC1idG4uanMiLCJzcmMvYmxvY2tzL3NlYXJjaC9zZWFyY2guanMiLCJzcmMvYmxvY2tzL3NsaWRlLXBhY2svc2xpZGUtcGFjay5qcyIsInNyYy9ibG9ja3MvdGFibGV0L3RhYmxldC5qcyIsInNyYy9ibG9ja3MvdXAtYnRuL3VwLWJ0bi5qcyIsInNyYy9ibG9ja3Mvd2Qtc2xpZGVyL3dkLXNsaWRlci5qcyIsInNyYy9ibG9ja3MveWEtbWFwL3lhLW1hcC5qcyIsInNyYy9jb21waWxlL2N1c3RvbS5qcyIsInNyYy9jb21waWxlL3ZhcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7Ozs7Ozs7Ozs7QUFlQSxDQUFDLFVBQVMsQ0FBVCxFQUFZLE1BQVosRUFBb0IsUUFBcEIsRUFBOEIsU0FBOUIsRUFBeUM7QUFDdEMsUUFBSSxVQUFVLEVBQUUsTUFBRixDQUFkOztBQUVBLE1BQUUsRUFBRixDQUFLLFFBQUwsR0FBZ0IsVUFBUyxPQUFULEVB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBRUQsUUFBSyxlQUFMO0FBQ0Msc0JBQVEsSUFBUjtBQUNBOztBQUVEO0FBQ0MsYUFBUyxJQUFULEdBQWdCLGVBQUssTUFBckI7QUFDQTtBQXBDRjtBQXNDQTtBQXpEVyxDQUFiOztBQTREQSxLQUFLLEtBQUw7Ozs7O0FDcEZBLElBQU0sT0FBTztBQUNaLGFBQWEsS0FERDtBQUVaLFNBQVUsRUFGRTs7QUFJWixNQUFLO0FBQ0osZ0JBQWMsK0JBRFY7QUFFSixXQUFXO0FBRlAsRUFKTzs7QUFTWixLQVRZLGtCQVNMO0FBQ04sT0FBSyxNQUFMLEdBQWMsS0FBSyxVQUFMLEdBQWtCLGlCQUFsQixHQUFzQyxvQkFBcEQ7QUFDQTtBQVhXLENBQWI7O0FBY0EsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogTGF6eSBMb2FkIC0galF1ZXJ5IHBsdWdpbiBmb3IgbGF6eSBsb2FkaW5nIGltYWdlc1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDE1IE1pa2EgVHV1cG9sYVxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBQcm9qZWN0IGhvbWU6XG4gKiAgIGh0dHA6Ly93d3cuYXBwZWxzaWluaS5uZXQvcHJvamVjdHMvbGF6eWxvYWRcbiAqXG4gKiBWZXJzaW9uOiAgMS45LjdcbiAqXG4gKi9cblxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG4gICAgJC5mbi5sYXp5bG9hZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcztcbiAgICAgICAgdmFyICRjb250YWluZXI7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIHRocmVzaG9sZCAgICAgICA6IDAsXG4gICAgICAgICAgICBmYWlsdXJlX2xpbWl0ICAgOiAwLFxuICAgICAgICAgICAgZXZlbnQgICAgICAgICAgIDogXCJzY3JvbGxcIixcbiAgICAgICAgICAgIGVmZmVjdCAgICAgICAgICA6IFwic2hvd1wiLFxuICAgICAgICAgICAgY29udGFpbmVyICAgICAgIDogd2luZG93LFxuICAgICAgICAgICAgZGF0YV9hdHRyaWJ1dGUgIDogXCJvcmlnaW5hbFwiLFxuICAgICAgICAgICAgc2tpcF9pbnZpc2libGUgIDogZmFsc2UsXG4gICAgICAgICAgICBhcHBlYXIgICAgICAgICAgOiBudWxsLFxuICAgICAgICAgICAgbG9hZCAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyICAgICA6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQUFYTlNSMElBcnM0YzZRQUFBQVJuUVUxQkFBQ3hqd3Y4WVFVQUFBQUpjRWhaY3dBQURzUUFBQTdFQVpVckRoc0FBQUFOU1VSQlZCaFhZemg4K1BCL0FBZmZBMG5OUHVDTEFBQUFBRWxGVGtTdVFtQ0NcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBjb3VudGVyID0gMDtcblxuICAgICAgICAgICAgZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5za2lwX2ludmlzaWJsZSAmJiAhJHRoaXMuaXMoXCI6dmlzaWJsZVwiKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgkLmFib3ZldGhldG9wKHRoaXMsIHNldHRpbmdzKSB8fFxuICAgICAgICAgICAgICAgICAgICAkLmxlZnRvZmJlZ2luKHRoaXMsIHNldHRpbmdzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogTm90aGluZy4gKi9cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEkLmJlbG93dGhlZm9sZCh0aGlzLCBzZXR0aW5ncykgJiZcbiAgICAgICAgICAgICAgICAgICAgISQucmlnaHRvZmZvbGQodGhpcywgc2V0dGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy50cmlnZ2VyKFwiYXBwZWFyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaWYgd2UgZm91bmQgYW4gaW1hZ2Ugd2UnbGwgbG9hZCwgcmVzZXQgdGhlIGNvdW50ZXIgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgrK2NvdW50ZXIgPiBzZXR0aW5ncy5mYWlsdXJlX2xpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYob3B0aW9ucykge1xuICAgICAgICAgICAgLyogTWFpbnRhaW4gQkMgZm9yIGEgY291cGxlIG9mIHZlcnNpb25zLiAqL1xuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gb3B0aW9ucy5mYWlsdXJlbGltaXQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZhaWx1cmVfbGltaXQgPSBvcHRpb25zLmZhaWx1cmVsaW1pdDtcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5mYWlsdXJlbGltaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBvcHRpb25zLmVmZmVjdHNwZWVkKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lZmZlY3Rfc3BlZWQgPSBvcHRpb25zLmVmZmVjdHNwZWVkO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLmVmZmVjdHNwZWVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmV4dGVuZChzZXR0aW5ncywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDYWNoZSBjb250YWluZXIgYXMgalF1ZXJ5IGFzIG9iamVjdC4gKi9cbiAgICAgICAgJGNvbnRhaW5lciA9IChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSA/ICR3aW5kb3cgOiAkKHNldHRpbmdzLmNvbnRhaW5lcik7XG5cbiAgICAgICAgLyogRmlyZSBvbmUgc2Nyb2xsIGV2ZW50IHBlciBzY3JvbGwuIE5vdCBvbmUgc2Nyb2xsIGV2ZW50IHBlciBpbWFnZS4gKi9cbiAgICAgICAgaWYgKDAgPT09IHNldHRpbmdzLmV2ZW50LmluZGV4T2YoXCJzY3JvbGxcIikpIHtcbiAgICAgICAgICAgICRjb250YWluZXIuYmluZChzZXR0aW5ncy5ldmVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgJHNlbGYgPSAkKHNlbGYpO1xuXG4gICAgICAgICAgICBzZWxmLmxvYWRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvKiBJZiBubyBzcmMgYXR0cmlidXRlIGdpdmVuIHVzZSBkYXRhOnVyaS4gKi9cbiAgICAgICAgICAgIGlmICgkc2VsZi5hdHRyKFwic3JjXCIpID09PSB1bmRlZmluZWQgfHwgJHNlbGYuYXR0cihcInNyY1wiKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHNlbGYuaXMoXCJpbWdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNlbGYuYXR0cihcInNyY1wiLCBzZXR0aW5ncy5wbGFjZWhvbGRlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBXaGVuIGFwcGVhciBpcyB0cmlnZ2VyZWQgbG9hZCBvcmlnaW5hbCBpbWFnZS4gKi9cbiAgICAgICAgICAgICRzZWxmLm9uZShcImFwcGVhclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5hcHBlYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50c19sZWZ0ID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuYXBwZWFyLmNhbGwoc2VsZiwgZWxlbWVudHNfbGVmdCwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICQoXCI8aW1nIC8+XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYmluZChcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luYWwgPSAkc2VsZi5hdHRyKFwiZGF0YS1cIiArIHNldHRpbmdzLmRhdGFfYXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzZWxmLmlzKFwiaW1nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLmF0dHIoXCJzcmNcIiwgb3JpZ2luYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgXCJ1cmwoJ1wiICsgb3JpZ2luYWwgKyBcIicpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZltzZXR0aW5ncy5lZmZlY3RdKHNldHRpbmdzLmVmZmVjdF9zcGVlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBSZW1vdmUgaW1hZ2UgZnJvbSBhcnJheSBzbyBpdCBpcyBub3QgbG9vcGVkIG5leHQgdGltZS4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9ICQuZ3JlcChlbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWVsZW1lbnQubG9hZGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gJCh0ZW1wKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5sb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50c19sZWZ0ID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5sb2FkLmNhbGwoc2VsZiwgZWxlbWVudHNfbGVmdCwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInNyY1wiLCAkc2VsZi5hdHRyKFwiZGF0YS1cIiArIHNldHRpbmdzLmRhdGFfYXR0cmlidXRlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qIFdoZW4gd2FudGVkIGV2ZW50IGlzIHRyaWdnZXJlZCBsb2FkIG9yaWdpbmFsIGltYWdlICovXG4gICAgICAgICAgICAvKiBieSB0cmlnZ2VyaW5nIGFwcGVhci4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKDAgIT09IHNldHRpbmdzLmV2ZW50LmluZGV4T2YoXCJzY3JvbGxcIikpIHtcbiAgICAgICAgICAgICAgICAkc2VsZi5iaW5kKHNldHRpbmdzLmV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGYudHJpZ2dlcihcImFwcGVhclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKiBDaGVjayBpZiBzb21ldGhpbmcgYXBwZWFycyB3aGVuIHdpbmRvdyBpcyByZXNpemVkLiAqL1xuICAgICAgICAkd2luZG93LmJpbmQoXCJyZXNpemVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyogV2l0aCBJT1M1IGZvcmNlIGxvYWRpbmcgaW1hZ2VzIHdoZW4gbmF2aWdhdGluZyB3aXRoIGJhY2sgYnV0dG9uLiAqL1xuICAgICAgICAvKiBOb24gb3B0aW1hbCB3b3JrYXJvdW5kLiAqL1xuICAgICAgICBpZiAoKC8oPzppcGhvbmV8aXBvZHxpcGFkKS4qb3MgNS9naSkudGVzdChuYXZpZ2F0b3IuYXBwVmVyc2lvbikpIHtcbiAgICAgICAgICAgICR3aW5kb3cuYmluZChcInBhZ2VzaG93XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5wZXJzaXN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykudHJpZ2dlcihcImFwcGVhclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBGb3JjZSBpbml0aWFsIGNoZWNrIGlmIGltYWdlcyBzaG91bGQgYXBwZWFyLiAqL1xuICAgICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyogQ29udmVuaWVuY2UgbWV0aG9kcyBpbiBqUXVlcnkgbmFtZXNwYWNlLiAgICAgICAgICAgKi9cbiAgICAvKiBVc2UgYXMgICQuYmVsb3d0aGVmb2xkKGVsZW1lbnQsIHt0aHJlc2hvbGQgOiAxMDAsIGNvbnRhaW5lciA6IHdpbmRvd30pICovXG5cbiAgICAkLmJlbG93dGhlZm9sZCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgPyB3aW5kb3cuaW5uZXJIZWlnaHQgOiAkd2luZG93LmhlaWdodCgpKSArICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLnRvcCArICQoc2V0dGluZ3MuY29udGFpbmVyKS5oZWlnaHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkIDw9ICQoZWxlbWVudCkub2Zmc2V0KCkudG9wIC0gc2V0dGluZ3MudGhyZXNob2xkO1xuICAgIH07XG5cbiAgICAkLnJpZ2h0b2Zmb2xkID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGZvbGQ7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lciA9PT0gdW5kZWZpbmVkIHx8IHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSB7XG4gICAgICAgICAgICBmb2xkID0gJHdpbmRvdy53aWR0aCgpICsgJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLmxlZnQgKyAkKHNldHRpbmdzLmNvbnRhaW5lcikud2lkdGgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkIDw9ICQoZWxlbWVudCkub2Zmc2V0KCkubGVmdCAtIHNldHRpbmdzLnRocmVzaG9sZDtcbiAgICB9O1xuXG4gICAgJC5hYm92ZXRoZXRvcCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLnRvcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkID49ICQoZWxlbWVudCkub2Zmc2V0KCkudG9wICsgc2V0dGluZ3MudGhyZXNob2xkICArICQoZWxlbWVudCkuaGVpZ2h0KCk7XG4gICAgfTtcblxuICAgICQubGVmdG9mYmVnaW4gPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICB2YXIgZm9sZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHwgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpIHtcbiAgICAgICAgICAgIGZvbGQgPSAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvbGQgPSAkKHNldHRpbmdzLmNvbnRhaW5lcikub2Zmc2V0KCkubGVmdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkID49ICQoZWxlbWVudCkub2Zmc2V0KCkubGVmdCArIHNldHRpbmdzLnRocmVzaG9sZCArICQoZWxlbWVudCkud2lkdGgoKTtcbiAgICB9O1xuXG4gICAgJC5pbnZpZXdwb3J0ID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgIHJldHVybiAhJC5yaWdodG9mZm9sZChlbGVtZW50LCBzZXR0aW5ncykgJiYgISQubGVmdG9mYmVnaW4oZWxlbWVudCwgc2V0dGluZ3MpICYmXG4gICAgICAgICAgICAgICAgISQuYmVsb3d0aGVmb2xkKGVsZW1lbnQsIHNldHRpbmdzKSAmJiAhJC5hYm92ZXRoZXRvcChlbGVtZW50LCBzZXR0aW5ncyk7XG4gICAgIH07XG5cbiAgICAvKiBDdXN0b20gc2VsZWN0b3JzIGZvciB5b3VyIGNvbnZlbmllbmNlLiAgICovXG4gICAgLyogVXNlIGFzICQoXCJpbWc6YmVsb3ctdGhlLWZvbGRcIikuc29tZXRoaW5nKCkgb3IgKi9cbiAgICAvKiAkKFwiaW1nXCIpLmZpbHRlcihcIjpiZWxvdy10aGUtZm9sZFwiKS5zb21ldGhpbmcoKSB3aGljaCBpcyBmYXN0ZXIgKi9cblxuICAgICQuZXh0ZW5kKCQuZXhwcltcIjpcIl0sIHtcbiAgICAgICAgXCJiZWxvdy10aGUtZm9sZFwiIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5iZWxvd3RoZWZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJhYm92ZS10aGUtdG9wXCIgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gISQuYmVsb3d0aGVmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwicmlnaHQtb2Ytc2NyZWVuXCI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICQucmlnaHRvZmZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJsZWZ0LW9mLXNjcmVlblwiIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gISQucmlnaHRvZmZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJpbi12aWV3cG9ydFwiICAgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5pbnZpZXdwb3J0KGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIC8qIE1haW50YWluIEJDIGZvciBjb3VwbGUgb2YgdmVyc2lvbnMuICovXG4gICAgICAgIFwiYWJvdmUtdGhlLWZvbGRcIiA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLmJlbG93dGhlZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcInJpZ2h0LW9mLWZvbGRcIiAgOiBmdW5jdGlvbihhKSB7IHJldHVybiAkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwibGVmdC1vZi1mb2xkXCIgICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcbiIsIi8vIERldmljZS5qc1xuLy8gKGMpIDIwMTQgTWF0dGhldyBIdWRzb25cbi8vIERldmljZS5qcyBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4vLyBGb3IgYWxsIGRldGFpbHMgYW5kIGRvY3VtZW50YXRpb246XG4vLyBodHRwOi8vbWF0dGhld2h1ZHNvbi5tZS9wcm9qZWN0cy9kZXZpY2UuanMvXG5cbihmdW5jdGlvbigpIHtcblxuICB2YXIgZGV2aWNlLFxuICAgIHByZXZpb3VzRGV2aWNlLFxuICAgIGFkZENsYXNzLFxuICAgIGRvY3VtZW50RWxlbWVudCxcbiAgICBmaW5kLFxuICAgIGhhbmRsZU9yaWVudGF0aW9uLFxuICAgIGhhc0NsYXNzLFxuICAgIG9yaWVudGF0aW9uRXZlbnQsXG4gICAgcmVtb3ZlQ2xhc3MsXG4gICAgdXNlckFnZW50O1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBkZXZpY2UgdmFyaWFibGUuXG4gIHByZXZpb3VzRGV2aWNlID0gd2luZG93LmRldmljZTtcblxuICBkZXZpY2UgPSB7fTtcblxuICAvLyBBZGQgZGV2aWNlIGFzIGEgZ2xvYmFsIG9iamVjdC5cbiAgd2luZG93LmRldmljZSA9IGRldmljZTtcblxuICAvLyBUaGUgPGh0bWw+IGVsZW1lbnQuXG4gIGRvY3VtZW50RWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgLy8gVGhlIGNsaWVudCB1c2VyIGFnZW50IHN0cmluZy5cbiAgLy8gTG93ZXJjYXNlLCBzbyB3ZSBjYW4gdXNlIHRoZSBtb3JlIGVmZmljaWVudCBpbmRleE9mKCksIGluc3RlYWQgb2YgUmVnZXhcbiAgdXNlckFnZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuICAvLyBNYWluIGZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIGRldmljZS5pb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5pcGhvbmUoKSB8fCBkZXZpY2UuaXBvZCgpIHx8IGRldmljZS5pcGFkKCk7XG4gIH07XG5cbiAgZGV2aWNlLmlwaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gIWRldmljZS53aW5kb3dzKCkgJiYgZmluZCgnaXBob25lJyk7XG4gIH07XG5cbiAgZGV2aWNlLmlwb2QgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ2lwb2QnKTtcbiAgfTtcblxuICBkZXZpY2UuaXBhZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmluZCgnaXBhZCcpO1xuICB9O1xuXG4gIGRldmljZS5hbmRyb2lkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhZGV2aWNlLndpbmRvd3MoKSAmJiBmaW5kKCdhbmRyb2lkJyk7XG4gIH07XG5cbiAgZGV2aWNlLmFuZHJvaWRQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmFuZHJvaWQoKSAmJiBmaW5kKCdtb2JpbGUnKTtcbiAgfTtcblxuICBkZXZpY2UuYW5kcm9pZFRhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmFuZHJvaWQoKSAmJiAhZmluZCgnbW9iaWxlJyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ2JsYWNrYmVycnknKSB8fCBmaW5kKCdiYjEwJykgfHwgZmluZCgncmltJyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnlQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmJsYWNrYmVycnkoKSAmJiAhZmluZCgndGFibGV0Jyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnlUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5ibGFja2JlcnJ5KCkgJiYgZmluZCgndGFibGV0Jyk7XG4gIH07XG5cbiAgZGV2aWNlLndpbmRvd3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ3dpbmRvd3MnKTtcbiAgfTtcblxuICBkZXZpY2Uud2luZG93c1Bob25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2Uud2luZG93cygpICYmIGZpbmQoJ3Bob25lJyk7XG4gIH07XG5cbiAgZGV2aWNlLndpbmRvd3NUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS53aW5kb3dzKCkgJiYgKGZpbmQoJ3RvdWNoJykgJiYgIWRldmljZS53aW5kb3dzUGhvbmUoKSk7XG4gIH07XG5cbiAgZGV2aWNlLmZ4b3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChmaW5kKCcobW9iaWxlOycpIHx8IGZpbmQoJyh0YWJsZXQ7JykpICYmIGZpbmQoJzsgcnY6Jyk7XG4gIH07XG5cbiAgZGV2aWNlLmZ4b3NQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmZ4b3MoKSAmJiBmaW5kKCdtb2JpbGUnKTtcbiAgfTtcblxuICBkZXZpY2UuZnhvc1RhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmZ4b3MoKSAmJiBmaW5kKCd0YWJsZXQnKTtcbiAgfTtcblxuICBkZXZpY2UubWVlZ28gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ21lZWdvJyk7XG4gIH07XG5cbiAgZGV2aWNlLmNvcmRvdmEgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5jb3Jkb3ZhICYmIGxvY2F0aW9uLnByb3RvY29sID09PSAnZmlsZTonO1xuICB9O1xuXG4gIGRldmljZS5ub2RlV2Via2l0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93LnByb2Nlc3MgPT09ICdvYmplY3QnO1xuICB9O1xuXG4gIGRldmljZS5tb2JpbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5hbmRyb2lkUGhvbmUoKSB8fCBkZXZpY2UuaXBob25lKCkgfHwgZGV2aWNlLmlwb2QoKSB8fCBkZXZpY2Uud2luZG93c1Bob25lKCkgfHwgZGV2aWNlLmJsYWNrYmVycnlQaG9uZSgpIHx8IGRldmljZS5meG9zUGhvbmUoKSB8fCBkZXZpY2UubWVlZ28oKTtcbiAgfTtcblxuICBkZXZpY2UudGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuaXBhZCgpIHx8IGRldmljZS5hbmRyb2lkVGFibGV0KCkgfHwgZGV2aWNlLmJsYWNrYmVycnlUYWJsZXQoKSB8fCBkZXZpY2Uud2luZG93c1RhYmxldCgpIHx8IGRldmljZS5meG9zVGFibGV0KCk7XG4gIH07XG5cbiAgZGV2aWNlLmRlc2t0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICFkZXZpY2UudGFibGV0KCkgJiYgIWRldmljZS5tb2JpbGUoKTtcbiAgfTtcblxuICBkZXZpY2UudGVsZXZpc2lvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCB0ZWxldmlzaW9uO1xuXG4gICAgdGVsZXZpc2lvbiA9IFtcbiAgICAgIFwiZ29vZ2xldHZcIixcbiAgICAgIFwidmllcmFcIixcbiAgICAgIFwic21hcnR0dlwiLFxuICAgICAgXCJpbnRlcm5ldC50dlwiLFxuICAgICAgXCJuZXRjYXN0XCIsXG4gICAgICBcIm5ldHR2XCIsXG4gICAgICBcImFwcGxldHZcIixcbiAgICAgIFwiYm94ZWVcIixcbiAgICAgIFwia3lsb1wiLFxuICAgICAgXCJyb2t1XCIsXG4gICAgICBcImRsbmFkb2NcIixcbiAgICAgIFwicm9rdVwiLFxuICAgICAgXCJwb3ZfdHZcIixcbiAgICAgIFwiaGJidHZcIixcbiAgICAgIFwiY2UtaHRtbFwiXG4gICAgXTtcblxuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgdGVsZXZpc2lvbi5sZW5ndGgpIHtcbiAgICAgIGlmIChmaW5kKHRlbGV2aXNpb25baV0pKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfTtcblxuICBkZXZpY2UucG9ydHJhaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aCkgPiAxO1xuICB9O1xuXG4gIGRldmljZS5sYW5kc2NhcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aCkgPCAxO1xuICB9O1xuXG4gIC8vIFB1YmxpYyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gZGV2aWNlLmpzIGluIG5vQ29uZmxpY3QgbW9kZSxcbiAgLy8gcmV0dXJuaW5nIHRoZSBkZXZpY2UgdmFyaWFibGUgdG8gaXRzIHByZXZpb3VzIG93bmVyLlxuICBkZXZpY2Uubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuZGV2aWNlID0gcHJldmlvdXNEZXZpY2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gUHJpdmF0ZSBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gU2ltcGxlIFVBIHN0cmluZyBzZWFyY2hcbiAgZmluZCA9IGZ1bmN0aW9uIChuZWVkbGUpIHtcbiAgICByZXR1cm4gdXNlckFnZW50LmluZGV4T2YobmVlZGxlKSAhPT0gLTE7XG4gIH07XG5cbiAgLy8gQ2hlY2sgaWYgZG9jdW1lbnRFbGVtZW50IGFscmVhZHkgaGFzIGEgZ2l2ZW4gY2xhc3MuXG4gIGhhc0NsYXNzID0gZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgIHZhciByZWdleDtcbiAgICByZWdleCA9IG5ldyBSZWdFeHAoY2xhc3NOYW1lLCAnaScpO1xuICAgIHJldHVybiBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLm1hdGNoKHJlZ2V4KTtcbiAgfTtcblxuICAvLyBBZGQgb25lIG9yIG1vcmUgQ1NTIGNsYXNzZXMgdG8gdGhlIDxodG1sPiBlbGVtZW50LlxuICBhZGRDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICB2YXIgY3VycmVudENsYXNzTmFtZXMgPSBudWxsO1xuICAgIGlmICghaGFzQ2xhc3MoY2xhc3NOYW1lKSkge1xuICAgICAgY3VycmVudENsYXNzTmFtZXMgPSBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICAgIGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUgPSBjdXJyZW50Q2xhc3NOYW1lcyArIFwiIFwiICsgY2xhc3NOYW1lO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZW1vdmUgc2luZ2xlIENTUyBjbGFzcyBmcm9tIHRoZSA8aHRtbD4gZWxlbWVudC5cbiAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgaWYgKGhhc0NsYXNzKGNsYXNzTmFtZSkpIHtcbiAgICAgIGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUgPSBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UoXCIgXCIgKyBjbGFzc05hbWUsIFwiXCIpO1xuICAgIH1cbiAgfTtcblxuICAvLyBIVE1MIEVsZW1lbnQgSGFuZGxpbmdcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gSW5zZXJ0IHRoZSBhcHByb3ByaWF0ZSBDU1MgY2xhc3MgYmFzZWQgb24gdGhlIF91c2VyX2FnZW50LlxuXG4gIGlmIChkZXZpY2UuaW9zKCkpIHtcbiAgICBpZiAoZGV2aWNlLmlwYWQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJpb3MgaXBhZCB0YWJsZXRcIik7XG4gICAgfSBlbHNlIGlmIChkZXZpY2UuaXBob25lKCkpIHtcbiAgICAgIGFkZENsYXNzKFwiaW9zIGlwaG9uZSBtb2JpbGVcIik7XG4gICAgfSBlbHNlIGlmIChkZXZpY2UuaXBvZCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImlvcyBpcG9kIG1vYmlsZVwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmFuZHJvaWQoKSkge1xuICAgIGlmIChkZXZpY2UuYW5kcm9pZFRhYmxldCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImFuZHJvaWQgdGFibGV0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhcImFuZHJvaWQgbW9iaWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UuYmxhY2tiZXJyeSgpKSB7XG4gICAgaWYgKGRldmljZS5ibGFja2JlcnJ5VGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwiYmxhY2tiZXJyeSB0YWJsZXRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiYmxhY2tiZXJyeSBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS53aW5kb3dzKCkpIHtcbiAgICBpZiAoZGV2aWNlLndpbmRvd3NUYWJsZXQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJ3aW5kb3dzIHRhYmxldFwiKTtcbiAgICB9IGVsc2UgaWYgKGRldmljZS53aW5kb3dzUGhvbmUoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJ3aW5kb3dzIG1vYmlsZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkQ2xhc3MoXCJkZXNrdG9wXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UuZnhvcygpKSB7XG4gICAgaWYgKGRldmljZS5meG9zVGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwiZnhvcyB0YWJsZXRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiZnhvcyBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS5tZWVnbygpKSB7XG4gICAgYWRkQ2xhc3MoXCJtZWVnbyBtb2JpbGVcIik7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLm5vZGVXZWJraXQoKSkge1xuICAgIGFkZENsYXNzKFwibm9kZS13ZWJraXRcIik7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLnRlbGV2aXNpb24oKSkge1xuICAgIGFkZENsYXNzKFwidGVsZXZpc2lvblwiKTtcbiAgfSBlbHNlIGlmIChkZXZpY2UuZGVza3RvcCgpKSB7XG4gICAgYWRkQ2xhc3MoXCJkZXNrdG9wXCIpO1xuICB9XG5cbiAgaWYgKGRldmljZS5jb3Jkb3ZhKCkpIHtcbiAgICBhZGRDbGFzcyhcImNvcmRvdmFcIik7XG4gIH1cblxuICAvLyBPcmllbnRhdGlvbiBIYW5kbGluZ1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEhhbmRsZSBkZXZpY2Ugb3JpZW50YXRpb24gY2hhbmdlcy5cbiAgaGFuZGxlT3JpZW50YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGRldmljZS5sYW5kc2NhcGUoKSkge1xuICAgICAgcmVtb3ZlQ2xhc3MoXCJwb3J0cmFpdFwiKTtcbiAgICAgIGFkZENsYXNzKFwibGFuZHNjYXBlXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVDbGFzcyhcImxhbmRzY2FwZVwiKTtcbiAgICAgIGFkZENsYXNzKFwicG9ydHJhaXRcIik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfTtcblxuICAvLyBEZXRlY3Qgd2hldGhlciBkZXZpY2Ugc3VwcG9ydHMgb3JpZW50YXRpb25jaGFuZ2UgZXZlbnQsXG4gIC8vIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gdGhlIHJlc2l6ZSBldmVudC5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh3aW5kb3csIFwib25vcmllbnRhdGlvbmNoYW5nZVwiKSkge1xuICAgIG9yaWVudGF0aW9uRXZlbnQgPSBcIm9yaWVudGF0aW9uY2hhbmdlXCI7XG4gIH0gZWxzZSB7XG4gICAgb3JpZW50YXRpb25FdmVudCA9IFwicmVzaXplXCI7XG4gIH1cblxuICAvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgaW4gb3JpZW50YXRpb24uXG4gIGlmICh3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKG9yaWVudGF0aW9uRXZlbnQsIGhhbmRsZU9yaWVudGF0aW9uLCBmYWxzZSk7XG4gIH0gZWxzZSBpZiAod2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgd2luZG93LmF0dGFjaEV2ZW50KG9yaWVudGF0aW9uRXZlbnQsIGhhbmRsZU9yaWVudGF0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3dbb3JpZW50YXRpb25FdmVudF0gPSBoYW5kbGVPcmllbnRhdGlvbjtcbiAgfVxuXG4gIGhhbmRsZU9yaWVudGF0aW9uKCk7XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGV2aWNlO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkZXZpY2U7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LmRldmljZSA9IGRldmljZTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiY29uc3QgYnVyZ2VyID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcuYnVyZ2VyJywgKCkgPT4ge1x0XHRcdFxuXHRcdFx0JCgnLm5hdmlnYXRpb24nKS50b2dnbGVDbGFzcygnbmF2aWdhdGlvbi0tb3BlbicpO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBidXJnZXI7IiwiY29uc3QgZG90U3RyaXAgPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5kb3Qtc3RyaXBfX2lucHV0JywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHN3aXRjaCAoJCh0aGlzKS5jbG9zZXN0KCcuZG90LXN0cmlwX19pbnB1dCcpLmF0dHIoJ2lkJykpIHtcblx0XHRcdFx0Y2FzZSAnZG90Q2FyJzpcblx0XHRcdFx0XHQkKCcuZG90LXN0cmlwX19ydW5uZXInKS5hdHRyKCdkYXRhLXBvcycsICdvbmUnKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnZG90TG9ycnknOlxuXHRcdFx0XHRcdCQoJy5kb3Qtc3RyaXBfX3J1bm5lcicpLmF0dHIoJ2RhdGEtcG9zJywgJ3R3bycpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdkb3RCdXMnOlxuXHRcdFx0XHRcdCQoJy5kb3Qtc3RyaXBfX3J1bm5lcicpLmF0dHIoJ2RhdGEtcG9zJywgJ3RocmVlJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cblx0XHRcdCQodGhpcylcblx0XHRcdFx0LmNsb3Nlc3QoJy5zbGlkZXInKVxuXHRcdFx0XHQuZmluZCgnLnNsaWRlLXBhY2snKVxuXHRcdFx0XHQuYXR0cignZGF0YS1zbGlkZXItcG9zJywgJCh0aGlzKS5hdHRyKCdkYXRhLWRvdC1wb3MnKSk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvdFN0cmlwOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHZhcnMgZnJvbSAnLi4vLi4vY29tcGlsZS92YXJzJztcblxuY29uc3QgZHJpdmVyRm9ybSA9IHtcblx0YnVzeVx0XHRcdFx0OiBmYWxzZSxcblx0ZmllbGRzQ29ycmVjdFx0OiBmYWxzZSxcblx0XG5cdGRhdGE6IHtcblx0XHRmaXJzdF9uYW1lXHRcdFx0XHQ6ICcnLFxuXHRcdGxhc3RfbmFtZVx0XHRcdFx0OiAnJyxcblx0XHRlbWFpbFx0XHRcdFx0XHRcdDogJycsXG5cdFx0cGhvbmVcdFx0XHRcdFx0XHQ6ICcnLFxuXHRcdGhvd19kaWRfeW91X2tub3dcdFx0OiAnJyxcblx0XHRjYXJfeWVhclx0XHRcdFx0XHQ6ICcnLFxuXHRcdGNhcl9zdGF0ZVx0XHRcdFx0OiAnJyxcblx0XHRjYXJfYnJhbmRcdFx0XHRcdDogJycsXG5cdFx0Y2FyX21vZGVsXHRcdFx0XHQ6ICcnLFxuXHRcdGNhcl9jb2xvclx0XHRcdFx0OiAnJyxcblx0XHRhdmdfbWlsZWFnZV9kYXlcdFx0OiAnJyxcblx0XHRhdmdfbWlsZWFnZV93ZWVrZW5kXHQ6ICcnLFxuXHRcdGNvbW1lbnRcdFx0XHRcdFx0OiAnJyxcblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnW2RhdGEtd2F5XScsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGNvbnN0IGVsZW1cdFx0XHQ9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS13YXldJyk7XG5cdFx0XHRjb25zdCBwYWdlXHRcdFx0PSAkKCcuZHJpdmVyLWZvcm0nKTtcblx0XHRcdGNvbnN0IGRhdGFQYWdlXHRcdD0gTnVtYmVyKHBhZ2UuYXR0cignZGF0YS1wYWdlJykpO1xuXHRcdFx0Y29uc3QgY3VycmVudFBhZ2VcdD0gJChgLmRyaXZlci1mb3JtX19wYWdlW2RhdGEtcGFnZT0ke2RhdGFQYWdlfV1gKTtcblx0XHRcdGNvbnN0IG5leHRQYWdlXHRcdD0gZGF0YVBhZ2UgKyAxO1xuXHRcdFx0Y29uc3QgcHJldlBhZ2VcdFx0PSBkYXRhUGFnZSAtIDE7XG5cblx0XHRcdGlmIChlbGVtLmF0dHIoJ2RhdGEtd2F5JykgPT09ICdwcmV2Jykge1xuXHRcdFx0XHRpZiAocHJldlBhZ2UgPT09IDEgfHwgcHJldlBhZ2UgPT09IDIpIHtcblx0XHRcdFx0XHRwYWdlLmF0dHIoJ2RhdGEtcGFnZScsIHByZXZQYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3dpdGNoIChkYXRhUGFnZSkge1xuXHRcdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRcdHRoaXMuZGF0YS5ob3dfZGlkX3lvdV9rbm93ID0gJCgnI2hvd19kaWRfeW91X2tub3cnKS52YWwoKTtcblxuXHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdGN1cnJlbnRQYWdlXG5cdFx0XHRcdFx0XHRcdC5maW5kKCdbZGF0YS1tYXNrXScpXG5cdFx0XHRcdFx0XHRcdC5lYWNoKChpbmRleCwgZWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoJChlbCkubGVuZ3RoICYmICgkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudFBhZ2Vcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmVhY2goKGluZGV4LCBlbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmRhdGFbJChlbCkuYXR0cignaWQnKV0gPSAkKGVsKS52YWwoKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5maWVsZHNDb3JyZWN0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHR0aGlzLmRhdGEucGhvbmUgPSB0aGlzLmRhdGEucGhvbmUucmVwbGFjZSgvXFxEL2csICcnKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0Y3VycmVudFBhZ2Vcblx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0LmVhY2goKGluZGV4LCBlbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmICgkKGVsKS5sZW5ndGggJiYgJChlbCkuYXR0cignZGF0YS1jb3JyZWN0JykgIT09ICd0cnVlJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudFBhZ2Vcblx0XHRcdFx0XHRcdFx0XHRcdC5maW5kKCdbZGF0YS1tYXNrXScpXG5cdFx0XHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcpICE9PSAndHJ1ZScpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudFBhZ2Vcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLWZpbGxlZF0nKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5kYXRhWyQoZWwpLmF0dHIoJ2lkJyldID0gJChlbCkudmFsKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnd3JvbmcgcGFnZSBudW1iZXInKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHRoaXMuZmllbGRzQ29ycmVjdCkge1xuXHRcdFx0XHRcdHN3aXRjaCAobmV4dFBhZ2UpIHtcblx0XHRcdFx0XHRcdC8vINC90LAg0L/QtdGA0LLQvtC5INGB0YLRgNCw0L3QuNGG0LVcblx0XHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C40YLRjCDRgdGC0YDQsNC90LjRhtGDXG5cdFx0XHRcdFx0XHRcdHBhZ2UuYXR0cignZGF0YS1wYWdlJywgJzInKTtcblx0XHRcdFx0XHRcdFx0Ly8g0YHQsdGA0L7RgdC40YLRjCDQv9C10YDQtdC80LXQvdC90YPRjlxuXHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdC8vINC90LAg0LLRgtC+0YDQvtC5INGB0YLRgNCw0L3QuNGG0LVcblx0XHRcdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C40YLRjCDRgdGC0YDQsNC90LjRhtGDXG5cdFx0XHRcdFx0XHRcdHBhZ2UuYXR0cignZGF0YS1wYWdlJywgJzMnKTtcblx0XHRcdFx0XHRcdFx0Ly8g0YHQsdGA0L7RgdC40YLRjCDQv9C10YDQtdC80LXQvdC90YPRjlxuXHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdC8vINC90LAg0YLRgNC10YLRjNC10Lkg0YHRgtGA0LDQvdC40YbQtVxuXHRcdFx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdFx0XHQvLyDQt9Cw0L/Rg9GB0YLQuNGC0Ywg0YTRg9C90LrRhtC40Y4g0L7RgtC/0YDQsNCy0LrQuCDRhNC+0YDQvNGLXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2VuZEZvcm0oKTtcblx0XHRcdFx0XHRcdFx0Ly8g0YHQsdGA0L7RgdC40YLRjCDQv9C10YDQtdC80LXQvdC90YPRjlxuXHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCd3cm9uZyBuZXh0IHBhZ2UgbnVtYmVyJyk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICog0L7RgtC/0YDQsNCy0LrQsCDRhNC+0YDQvNGLINC90LAg0YHQtdGA0LLQtdGAXG5cdCAqL1xuXHRzZW5kRm9ybSgpIHtcblx0XHRpZiAoIXRoaXMuYnVzeSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3N0YXJ0IHNlbmRpbmcgZm9ybScpO1xuXG5cdFx0XHR0aGlzLmJ1c3kgPSB0cnVlO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmxcdDogdmFycy5zZXJ2ZXIgKyB2YXJzLmFwaS5iZWNvbWVEcml2ZXIsXG5cdFx0XHRcdHR5cGVcdDogJ1BPU1QnLFxuXHRcdFx0XHRkYXRhXHQ6IHRoaXMuZGF0YSxcblx0XHRcdH0pXG5cdFx0XHRcdC5zdWNjZXNzKHJlc3VsdCA9PiB7XG5cdFx0XHRcdFx0JCgnLm1lc3NhZ2UtLXN1Y2Nlc3MnKS5hZGRDbGFzcygnbWVzc2FnZS0tc2hvdycpO1xuXG5cdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C40YLRjCDRgdGC0YDQsNC90LjRhtGDXG5cdFx0XHRcdFx0JCgnLmRyaXZlci1mb3JtJykuYXR0cignZGF0YS1wYWdlJywgJzEnKTtcblxuXHRcdFx0XHRcdC8vINC+0YfQuNGB0YLQutCwINC/0L7Qu9C10Lkg0YTQvtGA0LzRi1xuXHRcdFx0XHRcdCQoJ1tkYXRhLWZpZWxkLXR5cGVdJylcblx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuXHRcdFx0XHRcdFx0XHQkKGVsKVxuXHRcdFx0XHRcdFx0XHRcdC52YWwoJycpXG5cdFx0XHRcdFx0XHRcdFx0LmF0dHIoJ2RhdGEtZmlsbGVkJywgJ2ZhbHNlJylcblx0XHRcdFx0XHRcdFx0XHQuYXR0cignZGF0YS1jb3JyZWN0JywgJ251bGwnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dGhpcy5idXN5ID0gZmFsc2U7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZygnZm9ybSBoYXMgYmVlZCBzZW50Jyk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mYWlsKGVycm9yID0+IHtcblx0XHRcdFx0XHQkKCcubWVzc2FnZS0tZmFpbCcpLmFkZENsYXNzKCdtZXNzYWdlLS1zaG93Jyk7XG5cdFx0XHRcdFx0aWYgKGVycm9yLnJlc3BvbnNlVGV4dCkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3NlcnZlcnMgYW5zd2VyOlxcbicsZXJyb3IucmVzcG9uc2VUZXh0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ1VGTyBoYXZlIGludGVycnVwdGVkIG91ciBzZXJ2ZXJcXCdzIHdvcmtcXG53ZVxcJ2wgdHJ5IHRvIGZpeCBpdCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLmJ1c3kgPSBmYWxzZTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkcml2ZXJGb3JtOyIsImltcG9ydCB2YXJzIGZyb20gJy4uLy4uL2NvbXBpbGUvdmFycyc7XG5cbmNvbnN0IGdhbGxlcnkgPSB7XG5cdG51bVRvTG9hZDogMjAsXG5cdGNvbnRhaW5lcjogJCgnLmdhbGxlcnknKSxcblx0bG9hZGVyXHQ6ICQoJy5nYWxsZXJ5X19sb2FkaW5nJyksXG5cdG1vcmVCdG5cdDogJCgnLmdhbGxlcnlfX2J0bicpLFxuXHRidXN5XHRcdDogdHJ1ZSxcblx0d2F0Y2hlZFx0OiBmYWxzZSxcblx0XG5cdHVybHM6IHtcblx0XHRhbGxcdDogW10sXG5cdFx0dG9QdXNoOiBbXSxcblx0fSxcblxuXHRpdGVtczoge1xuXHRcdHRvUHVzaDogbnVsbCxcblx0fSxcblx0LyoqXG5cdCAqINC/0L7Qu9GD0YfQtdC90LjQtSDRgdC/0LjRgdC60LAg0LjQt9C+0LHRgNCw0LbQtdC90LjQuVxuXHQgKi9cblx0Z2V0VXJscygpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc3VsdCwgZXJyb3IpID0+IHtcblx0XHRcdGxldCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdFx0XHRyZXF1ZXN0Lm9wZW4oJ1BPU1QnLCB2YXJzLnNlcnZlciArIHZhcnMuYXBpLmdhbGxlcnkpO1xuXHRcdFx0cmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcpO1xuXHRcdFx0cmVxdWVzdC5vbmxvYWQgPSAoKSA9PiB7XG5cdFx0XHRcdGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0cmVzdWx0KEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGVycm9yKEVycm9yKCdJbWFnZSBkaWRuXFwndCBsb2FkIHN1Y2Nlc3NmdWxseTsgZXJyb3IgY29kZTonICsgcmVxdWVzdC5zdGF0dXNUZXh0KSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRyZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiB7XG5cdFx0XHRcdGVycm9yKEVycm9yKCdUaGVyZSB3YXMgYSBuZXR3b3JrIGVycm9yLicpKTtcblx0XHRcdH07XG5cblx0XHRcdHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeSh7dGFnczogWydtYWluJ119KSk7XG5cdFx0fSk7XG5cdH0sXG5cdGxvYWRTdGFydCgpIHtcblx0XHR0aGlzLmJ1c3kgPSB0cnVlO1xuXHRcdHRoaXMubG9hZGVyLnNob3coKTtcblxuXHRcdCQoJy5zZWN0aW9uLS1nYWxsZXJ5IC5zZWN0aW9uX19jb250ZW50JykuY3NzKCdwYWRkaW5nLWJvdHRvbScsICc1MHB4Jyk7XG5cdH0sXG5cdGxvYWRFbmQoKSB7XG5cdFx0dGhpcy5idXN5ID0gZmFsc2U7XG5cdFx0dGhpcy5sb2FkZXIuaGlkZSgpO1xuXG5cdFx0JCgnLnNlY3Rpb24tLWdhbGxlcnkgLnNlY3Rpb25fX2NvbnRlbnQnKS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuXHR9LFxuXHQvKipcblx0ICog0YHQvtC30LTQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6INCyINCU0J7QnNC1XG5cdCAqIEBwYXJhbSAge0Jvb2xlYW59IGlzRmlyc3Qg0L/QtdGA0LLRi9C5INC70Lgg0LLRi9C30L7QsiDRhNGD0L3QutGG0LjQuFxuXHQgKi9cblx0bWFrZUltZ3MoaXNGaXJzdCkge1xuXHRcdGlmICghdGhpcy51cmxzLmFsbC5sZW5ndGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIWlzRmlyc3QpIHtcblx0XHRcdHRoaXMubG9hZFN0YXJ0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMudXJscy5hbGwubGVuZ3RoID49IHRoaXMubnVtVG9Mb2FkKSB7XG5cdFx0XHR0aGlzLnVybHMudG9QdXNoID0gdGhpcy51cmxzLmFsbC5zcGxpY2UoLXRoaXMubnVtVG9Mb2FkLCB0aGlzLm51bVRvTG9hZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudXJscy50b1B1c2ggPSB0aGlzLnVybHMuYWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoID0gJCh0aGlzLnVybHMudG9QdXNoLmpvaW4oJycpKTtcblx0XHR0aGlzLnVybHMudG9QdXNoLmxlbmd0aCA9IDA7XG5cblx0XHRpZiAoaXNGaXJzdCkge1xuXHRcdFx0dGhpcy5jb250YWluZXJcblx0XHRcdFx0Lm1hc29ucnkoe1xuXHRcdFx0XHRcdGNvbHVtbldpZHRoXHRcdDogJy5nYWxsZXJ5X19pdGVtJyxcblx0XHRcdFx0XHRpc0FuaW1hdGVkXHRcdDogdHJ1ZSxcblx0XHRcdFx0XHRpc0luaXRMYXlvdXRcdDogdHJ1ZSxcblx0XHRcdFx0XHRpc1Jlc2l6YWJsZVx0XHQ6IHRydWUsXG5cdFx0XHRcdFx0aXRlbVNlbGVjdG9yXHQ6ICcuZ2FsbGVyeV9faXRlbScsXG5cdFx0XHRcdFx0cGVyY2VudFBvc2l0aW9uOiB0cnVlLFxuXHRcdFx0XHRcdHNpbmdsZU1vZGVcdFx0OiB0cnVlLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuYXBwZW5kKHRoaXMuaXRlbXMudG9QdXNoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jb250YWluZXIuYXBwZW5kKHRoaXMuaXRlbXMudG9QdXNoKTtcblx0XHR9XG5cblx0XHR0aGlzLml0ZW1zLnRvUHVzaFxuXHRcdFx0LmhpZGUoKVxuXHRcdFx0LmltYWdlc0xvYWRlZCgpXG5cdFx0XHQucHJvZ3Jlc3MoKGltZ0xvYWQsIGltYWdlKSA9PiB7XG5cdFx0XHRcdGNvbnN0ICRpdGVtID0gJChpbWFnZS5pbWcpLnBhcmVudHMoJy5nYWxsZXJ5X19pdGVtJyk7XG5cblx0XHRcdFx0aWYgKHRoaXMubG9hZGVyLmhhc0NsYXNzKCdnYWxsZXJ5X19sb2FkaW5nLS1maXJzdCcpKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2FkZXIucmVtb3ZlQ2xhc3MoJ2dhbGxlcnlfX2xvYWRpbmctLWZpcnN0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkaXRlbS5zaG93KCk7XG5cblx0XHRcdFx0dGhpcy5jb250YWluZXJcblx0XHRcdFx0XHQubWFzb25yeSgnYXBwZW5kZWQnLCAkaXRlbSlcblx0XHRcdFx0XHQubWFzb25yeSgpO1xuXHRcdFx0fSlcblx0XHRcdC5kb25lKCgpID0+IHtcblx0XHRcdFx0dGhpcy5sb2FkRW5kKCk7XG5cdFx0XHRcdHRoaXMub25TY3JvbGwoKTtcblxuXHRcdFx0XHRpZiAoIXRoaXMud2F0Y2hlZCkge1xuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGwoKCkgPT4ge3RoaXMub25TY3JvbGwoKX0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoLmxlbmd0aCA9IDA7XG5cdH0sXG5cdC8qKlxuXHQgKiDQvdCw0LLQtdGI0LjQstCw0LXQvNCw0Y8g0L3QsCDRgdC60YDQvtC70Lsg0YTRg9C90LrRhtC40Y9cblx0ICog0LfQsNC/0YPRgdC60LDQtdGCINC/0L7QtNCz0YDRg9C30LrRgyDRhNC+0YLQvtC6INC10YHQtNC4INC90LDQtNC+XG5cdCAqL1xuXHRvblNjcm9sbCgpIHtcblx0XHRjb25zdCBwYWdlSGVpZ2h0XHRcdD0gJChkb2N1bWVudCkuaGVpZ2h0KCk7XG5cdFx0Y29uc3Qgd2luZG93SGVpZ2h0XHQ9ICQod2luZG93KS5oZWlnaHQoKTtcblx0XHRjb25zdCB3aW5kb3dTY3JvbGxcdD0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXHRcdGNvbnN0IGxlZnRUb0JvdHRvbVx0PVx0cGFnZUhlaWdodCAtIHdpbmRvd0hlaWdodCAtIHdpbmRvd1Njcm9sbDtcblxuXHRcdGlmICghdGhpcy5idXN5ICYmIHRoaXMudXJscy5hbGwubGVuZ3RoICYmIGxlZnRUb0JvdHRvbSA8PSAzMDApIHtcblx0XHRcdGNvbnNvbGUubG9nKCdzY3JvbGwgbG9hZCcpO1xuXHRcdFx0dGhpcy5tYWtlSW1ncygpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJy5nYWxsZXJ5X19iZycpLmhpZGUoKTtcblxuXHRcdHRoaXMuZ2V0VXJscygpXG5cdFx0XHQudGhlbihcblx0XHRcdFx0cmVzdWx0ID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnZ290IGltYWdlcycpO1xuXHRcdFx0XHRcdHRoaXMudXJscy5hbGwgPSByZXN1bHQucmV2ZXJzZSgpO1xuXG5cdFx0XHRcdFx0dGhpcy51cmxzLmFsbC5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnVybHMuYWxsW2ldID0gJzxkaXYgZGF0YS11cmw9XCInICsgdmFycy5zZXJ2ZXIgKyBlbGVtICtcblx0XHRcdFx0XHRcdFx0J1wiIGNsYXNzPVwiZ2FsbGVyeV9faXRlbVwiPjxpbWcgc3JjPVwiJyArIHZhcnMuc2VydmVyICsgZWxlbSArXG5cdFx0XHRcdFx0XHRcdCdcIiBhbHQ+PGRpdiBjbGFzcz1cImdhbGxlcnlfX2RhcmtuZXNzXCI+PC9kaXY+PC9kaXY+Jztcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHRoaXMubWFrZUltZ3ModHJ1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvciwgJ2Vycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5nYWxsZXJ5X19pdGVtJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBpbWdVcmwgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtdXJsJyk7XG5cblx0XHRcdCQoJ1tkYXRhLWdhbC1tb2RhbF0nKVxuXHRcdFx0XHQuYXR0cignc3JjJywgaW1nVXJsKVxuXHRcdFx0XHQuY2xvc2VzdCgnLmdhbGxlcnlfX2JnJylcblx0XHRcdFx0LmZhZGVJbigzMDApO1xuXHRcdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5nYWxsZXJ5X19iZycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHQkKHRoaXMpLmZhZGVPdXQoMzAwKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2FsbGVyeTsiLCJjb25zdCBpbnB1dCA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignYmx1cicsICcuaW5wdXRfX2lucHV0JywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuaW5wdXRfX2lucHV0Jyk7XG5cblx0XHRcdGlmIChlbGVtLnZhbCgpKSB7XG5cdFx0XHRcdGVsZW0uYXR0cignZGF0YS1maWxsZWQnLCAndHJ1ZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWZpbGxlZCcsICdmYWxzZScpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdrZXl1cCcsICdbZGF0YS1tYXNrPVxcJ3RlbFxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2s9XFwndGVsXFwnXScpO1xuXG5cdFx0XHRlbGVtLnZhbChpbnB1dC5mb3JtYXQoZWxlbS52YWwoKSwgJ3RlbCcpKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnW2RhdGEtbWFzaz1cXCd0ZWxcXCddJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1tYXNrPVxcJ3RlbFxcJ10nKTtcblxuXHRcdFx0ZWxlbS52YWwoaW5wdXQuZm9ybWF0KGVsZW0udmFsKCksICd0ZWwnKSk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwneWVhclxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2s9XFwneWVhclxcJ10nKTtcblxuXHRcdFx0ZWxlbS52YWwoaW5wdXQuZm9ybWF0KGVsZW0udmFsKCksICd5ZWFyJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdrZXl1cCcsICdbZGF0YS1tYXNrPVxcJ251bWJlclxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2s9XFwnbnVtYmVyXFwnXScpO1xuXG5cdFx0XHRlbGVtLnZhbChpbnB1dC5mb3JtYXQoZWxlbS52YWwoKSwgJ251bWJlcicpKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignYmx1cicsICdbZGF0YS1tYXNrXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFza10nKTtcblxuXHRcdFx0c3dpdGNoIChlbGVtLmF0dHIoJ2RhdGEtbWFzaycpKSB7XG5cdFx0XHRcdGNhc2UgJ2VtYWlsJzpcblx0XHRcdFx0XHRpZiAoLy4rQC4rXFwuLisvaS50ZXN0KGVsZW0udmFsKCkpKSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ3RlbCc6XG5cdFx0XHRcdFx0Ly8gL14oW1xcK10rKSpbMC05XFx4MjBcXHgyOFxceDI5XFwtXXs3LDExfSQvXG5cdFx0XHRcdFx0aWYgKGVsZW0udmFsKCkubGVuZ3RoID09PSAxOCkge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICduYW1lJzpcblx0XHRcdFx0XHRpZiAoL15bYS16QS1a0LAt0Y/RkdCQLdCv0IFdW2EtekEtWtCwLdGP0ZHQkC3Qr9CBMC05LV9cXC5dezEsMjB9JC8udGVzdChlbGVtLnZhbCgpKSkge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdlbXB0eSc6XG5cdFx0XHRcdGNhc2UgJ3RleHQnOlxuXHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdGlmIChlbGVtLnZhbCgpKSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ2VtcHR5Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ3llYXInOlxuXHRcdFx0XHRcdGlmIChlbGVtLnZhbCgpICYmXG5cdFx0XHRcdFx0XHRwYXJzZUludChlbGVtLnZhbCgpKSA+PSAxOTAwICYmXG5cdFx0XHRcdFx0XHRwYXJzZUludChlbGVtLnZhbCgpKSA8PSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2lucHV0JywgJ1tkYXRhLW1hc2tdJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1tYXNrXScpO1xuXG5cdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdudWxsJyk7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDRhNC+0YDQvNCw0YLQuNGA0YPQtdGCINC30L3QsNGH0LXQvdC40LUg0LIg0LjQvdC/0YPRgtC1XG5cdCAqIEBwYXJhbSAge3N0cmluZ30gZGF0YSAgINC30L3QsNGH0LXQvdC40LUg0LIg0LjQvdC/0YPRgtC1XG5cdCAqIEBwYXJhbSAge3N0cmluZ30gZm9ybWF0INC40LzRjyDRhNC+0YDQvNCw0YLQsFxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICDQvtGC0YTQvtGA0LzQsNGC0LjRgNC+0LLQsNC90L3QvtC1INC30L3QsNGH0LXQvdC40LVcblx0ICovXG5cdGZvcm1hdChkYXRhLCBmb3JtYXQpIHtcblx0XHRzd2l0Y2ggKGZvcm1hdCkge1xuXHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0cmV0dXJuIGRhdGEucmVwbGFjZSgvXFxEL2csICcnKTtcblxuXHRcdFx0Y2FzZSAneWVhcic6XG5cdFx0XHRcdGRhdGEgPSBpbnB1dC5mb3JtYXQoZGF0YSwgJ251bWJlcicpO1xuXG5cdFx0XHRcdGlmIChkYXRhLmxlbmd0aCA+IDQpIHtcblx0XHRcdFx0XHRkYXRhID0gZGF0YS5zbGljZSgwLCA0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBkYXRhO1xuXG5cdFx0XHRjYXNlICd0ZWwnOlxuXHRcdFx0XHRkYXRhID0gaW5wdXQuZm9ybWF0KGRhdGEsICdudW1iZXInKTtcblxuXHRcdFx0XHRsZXQgbmV3RGF0YSA9ICcnO1xuXG5cdFx0XHRcdGlmIChkYXRhLmxlbmd0aCA8PSAxMSkge1xuXHRcdFx0XHRcdHN3aXRjaChkYXRhLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRcdFx0aWYoZGF0YVswXSAhPT0gJzcnKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMF07XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgNTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA2OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XSArIGRhdGFbNV07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA3OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XSArIGRhdGFbNV0gKyBkYXRhWzZdO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgODpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDk6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbN10gKyBkYXRhWzhdO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMTA6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbN10gKyBkYXRhWzhdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzldO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMTE6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbN10gKyBkYXRhWzhdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzldICsgZGF0YVsxMF07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs5XSArIGRhdGFbMTBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBuZXdEYXRhO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb25zb2xlLmxvZygnd3JvbmcgaW5wdXQgZm9ybWF0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdXQ7IiwiY29uc3QgbWFwID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnI21hcCcpLmxhenlsb2FkKHtcblx0XHRcdHRocmVzaG9sZDogMjAwLFxuXHRcdFx0ZWZmZWN0XHQ6ICdmYWRlSW4nLFxuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYXA7IiwiY29uc3QgbWVzc2FnZSA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLm1lc3NhZ2VfX2JnLCAubWVzc2FnZV9fY2xvc2UnLCBldmVudCA9PiB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XG5cdFx0XHQkKGV2ZW50LnRhcmdldClcblx0XHRcdFx0LmNsb3Nlc3QoJy5tZXNzYWdlJylcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdtZXNzYWdlLS1zaG93Jyk7XG5cdFx0fSk7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWVzc2FnZTsiLCJjb25zdCBwaW4gPSB7XG5cdHNlY1x0XHQ6IDU1NTU1LFxuXHRob3Vyc1x0XHQ6IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSxcblx0bWludXRlc1x0OiBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKSxcblx0c2Vjb25kc1x0OiBuZXcgRGF0ZSgpLmdldFNlY29uZHMoKSxcblx0LyoqXG5cdCAqINGB0YfQtdGC0YfQuNC6LCDRg9Cy0LXQu9C40YfQuNCy0LDQtdGCINCy0YDQtdC80Y9cblx0ICovXG5cdGNvdW50ZG93bigpIHtcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnXScpLnRleHQoTWF0aC5mbG9vcih0aGlzLnNlYy8zNjAwKSk7XG5cdFx0JCgnW2RhdGEtY2xvY2s9XFwnbVxcJ10nKS50ZXh0KE1hdGguZmxvb3IodGhpcy5zZWMlMzYwMC82MCkpO1xuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ3NcXCddJykudGV4dChNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAlNjApKTtcblxuXHRcdHRoaXMuc2VjICs9IDE7XG5cdH0sXG5cdC8qKlxuXHQgKiDQtNC+0LHQsNCy0LvRj9C10YIg0Log0YbQuNGE0YDQtSDQvdC+0LvRjCwg0YfRgtC+0LEg0L/QvtC70YPRh9C40YLRjCDQtNCy0YPQt9C90LDRh9C90L7QtSDRh9C40YHQu9C+XG5cdCAqIEBwYXJhbSAge251bWJlcn0gbnVtYmVyINGG0LjRhNGA0LAg0LjQu9C4INGH0LjRgdC70L5cblx0ICogQHJldHVybiB7bnVtYmVyfSAgICAgICAg0LTQstGD0LfQvdCw0YfQvdC+0LUg0YfQuNGB0LvQvlxuXHQgKi9cblx0dHdvTnVtYmVycyhudW1iZXIpIHtcblx0XHRpZiAobnVtYmVyIDwgMTApIHtcblx0XHRcdG51bWJlciA9ICcwJyArIG51bWJlci50b1N0cmluZygpO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVtYmVyO1xuXHR9LFxuXHQvKipcblx0ICog0L7QsdC90L7QstC70Y/QtdGCINCy0YDQtdC80Y9cblx0ICog0LLRi9C30YvQstCw0LXRgtGB0Y8g0LrQsNC00LbRg9GOINGB0LXQutGD0L3QtNGDXG5cdCAqL1xuXHRzZXRUaW1lKCkge1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHR0aGlzLmhvdXJzID0gbmV3IERhdGUoKS5nZXRIb3VycygpO1xuXHRcdFx0XHRcdFxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnaFxcJycpLnRleHQodGhpcy50d29OdW1iZXJzKHRoaXMuaG91cnMpKTtcblxuXHRcdFx0dGhpcy5taW51dGVzID0gbmV3IERhdGUoKS5nZXRNaW51dGVzKCk7XG5cdFx0XHRcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ21cXCcnKS50ZXh0KHRoaXMudHdvTnVtYmVycyh0aGlzLm1pbnV0ZXMpKTtcblxuXHRcdFx0dGhpcy5zZWNvbmRzID0gbmV3IERhdGUoKS5nZXRTZWNvbmRzKCk7XG5cdFx0XHRcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ3NcXCcnKS50ZXh0KHRoaXMudHdvTnVtYmVycyh0aGlzLnNlY29uZHMpKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLnBpbicsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGxldCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5waW4nKTtcblx0XHRcdFxuXHRcdFx0ZWxlbVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3Bpbi0tc2hvdycpXG5cdFx0XHRcdC5jc3MoJ3otaW5kZXgnLCAnMicpXG5cdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdC5yZW1vdmVDbGFzcygncGluLS1zaG93Jylcblx0XHRcdFx0LmNzcygnei1pbmRleCcsICcxJyk7XG5cdFx0fSk7XG5cblx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdkZXNrdG9wJykpIHtcblx0XHRcdGxldCBuZXdEYXRlID0gbmV3IERhdGUoKTtcblxuXHRcdFx0bmV3RGF0ZS5zZXREYXRlKG5ld0RhdGUuZ2V0RGF0ZSgpKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnaFxcJycpLnRleHQodGhpcy5ob3Vycyk7XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnJykudGV4dCh0aGlzLm1pbnV0ZXMpO1xuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJycpLnRleHQodGhpcy5zZWNvbmRzKTtcblxuXHRcdFx0c2V0SW50ZXJ2YWwodGhpcy5zZXRUaW1lLCAxMDAwKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnXScpXG5cdFx0XHRcdC50ZXh0KE1hdGguZmxvb3IodGhpcy5zZWMvMzYwMCkgPCAxMCA/XG5cdFx0XHRcdFx0XHRcdCcwJyArIE1hdGguZmxvb3IodGhpcy5zZWMvMzYwMCkgOlxuXHRcdFx0XHRcdFx0XHRNYXRoLmZsb29yKHRoaXMuc2VjLzM2MDApKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnbVxcJ10nKVxuXHRcdFx0XHQudGV4dChNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAvNjApIDwgMTAgP1xuXHRcdFx0XHRcdFx0XHQnMCcgKyBNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAvNjApIDpcblx0XHRcdFx0XHRcdFx0TWF0aC5mbG9vcih0aGlzLnNlYyUzNjAwLzYwKSk7XG5cblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ3NcXCddJylcblx0XHRcdFx0LnRleHQoTWF0aC5mbG9vcih0aGlzLnNlYyUzNjAwJTYwKSA8IDEwID9cblx0XHRcdFx0XHRcdFx0JzAnICsgTWF0aC5mbG9vcih0aGlzLnNlYyUzNjAwJTYwKSA6XG5cdFx0XHRcdFx0XHRcdE1hdGguZmxvb3IodGhpcy5zZWMlMzYwMCU2MCkpO1xuXG5cdFx0XHR0aGlzLnNlYyArPSAxO1xuXG5cdFx0XHRzZXRJbnRlcnZhbCh0aGlzLmNvdW50ZG93biwgMTAwMCk7XG5cdFx0fVxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwaW47IiwiY29uc3QgcXVlc3Rpb24gPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCcucXVlc3Rpb25zX19pdGVtJykuZXEoMSkuaGlkZSgpO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcubWFpbi1idG4tLWhkaXcnLCBldmVudCA9PiB7XG5cdFx0XHRsZXQgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcubWFpbi1idG4tLWhkaXcnKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcblx0XHRcdGlmICghZWxlbS5oYXNDbGFzcygnbWFpbi1idG4tLWFjdGl2ZScpKSB7XG5cdFx0XHRcdGVsZW1cblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ21haW4tYnRuLS1hY3RpdmUnKVxuXHRcdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCdtYWluLWJ0bi0tYWN0aXZlJyk7XG5cdFx0XHRcblx0XHRcdFx0JCgnLnF1ZXN0aW9uc19faXRlbScpXG5cdFx0XHRcdFx0LmVxKGVsZW0uaW5kZXgoKSAtIDIpXG5cdFx0XHRcdFx0LmZhZGVJbigzMDApXG5cdFx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0XHQuZmFkZU91dCgzMDApO1xuXG5cdFx0XHRcdCQoJy5xdWVzdGlvbnNfX2l0ZW0nKVxuXHRcdFx0XHRcdC5maW5kKCcucXVlc3Rpb25fX2JvZHknKVxuXHRcdFx0XHRcdC5zbGlkZVVwKDMwMCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5xdWVzdGlvbl9faGVhZGVyJywgZXZlbnQgPT4ge1xuXHRcdFx0bGV0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnF1ZXN0aW9uX19oZWFkZXInKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcblx0XHRcdGVsZW1cblx0XHRcdFx0LnNpYmxpbmdzKCcucXVlc3Rpb25fX2JvZHknKVxuXHRcdFx0XHQuc2xpZGVUb2dnbGUoMzAwKVxuXHRcdFx0XHQuY2xvc2VzdCgnLnF1ZXN0aW9uJylcblx0XHRcdFx0LnNpYmxpbmdzKCcucXVlc3Rpb24nKVxuXHRcdFx0XHQuZmluZCgnLnF1ZXN0aW9uX19ib2R5Jylcblx0XHRcdFx0LnNsaWRlVXAoMzAwKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcXVlc3Rpb247IiwiY29uc3Qgc2Nyb2xsQnRuID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcuc2Nyb2xsLWJ0bicsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnNjcm9sbC1idG4nKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcblx0XHRcdCQoJ2h0bWwsIGJvZHknKVxuXHRcdFx0XHQuYW5pbWF0ZShcblx0XHRcdFx0XHR7c2Nyb2xsVG9wOiBlbGVtLmNsb3Nlc3QoJy5zZWN0aW9uJykub3V0ZXJIZWlnaHQoKX0sXG5cdFx0XHRcdFx0NzAwKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2Nyb2xsQnRuOyIsImNvbnN0IHNlYXJjaCA9IHtcblx0bmVlZGVkU2Nyb2xsOiBudWxsLFxuXHRzdGFydGVkXHRcdDogZmFsc2UsXG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHR0aGlzLm5lZWRlZFNjcm9sbCA9ICQoJy5zZWFyY2gnKS5vZmZzZXQoKS50b3AgLSAkKHdpbmRvdykuaGVpZ2h0KCkgKyAkKCcuc2VhcmNoJykuaGVpZ2h0KCkgLyAyO1xuXHRcdFxuXHRcdCQod2luZG93KS5zY3JvbGwoKCkgPT4ge1xuXHRcdFx0aWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSB0aGlzLm5lZWRlZFNjcm9sbCAmJiAhdGhpcy5zdGFydGVkKSB7XG5cdFx0XHRcdCQoJy5zZWFyY2gnKS5hZGRDbGFzcygnc2VhcmNoLS1hbmltYXRlJyk7XG5cdFx0XHRcdHRoaXMuc3RhcnRlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlYXJjaDsiLCJjb25zdCBzbGlkZVBhY2sgPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJ1tkYXRhLXBhZy1wb3NdJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdCQodGhpcylcblx0XHRcdFx0LmFkZENsYXNzKCdzbGlkZS1wYWNrX19wYWctLWFjdGl2ZScpXG5cdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdC5yZW1vdmVDbGFzcygnc2xpZGUtcGFja19fcGFnLS1hY3RpdmUnKVxuXHRcdFx0XHQuY2xvc2VzdCgnLnNsaWRlLXBhY2tfX3BhZ3MnKVxuXHRcdFx0XHQuc2libGluZ3MoJ1tkYXRhLXNsaWRlci1wb3NdJylcblx0XHRcdFx0LmF0dHIoJ2RhdGEtc2xpZGVyLXBvcycsICQodGhpcykuYXR0cignZGF0YS1wYWctcG9zJykpO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzbGlkZVBhY2s7IiwiY29uc3QgdGFibGV0ID0ge1xuXHRtb2JPbmVcdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtbW9iLXgxJyksXG5cdG1vYlR3b1x0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS1tb2IteDInKSxcblx0bW9iVGhyZWVcdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtbW9iLXgzJyksXG5cdHRhYk9uZVx0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS10YWIteDEnKSxcblx0dGFiVHdvXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLXRhYi14MicpLFxuXHR0YWJUaHJlZVx0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS10YWIteDMnKSxcblx0LyoqXG5cdCAqINC30LDQv9GD0YHQutCw0LXQvNCw0Y8g0L/RgNC4INC30LDQs9GA0YPQt9C60LUg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0aWYgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDMpIHtcblx0XHRcdGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpKSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy5tb2JUaHJlZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRoaXMudGFiVGhyZWUpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMikge1xuXHRcdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJykpIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0aGlzLm1vYlR3byk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRoaXMudGFiVHdvKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgIHtcblx0XHRcdGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpKSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy5tb2JPbmUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0aGlzLnRhYk9uZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0JCgnI3RhYmxldCcpLmxhenlsb2FkKHtcblx0XHRcdHRocmVzaG9sZDogMjAwLFxuXHRcdFx0ZWZmZWN0XHQ6ICdmYWRlSW4nLFxuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZXQ7IiwiY29uc3QgdXBCdG4gPSB7XG5cdC8qKlxuXHQgKiDQstC60LvRjtGH0LDQtdGCL9Cy0YvQutC70Y7Rh9Cw0LXRgiDQstC40LTQuNC80L7RgdGC0Ywg0LrQvdC+0L/QutC4XG5cdCAqL1xuXHRzZXRWaXNpYmlsaXR5KCkge1xuXHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPj0gODAwKSB7XG5cdFx0XHQkKCcudXAtYnRuJykuYWRkQ2xhc3MoJ3VwLWJ0bi0tc2hvdycpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCcudXAtYnRuJykucmVtb3ZlQ2xhc3MoJ3VwLWJ0bi0tc2hvdycpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqINC30LDQv9GD0YHQutCw0LXQvNCw0Y8g0L/RgNC4INC30LDQs9GA0YPQt9C60LUg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0dXBCdG4uc2V0VmlzaWJpbGl0eSgpO1xuXG5cdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7XG5cdFx0XHR1cEJ0bi5zZXRWaXNpYmlsaXR5KCk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy51cC1idG4nLCAoKSA9PiB7XG5cdFx0XHQkKCdodG1sLCBib2R5Jylcblx0XHRcdFx0LnN0b3AoKVxuXHRcdFx0XHQuYW5pbWF0ZShcblx0XHRcdFx0XHR7c2Nyb2xsVG9wOiAwfSxcblx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsVG9wKCkvNCk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVwQnRuOyIsImNvbnN0IHdkU2xpZGVyID0ge1xuXHQvKipcblx0ICog0LfQsNC/0YPRgdC60LDQtdC80LDRjyDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy53ZC1zbGlkZXJfX3BhZycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQkKHRoaXMpXG5cdFx0XHRcdC5hZGRDbGFzcygnd2Qtc2xpZGVyX19wYWctLWFjdGl2ZScpXG5cdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdC5yZW1vdmVDbGFzcygnd2Qtc2xpZGVyX19wYWctLWFjdGl2ZScpO1xuXHRcdFx0XHRcblx0XHRcdGlmICgkKHRoaXMpLmluZGV4KCkgPT09IDEpIHtcblx0XHRcdFx0JCh0aGlzKVxuXHRcdFx0XHRcdC5jbG9zZXN0KCcud2Qtc2xpZGVyJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ3dkLXNsaWRlci0tdHdvJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0LmNsb3Nlc3QoJy53ZC1zbGlkZXInKVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnd2Qtc2xpZGVyLS10d28nKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gd2RTbGlkZXI7IiwiY29uc3QgeWFNYXAgPSB7XG5cdHBvaW50czogW10sXG5cdG1hcDoge30sXG5cdC8qKlxuXHQgKiDQvtCx0YrRj9Cy0LvRj9C10YIg0YLQvtGH0LrQuCAo0L3QsNC00L4g0LLRi9C/0L7Qu9C90Y/RgtGMINC/0L7RgdC70LUg0YHQvtC30LTQsNC90LjRjyDQutCw0YDRgtGLKVxuXHQgKi9cblx0c2V0UG9pbnRzKCkge1xuXHRcdHRoaXMucG9pbnRzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRjb29yZHM6IFs1OS45MjAyMjk3NTk2Mjc2OSwgMzAuMzcyOTU1OTk5OTk5OTc3XSxcblx0XHRcdFx0dGl0bGVzOiB7XG5cdFx0XHRcdFx0aGludENvbnRlbnRcdFx0OiAn0JHQvtC60YEg0LTQu9GPINC+0LrQu9C10LnQutC4Jyxcblx0XHRcdFx0XHRiYWxsb29uQ29udGVudFx0OiAn0KHQn9CxLCDQmtGA0LXQvNC10L3Rh9GD0LPRgdC60LDRjyDRg9C7Liwg0LQuOCcsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBhcmFtczoge1xuXHRcdFx0XHRcdGljb25MYXlvdXQ6IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeVxuXHRcdFx0XHRcdFx0LmNyZWF0ZUNsYXNzKCc8ZGl2IGNsYXNzPVxcJ3lhLW1hcF9faWNvbiB5YS1tYXBfX2ljb24tLWJsdWVcXCc+PC9kaXY+JyksXG5cblx0XHRcdFx0XHRpY29uU2hhcGU6IHtcblx0XHRcdFx0XHRcdHR5cGVcdFx0XHQ6ICdSZWN0YW5nbGUnLFxuXHRcdFx0XHRcdFx0Y29vcmRpbmF0ZXNcdDogW1stNywgLTQwXSwgWzMzLCAwXV0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGNvb3JkczogWzU5Ljk0NDg0MDkzNzcxOTMxLCAzMC4zODg1OTAxNjY4NDAxNl0sXG5cdFx0XHRcdHRpdGxlczoge1xuXHRcdFx0XHRcdGhpbnRDb250ZW50XHRcdDogJ9CT0LvQsNCy0L3Ri9C5INC+0YTQuNGBJyxcblx0XHRcdFx0XHRiYWxsb29uQ29udGVudFx0OiAn0KHQn9CxLCDQodGD0LLQvtGA0L7QstGB0LrQuNC5INC/0YDQvtGB0L/QtdC60YIsIDY10LEsINC+0YTQuNGBIDE2Jyxcblx0XHRcdFx0fSxcblx0XHRcdFx0cGFyYW1zOiB7XG5cdFx0XHRcdFx0aWNvbkxheW91dDogeW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5XG5cdFx0XHRcdFx0XHQuY3JlYXRlQ2xhc3MoJzxkaXYgY2xhc3M9XFwneWEtbWFwX19pY29uIHlhLW1hcF9faWNvbi0tcmVkXFwnPjwvZGl2PicpLFxuXG5cdFx0XHRcdFx0aWNvblNoYXBlOiB7XG5cdFx0XHRcdFx0XHR0eXBlXHRcdFx0OiAnUmVjdGFuZ2xlJyxcblx0XHRcdFx0XHRcdGNvb3JkaW5hdGVzXHQ6IFtbLTcsIC00MF0sIFszMywgMF1dLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdH1cblx0XHRdO1xuXHR9LFxuXHQvKipcblx0ICog0YHQvtC30LTQsNC10YIg0YLQvtGH0LrRgyDQvdCwINC60LDRgNGC0LVcblx0ICogQHBhcmFtIHtvYmpleHR9IHBvaW50INC+0LHRitC10LrRgiDRgSDQtNCw0L3QvdGL0LzQuCDRgtC+0YfQutC4XG5cdCAqL1xuXHRzZXRQb2ludChwb2ludCkge1xuXHRcdHRoaXMubWFwLmdlb09iamVjdHMuYWRkKG5ldyB5bWFwcy5QbGFjZW1hcmsocG9pbnQuY29vcmRzLCBwb2ludC50aXRsZXMsIHBvaW50LnBhcmFtcykpO1xuXHR9LFxuXHQvKipcblx0ICog0YHQvtC30LTQsNC10YIg0LrQsNGA0YLRg1xuXHQgKi9cblx0c2V0TWFwKCkge1xuXHRcdHltYXBzLnJlYWR5KCgpID0+IHtcblx0XHRcdHRoaXMubWFwID0gbmV3IHltYXBzLk1hcCgneWFNYXAnLCB7XG5cdFx0XHRcdGNlbnRlcjogW1xuXHRcdFx0XHRcdDU5LjkzMTU5MzIyMjMzOTg0LFxuXHRcdFx0XHRcdDMwLjM3NTE0NDY4MjU1NjEyMlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRjb250cm9sczogW1xuXHRcdFx0XHRcdCd6b29tQ29udHJvbCcsXG5cdFx0XHRcdF0sXG5cdFx0XHRcdHpvb206IDEzLFxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuc2V0UG9pbnRzKCk7XG5cblx0XHRcdHRoaXMucG9pbnRzLmZvckVhY2goZWxlbSA9PiB7XG5cdFx0XHRcdHRoaXMuc2V0UG9pbnQoZWxlbSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5tYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdHRoaXMuc2V0TWFwKCk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHlhTWFwOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHZhcnNcdFx0XHRmcm9tICcuL3ZhcnMnO1xuXG5pbXBvcnQgZHJpdmVyRm9ybVx0ZnJvbSAnLi4vYmxvY2tzL2RyaXZlci1mb3JtL2RyaXZlci1mb3JtJztcbmltcG9ydCBpbnB1dFx0XHRmcm9tICcuLi9ibG9ja3MvaW5wdXQvaW5wdXQnO1xuaW1wb3J0IG1lc3NhZ2VcdFx0ZnJvbSAnLi4vYmxvY2tzL21lc3NhZ2UvbWVzc2FnZSc7XG5pbXBvcnQgYnVyZ2VyXHRcdGZyb20gJy4uL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyJztcbmltcG9ydCBzY3JvbGxCdG5cdGZyb20gJy4uL2Jsb2Nrcy9zY3JvbGwtYnRuL3Njcm9sbC1idG4nO1xuaW1wb3J0IHdkU2xpZGVyXHRmcm9tICcuLi9ibG9ja3Mvd2Qtc2xpZGVyL3dkLXNsaWRlcic7XG5pbXBvcnQgdGFibGV0XHRcdGZyb20gJy4uL2Jsb2Nrcy90YWJsZXQvdGFibGV0JztcbmltcG9ydCBzZWFyY2hcdFx0ZnJvbSAnLi4vYmxvY2tzL3NlYXJjaC9zZWFyY2gnO1xuaW1wb3J0IHBpblx0XHRcdGZyb20gJy4uL2Jsb2Nrcy9waW4vcGluJztcbmltcG9ydCBtYXBcdFx0XHRmcm9tICcuLi9ibG9ja3MvbWFwL21hcCc7XG5pbXBvcnQgc2xpZGVQYWNrXHRmcm9tICcuLi9ibG9ja3Mvc2xpZGUtcGFjay9zbGlkZS1wYWNrJztcbmltcG9ydCBkb3RTdHJpcFx0ZnJvbSAnLi4vYmxvY2tzL2RvdC1zdHJpcC9kb3Qtc3RyaXAnO1xuaW1wb3J0IHF1ZXN0aW9uXHRmcm9tICcuLi9ibG9ja3MvcXVlc3Rpb24vcXVlc3Rpb24nO1xuaW1wb3J0IHVwQnRuXHRcdGZyb20gJy4uL2Jsb2Nrcy91cC1idG4vdXAtYnRuJztcbmltcG9ydCB5YU1hcFx0XHRmcm9tICcuLi9ibG9ja3MveWEtbWFwL3lhLW1hcCc7XG5pbXBvcnQgZ2FsbGVyeVx0XHRmcm9tICcuLi9ibG9ja3MvZ2FsbGVyeS9nYWxsZXJ5JztcblxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9qcXVlcnlfbGF6eWxvYWQvanF1ZXJ5Lmxhenlsb2FkJyk7XG5yZXF1aXJlKCdkZXZpY2UuanMnKTtcblxuY29uc3QgamF0YSA9IHtcblx0LyoqXG5cdCAqINC30LDQv9GD0YHQutCw0LXQvNCw0Y8g0L/RgNC4INC30LDQs9GA0YPQt9C60LUg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdHJlYWR5KCkge1xuXHRcdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xuXHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCB0aGlzLmluaXQpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdHZhcnMuaW5pdCgpO1xuXHRcdGJ1cmdlci5pbml0KCk7XG5cdFx0dXBCdG4uaW5pdCgpO1xuXG5cdFx0c3dpdGNoICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpIHtcblx0XHRcdGNhc2UgJy8nOlxuXHRcdFx0XHRkcml2ZXJGb3JtLmluaXQoKTtcblx0XHRcdFx0aW5wdXQuaW5pdCgpO1xuXHRcdFx0XHRtZXNzYWdlLmluaXQoKTtcblx0XHRcdFx0c2Nyb2xsQnRuLmluaXQoKTtcblx0XHRcdFx0d2RTbGlkZXIuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2Fib3V0Lmh0bWwnOlxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2ZvcmFkdi5odG1sJzpcblx0XHRcdFx0ZG90U3RyaXAuaW5pdCgpO1xuXHRcdFx0XHRtYXAuaW5pdCgpO1xuXHRcdFx0XHRwaW4uaW5pdCgpO1xuXHRcdFx0XHRzY3JvbGxCdG4uaW5pdCgpO1xuXHRcdFx0XHRzZWFyY2guaW5pdCgpO1xuXHRcdFx0XHRzbGlkZVBhY2suaW5pdCgpO1xuXHRcdFx0XHR0YWJsZXQuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2NvbnRhY3RzLmh0bWwnOlxuXHRcdFx0XHR5YU1hcC5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvaG93Lmh0bWwnOlxuXHRcdFx0XHRxdWVzdGlvbi5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvZ2FsbGVyeS5odG1sJzpcblx0XHRcdFx0Z2FsbGVyeS5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRsb2NhdGlvbi5ocmVmID0gdmFycy5zZXJ2ZXI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fSxcbn07XG5cbmphdGEucmVhZHkoKTsiLCJjb25zdCB2YXJzID0ge1xuXHRwcm9kdWN0aW9uXHQ6IGZhbHNlLFxuXHRzZXJ2ZXJcdFx0OiAnJyxcblx0XG5cdGFwaToge1xuXHRcdGJlY29tZURyaXZlcjogJy9hcGkvdjEvYWNjb3VudHMvYmVjb21lZHJpdmVyJyxcblx0XHRnYWxsZXJ5XHRcdDogJy9hcGkvdjEvZ2FsbGVyeScsXG5cdH0sXG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLnNlcnZlciA9IHRoaXMucHJvZHVjdGlvbiA/ICdodHRwczovL2phdGEucnUnIDogJ2h0dHA6Ly9kZXYuamF0YS5ydSc7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZhcnM7Il19
