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
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"../../compile/vars":21}],7:[function(require,module,exports){
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

},{"../../compile/vars":21}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
'use strict';

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

var _vars = require('./vars');

var _vars2 = _interopRequireDefault(_vars);

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

},{"../../bower_components/jquery_lazyload/jquery.lazyload":1,"../blocks/burger/burger":4,"../blocks/dot-strip/dot-strip":5,"../blocks/driver-form/driver-form":6,"../blocks/gallery/gallery":7,"../blocks/input/input":8,"../blocks/map/map":9,"../blocks/message/message":10,"../blocks/pin/pin":11,"../blocks/question/question":12,"../blocks/scroll-btn/scroll-btn":13,"../blocks/search/search":14,"../blocks/slide-pack/slide-pack":15,"../blocks/tablet/tablet":16,"../blocks/up-btn/up-btn":17,"../blocks/wd-slider/wd-slider":18,"../blocks/ya-map/ya-map":19,"./vars":21,"device.js":2}],21:[function(require,module,exports){
(function (process){
'use strict';

var NODE_ENV = process.env.NODE_ENV || 'development';
var production = NODE_ENV === 'production' ? true : false;

var vars = {
	server: production ? 'https://jata.ru' : 'http://dev.jata.ru',
	api: {
		becomeDriver: '/api/v1/accounts/becomedriver',
		gallery: '/api/v1/gallery'
	}
};

module.exports = vars;

}).call(this,require('_process'))

},{"_process":3}]},{},[20])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL2pxdWVyeV9sYXp5bG9hZC9qcXVlcnkubGF6eWxvYWQuanMiLCJub2RlX21vZHVsZXMvZGV2aWNlLmpzL2xpYi9kZXZpY2UuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyLmpzIiwic3JjL2Jsb2Nrcy9kb3Qtc3RyaXAvZG90LXN0cmlwLmpzIiwic3JjL2Jsb2Nrcy9kcml2ZXItZm9ybS9kcml2ZXItZm9ybS5qcyIsInNyYy9ibG9ja3MvZ2FsbGVyeS9nYWxsZXJ5LmpzIiwic3JjL2Jsb2Nrcy9pbnB1dC9pbnB1dC5qcyIsInNyYy9ibG9ja3MvbWFwL21hcC5qcyIsInNyYy9ibG9ja3MvbWVzc2FnZS9tZXNzYWdlLmpzIiwic3JjL2Jsb2Nrcy9waW4vcGluLmpzIiwic3JjL2Jsb2Nrcy9xdWVzdGlvbi9xdWVzdGlvbi5qcyIsInNyYy9ibG9ja3Mvc2Nyb2xsLWJ0bi9zY3JvbGwtYnRuLmpzIiwic3JjL2Jsb2Nrcy9zZWFyY2gvc2VhcmNoLmpzIiwic3JjL2Jsb2Nrcy9zbGlkZS1wYWNrL3NsaWRlLXBhY2suanMiLCJzcmMvYmxvY2tzL3RhYmxldC90YWJsZXQuanMiLCJzcmMvYmxvY2tzL3VwLWJ0bi91cC1idG4uanMiLCJzcmMvYmxvY2tzL3dkLXNsaWRlci93ZC1zbGlkZXIuanMiLCJzcmMvYmxvY2tzL3lhLW1hcC95YS1tYXAuanMiLCJzcmMvY29tcGlsZS9jdXN0b20uanMiLCJzcmMvY29tcGlsZS92YXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsQ0FBQyxVQUFTLENBQVQsRUFBWSxNQUFaLEVBQW9CLFFBQXBCLEVBQThCLFNBQTlCLEVBQXlDO0FBQ3RDLFFBQUksVUFBVSxFQUFFLE1BQUYsQ0FBZDs7QUFFQSxNQUFF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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcExBLElBQU0sU0FBUztBQUNkOzs7QUFHQSxLQUpjLGtCQUlQO0FBQ04sSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IsU0FBdEIsRUFBaUMsWUFBTTtBQUN0QyxLQUFFLGFBQUYsRUFBaUIsV0FBakIsQ0FBNkIsa0JBQTdCO0FBQ0EsR0FGRDtBQUdBO0FBUmEsQ0FBZjs7QUFXQSxPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7O0FDWEEsSUFBTSxXQUFXO0FBQ2hCOzs7QUFHQSxLQUpnQixrQkFJVDtBQUNOLElBQUUsTUFBRixFQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLG1CQUF0QixFQUEyQyxVQUFTLEtBQVQsRUFBZ0I7QUFDMUQsV0FBUSxFQUFFLElBQUYsRUFBUSxPQUFSLENBQWdCLG1CQUFoQixFQUFxQyxJQUFyQyxDQUEwQyxJQUExQyxDQUFSO0FBQ0MsU0FBSyxRQUFMO0FBQ0MsT0FBRSxvQkFBRixFQUF3QixJQUF4QixDQUE2QixVQUE3QixFQUF5QyxLQUF6QztBQUNBO0FBQ0QsU0FBSyxVQUFMO0FBQ0MsT0FBRSxvQkFBRixFQUF3QixJQUF4QixDQUE2QixVQUE3QixFQUF5QyxLQUF6QztBQUNBO0FBQ0QsU0FBSyxRQUFMO0FBQ0MsT0FBRSxvQkFBRixFQUF3QixJQUF4QixDQUE2QixVQUE3QixFQUF5QyxPQUF6QztBQUNBO0FBVEY7O0FBWUEsS0FBRSxJQUFGLEVBQ0UsT0FERixDQUNVLFNBRFYsRUFFRSxJQUZGLENBRU8sYUFGUCxFQUdFLElBSEYsQ0FHTyxpQkFIUCxFQUcwQixFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsY0FBYixDQUgxQjtBQUlBLEdBakJEO0FBa0JBO0FBdkJlLENBQWpCOztBQTBCQSxPQUFPLE9BQVAsR0FBaUIsUUFBakI7OztBQzFCQTs7QUFFQTs7Ozs7O0FBRUEsSUFBTSxhQUFhO0FBQ2xCLE9BQVUsS0FEUTtBQUVsQixnQkFBZ0IsS0FGRTs7QUFJbEIsT0FBTTtBQUNMLGNBQWdCLEVBRFg7QUFFTCxhQUFlLEVBRlY7QUFHTCxTQUFhLEVBSFI7QUFJTCxTQUFhLEVBSlI7QUFLTCxvQkFBb0IsRUFMZjtBQU1MLFlBQWUsRUFOVjtBQU9MLGFBQWUsRUFQVjtBQVFMLGFBQWUsRUFSVjtBQVNMLGFBQWUsRUFUVjtBQVVMLGFBQWUsRUFWVjtBQVdMLG1CQUFtQixFQVhkO0FBWUwsdUJBQXNCLEVBWmpCO0FBYUwsV0FBYztBQWJULEVBSlk7QUFtQmxCOzs7QUFHQSxLQXRCa0Isa0JBc0JYO0FBQUE7O0FBQ04sSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IsWUFBdEIsRUFBb0MsaUJBQVM7QUFDNUMsU0FBTSxjQUFOOztBQUVBLE9BQU0sT0FBUyxFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFoQixDQUF3QixZQUF4QixDQUFmO0FBQ0EsT0FBTSxPQUFTLEVBQUUsY0FBRixDQUFmO0FBQ0EsT0FBTSxXQUFZLE9BQU8sS0FBSyxJQUFMLENBQVUsV0FBVixDQUFQLENBQWxCO0FBQ0EsT0FBTSxjQUFjLG9DQUFrQyxRQUFsQyxPQUFwQjtBQUNBLE9BQU0sV0FBWSxXQUFXLENBQTdCO0FBQ0EsT0FBTSxXQUFZLFdBQVcsQ0FBN0I7O0FBRUEsT0FBSSxLQUFLLElBQUwsQ0FBVSxVQUFWLE1BQTBCLE1BQTlCLEVBQXNDO0FBQ3JDLFFBQUksYUFBYSxDQUFiLElBQWtCLGFBQWEsQ0FBbkMsRUFBc0M7QUFDckMsVUFBSyxJQUFMLENBQVUsV0FBVixFQUF1QixRQUF2QjtBQUNBO0FBQ0QsSUFKRCxNQUlPO0FBQ04sWUFBUSxRQUFSO0FBQ0MsVUFBSyxDQUFMO0FBQ0MsWUFBSyxJQUFMLENBQVUsZ0JBQVYsR0FBNkIsRUFBRSxtQkFBRixFQUF1QixHQUF2QixFQUE3Qjs7QUFFRCxVQUFLLENBQUw7QUFDQyxrQkFDRSxJQURGLENBQ08sYUFEUCxFQUVFLElBRkYsQ0FFTyxVQUFDLEtBQUQsRUFBUSxFQUFSLEVBQWU7QUFDcEIsV0FBSSxFQUFFLEVBQUYsRUFBTSxNQUFOLElBQWlCLEVBQUUsRUFBRixFQUFNLElBQU4sQ0FBVyxjQUFYLE1BQStCLE1BQXBELEVBQTZEO0FBQzVELG9CQUNFLElBREYsQ0FDTyxhQURQLEVBRUUsSUFGRixDQUVPLFVBQUMsS0FBRCxFQUFRLEVBQVIsRUFBZTtBQUNwQixhQUFJLEVBQUUsRUFBRixFQUFNLElBQU4sQ0FBVyxjQUFYLE1BQStCLE1BQW5DLEVBQTJDO0FBQzFDLFlBQUUsRUFBRixFQUFNLElBQU4sQ0FBVyxjQUFYLEVBQTJCLE9BQTNCO0FBQ0E7QUFDRCxTQU5GOztBQVFBLGNBQUssYUFBTCxHQUFxQixLQUFyQjtBQUNBLGVBQU8sS0FBUDtBQUVBLFFBWkQsTUFZTztBQUNOLGNBQUssSUFBTCxDQUFVLEVBQUUsRUFBRixFQUFNLElBQU4sQ0FBVyxJQUFYLENBQVYsSUFBOEIsRUFBRSxFQUFGLEVBQU0sR0FBTixFQUE5Qjs7QUFFQSxjQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQTtBQUNELE9BcEJGOztBQXNCQSxZQUFLLElBQUwsQ0FBVSxLQUFWLEdBQWtCLE1BQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsT0FBaEIsQ0FBd0IsS0FBeEIsRUFBK0IsRUFBL0IsQ0FBbEI7QUFDQTs7QUFFRCxVQUFLLENBQUw7QUFDQyxrQkFDRSxJQURGLENBQ08sYUFEUCxFQUVFLElBRkYsQ0FFTyxVQUFDLEtBQUQsRUFBUSxFQUFSLEVBQWU7QUFDcEIsV0FBSSxFQUFFLEVBQUYsRUFBTSxNQUFOLElBQWdCLEVBQUUsRUFBRixFQUFNLElBQU4sQ0FBVyxjQUFYLE1BQStCLE1BQW5ELEVBQTJEO0FBQzFELG9CQUNDLElBREQsQ0FDTSxhQUROLEVBRUMsSUFGRCxDQUVNLFVBQVMsS0FBVCxFQUFnQixFQUFoQixFQUFvQjtBQUN6QixhQUFJLEVBQUUsRUFBRixFQUFNLElBQU4sQ0FBVyxjQUFYLE1BQStCLE1BQW5DLEVBQTJDO0FBQzFDLFlBQUUsRUFBRixFQUFNLElBQU4sQ0FBVyxjQUFYLEVBQTJCLE9BQTNCO0FBQ0E7QUFDRCxTQU5EOztBQVFELGNBQUssYUFBTCxHQUFxQixLQUFyQjs7QUFFQSxlQUFPLEtBQVA7QUFDQyxRQVpELE1BWU87QUFDTixvQkFDRSxJQURGLENBQ08sZUFEUCxFQUVFLElBRkYsQ0FFTyxVQUFDLEtBQUQsRUFBUSxFQUFSLEVBQWU7QUFDcEIsZUFBSyxJQUFMLENBQVUsRUFBRSxFQUFGLEVBQU0sSUFBTixDQUFXLElBQVgsQ0FBVixJQUE4QixFQUFFLEVBQUYsRUFBTSxHQUFOLEVBQTlCO0FBQ0EsU0FKRjs7QUFNQSxjQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQTtBQUNELE9BeEJGO0FBeUJBOztBQUVEO0FBQ0MsY0FBUSxHQUFSLENBQVksbUJBQVo7QUFDQTtBQTVERjs7QUErREEsUUFBSSxNQUFLLGFBQVQsRUFBd0I7QUFDdkIsYUFBUSxRQUFSO0FBQ0M7QUFDQSxXQUFLLENBQUw7QUFDQztBQUNBLFlBQUssSUFBTCxDQUFVLFdBQVYsRUFBdUIsR0FBdkI7QUFDQTtBQUNBLGFBQUssYUFBTCxHQUFxQixLQUFyQjtBQUNBOztBQUVEO0FBQ0EsV0FBSyxDQUFMO0FBQ0M7QUFDQSxZQUFLLElBQUwsQ0FBVSxXQUFWLEVBQXVCLEdBQXZCO0FBQ0E7QUFDQSxhQUFLLGFBQUwsR0FBcUIsS0FBckI7QUFDQTs7QUFFRDtBQUNBLFdBQUssQ0FBTDtBQUNDO0FBQ0EsYUFBSyxRQUFMO0FBQ0E7QUFDQSxhQUFLLGFBQUwsR0FBcUIsS0FBckI7QUFDQTs7QUFFRDtBQUNDLGVBQVEsR0FBUixDQUFZLHdCQUFaO0FBQ0E7QUEzQkY7QUE2QkE7QUFDRDtBQUNELEdBOUdEO0FBK0dBLEVBdElpQjs7QUF1SWxCOzs7QUFHQSxTQTFJa0Isc0JBMElQO0FBQUE7O0FBQ1YsTUFBSSxDQUFDLEtBQUssSUFBVixFQUFnQjtBQUNmLFdBQVEsR0FBUixDQUFZLG9CQUFaOztBQUVBLFFBQUssSUFBTCxHQUFZLElBQVo7O0FBRUEsS0FBRSxJQUFGLENBQU87QUFDTixTQUFNLGVBQUssTUFBTCxHQUFjLGVBQUssR0FBTCxDQUFTLFlBRHZCO0FBRU4sVUFBTyxNQUZEO0FBR04sVUFBTyxLQUFLO0FBSE4sSUFBUCxFQUtFLE9BTEYsQ0FLVSxrQkFBVTtBQUNsQixNQUFFLG1CQUFGLEVBQXVCLFFBQXZCLENBQWdDLGVBQWhDOztBQUVBO0FBQ0EsTUFBRSxjQUFGLEVBQWtCLElBQWxCLENBQXVCLFdBQXZCLEVBQW9DLEdBQXBDOztBQUVBO0FBQ0EsTUFBRSxtQkFBRixFQUNFLElBREYsQ0FDTyxVQUFTLEtBQVQsRUFBZ0IsRUFBaEIsRUFBb0I7QUFDekIsT0FBRSxFQUFGLEVBQ0UsR0FERixDQUNNLEVBRE4sRUFFRSxJQUZGLENBRU8sYUFGUCxFQUVzQixPQUZ0QixFQUdFLElBSEYsQ0FHTyxjQUhQLEVBR3VCLE1BSHZCO0FBSUEsS0FORjs7QUFRQSxXQUFLLElBQUwsR0FBWSxLQUFaOztBQUVBLFlBQVEsR0FBUixDQUFZLG9CQUFaO0FBQ0EsSUF2QkYsRUF3QkUsSUF4QkYsQ0F3Qk8saUJBQVM7QUFDZCxNQUFFLGdCQUFGLEVBQW9CLFFBQXBCLENBQTZCLGVBQTdCO0FBQ0EsUUFBSSxNQUFNLFlBQVYsRUFBd0I7QUFDdkIsYUFBUSxHQUFSLENBQVksbUJBQVosRUFBZ0MsTUFBTSxZQUF0QztBQUNBLEtBRkQsTUFFTztBQUNOLGFBQVEsR0FBUixDQUFZLDhEQUFaO0FBQ0E7QUFDRCxXQUFLLElBQUwsR0FBWSxLQUFaO0FBQ0EsSUFoQ0Y7QUFpQ0E7QUFDRDtBQWxMaUIsQ0FBbkI7O0FBcUxBLE9BQU8sT0FBUCxHQUFpQixVQUFqQjs7Ozs7QUN6TEE7Ozs7OztBQUVBLElBQU0sVUFBVTtBQUNmLFlBQVcsRUFESTtBQUVmLFlBQVcsRUFBRSxVQUFGLENBRkk7QUFHZixTQUFTLEVBQUUsbUJBQUYsQ0FITTtBQUlmLFVBQVUsRUFBRSxlQUFGLENBSks7QUFLZixPQUFRLElBTE87QUFNZixVQUFVLEtBTks7O0FBUWYsT0FBTTtBQUNMLE9BQU0sRUFERDtBQUVMLFVBQVE7QUFGSCxFQVJTOztBQWFmLFFBQU87QUFDTixVQUFRO0FBREYsRUFiUTtBQWdCZjs7O0FBR0EsUUFuQmUscUJBbUJMO0FBQ1QsU0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE1BQUQsRUFBUyxLQUFULEVBQW1CO0FBQ3JDLE9BQUksVUFBVSxJQUFJLGNBQUosRUFBZDtBQUNBLFdBQVEsSUFBUixDQUFhLE1BQWIsRUFBcUIsZUFBSyxNQUFMLEdBQWMsZUFBSyxHQUFMLENBQVMsT0FBNUM7QUFDQSxXQUFRLGdCQUFSLENBQXlCLGNBQXpCLEVBQXlDLGlDQUF6QztBQUNBLFdBQVEsTUFBUixHQUFpQixZQUFNO0FBQ3RCLFFBQUksUUFBUSxNQUFSLEtBQW1CLEdBQXZCLEVBQTRCO0FBQzNCLFlBQU8sS0FBSyxLQUFMLENBQVcsUUFBUSxRQUFuQixDQUFQO0FBQ0EsS0FGRCxNQUVPO0FBQ04sV0FBTSxNQUFNLGlEQUFpRCxRQUFRLFVBQS9ELENBQU47QUFDQTtBQUNELElBTkQ7QUFPQSxXQUFRLE9BQVIsR0FBa0IsWUFBTTtBQUN2QixVQUFNLE1BQU0sNEJBQU4sQ0FBTjtBQUNBLElBRkQ7O0FBSUEsV0FBUSxJQUFSLENBQWEsS0FBSyxTQUFMLENBQWUsRUFBQyxNQUFNLENBQUMsTUFBRCxDQUFQLEVBQWYsQ0FBYjtBQUNBLEdBaEJNLENBQVA7QUFpQkEsRUFyQ2M7QUFzQ2YsVUF0Q2UsdUJBc0NIO0FBQ1gsT0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLE9BQUssTUFBTCxDQUFZLElBQVo7O0FBRUEsSUFBRSxxQ0FBRixFQUF5QyxHQUF6QyxDQUE2QyxnQkFBN0MsRUFBK0QsTUFBL0Q7QUFDQSxFQTNDYztBQTRDZixRQTVDZSxxQkE0Q0w7QUFDVCxPQUFLLElBQUwsR0FBWSxLQUFaO0FBQ0EsT0FBSyxNQUFMLENBQVksSUFBWjs7QUFFQSxJQUFFLHFDQUFGLEVBQXlDLFVBQXpDLENBQW9ELE9BQXBEO0FBQ0EsRUFqRGM7O0FBa0RmOzs7O0FBSUEsU0F0RGUsb0JBc0ROLE9BdERNLEVBc0RHO0FBQUE7O0FBQ2pCLE1BQUksQ0FBQyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsTUFBbkIsRUFBMkI7QUFDMUI7QUFDQTs7QUFFRCxNQUFJLENBQUMsT0FBTCxFQUFjO0FBQ2IsUUFBSyxTQUFMO0FBQ0E7O0FBRUQsTUFBSSxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsTUFBZCxJQUF3QixLQUFLLFNBQWpDLEVBQTRDO0FBQzNDLFFBQUssSUFBTCxDQUFVLE1BQVYsR0FBbUIsS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLE1BQWQsQ0FBcUIsQ0FBQyxLQUFLLFNBQTNCLEVBQXNDLEtBQUssU0FBM0MsQ0FBbkI7QUFDQSxHQUZELE1BRU87QUFDTixRQUFLLElBQUwsQ0FBVSxNQUFWLEdBQW1CLEtBQUssSUFBTCxDQUFVLEdBQTdCO0FBQ0E7O0FBRUQsT0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixFQUFFLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsSUFBakIsQ0FBc0IsRUFBdEIsQ0FBRixDQUFwQjtBQUNBLE9BQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFBakIsR0FBMEIsQ0FBMUI7O0FBRUEsTUFBSSxPQUFKLEVBQWE7QUFDWixRQUFLLFNBQUwsQ0FDRSxPQURGLENBQ1U7QUFDUixpQkFBZSxnQkFEUDtBQUVSLGdCQUFjLElBRk47QUFHUixrQkFBZSxJQUhQO0FBSVIsaUJBQWUsSUFKUDtBQUtSLGtCQUFlLGdCQUxQO0FBTVIscUJBQWlCLElBTlQ7QUFPUixnQkFBYztBQVBOLElBRFYsRUFVRSxNQVZGLENBVVMsS0FBSyxLQUFMLENBQVcsTUFWcEI7QUFXQSxHQVpELE1BWU87QUFDTixRQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLEtBQUssS0FBTCxDQUFXLE1BQWpDO0FBQ0E7O0FBRUQsT0FBSyxLQUFMLENBQVcsTUFBWCxDQUNFLElBREYsR0FFRSxZQUZGLEdBR0UsUUFIRixDQUdXLFVBQUMsT0FBRCxFQUFVLEtBQVYsRUFBb0I7QUFDN0IsT0FBTSxRQUFRLEVBQUUsTUFBTSxHQUFSLEVBQWEsT0FBYixDQUFxQixnQkFBckIsQ0FBZDs7QUFFQSxPQUFJLE1BQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIseUJBQXJCLENBQUosRUFBcUQ7QUFDcEQsVUFBSyxNQUFMLENBQVksV0FBWixDQUF3Qix5QkFBeEI7QUFDQTs7QUFFRCxTQUFNLElBQU47O0FBRUEsU0FBSyxTQUFMLENBQ0UsT0FERixDQUNVLFVBRFYsRUFDc0IsS0FEdEIsRUFFRSxPQUZGO0FBR0EsR0FmRixFQWdCRSxJQWhCRixDQWdCTyxZQUFNO0FBQ1gsU0FBSyxPQUFMO0FBQ0EsU0FBSyxRQUFMOztBQUVBLE9BQUksQ0FBQyxNQUFLLE9BQVYsRUFBbUI7QUFDbEIsTUFBRSxNQUFGLEVBQVUsTUFBVixDQUFpQixZQUFNO0FBQUMsV0FBSyxRQUFMO0FBQWdCLEtBQXhDO0FBQ0E7QUFDRCxHQXZCRjs7QUF5QkEsT0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixNQUFsQixHQUEyQixDQUEzQjtBQUNBLEVBbEhjOztBQW1IZjs7OztBQUlBLFNBdkhlLHNCQXVISjtBQUNWLE1BQU0sYUFBYyxFQUFFLFFBQUYsRUFBWSxNQUFaLEVBQXBCO0FBQ0EsTUFBTSxlQUFlLEVBQUUsTUFBRixFQUFVLE1BQVYsRUFBckI7QUFDQSxNQUFNLGVBQWUsRUFBRSxNQUFGLEVBQVUsU0FBVixFQUFyQjtBQUNBLE1BQU0sZUFBZSxhQUFhLFlBQWIsR0FBNEIsWUFBakQ7O0FBRUEsTUFBSSxDQUFDLEtBQUssSUFBTixJQUFjLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxNQUE1QixJQUFzQyxnQkFBZ0IsR0FBMUQsRUFBK0Q7QUFDOUQsV0FBUSxHQUFSLENBQVksYUFBWjtBQUNBLFFBQUssUUFBTDtBQUNBO0FBQ0QsRUFqSWM7O0FBa0lmOzs7QUFHQSxLQXJJZSxrQkFxSVI7QUFBQTs7QUFDTixJQUFFLGNBQUYsRUFBa0IsSUFBbEI7O0FBRUEsT0FBSyxPQUFMLEdBQ0UsSUFERixDQUVFLGtCQUFVO0FBQ1QsV0FBUSxHQUFSLENBQVksWUFBWjtBQUNBLFVBQUssSUFBTCxDQUFVLEdBQVYsR0FBZ0IsT0FBTyxPQUFQLEVBQWhCOztBQUVBLFVBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxPQUFkLENBQXNCLFVBQUMsSUFBRCxFQUFPLENBQVAsRUFBYTtBQUNsQyxXQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsQ0FBZCxJQUFtQixvQkFBb0IsZUFBSyxNQUF6QixHQUFrQyxJQUFsQyxHQUNsQixvQ0FEa0IsR0FDcUIsZUFBSyxNQUQxQixHQUNtQyxJQURuQyxHQUVsQixtREFGRDtBQUdBLElBSkQ7O0FBTUEsVUFBSyxRQUFMLENBQWMsSUFBZDtBQUNBLEdBYkgsRUFjRSxpQkFBUztBQUNSLFdBQVEsR0FBUixDQUFZLEtBQVosRUFBbUIsT0FBbkI7QUFDQSxHQWhCSDs7QUFtQkEsSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IsZ0JBQXRCLEVBQXdDLFVBQVMsS0FBVCxFQUFnQjtBQUN2RCxPQUFJLFNBQVMsRUFBRSxJQUFGLEVBQVEsSUFBUixDQUFhLFVBQWIsQ0FBYjs7QUFFQSxLQUFFLGtCQUFGLEVBQ0UsSUFERixDQUNPLEtBRFAsRUFDYyxNQURkLEVBRUUsT0FGRixDQUVVLGNBRlYsRUFHRSxNQUhGLENBR1MsR0FIVDtBQUlDLEdBUEY7O0FBU0EsSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IsY0FBdEIsRUFBc0MsVUFBUyxLQUFULEVBQWdCO0FBQ3JELEtBQUUsSUFBRixFQUFRLE9BQVIsQ0FBZ0IsR0FBaEI7QUFDQSxHQUZEO0FBR0E7QUF2S2MsQ0FBaEI7O0FBMEtBLE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7Ozs7QUM1S0EsSUFBTSxRQUFRO0FBQ2I7OztBQUdBLEtBSmEsa0JBSU47QUFDTixJQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsTUFBYixFQUFxQixlQUFyQixFQUFzQyxpQkFBUztBQUM5QyxPQUFNLE9BQU8sRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBaEIsQ0FBd0IsZUFBeEIsQ0FBYjs7QUFFQSxPQUFJLEtBQUssR0FBTCxFQUFKLEVBQWdCO0FBQ2YsU0FBSyxJQUFMLENBQVUsYUFBVixFQUF5QixNQUF6QjtBQUNBLElBRkQsTUFFTztBQUNOLFNBQUssSUFBTCxDQUFVLGFBQVYsRUFBeUIsT0FBekI7QUFDQTtBQUNELEdBUkQ7O0FBVUEsSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IscUJBQXRCLEVBQTZDLGlCQUFTO0FBQ3JELE9BQU0sT0FBTyxFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFoQixDQUF3QixxQkFBeEIsQ0FBYjs7QUFFQSxRQUFLLEdBQUwsQ0FBUyxNQUFNLE1BQU4sQ0FBYSxLQUFLLEdBQUwsRUFBYixFQUF5QixLQUF6QixDQUFUO0FBQ0EsR0FKRDs7QUFNQSxJQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsT0FBYixFQUFzQixxQkFBdEIsRUFBNkMsaUJBQVM7QUFDckQsT0FBTSxPQUFPLEVBQUUsTUFBTSxNQUFSLEVBQWdCLE9BQWhCLENBQXdCLHFCQUF4QixDQUFiOztBQUVBLFFBQUssR0FBTCxDQUFTLE1BQU0sTUFBTixDQUFhLEtBQUssR0FBTCxFQUFiLEVBQXlCLEtBQXpCLENBQVQ7QUFDQSxHQUpEOztBQU1BLElBQUUsTUFBRixFQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLHNCQUF0QixFQUE4QyxpQkFBUztBQUN0RCxPQUFNLE9BQU8sRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBaEIsQ0FBd0Isc0JBQXhCLENBQWI7O0FBRUEsUUFBSyxHQUFMLENBQVMsTUFBTSxNQUFOLENBQWEsS0FBSyxHQUFMLEVBQWIsRUFBeUIsTUFBekIsQ0FBVDtBQUNBLEdBSkQ7O0FBTUEsSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0Isd0JBQXRCLEVBQWdELGlCQUFTO0FBQ3hELE9BQU0sT0FBTyxFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFoQixDQUF3Qix3QkFBeEIsQ0FBYjs7QUFFQSxRQUFLLEdBQUwsQ0FBUyxNQUFNLE1BQU4sQ0FBYSxLQUFLLEdBQUwsRUFBYixFQUF5QixRQUF6QixDQUFUO0FBQ0EsR0FKRDs7QUFNQSxJQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsTUFBYixFQUFxQixhQUFyQixFQUFvQyxpQkFBUztBQUM1QyxPQUFNLE9BQU8sRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBaEIsQ0FBd0IsYUFBeEIsQ0FBYjs7QUFFQSxXQUFRLEtBQUssSUFBTCxDQUFVLFdBQVYsQ0FBUjtBQUNDLFNBQUssT0FBTDtBQUNDLFNBQUksYUFBYSxJQUFiLENBQWtCLEtBQUssR0FBTCxFQUFsQixDQUFKLEVBQW1DO0FBQ2xDLFdBQUssSUFBTCxDQUFVLGNBQVYsRUFBMEIsTUFBMUI7QUFDQSxNQUZELE1BRU87QUFDTixXQUFLLElBQUwsQ0FBVSxjQUFWLEVBQTBCLE9BQTFCO0FBQ0E7QUFDRDs7QUFFRCxTQUFLLEtBQUw7QUFDQztBQUNBLFNBQUksS0FBSyxHQUFMLEdBQVcsTUFBWCxLQUFzQixFQUExQixFQUE4QjtBQUM3QixXQUFLLElBQUwsQ0FBVSxjQUFWLEVBQTBCLE1BQTFCO0FBQ0EsTUFGRCxNQUVPO0FBQ04sV0FBSyxJQUFMLENBQVUsY0FBVixFQUEwQixPQUExQjtBQUNBO0FBQ0Q7O0FBRUQsU0FBSyxNQUFMO0FBQ0MsU0FBSSxrREFBa0QsSUFBbEQsQ0FBdUQsS0FBSyxHQUFMLEVBQXZELENBQUosRUFBd0U7QUFDdkUsV0FBSyxJQUFMLENBQVUsY0FBVixFQUEwQixNQUExQjtBQUNBLE1BRkQsTUFFTztBQUNOLFdBQUssSUFBTCxDQUFVLGNBQVYsRUFBMEIsT0FBMUI7QUFDQTtBQUNEOztBQUVELFNBQUssT0FBTDtBQUNBLFNBQUssTUFBTDtBQUNBLFNBQUssUUFBTDtBQUNDLFNBQUksS0FBSyxHQUFMLEVBQUosRUFBZ0I7QUFDZixXQUFLLElBQUwsQ0FBVSxjQUFWLEVBQTBCLE1BQTFCO0FBQ0EsTUFGRCxNQUVPO0FBQ04sV0FBSyxJQUFMLENBQVUsY0FBVixFQUEwQixPQUExQjtBQUNBO0FBQ0Q7O0FBRUQsU0FBSyxNQUFMO0FBQ0MsU0FBSSxLQUFLLEdBQUwsTUFDSCxTQUFTLEtBQUssR0FBTCxFQUFULEtBQXdCLElBRHJCLElBRUgsU0FBUyxLQUFLLEdBQUwsRUFBVCxLQUF3QixJQUFJLElBQUosR0FBVyxXQUFYLEVBRnpCLEVBRW1EO0FBQ2xELFdBQUssSUFBTCxDQUFVLGNBQVYsRUFBMEIsTUFBMUI7QUFDQSxNQUpELE1BSU87QUFDTixXQUFLLElBQUwsQ0FBVSxjQUFWLEVBQTBCLE9BQTFCO0FBQ0E7QUFDRDtBQTVDRjtBQThDQSxHQWpERDs7QUFtREEsSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IsYUFBdEIsRUFBcUMsaUJBQVM7QUFDN0MsT0FBTSxPQUFPLEVBQUUsTUFBTSxNQUFSLEVBQWdCLE9BQWhCLENBQXdCLGFBQXhCLENBQWI7O0FBRUEsUUFBSyxJQUFMLENBQVUsY0FBVixFQUEwQixNQUExQjtBQUNBLEdBSkQ7QUFLQSxFQS9GWTs7QUFnR2I7Ozs7OztBQU1BLE9BdEdhLGtCQXNHTixJQXRHTSxFQXNHQSxPQXRHQSxFQXNHUTtBQUNwQixVQUFRLE9BQVI7QUFDQyxRQUFLLFFBQUw7QUFDQyxXQUFPLEtBQUssT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEIsQ0FBUDs7QUFFRCxRQUFLLE1BQUw7QUFDQyxXQUFPLE1BQU0sTUFBTixDQUFhLElBQWIsRUFBbUIsUUFBbkIsQ0FBUDs7QUFFQSxRQUFJLEtBQUssTUFBTCxHQUFjLENBQWxCLEVBQXFCO0FBQ3BCLFlBQU8sS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBUDtBQUNBOztBQUVELFdBQU8sSUFBUDs7QUFFRCxRQUFLLEtBQUw7QUFDQyxXQUFPLE1BQU0sTUFBTixDQUFhLElBQWIsRUFBbUIsUUFBbkIsQ0FBUDs7QUFFQSxRQUFJLFVBQVUsRUFBZDs7QUFFQSxRQUFJLEtBQUssTUFBTCxJQUFlLEVBQW5CLEVBQXVCO0FBQ3RCLGFBQU8sS0FBSyxNQUFaO0FBQ0MsV0FBSyxDQUFMO0FBQ0MsaUJBQVUsTUFBVjtBQUNBO0FBQ0QsV0FBSyxDQUFMO0FBQ0MsV0FBRyxLQUFLLENBQUwsTUFBWSxHQUFmLEVBQW9CO0FBQ25CLGtCQUFVLFNBQVMsS0FBSyxDQUFMLENBQW5CO0FBQ0EsUUFGRCxNQUVPO0FBQ04sa0JBQVUsTUFBVjtBQUNBO0FBQ0Q7QUFDRCxXQUFLLENBQUw7QUFDQyxpQkFBVSxTQUFTLEtBQUssQ0FBTCxDQUFuQjtBQUNBO0FBQ0QsV0FBSyxDQUFMO0FBQ0MsaUJBQVUsU0FBUyxLQUFLLENBQUwsQ0FBVCxHQUFtQixLQUFLLENBQUwsQ0FBN0I7QUFDQTtBQUNELFdBQUssQ0FBTDtBQUNDLGlCQUFVLFNBQVMsS0FBSyxDQUFMLENBQVQsR0FBbUIsS0FBSyxDQUFMLENBQW5CLEdBQTZCLEtBQUssQ0FBTCxDQUF2QztBQUNBO0FBQ0QsV0FBSyxDQUFMO0FBQ0MsaUJBQVUsU0FBUyxLQUFLLENBQUwsQ0FBVCxHQUFtQixLQUFLLENBQUwsQ0FBbkIsR0FBNkIsS0FBSyxDQUFMLENBQTdCLEdBQ04sSUFETSxHQUNDLEtBQUssQ0FBTCxDQURYO0FBRUE7QUFDRCxXQUFLLENBQUw7QUFDQyxpQkFBVSxTQUFTLEtBQUssQ0FBTCxDQUFULEdBQW1CLEtBQUssQ0FBTCxDQUFuQixHQUE2QixLQUFLLENBQUwsQ0FBN0IsR0FDTixJQURNLEdBQ0MsS0FBSyxDQUFMLENBREQsR0FDVyxLQUFLLENBQUwsQ0FEckI7QUFFQTtBQUNELFdBQUssQ0FBTDtBQUNDLGlCQUFVLFNBQVMsS0FBSyxDQUFMLENBQVQsR0FBbUIsS0FBSyxDQUFMLENBQW5CLEdBQTZCLEtBQUssQ0FBTCxDQUE3QixHQUNOLElBRE0sR0FDQyxLQUFLLENBQUwsQ0FERCxHQUNXLEtBQUssQ0FBTCxDQURYLEdBQ3FCLEtBQUssQ0FBTCxDQUQvQjtBQUVBO0FBQ0QsV0FBSyxDQUFMO0FBQ0MsaUJBQVUsU0FBUyxLQUFLLENBQUwsQ0FBVCxHQUFtQixLQUFLLENBQUwsQ0FBbkIsR0FBNkIsS0FBSyxDQUFMLENBQTdCLEdBQ04sSUFETSxHQUNDLEtBQUssQ0FBTCxDQURELEdBQ1csS0FBSyxDQUFMLENBRFgsR0FDcUIsS0FBSyxDQUFMLENBRHJCLEdBRU4sR0FGTSxHQUVBLEtBQUssQ0FBTCxDQUZWO0FBR0E7QUFDRCxXQUFLLENBQUw7QUFDQyxpQkFBVSxTQUFTLEtBQUssQ0FBTCxDQUFULEdBQW1CLEtBQUssQ0FBTCxDQUFuQixHQUE2QixLQUFLLENBQUwsQ0FBN0IsR0FDTixJQURNLEdBQ0MsS0FBSyxDQUFMLENBREQsR0FDVyxLQUFLLENBQUwsQ0FEWCxHQUNxQixLQUFLLENBQUwsQ0FEckIsR0FFTixHQUZNLEdBRUEsS0FBSyxDQUFMLENBRkEsR0FFVSxLQUFLLENBQUwsQ0FGcEI7QUFHQTtBQUNELFdBQUssRUFBTDtBQUNDLGlCQUFVLFNBQVMsS0FBSyxDQUFMLENBQVQsR0FBbUIsS0FBSyxDQUFMLENBQW5CLEdBQTZCLEtBQUssQ0FBTCxDQUE3QixHQUNOLElBRE0sR0FDQyxLQUFLLENBQUwsQ0FERCxHQUNXLEtBQUssQ0FBTCxDQURYLEdBQ3FCLEtBQUssQ0FBTCxDQURyQixHQUVOLEdBRk0sR0FFQSxLQUFLLENBQUwsQ0FGQSxHQUVVLEtBQUssQ0FBTCxDQUZWLEdBR04sR0FITSxHQUdBLEtBQUssQ0FBTCxDQUhWO0FBSUE7QUFDRCxXQUFLLEVBQUw7QUFDQyxpQkFBVSxTQUFTLEtBQUssQ0FBTCxDQUFULEdBQW1CLEtBQUssQ0FBTCxDQUFuQixHQUE2QixLQUFLLENBQUwsQ0FBN0IsR0FDTixJQURNLEdBQ0MsS0FBSyxDQUFMLENBREQsR0FDVyxLQUFLLENBQUwsQ0FEWCxHQUNxQixLQUFLLENBQUwsQ0FEckIsR0FFTixHQUZNLEdBRUEsS0FBSyxDQUFMLENBRkEsR0FFVSxLQUFLLENBQUwsQ0FGVixHQUdOLEdBSE0sR0FHQSxLQUFLLENBQUwsQ0FIQSxHQUdVLEtBQUssRUFBTCxDQUhwQjtBQUlBO0FBckRGO0FBdURBLEtBeERELE1Bd0RPO0FBQ04sZUFBVSxTQUFTLEtBQUssQ0FBTCxDQUFULEdBQW1CLEtBQUssQ0FBTCxDQUFuQixHQUE2QixLQUFLLENBQUwsQ0FBN0IsR0FDTixJQURNLEdBQ0MsS0FBSyxDQUFMLENBREQsR0FDVyxLQUFLLENBQUwsQ0FEWCxHQUNxQixLQUFLLENBQUwsQ0FEckIsR0FFTixHQUZNLEdBRUEsS0FBSyxDQUFMLENBRkEsR0FFVSxLQUFLLENBQUwsQ0FGVixHQUdOLEdBSE0sR0FHQSxLQUFLLENBQUwsQ0FIQSxHQUdVLEtBQUssRUFBTCxDQUhwQjtBQUlBO0FBQ0QsV0FBTyxPQUFQOztBQUVEO0FBQ0MsWUFBUSxHQUFSLENBQVksb0JBQVo7QUFDQTtBQXBGRjtBQXNGQTtBQTdMWSxDQUFkOztBQWdNQSxPQUFPLE9BQVAsR0FBaUIsS0FBakI7Ozs7O0FDaE1BLElBQU0sTUFBTTtBQUNYOzs7QUFHQSxLQUpXLGtCQUlKO0FBQ04sSUFBRSxNQUFGLEVBQVUsUUFBVixDQUFtQjtBQUNsQixjQUFXLEdBRE87QUFFbEIsV0FBUztBQUZTLEdBQW5CO0FBSUE7QUFUVSxDQUFaOztBQVlBLE9BQU8sT0FBUCxHQUFpQixHQUFqQjs7Ozs7QUNaQSxJQUFNLFVBQVU7QUFDZjs7O0FBR0EsS0FKZSxrQkFJUjtBQUNOLElBQUUsTUFBRixFQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLCtCQUF0QixFQUF1RCxpQkFBUztBQUMvRCxTQUFNLGNBQU47O0FBRUEsS0FBRSxNQUFNLE1BQVIsRUFDRSxPQURGLENBQ1UsVUFEVixFQUVFLFdBRkYsQ0FFYyxlQUZkO0FBR0EsR0FORDtBQU9BO0FBWmMsQ0FBaEI7O0FBZUEsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7OztBQ2ZBLElBQU0sTUFBTTtBQUNYLE1BQU8sS0FESTtBQUVYLFFBQVMsSUFBSSxJQUFKLEdBQVcsUUFBWCxFQUZFO0FBR1gsVUFBVSxJQUFJLElBQUosR0FBVyxVQUFYLEVBSEM7QUFJWCxVQUFVLElBQUksSUFBSixHQUFXLFVBQVgsRUFKQztBQUtYOzs7QUFHQSxVQVJXLHVCQVFDO0FBQ1gsSUFBRSxvQkFBRixFQUF3QixJQUF4QixDQUE2QixLQUFLLEtBQUwsQ0FBVyxLQUFLLEdBQUwsR0FBUyxJQUFwQixDQUE3QjtBQUNBLElBQUUsb0JBQUYsRUFBd0IsSUFBeEIsQ0FBNkIsS0FBSyxLQUFMLENBQVcsS0FBSyxHQUFMLEdBQVMsSUFBVCxHQUFjLEVBQXpCLENBQTdCO0FBQ0EsSUFBRSxvQkFBRixFQUF3QixJQUF4QixDQUE2QixLQUFLLEtBQUwsQ0FBVyxLQUFLLEdBQUwsR0FBUyxJQUFULEdBQWMsRUFBekIsQ0FBN0I7O0FBRUEsT0FBSyxHQUFMLElBQVksQ0FBWjtBQUNBLEVBZFU7O0FBZVg7Ozs7O0FBS0EsV0FwQlcsc0JBb0JBLE1BcEJBLEVBb0JRO0FBQ2xCLE1BQUksU0FBUyxFQUFiLEVBQWlCO0FBQ2hCLFlBQVMsTUFBTSxPQUFPLFFBQVAsRUFBZjtBQUNBO0FBQ0QsU0FBTyxNQUFQO0FBQ0EsRUF6QlU7O0FBMEJYOzs7O0FBSUEsUUE5QlcscUJBOEJEO0FBQUE7O0FBQ1QsU0FBTyxZQUFNO0FBQ1osU0FBSyxLQUFMLEdBQWEsSUFBSSxJQUFKLEdBQVcsUUFBWCxFQUFiOztBQUVBLEtBQUUsbUJBQUYsRUFBdUIsSUFBdkIsQ0FBNEIsTUFBSyxVQUFMLENBQWdCLE1BQUssS0FBckIsQ0FBNUI7O0FBRUEsU0FBSyxPQUFMLEdBQWUsSUFBSSxJQUFKLEdBQVcsVUFBWCxFQUFmOztBQUVBLEtBQUUsbUJBQUYsRUFBdUIsSUFBdkIsQ0FBNEIsTUFBSyxVQUFMLENBQWdCLE1BQUssT0FBckIsQ0FBNUI7O0FBRUEsU0FBSyxPQUFMLEdBQWUsSUFBSSxJQUFKLEdBQVcsVUFBWCxFQUFmOztBQUVBLEtBQUUsbUJBQUYsRUFBdUIsSUFBdkIsQ0FBNEIsTUFBSyxVQUFMLENBQWdCLE1BQUssT0FBckIsQ0FBNUI7QUFDQSxHQVpEO0FBYUEsRUE1Q1U7O0FBNkNYOzs7QUFHQSxLQWhEVyxrQkFnREo7QUFDTixJQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsWUFBYixFQUEyQixNQUEzQixFQUFtQyxpQkFBUztBQUMzQyxTQUFNLGNBQU47O0FBRUEsT0FBSSxPQUFPLEVBQUUsTUFBTSxNQUFSLEVBQWdCLE9BQWhCLENBQXdCLE1BQXhCLENBQVg7O0FBRUEsUUFDRSxXQURGLENBQ2MsV0FEZCxFQUVFLEdBRkYsQ0FFTSxTQUZOLEVBRWlCLEdBRmpCLEVBR0UsUUFIRixHQUlFLFdBSkYsQ0FJYyxXQUpkLEVBS0UsR0FMRixDQUtNLFNBTE4sRUFLaUIsR0FMakI7QUFNQSxHQVhEOztBQWFBLE1BQUksRUFBRSxNQUFGLEVBQVUsUUFBVixDQUFtQixTQUFuQixDQUFKLEVBQW1DO0FBQ2xDLE9BQUksVUFBVSxJQUFJLElBQUosRUFBZDs7QUFFQSxXQUFRLE9BQVIsQ0FBZ0IsUUFBUSxPQUFSLEVBQWhCOztBQUVBLEtBQUUsbUJBQUYsRUFBdUIsSUFBdkIsQ0FBNEIsS0FBSyxLQUFqQztBQUNBLEtBQUUsbUJBQUYsRUFBdUIsSUFBdkIsQ0FBNEIsS0FBSyxPQUFqQztBQUNBLEtBQUUsbUJBQUYsRUFBdUIsSUFBdkIsQ0FBNEIsS0FBSyxPQUFqQzs7QUFFQSxlQUFZLEtBQUssT0FBakIsRUFBMEIsSUFBMUI7QUFFQSxHQVhELE1BV087QUFDTixLQUFFLG9CQUFGLEVBQ0UsSUFERixDQUNPLEtBQUssS0FBTCxDQUFXLEtBQUssR0FBTCxHQUFTLElBQXBCLElBQTRCLEVBQTVCLEdBQ0gsTUFBTSxLQUFLLEtBQUwsQ0FBVyxLQUFLLEdBQUwsR0FBUyxJQUFwQixDQURILEdBRUgsS0FBSyxLQUFMLENBQVcsS0FBSyxHQUFMLEdBQVMsSUFBcEIsQ0FISjs7QUFLQSxLQUFFLG9CQUFGLEVBQ0UsSUFERixDQUNPLEtBQUssS0FBTCxDQUFXLEtBQUssR0FBTCxHQUFTLElBQVQsR0FBYyxFQUF6QixJQUErQixFQUEvQixHQUNILE1BQU0sS0FBSyxLQUFMLENBQVcsS0FBSyxHQUFMLEdBQVMsSUFBVCxHQUFjLEVBQXpCLENBREgsR0FFSCxLQUFLLEtBQUwsQ0FBVyxLQUFLLEdBQUwsR0FBUyxJQUFULEdBQWMsRUFBekIsQ0FISjs7QUFLQSxLQUFFLG9CQUFGLEVBQ0UsSUFERixDQUNPLEtBQUssS0FBTCxDQUFXLEtBQUssR0FBTCxHQUFTLElBQVQsR0FBYyxFQUF6QixJQUErQixFQUEvQixHQUNILE1BQU0sS0FBSyxLQUFMLENBQVcsS0FBSyxHQUFMLEdBQVMsSUFBVCxHQUFjLEVBQXpCLENBREgsR0FFSCxLQUFLLEtBQUwsQ0FBVyxLQUFLLEdBQUwsR0FBUyxJQUFULEdBQWMsRUFBekIsQ0FISjs7QUFLQSxRQUFLLEdBQUwsSUFBWSxDQUFaOztBQUVBLGVBQVksS0FBSyxTQUFqQixFQUE0QixJQUE1QjtBQUNBO0FBQ0Q7QUE3RlUsQ0FBWjs7QUFnR0EsT0FBTyxPQUFQLEdBQWlCLEdBQWpCOzs7OztBQ2hHQSxJQUFNLFdBQVc7QUFDaEI7OztBQUdBLEtBSmdCLGtCQUlUO0FBQ04sSUFBRSxrQkFBRixFQUFzQixFQUF0QixDQUF5QixDQUF6QixFQUE0QixJQUE1Qjs7QUFFQSxJQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsT0FBYixFQUFzQixpQkFBdEIsRUFBeUMsaUJBQVM7QUFDakQsT0FBSSxPQUFPLEVBQUUsTUFBTSxNQUFSLEVBQWdCLE9BQWhCLENBQXdCLGlCQUF4QixDQUFYO0FBQ0EsU0FBTSxjQUFOOztBQUVBLE9BQUksQ0FBQyxLQUFLLFFBQUwsQ0FBYyxrQkFBZCxDQUFMLEVBQXdDO0FBQ3ZDLFNBQ0UsUUFERixDQUNXLGtCQURYLEVBRUUsUUFGRixHQUdFLFdBSEYsQ0FHYyxrQkFIZDs7QUFLQSxNQUFFLGtCQUFGLEVBQ0UsRUFERixDQUNLLEtBQUssS0FBTCxLQUFlLENBRHBCLEVBRUUsTUFGRixDQUVTLEdBRlQsRUFHRSxRQUhGLEdBSUUsT0FKRixDQUlVLEdBSlY7O0FBTUEsTUFBRSxrQkFBRixFQUNFLElBREYsQ0FDTyxpQkFEUCxFQUVFLE9BRkYsQ0FFVSxHQUZWO0FBR0E7QUFDRCxHQXBCRDs7QUFzQkEsSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IsbUJBQXRCLEVBQTJDLGlCQUFTO0FBQ25ELE9BQUksT0FBTyxFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFoQixDQUF3QixtQkFBeEIsQ0FBWDtBQUNBLFNBQU0sY0FBTjs7QUFFQSxRQUNFLFFBREYsQ0FDVyxpQkFEWCxFQUVFLFdBRkYsQ0FFYyxHQUZkLEVBR0UsT0FIRixDQUdVLFdBSFYsRUFJRSxRQUpGLENBSVcsV0FKWCxFQUtFLElBTEYsQ0FLTyxpQkFMUCxFQU1FLE9BTkYsQ0FNVSxHQU5WO0FBT0EsR0FYRDtBQVlBO0FBekNlLENBQWpCOztBQTRDQSxPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7O0FDNUNBLElBQU0sWUFBWTtBQUNqQjs7O0FBR0EsS0FKaUIsa0JBSVY7QUFDTixJQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsT0FBYixFQUFzQixhQUF0QixFQUFxQyxpQkFBUztBQUM3QyxPQUFNLE9BQU8sRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBaEIsQ0FBd0IsYUFBeEIsQ0FBYjtBQUNBLFNBQU0sY0FBTjs7QUFFQSxLQUFFLFlBQUYsRUFDRSxPQURGLENBRUUsRUFBQyxXQUFXLEtBQUssT0FBTCxDQUFhLFVBQWIsRUFBeUIsV0FBekIsRUFBWixFQUZGLEVBR0UsR0FIRjtBQUlBLEdBUkQ7QUFTQTtBQWRnQixDQUFsQjs7QUFpQkEsT0FBTyxPQUFQLEdBQWlCLFNBQWpCOzs7OztBQ2pCQSxJQUFNLFNBQVM7QUFDZCxlQUFjLElBREE7QUFFZCxVQUFXLEtBRkc7QUFHZDs7O0FBR0EsS0FOYyxrQkFNUDtBQUFBOztBQUNOLE9BQUssWUFBTCxHQUFvQixFQUFFLFNBQUYsRUFBYSxNQUFiLEdBQXNCLEdBQXRCLEdBQTRCLEVBQUUsTUFBRixFQUFVLE1BQVYsRUFBNUIsR0FBaUQsRUFBRSxTQUFGLEVBQWEsTUFBYixLQUF3QixDQUE3Rjs7QUFFQSxJQUFFLE1BQUYsRUFBVSxNQUFWLENBQWlCLFlBQU07QUFDdEIsT0FBSSxFQUFFLE1BQUYsRUFBVSxTQUFWLE1BQXlCLE1BQUssWUFBOUIsSUFBOEMsQ0FBQyxNQUFLLE9BQXhELEVBQWlFO0FBQ2hFLE1BQUUsU0FBRixFQUFhLFFBQWIsQ0FBc0IsaUJBQXRCO0FBQ0EsVUFBSyxPQUFMLEdBQWUsSUFBZjtBQUNBO0FBQ0QsR0FMRDtBQU1BO0FBZmEsQ0FBZjs7QUFrQkEsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7OztBQ2xCQSxJQUFNLFlBQVk7QUFDakI7OztBQUdBLEtBSmlCLGtCQUlWO0FBQ04sSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IsZ0JBQXRCLEVBQXdDLFVBQVMsS0FBVCxFQUFnQjtBQUN2RCxTQUFNLGNBQU47O0FBRUEsS0FBRSxJQUFGLEVBQ0UsUUFERixDQUNXLHlCQURYLEVBRUUsUUFGRixHQUdFLFdBSEYsQ0FHYyx5QkFIZCxFQUlFLE9BSkYsQ0FJVSxtQkFKVixFQUtFLFFBTEYsQ0FLVyxtQkFMWCxFQU1FLElBTkYsQ0FNTyxpQkFOUCxFQU0wQixFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsY0FBYixDQU4xQjtBQU9BLEdBVkQ7QUFXQTtBQWhCZ0IsQ0FBbEI7O0FBbUJBLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7Ozs7QUNuQkEsSUFBTSxTQUFTO0FBQ2QsU0FBUyxFQUFFLFNBQUYsRUFBYSxJQUFiLENBQWtCLGFBQWxCLENBREs7QUFFZCxTQUFTLEVBQUUsU0FBRixFQUFhLElBQWIsQ0FBa0IsYUFBbEIsQ0FGSztBQUdkLFdBQVcsRUFBRSxTQUFGLEVBQWEsSUFBYixDQUFrQixhQUFsQixDQUhHO0FBSWQsU0FBUyxFQUFFLFNBQUYsRUFBYSxJQUFiLENBQWtCLGFBQWxCLENBSks7QUFLZCxTQUFTLEVBQUUsU0FBRixFQUFhLElBQWIsQ0FBa0IsYUFBbEIsQ0FMSztBQU1kLFdBQVcsRUFBRSxTQUFGLEVBQWEsSUFBYixDQUFrQixhQUFsQixDQU5HO0FBT2Q7OztBQUdBLEtBVmMsa0JBVVA7QUFDTixNQUFJLE9BQU8sZ0JBQVAsSUFBMkIsQ0FBL0IsRUFBa0M7QUFDakMsT0FBSSxFQUFFLE1BQUYsRUFBVSxRQUFWLENBQW1CLFFBQW5CLENBQUosRUFBa0M7QUFDakMsTUFBRSxTQUFGLEVBQWEsSUFBYixDQUFrQixlQUFsQixFQUFtQyxLQUFLLFFBQXhDO0FBQ0EsSUFGRCxNQUVPO0FBQ04sTUFBRSxTQUFGLEVBQWEsSUFBYixDQUFrQixlQUFsQixFQUFtQyxLQUFLLFFBQXhDO0FBQ0E7QUFDRCxHQU5ELE1BTU8sSUFBSSxPQUFPLGdCQUFQLElBQTJCLENBQS9CLEVBQWtDO0FBQ3hDLE9BQUksRUFBRSxNQUFGLEVBQVUsUUFBVixDQUFtQixRQUFuQixDQUFKLEVBQWtDO0FBQ2pDLE1BQUUsU0FBRixFQUFhLElBQWIsQ0FBa0IsZUFBbEIsRUFBbUMsS0FBSyxNQUF4QztBQUNBLElBRkQsTUFFTztBQUNOLE1BQUUsU0FBRixFQUFhLElBQWIsQ0FBa0IsZUFBbEIsRUFBbUMsS0FBSyxNQUF4QztBQUNBO0FBQ0QsR0FOTSxNQU1DO0FBQ1AsT0FBSSxFQUFFLE1BQUYsRUFBVSxRQUFWLENBQW1CLFFBQW5CLENBQUosRUFBa0M7QUFDakMsTUFBRSxTQUFGLEVBQWEsSUFBYixDQUFrQixlQUFsQixFQUFtQyxLQUFLLE1BQXhDO0FBQ0EsSUFGRCxNQUVPO0FBQ04sTUFBRSxTQUFGLEVBQWEsSUFBYixDQUFrQixlQUFsQixFQUFtQyxLQUFLLE1BQXhDO0FBQ0E7QUFDRDs7QUFFRCxJQUFFLFNBQUYsRUFBYSxRQUFiLENBQXNCO0FBQ3JCLGNBQVcsR0FEVTtBQUVyQixXQUFTO0FBRlksR0FBdEI7QUFJQTtBQW5DYSxDQUFmOztBQXNDQSxPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7O0FDdENBLElBQU0sUUFBUTtBQUNiOzs7QUFHQSxjQUphLDJCQUlHO0FBQ2YsTUFBSSxFQUFFLE1BQUYsRUFBVSxTQUFWLE1BQXlCLEdBQTdCLEVBQWtDO0FBQ2pDLEtBQUUsU0FBRixFQUFhLFFBQWIsQ0FBc0IsY0FBdEI7QUFDQSxHQUZELE1BRU87QUFDTixLQUFFLFNBQUYsRUFBYSxXQUFiLENBQXlCLGNBQXpCO0FBQ0E7QUFDRCxFQVZZOztBQVdiOzs7QUFHQSxLQWRhLGtCQWNOO0FBQ04sUUFBTSxhQUFOOztBQUVBLElBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsWUFBTTtBQUN0QixTQUFNLGFBQU47QUFDQSxHQUZEOztBQUlBLElBQUUsTUFBRixFQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLFNBQXRCLEVBQWlDLFlBQU07QUFDdEMsS0FBRSxZQUFGLEVBQ0UsSUFERixHQUVFLE9BRkYsQ0FHRSxFQUFDLFdBQVcsQ0FBWixFQUhGLEVBSUUsRUFBRSxNQUFGLEVBQVUsU0FBVixLQUFzQixDQUp4QjtBQUtBLEdBTkQ7QUFPQTtBQTVCWSxDQUFkOztBQStCQSxPQUFPLE9BQVAsR0FBaUIsS0FBakI7Ozs7O0FDL0JBLElBQU0sV0FBVztBQUNoQjs7O0FBR0EsS0FKZ0Isa0JBSVQ7QUFDTixJQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsT0FBYixFQUFzQixpQkFBdEIsRUFBeUMsVUFBUyxLQUFULEVBQWdCO0FBQ3hELFNBQU0sY0FBTjs7QUFFQSxLQUFFLElBQUYsRUFDRSxRQURGLENBQ1csd0JBRFgsRUFFRSxRQUZGLEdBR0UsV0FIRixDQUdjLHdCQUhkOztBQUtBLE9BQUksRUFBRSxJQUFGLEVBQVEsS0FBUixPQUFvQixDQUF4QixFQUEyQjtBQUMxQixNQUFFLElBQUYsRUFDRSxPQURGLENBQ1UsWUFEVixFQUVFLFFBRkYsQ0FFVyxnQkFGWDtBQUdBLElBSkQsTUFJTztBQUNOLE1BQUUsSUFBRixFQUNFLE9BREYsQ0FDVSxZQURWLEVBRUUsV0FGRixDQUVjLGdCQUZkO0FBR0E7QUFDRCxHQWpCRDtBQWtCQTtBQXZCZSxDQUFqQjs7QUEwQkEsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7OztBQzFCQSxJQUFNLFFBQVE7QUFDYixTQUFRLEVBREs7QUFFYixNQUFLLEVBRlE7QUFHYjs7O0FBR0EsVUFOYSx1QkFNRDtBQUNYLE9BQUssTUFBTCxHQUFjLENBQ2I7QUFDQyxXQUFRLENBQUMsaUJBQUQsRUFBb0Isa0JBQXBCLENBRFQ7QUFFQyxXQUFRO0FBQ1AsaUJBQWUsa0JBRFI7QUFFUCxvQkFBaUI7QUFGVixJQUZUO0FBTUMsV0FBUTtBQUNQLGdCQUFZLE1BQU0scUJBQU4sQ0FDVixXQURVLENBQ0UsdURBREYsQ0FETDs7QUFJUCxlQUFXO0FBQ1YsV0FBUyxXQURDO0FBRVYsa0JBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBRixFQUFLLENBQUMsRUFBTixDQUFELEVBQVksQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFaO0FBRko7QUFKSjtBQU5ULEdBRGEsRUFpQmI7QUFDQyxXQUFRLENBQUMsaUJBQUQsRUFBb0IsaUJBQXBCLENBRFQ7QUFFQyxXQUFRO0FBQ1AsaUJBQWUsY0FEUjtBQUVQLG9CQUFpQjtBQUZWLElBRlQ7QUFNQyxXQUFRO0FBQ1AsZ0JBQVksTUFBTSxxQkFBTixDQUNWLFdBRFUsQ0FDRSxzREFERixDQURMOztBQUlQLGVBQVc7QUFDVixXQUFTLFdBREM7QUFFVixrQkFBYyxDQUFDLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBQyxFQUFOLENBQUQsRUFBWSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVo7QUFGSjtBQUpKO0FBTlQsR0FqQmEsQ0FBZDtBQWtDQSxFQXpDWTs7QUEwQ2I7Ozs7QUFJQSxTQTlDYSxvQkE4Q0osS0E5Q0ksRUE4Q0c7QUFDZixPQUFLLEdBQUwsQ0FBUyxVQUFULENBQW9CLEdBQXBCLENBQXdCLElBQUksTUFBTSxTQUFWLENBQW9CLE1BQU0sTUFBMUIsRUFBa0MsTUFBTSxNQUF4QyxFQUFnRCxNQUFNLE1BQXRELENBQXhCO0FBQ0EsRUFoRFk7O0FBaURiOzs7QUFHQSxPQXBEYSxvQkFvREo7QUFBQTs7QUFDUixRQUFNLEtBQU4sQ0FBWSxZQUFNO0FBQ2pCLFNBQUssR0FBTCxHQUFXLElBQUksTUFBTSxHQUFWLENBQWMsT0FBZCxFQUF1QjtBQUNqQyxZQUFRLENBQ1AsaUJBRE8sRUFFUCxrQkFGTyxDQUR5QjtBQUtqQyxjQUFVLENBQ1QsYUFEUyxDQUx1QjtBQVFqQyxVQUFNO0FBUjJCLElBQXZCLENBQVg7O0FBV0EsU0FBSyxTQUFMOztBQUVBLFNBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsZ0JBQVE7QUFDM0IsVUFBSyxRQUFMLENBQWMsSUFBZDtBQUNBLElBRkQ7O0FBSUEsU0FBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixPQUFuQixDQUEyQixZQUEzQjtBQUNBLEdBbkJEO0FBb0JBLEVBekVZOztBQTBFYjs7O0FBR0EsS0E3RWEsa0JBNkVOO0FBQ04sT0FBSyxNQUFMO0FBQ0E7QUEvRVksQ0FBZDs7QUFrRkEsT0FBTyxPQUFQLEdBQWlCLEtBQWpCOzs7QUNsRkE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsUUFBUSx3REFBUjtBQUNBLFFBQVEsV0FBUjs7QUFFQSxJQUFNLE9BQU87QUFDWjs7O0FBR0EsTUFKWSxtQkFJSjtBQUNQLE1BQUksU0FBUyxVQUFULEtBQXdCLFNBQTVCLEVBQXNDO0FBQ3JDLFFBQUssSUFBTDtBQUNBLEdBRkQsTUFFTztBQUNOLFlBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEtBQUssSUFBbkQ7QUFDQTtBQUNELEVBVlc7O0FBV1o7OztBQUdBLEtBZFksa0JBY0w7QUFDTixtQkFBTyxJQUFQO0FBQ0Esa0JBQU0sSUFBTjs7QUFFQSxVQUFRLE9BQU8sUUFBUCxDQUFnQixRQUF4QjtBQUNDLFFBQUssR0FBTDtBQUNDLHlCQUFXLElBQVg7QUFDQSxvQkFBTSxJQUFOO0FBQ0Esc0JBQVEsSUFBUjtBQUNBLHdCQUFVLElBQVY7QUFDQSx1QkFBUyxJQUFUO0FBQ0E7O0FBRUQsUUFBSyxjQUFMO0FBQ0MsdUJBQVMsSUFBVDtBQUNBLGtCQUFJLElBQUo7QUFDQSxrQkFBSSxJQUFKO0FBQ0Esd0JBQVUsSUFBVjtBQUNBLHFCQUFPLElBQVA7QUFDQSx3QkFBVSxJQUFWO0FBQ0EscUJBQU8sSUFBUDtBQUNBOztBQUVELFFBQUssZ0JBQUw7QUFDQyxvQkFBTSxJQUFOO0FBQ0E7O0FBRUQsUUFBSyxXQUFMO0FBQ0MsdUJBQVMsSUFBVDtBQUNBOztBQUVELFFBQUssZUFBTDtBQUNDLHNCQUFRLElBQVI7QUFDQTs7QUFFRDtBQUNDLGFBQVMsSUFBVCxHQUFnQixlQUFLLE1BQXJCO0FBQ0E7QUFqQ0Y7QUFtQ0E7QUFyRFcsQ0FBYjs7QUF3REEsS0FBSyxLQUFMOzs7Ozs7QUMvRUEsSUFBTSxXQUFXLFFBQVEsR0FBUixDQUFZLFFBQVosSUFBd0IsYUFBekM7QUFDQSxJQUFNLGFBQWEsYUFBYSxZQUFiLEdBQTRCLElBQTVCLEdBQW1DLEtBQXREOztBQUVBLElBQU0sT0FBTztBQUNaLFNBQVEsYUFBYSxpQkFBYixHQUFpQyxvQkFEN0I7QUFFWixNQUFNO0FBQ0wsZ0JBQWMsK0JBRFQ7QUFFTCxXQUFXO0FBRk47QUFGTSxDQUFiOztBQVFBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIExhenkgTG9hZCAtIGpRdWVyeSBwbHVnaW4gZm9yIGxhenkgbG9hZGluZyBpbWFnZXNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxNSBNaWthIFR1dXBvbGFcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogUHJvamVjdCBob21lOlxuICogICBodHRwOi8vd3d3LmFwcGVsc2lpbmkubmV0L3Byb2plY3RzL2xhenlsb2FkXG4gKlxuICogVmVyc2lvbjogIDEuOS43XG4gKlxuICovXG5cbihmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcblxuICAgICQuZm4ubGF6eWxvYWQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IHRoaXM7XG4gICAgICAgIHZhciAkY29udGFpbmVyO1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICB0aHJlc2hvbGQgICAgICAgOiAwLFxuICAgICAgICAgICAgZmFpbHVyZV9saW1pdCAgIDogMCxcbiAgICAgICAgICAgIGV2ZW50ICAgICAgICAgICA6IFwic2Nyb2xsXCIsXG4gICAgICAgICAgICBlZmZlY3QgICAgICAgICAgOiBcInNob3dcIixcbiAgICAgICAgICAgIGNvbnRhaW5lciAgICAgICA6IHdpbmRvdyxcbiAgICAgICAgICAgIGRhdGFfYXR0cmlidXRlICA6IFwib3JpZ2luYWxcIixcbiAgICAgICAgICAgIHNraXBfaW52aXNpYmxlICA6IGZhbHNlLFxuICAgICAgICAgICAgYXBwZWFyICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICAgIGxvYWQgICAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICBwbGFjZWhvbGRlciAgICAgOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBWUFBQUFmRmNTSkFBQUFBWE5TUjBJQXJzNGM2UUFBQUFSblFVMUJBQUN4and2OFlRVUFBQUFKY0VoWmN3QUFEc1FBQUE3RUFaVXJEaHNBQUFBTlNVUkJWQmhYWXpoOCtQQi9BQWZmQTBuTlB1Q0xBQUFBQUVsRlRrU3VRbUNDXCJcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB2YXIgY291bnRlciA9IDA7XG5cbiAgICAgICAgICAgIGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2tpcF9pbnZpc2libGUgJiYgISR0aGlzLmlzKFwiOnZpc2libGVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoJC5hYm92ZXRoZXRvcCh0aGlzLCBzZXR0aW5ncykgfHxcbiAgICAgICAgICAgICAgICAgICAgJC5sZWZ0b2ZiZWdpbih0aGlzLCBzZXR0aW5ncykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIE5vdGhpbmcuICovXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghJC5iZWxvd3RoZWZvbGQodGhpcywgc2V0dGluZ3MpICYmXG4gICAgICAgICAgICAgICAgICAgICEkLnJpZ2h0b2Zmb2xkKHRoaXMsIHNldHRpbmdzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMudHJpZ2dlcihcImFwcGVhclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlmIHdlIGZvdW5kIGFuIGltYWdlIHdlJ2xsIGxvYWQsIHJlc2V0IHRoZSBjb3VudGVyICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKytjb3VudGVyID4gc2V0dGluZ3MuZmFpbHVyZV9saW1pdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIC8qIE1haW50YWluIEJDIGZvciBhIGNvdXBsZSBvZiB2ZXJzaW9ucy4gKi9cbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IG9wdGlvbnMuZmFpbHVyZWxpbWl0KSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5mYWlsdXJlX2xpbWl0ID0gb3B0aW9ucy5mYWlsdXJlbGltaXQ7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuZmFpbHVyZWxpbWl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gb3B0aW9ucy5lZmZlY3RzcGVlZCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZWZmZWN0X3NwZWVkID0gb3B0aW9ucy5lZmZlY3RzcGVlZDtcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5lZmZlY3RzcGVlZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5leHRlbmQoc2V0dGluZ3MsIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ2FjaGUgY29udGFpbmVyIGFzIGpRdWVyeSBhcyBvYmplY3QuICovXG4gICAgICAgICRjb250YWluZXIgPSAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykgPyAkd2luZG93IDogJChzZXR0aW5ncy5jb250YWluZXIpO1xuXG4gICAgICAgIC8qIEZpcmUgb25lIHNjcm9sbCBldmVudCBwZXIgc2Nyb2xsLiBOb3Qgb25lIHNjcm9sbCBldmVudCBwZXIgaW1hZ2UuICovXG4gICAgICAgIGlmICgwID09PSBzZXR0aW5ncy5ldmVudC5pbmRleE9mKFwic2Nyb2xsXCIpKSB7XG4gICAgICAgICAgICAkY29udGFpbmVyLmJpbmQoc2V0dGluZ3MuZXZlbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyICRzZWxmID0gJChzZWxmKTtcblxuICAgICAgICAgICAgc2VsZi5sb2FkZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgLyogSWYgbm8gc3JjIGF0dHJpYnV0ZSBnaXZlbiB1c2UgZGF0YTp1cmkuICovXG4gICAgICAgICAgICBpZiAoJHNlbGYuYXR0cihcInNyY1wiKSA9PT0gdW5kZWZpbmVkIHx8ICRzZWxmLmF0dHIoXCJzcmNcIikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCRzZWxmLmlzKFwiaW1nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICRzZWxmLmF0dHIoXCJzcmNcIiwgc2V0dGluZ3MucGxhY2Vob2xkZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogV2hlbiBhcHBlYXIgaXMgdHJpZ2dlcmVkIGxvYWQgb3JpZ2luYWwgaW1hZ2UuICovXG4gICAgICAgICAgICAkc2VsZi5vbmUoXCJhcHBlYXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MuYXBwZWFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHNfbGVmdCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmFwcGVhci5jYWxsKHNlbGYsIGVsZW1lbnRzX2xlZnQsIHNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkKFwiPGltZyAvPlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmJpbmQoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsID0gJHNlbGYuYXR0cihcImRhdGEtXCIgKyBzZXR0aW5ncy5kYXRhX2F0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2VsZi5pcyhcImltZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZi5hdHRyKFwic3JjXCIsIG9yaWdpbmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZi5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwidXJsKCdcIiArIG9yaWdpbmFsICsgXCInKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGZbc2V0dGluZ3MuZWZmZWN0XShzZXR0aW5ncy5lZmZlY3Rfc3BlZWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogUmVtb3ZlIGltYWdlIGZyb20gYXJyYXkgc28gaXQgaXMgbm90IGxvb3BlZCBuZXh0IHRpbWUuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXAgPSAkLmdyZXAoZWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFlbGVtZW50LmxvYWRlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50cyA9ICQodGVtcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MubG9hZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHNfbGVmdCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MubG9hZC5jYWxsKHNlbGYsIGVsZW1lbnRzX2xlZnQsIHNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzcmNcIiwgJHNlbGYuYXR0cihcImRhdGEtXCIgKyBzZXR0aW5ncy5kYXRhX2F0dHJpYnV0ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKiBXaGVuIHdhbnRlZCBldmVudCBpcyB0cmlnZ2VyZWQgbG9hZCBvcmlnaW5hbCBpbWFnZSAqL1xuICAgICAgICAgICAgLyogYnkgdHJpZ2dlcmluZyBhcHBlYXIuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICgwICE9PSBzZXR0aW5ncy5ldmVudC5pbmRleE9mKFwic2Nyb2xsXCIpKSB7XG4gICAgICAgICAgICAgICAgJHNlbGYuYmluZChzZXR0aW5ncy5ldmVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VsZi5sb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLnRyaWdnZXIoXCJhcHBlYXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgc29tZXRoaW5nIGFwcGVhcnMgd2hlbiB3aW5kb3cgaXMgcmVzaXplZC4gKi9cbiAgICAgICAgJHdpbmRvdy5iaW5kKFwicmVzaXplXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qIFdpdGggSU9TNSBmb3JjZSBsb2FkaW5nIGltYWdlcyB3aGVuIG5hdmlnYXRpbmcgd2l0aCBiYWNrIGJ1dHRvbi4gKi9cbiAgICAgICAgLyogTm9uIG9wdGltYWwgd29ya2Fyb3VuZC4gKi9cbiAgICAgICAgaWYgKCgvKD86aXBob25lfGlwb2R8aXBhZCkuKm9zIDUvZ2kpLnRlc3QobmF2aWdhdG9yLmFwcFZlcnNpb24pKSB7XG4gICAgICAgICAgICAkd2luZG93LmJpbmQoXCJwYWdlc2hvd1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQucGVyc2lzdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXCJhcHBlYXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yY2UgaW5pdGlhbCBjaGVjayBpZiBpbWFnZXMgc2hvdWxkIGFwcGVhci4gKi9cbiAgICAgICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qIENvbnZlbmllbmNlIG1ldGhvZHMgaW4galF1ZXJ5IG5hbWVzcGFjZS4gICAgICAgICAgICovXG4gICAgLyogVXNlIGFzICAkLmJlbG93dGhlZm9sZChlbGVtZW50LCB7dGhyZXNob2xkIDogMTAwLCBjb250YWluZXIgOiB3aW5kb3d9KSAqL1xuXG4gICAgJC5iZWxvd3RoZWZvbGQgPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICB2YXIgZm9sZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHwgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpIHtcbiAgICAgICAgICAgIGZvbGQgPSAod2luZG93LmlubmVySGVpZ2h0ID8gd2luZG93LmlubmVySGVpZ2h0IDogJHdpbmRvdy5oZWlnaHQoKSkgKyAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9sZCA9ICQoc2V0dGluZ3MuY29udGFpbmVyKS5vZmZzZXQoKS50b3AgKyAkKHNldHRpbmdzLmNvbnRhaW5lcikuaGVpZ2h0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9sZCA8PSAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcCAtIHNldHRpbmdzLnRocmVzaG9sZDtcbiAgICB9O1xuXG4gICAgJC5yaWdodG9mZm9sZCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICR3aW5kb3cud2lkdGgoKSArICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9sZCA9ICQoc2V0dGluZ3MuY29udGFpbmVyKS5vZmZzZXQoKS5sZWZ0ICsgJChzZXR0aW5ncy5jb250YWluZXIpLndpZHRoKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9sZCA8PSAkKGVsZW1lbnQpLm9mZnNldCgpLmxlZnQgLSBzZXR0aW5ncy50aHJlc2hvbGQ7XG4gICAgfTtcblxuICAgICQuYWJvdmV0aGV0b3AgPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICB2YXIgZm9sZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHwgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpIHtcbiAgICAgICAgICAgIGZvbGQgPSAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9sZCA9ICQoc2V0dGluZ3MuY29udGFpbmVyKS5vZmZzZXQoKS50b3A7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9sZCA+PSAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcCArIHNldHRpbmdzLnRocmVzaG9sZCAgKyAkKGVsZW1lbnQpLmhlaWdodCgpO1xuICAgIH07XG5cbiAgICAkLmxlZnRvZmJlZ2luID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGZvbGQ7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lciA9PT0gdW5kZWZpbmVkIHx8IHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSB7XG4gICAgICAgICAgICBmb2xkID0gJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLmxlZnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9sZCA+PSAkKGVsZW1lbnQpLm9mZnNldCgpLmxlZnQgKyBzZXR0aW5ncy50aHJlc2hvbGQgKyAkKGVsZW1lbnQpLndpZHRoKCk7XG4gICAgfTtcblxuICAgICQuaW52aWV3cG9ydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgICByZXR1cm4gISQucmlnaHRvZmZvbGQoZWxlbWVudCwgc2V0dGluZ3MpICYmICEkLmxlZnRvZmJlZ2luKGVsZW1lbnQsIHNldHRpbmdzKSAmJlxuICAgICAgICAgICAgICAgICEkLmJlbG93dGhlZm9sZChlbGVtZW50LCBzZXR0aW5ncykgJiYgISQuYWJvdmV0aGV0b3AoZWxlbWVudCwgc2V0dGluZ3MpO1xuICAgICB9O1xuXG4gICAgLyogQ3VzdG9tIHNlbGVjdG9ycyBmb3IgeW91ciBjb252ZW5pZW5jZS4gICAqL1xuICAgIC8qIFVzZSBhcyAkKFwiaW1nOmJlbG93LXRoZS1mb2xkXCIpLnNvbWV0aGluZygpIG9yICovXG4gICAgLyogJChcImltZ1wiKS5maWx0ZXIoXCI6YmVsb3ctdGhlLWZvbGRcIikuc29tZXRoaW5nKCkgd2hpY2ggaXMgZmFzdGVyICovXG5cbiAgICAkLmV4dGVuZCgkLmV4cHJbXCI6XCJdLCB7XG4gICAgICAgIFwiYmVsb3ctdGhlLWZvbGRcIiA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICQuYmVsb3d0aGVmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwiYWJvdmUtdGhlLXRvcFwiICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLmJlbG93dGhlZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcInJpZ2h0LW9mLXNjcmVlblwiOiBmdW5jdGlvbihhKSB7IHJldHVybiAkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwibGVmdC1vZi1zY3JlZW5cIiA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwiaW4tdmlld3BvcnRcIiAgICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICQuaW52aWV3cG9ydChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICAvKiBNYWludGFpbiBCQyBmb3IgY291cGxlIG9mIHZlcnNpb25zLiAqL1xuICAgICAgICBcImFib3ZlLXRoZS1mb2xkXCIgOiBmdW5jdGlvbihhKSB7IHJldHVybiAhJC5iZWxvd3RoZWZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJyaWdodC1vZi1mb2xkXCIgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5yaWdodG9mZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcImxlZnQtb2YtZm9sZFwiICAgOiBmdW5jdGlvbihhKSB7IHJldHVybiAhJC5yaWdodG9mZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG4iLCIvLyBEZXZpY2UuanNcbi8vIChjKSAyMDE0IE1hdHRoZXcgSHVkc29uXG4vLyBEZXZpY2UuanMgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuLy8gRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2N1bWVudGF0aW9uOlxuLy8gaHR0cDovL21hdHRoZXdodWRzb24ubWUvcHJvamVjdHMvZGV2aWNlLmpzL1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIGRldmljZSxcbiAgICBwcmV2aW91c0RldmljZSxcbiAgICBhZGRDbGFzcyxcbiAgICBkb2N1bWVudEVsZW1lbnQsXG4gICAgZmluZCxcbiAgICBoYW5kbGVPcmllbnRhdGlvbixcbiAgICBoYXNDbGFzcyxcbiAgICBvcmllbnRhdGlvbkV2ZW50LFxuICAgIHJlbW92ZUNsYXNzLFxuICAgIHVzZXJBZ2VudDtcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgZGV2aWNlIHZhcmlhYmxlLlxuICBwcmV2aW91c0RldmljZSA9IHdpbmRvdy5kZXZpY2U7XG5cbiAgZGV2aWNlID0ge307XG5cbiAgLy8gQWRkIGRldmljZSBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIHdpbmRvdy5kZXZpY2UgPSBkZXZpY2U7XG5cbiAgLy8gVGhlIDxodG1sPiBlbGVtZW50LlxuICBkb2N1bWVudEVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gIC8vIFRoZSBjbGllbnQgdXNlciBhZ2VudCBzdHJpbmcuXG4gIC8vIExvd2VyY2FzZSwgc28gd2UgY2FuIHVzZSB0aGUgbW9yZSBlZmZpY2llbnQgaW5kZXhPZigpLCBpbnN0ZWFkIG9mIFJlZ2V4XG4gIHVzZXJBZ2VudCA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbiAgLy8gTWFpbiBmdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICBkZXZpY2UuaW9zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuaXBob25lKCkgfHwgZGV2aWNlLmlwb2QoKSB8fCBkZXZpY2UuaXBhZCgpO1xuICB9O1xuXG4gIGRldmljZS5pcGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICFkZXZpY2Uud2luZG93cygpICYmIGZpbmQoJ2lwaG9uZScpO1xuICB9O1xuXG4gIGRldmljZS5pcG9kID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCdpcG9kJyk7XG4gIH07XG5cbiAgZGV2aWNlLmlwYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ2lwYWQnKTtcbiAgfTtcblxuICBkZXZpY2UuYW5kcm9pZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gIWRldmljZS53aW5kb3dzKCkgJiYgZmluZCgnYW5kcm9pZCcpO1xuICB9O1xuXG4gIGRldmljZS5hbmRyb2lkUGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5hbmRyb2lkKCkgJiYgZmluZCgnbW9iaWxlJyk7XG4gIH07XG5cbiAgZGV2aWNlLmFuZHJvaWRUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5hbmRyb2lkKCkgJiYgIWZpbmQoJ21vYmlsZScpO1xuICB9O1xuXG4gIGRldmljZS5ibGFja2JlcnJ5ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCdibGFja2JlcnJ5JykgfHwgZmluZCgnYmIxMCcpIHx8IGZpbmQoJ3JpbScpO1xuICB9O1xuXG4gIGRldmljZS5ibGFja2JlcnJ5UGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5ibGFja2JlcnJ5KCkgJiYgIWZpbmQoJ3RhYmxldCcpO1xuICB9O1xuXG4gIGRldmljZS5ibGFja2JlcnJ5VGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuYmxhY2tiZXJyeSgpICYmIGZpbmQoJ3RhYmxldCcpO1xuICB9O1xuXG4gIGRldmljZS53aW5kb3dzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCd3aW5kb3dzJyk7XG4gIH07XG5cbiAgZGV2aWNlLndpbmRvd3NQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLndpbmRvd3MoKSAmJiBmaW5kKCdwaG9uZScpO1xuICB9O1xuXG4gIGRldmljZS53aW5kb3dzVGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2Uud2luZG93cygpICYmIChmaW5kKCd0b3VjaCcpICYmICFkZXZpY2Uud2luZG93c1Bob25lKCkpO1xuICB9O1xuXG4gIGRldmljZS5meG9zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoZmluZCgnKG1vYmlsZTsnKSB8fCBmaW5kKCcodGFibGV0OycpKSAmJiBmaW5kKCc7IHJ2OicpO1xuICB9O1xuXG4gIGRldmljZS5meG9zUGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5meG9zKCkgJiYgZmluZCgnbW9iaWxlJyk7XG4gIH07XG5cbiAgZGV2aWNlLmZ4b3NUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5meG9zKCkgJiYgZmluZCgndGFibGV0Jyk7XG4gIH07XG5cbiAgZGV2aWNlLm1lZWdvID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCdtZWVnbycpO1xuICB9O1xuXG4gIGRldmljZS5jb3Jkb3ZhID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB3aW5kb3cuY29yZG92YSAmJiBsb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2ZpbGU6JztcbiAgfTtcblxuICBkZXZpY2Uubm9kZVdlYmtpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdy5wcm9jZXNzID09PSAnb2JqZWN0JztcbiAgfTtcblxuICBkZXZpY2UubW9iaWxlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuYW5kcm9pZFBob25lKCkgfHwgZGV2aWNlLmlwaG9uZSgpIHx8IGRldmljZS5pcG9kKCkgfHwgZGV2aWNlLndpbmRvd3NQaG9uZSgpIHx8IGRldmljZS5ibGFja2JlcnJ5UGhvbmUoKSB8fCBkZXZpY2UuZnhvc1Bob25lKCkgfHwgZGV2aWNlLm1lZWdvKCk7XG4gIH07XG5cbiAgZGV2aWNlLnRhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmlwYWQoKSB8fCBkZXZpY2UuYW5kcm9pZFRhYmxldCgpIHx8IGRldmljZS5ibGFja2JlcnJ5VGFibGV0KCkgfHwgZGV2aWNlLndpbmRvd3NUYWJsZXQoKSB8fCBkZXZpY2UuZnhvc1RhYmxldCgpO1xuICB9O1xuXG4gIGRldmljZS5kZXNrdG9wID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhZGV2aWNlLnRhYmxldCgpICYmICFkZXZpY2UubW9iaWxlKCk7XG4gIH07XG5cbiAgZGV2aWNlLnRlbGV2aXNpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgdGVsZXZpc2lvbjtcblxuICAgIHRlbGV2aXNpb24gPSBbXG4gICAgICBcImdvb2dsZXR2XCIsXG4gICAgICBcInZpZXJhXCIsXG4gICAgICBcInNtYXJ0dHZcIixcbiAgICAgIFwiaW50ZXJuZXQudHZcIixcbiAgICAgIFwibmV0Y2FzdFwiLFxuICAgICAgXCJuZXR0dlwiLFxuICAgICAgXCJhcHBsZXR2XCIsXG4gICAgICBcImJveGVlXCIsXG4gICAgICBcImt5bG9cIixcbiAgICAgIFwicm9rdVwiLFxuICAgICAgXCJkbG5hZG9jXCIsXG4gICAgICBcInJva3VcIixcbiAgICAgIFwicG92X3R2XCIsXG4gICAgICBcImhiYnR2XCIsXG4gICAgICBcImNlLWh0bWxcIlxuICAgIF07XG5cbiAgICBpID0gMDtcbiAgICB3aGlsZSAoaSA8IHRlbGV2aXNpb24ubGVuZ3RoKSB7XG4gICAgICBpZiAoZmluZCh0ZWxldmlzaW9uW2ldKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gIH07XG5cbiAgZGV2aWNlLnBvcnRyYWl0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAod2luZG93LmlubmVySGVpZ2h0IC8gd2luZG93LmlubmVyV2lkdGgpID4gMTtcbiAgfTtcblxuICBkZXZpY2UubGFuZHNjYXBlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAod2luZG93LmlubmVySGVpZ2h0IC8gd2luZG93LmlubmVyV2lkdGgpIDwgMTtcbiAgfTtcblxuICAvLyBQdWJsaWMgVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIGRldmljZS5qcyBpbiBub0NvbmZsaWN0IG1vZGUsXG4gIC8vIHJldHVybmluZyB0aGUgZGV2aWNlIHZhcmlhYmxlIHRvIGl0cyBwcmV2aW91cyBvd25lci5cbiAgZGV2aWNlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmRldmljZSA9IHByZXZpb3VzRGV2aWNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIFByaXZhdGUgVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFNpbXBsZSBVQSBzdHJpbmcgc2VhcmNoXG4gIGZpbmQgPSBmdW5jdGlvbiAobmVlZGxlKSB7XG4gICAgcmV0dXJuIHVzZXJBZ2VudC5pbmRleE9mKG5lZWRsZSkgIT09IC0xO1xuICB9O1xuXG4gIC8vIENoZWNrIGlmIGRvY3VtZW50RWxlbWVudCBhbHJlYWR5IGhhcyBhIGdpdmVuIGNsYXNzLlxuICBoYXNDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICB2YXIgcmVnZXg7XG4gICAgcmVnZXggPSBuZXcgUmVnRXhwKGNsYXNzTmFtZSwgJ2knKTtcbiAgICByZXR1cm4gZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZS5tYXRjaChyZWdleCk7XG4gIH07XG5cbiAgLy8gQWRkIG9uZSBvciBtb3JlIENTUyBjbGFzc2VzIHRvIHRoZSA8aHRtbD4gZWxlbWVudC5cbiAgYWRkQ2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgdmFyIGN1cnJlbnRDbGFzc05hbWVzID0gbnVsbDtcbiAgICBpZiAoIWhhc0NsYXNzKGNsYXNzTmFtZSkpIHtcbiAgICAgIGN1cnJlbnRDbGFzc05hbWVzID0gZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgICBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lID0gY3VycmVudENsYXNzTmFtZXMgKyBcIiBcIiArIGNsYXNzTmFtZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVtb3ZlIHNpbmdsZSBDU1MgY2xhc3MgZnJvbSB0aGUgPGh0bWw+IGVsZW1lbnQuXG4gIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgIGlmIChoYXNDbGFzcyhjbGFzc05hbWUpKSB7XG4gICAgICBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lID0gZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKFwiIFwiICsgY2xhc3NOYW1lLCBcIlwiKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSFRNTCBFbGVtZW50IEhhbmRsaW5nXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEluc2VydCB0aGUgYXBwcm9wcmlhdGUgQ1NTIGNsYXNzIGJhc2VkIG9uIHRoZSBfdXNlcl9hZ2VudC5cblxuICBpZiAoZGV2aWNlLmlvcygpKSB7XG4gICAgaWYgKGRldmljZS5pcGFkKCkpIHtcbiAgICAgIGFkZENsYXNzKFwiaW9zIGlwYWQgdGFibGV0XCIpO1xuICAgIH0gZWxzZSBpZiAoZGV2aWNlLmlwaG9uZSgpKSB7XG4gICAgICBhZGRDbGFzcyhcImlvcyBpcGhvbmUgbW9iaWxlXCIpO1xuICAgIH0gZWxzZSBpZiAoZGV2aWNlLmlwb2QoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJpb3MgaXBvZCBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS5hbmRyb2lkKCkpIHtcbiAgICBpZiAoZGV2aWNlLmFuZHJvaWRUYWJsZXQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJhbmRyb2lkIHRhYmxldFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkQ2xhc3MoXCJhbmRyb2lkIG1vYmlsZVwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmJsYWNrYmVycnkoKSkge1xuICAgIGlmIChkZXZpY2UuYmxhY2tiZXJyeVRhYmxldCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImJsYWNrYmVycnkgdGFibGV0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhcImJsYWNrYmVycnkgbW9iaWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2Uud2luZG93cygpKSB7XG4gICAgaWYgKGRldmljZS53aW5kb3dzVGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwid2luZG93cyB0YWJsZXRcIik7XG4gICAgfSBlbHNlIGlmIChkZXZpY2Uud2luZG93c1Bob25lKCkpIHtcbiAgICAgIGFkZENsYXNzKFwid2luZG93cyBtb2JpbGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiZGVza3RvcFwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmZ4b3MoKSkge1xuICAgIGlmIChkZXZpY2UuZnhvc1RhYmxldCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImZ4b3MgdGFibGV0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhcImZ4b3MgbW9iaWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UubWVlZ28oKSkge1xuICAgIGFkZENsYXNzKFwibWVlZ28gbW9iaWxlXCIpO1xuICB9IGVsc2UgaWYgKGRldmljZS5ub2RlV2Via2l0KCkpIHtcbiAgICBhZGRDbGFzcyhcIm5vZGUtd2Via2l0XCIpO1xuICB9IGVsc2UgaWYgKGRldmljZS50ZWxldmlzaW9uKCkpIHtcbiAgICBhZGRDbGFzcyhcInRlbGV2aXNpb25cIik7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmRlc2t0b3AoKSkge1xuICAgIGFkZENsYXNzKFwiZGVza3RvcFwiKTtcbiAgfVxuXG4gIGlmIChkZXZpY2UuY29yZG92YSgpKSB7XG4gICAgYWRkQ2xhc3MoXCJjb3Jkb3ZhXCIpO1xuICB9XG5cbiAgLy8gT3JpZW50YXRpb24gSGFuZGxpbmdcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBIYW5kbGUgZGV2aWNlIG9yaWVudGF0aW9uIGNoYW5nZXMuXG4gIGhhbmRsZU9yaWVudGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChkZXZpY2UubGFuZHNjYXBlKCkpIHtcbiAgICAgIHJlbW92ZUNsYXNzKFwicG9ydHJhaXRcIik7XG4gICAgICBhZGRDbGFzcyhcImxhbmRzY2FwZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlQ2xhc3MoXCJsYW5kc2NhcGVcIik7XG4gICAgICBhZGRDbGFzcyhcInBvcnRyYWl0XCIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH07XG5cbiAgLy8gRGV0ZWN0IHdoZXRoZXIgZGV2aWNlIHN1cHBvcnRzIG9yaWVudGF0aW9uY2hhbmdlIGV2ZW50LFxuICAvLyBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIHRoZSByZXNpemUgZXZlbnQuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwod2luZG93LCBcIm9ub3JpZW50YXRpb25jaGFuZ2VcIikpIHtcbiAgICBvcmllbnRhdGlvbkV2ZW50ID0gXCJvcmllbnRhdGlvbmNoYW5nZVwiO1xuICB9IGVsc2Uge1xuICAgIG9yaWVudGF0aW9uRXZlbnQgPSBcInJlc2l6ZVwiO1xuICB9XG5cbiAgLy8gTGlzdGVuIGZvciBjaGFuZ2VzIGluIG9yaWVudGF0aW9uLlxuICBpZiAod2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihvcmllbnRhdGlvbkV2ZW50LCBoYW5kbGVPcmllbnRhdGlvbiwgZmFsc2UpO1xuICB9IGVsc2UgaWYgKHdpbmRvdy5hdHRhY2hFdmVudCkge1xuICAgIHdpbmRvdy5hdHRhY2hFdmVudChvcmllbnRhdGlvbkV2ZW50LCBoYW5kbGVPcmllbnRhdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93W29yaWVudGF0aW9uRXZlbnRdID0gaGFuZGxlT3JpZW50YXRpb247XG4gIH1cblxuICBoYW5kbGVPcmllbnRhdGlvbigpO1xuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRldmljZTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZGV2aWNlO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5kZXZpY2UgPSBkZXZpY2U7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJjb25zdCBidXJnZXIgPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5idXJnZXInLCAoKSA9PiB7XHRcdFx0XG5cdFx0XHQkKCcubmF2aWdhdGlvbicpLnRvZ2dsZUNsYXNzKCduYXZpZ2F0aW9uLS1vcGVuJyk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJ1cmdlcjsiLCJjb25zdCBkb3RTdHJpcCA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmRvdC1zdHJpcF9faW5wdXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0c3dpdGNoICgkKHRoaXMpLmNsb3Nlc3QoJy5kb3Qtc3RyaXBfX2lucHV0JykuYXR0cignaWQnKSkge1xuXHRcdFx0XHRjYXNlICdkb3RDYXInOlxuXHRcdFx0XHRcdCQoJy5kb3Qtc3RyaXBfX3J1bm5lcicpLmF0dHIoJ2RhdGEtcG9zJywgJ29uZScpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdkb3RMb3JyeSc6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAndHdvJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ2RvdEJ1cyc6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAndGhyZWUnKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0JCh0aGlzKVxuXHRcdFx0XHQuY2xvc2VzdCgnLnNsaWRlcicpXG5cdFx0XHRcdC5maW5kKCcuc2xpZGUtcGFjaycpXG5cdFx0XHRcdC5hdHRyKCdkYXRhLXNsaWRlci1wb3MnLCAkKHRoaXMpLmF0dHIoJ2RhdGEtZG90LXBvcycpKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZG90U3RyaXA7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdmFycyBmcm9tICcuLi8uLi9jb21waWxlL3ZhcnMnO1xuXG5jb25zdCBkcml2ZXJGb3JtID0ge1xuXHRidXN5XHRcdFx0XHQ6IGZhbHNlLFxuXHRmaWVsZHNDb3JyZWN0XHQ6IGZhbHNlLFxuXHRcblx0ZGF0YToge1xuXHRcdGZpcnN0X25hbWVcdFx0XHRcdDogJycsXG5cdFx0bGFzdF9uYW1lXHRcdFx0XHQ6ICcnLFxuXHRcdGVtYWlsXHRcdFx0XHRcdFx0OiAnJyxcblx0XHRwaG9uZVx0XHRcdFx0XHRcdDogJycsXG5cdFx0aG93X2RpZF95b3Vfa25vd1x0XHQ6ICcnLFxuXHRcdGNhcl95ZWFyXHRcdFx0XHRcdDogJycsXG5cdFx0Y2FyX3N0YXRlXHRcdFx0XHQ6ICcnLFxuXHRcdGNhcl9icmFuZFx0XHRcdFx0OiAnJyxcblx0XHRjYXJfbW9kZWxcdFx0XHRcdDogJycsXG5cdFx0Y2FyX2NvbG9yXHRcdFx0XHQ6ICcnLFxuXHRcdGF2Z19taWxlYWdlX2RheVx0XHQ6ICcnLFxuXHRcdGF2Z19taWxlYWdlX3dlZWtlbmRcdDogJycsXG5cdFx0Y29tbWVudFx0XHRcdFx0XHQ6ICcnLFxuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdbZGF0YS13YXldJywgZXZlbnQgPT4ge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0Y29uc3QgZWxlbVx0XHRcdD0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLXdheV0nKTtcblx0XHRcdGNvbnN0IHBhZ2VcdFx0XHQ9ICQoJy5kcml2ZXItZm9ybScpO1xuXHRcdFx0Y29uc3QgZGF0YVBhZ2VcdFx0PSBOdW1iZXIocGFnZS5hdHRyKCdkYXRhLXBhZ2UnKSk7XG5cdFx0XHRjb25zdCBjdXJyZW50UGFnZVx0PSAkKGAuZHJpdmVyLWZvcm1fX3BhZ2VbZGF0YS1wYWdlPSR7ZGF0YVBhZ2V9XWApO1xuXHRcdFx0Y29uc3QgbmV4dFBhZ2VcdFx0PSBkYXRhUGFnZSArIDE7XG5cdFx0XHRjb25zdCBwcmV2UGFnZVx0XHQ9IGRhdGFQYWdlIC0gMTtcblxuXHRcdFx0aWYgKGVsZW0uYXR0cignZGF0YS13YXknKSA9PT0gJ3ByZXYnKSB7XG5cdFx0XHRcdGlmIChwcmV2UGFnZSA9PT0gMSB8fCBwcmV2UGFnZSA9PT0gMikge1xuXHRcdFx0XHRcdHBhZ2UuYXR0cignZGF0YS1wYWdlJywgcHJldlBhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzd2l0Y2ggKGRhdGFQYWdlKSB7XG5cdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0dGhpcy5kYXRhLmhvd19kaWRfeW91X2tub3cgPSAkKCcjaG93X2RpZF95b3Vfa25vdycpLnZhbCgpO1xuXG5cdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0Y3VycmVudFBhZ2Vcblx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0LmVhY2goKGluZGV4LCBlbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmICgkKGVsKS5sZW5ndGggJiYgKCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcpICE9PSAndHJ1ZScpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcpICE9PSAndHJ1ZScpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZGF0YVskKGVsKS5hdHRyKCdpZCcpXSA9ICQoZWwpLnZhbCgpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHRoaXMuZGF0YS5waG9uZSA9IHRoaXMuZGF0YS5waG9uZS5yZXBsYWNlKC9cXEQvZywgJycpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmxlbmd0aCAmJiAkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoJChlbCkuYXR0cignZGF0YS1jb3JyZWN0JykgIT09ICd0cnVlJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtZmlsbGVkXScpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5lYWNoKChpbmRleCwgZWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmRhdGFbJChlbCkuYXR0cignaWQnKV0gPSAkKGVsKS52YWwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCd3cm9uZyBwYWdlIG51bWJlcicpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodGhpcy5maWVsZHNDb3JyZWN0KSB7XG5cdFx0XHRcdFx0c3dpdGNoIChuZXh0UGFnZSkge1xuXHRcdFx0XHRcdFx0Ly8g0L3QsCDQv9C10YDQstC+0Lkg0YHRgtGA0LDQvdC40YbQtVxuXHRcdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LjRgtGMINGB0YLRgNCw0L3QuNGG0YNcblx0XHRcdFx0XHRcdFx0cGFnZS5hdHRyKCdkYXRhLXBhZ2UnLCAnMicpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0Ly8g0L3QsCDQstGC0L7RgNC+0Lkg0YHRgtGA0LDQvdC40YbQtVxuXHRcdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LjRgtGMINGB0YLRgNCw0L3QuNGG0YNcblx0XHRcdFx0XHRcdFx0cGFnZS5hdHRyKCdkYXRhLXBhZ2UnLCAnMycpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0Ly8g0L3QsCDRgtGA0LXRgtGM0LXQuSDRgdGC0YDQsNC90LjRhtC1XG5cdFx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRcdC8vINC30LDQv9GD0YHRgtC40YLRjCDRhNGD0L3QutGG0LjRjiDQvtGC0L/RgNCw0LLQutC4INGE0L7RgNC80Ytcblx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kRm9ybSgpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3dyb25nIG5leHQgcGFnZSBudW1iZXInKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQvtGC0L/RgNCw0LLQutCwINGE0L7RgNC80Ysg0L3QsCDRgdC10YDQstC10YBcblx0ICovXG5cdHNlbmRGb3JtKCkge1xuXHRcdGlmICghdGhpcy5idXN5KSB7XG5cdFx0XHRjb25zb2xlLmxvZygnc3RhcnQgc2VuZGluZyBmb3JtJyk7XG5cblx0XHRcdHRoaXMuYnVzeSA9IHRydWU7XG5cblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHVybFx0OiB2YXJzLnNlcnZlciArIHZhcnMuYXBpLmJlY29tZURyaXZlcixcblx0XHRcdFx0dHlwZVx0OiAnUE9TVCcsXG5cdFx0XHRcdGRhdGFcdDogdGhpcy5kYXRhLFxuXHRcdFx0fSlcblx0XHRcdFx0LnN1Y2Nlc3MocmVzdWx0ID0+IHtcblx0XHRcdFx0XHQkKCcubWVzc2FnZS0tc3VjY2VzcycpLmFkZENsYXNzKCdtZXNzYWdlLS1zaG93Jyk7XG5cblx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LjRgtGMINGB0YLRgNCw0L3QuNGG0YNcblx0XHRcdFx0XHQkKCcuZHJpdmVyLWZvcm0nKS5hdHRyKCdkYXRhLXBhZ2UnLCAnMScpO1xuXG5cdFx0XHRcdFx0Ly8g0L7Rh9C40YHRgtC60LAg0L/QvtC70LXQuSDRhNC+0YDQvNGLXG5cdFx0XHRcdFx0JCgnW2RhdGEtZmllbGQtdHlwZV0nKVxuXHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG5cdFx0XHRcdFx0XHRcdCQoZWwpXG5cdFx0XHRcdFx0XHRcdFx0LnZhbCgnJylcblx0XHRcdFx0XHRcdFx0XHQuYXR0cignZGF0YS1maWxsZWQnLCAnZmFsc2UnKVxuXHRcdFx0XHRcdFx0XHRcdC5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnbnVsbCcpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHR0aGlzLmJ1c3kgPSBmYWxzZTtcblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdmb3JtIGhhcyBiZWVkIHNlbnQnKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZhaWwoZXJyb3IgPT4ge1xuXHRcdFx0XHRcdCQoJy5tZXNzYWdlLS1mYWlsJykuYWRkQ2xhc3MoJ21lc3NhZ2UtLXNob3cnKTtcblx0XHRcdFx0XHRpZiAoZXJyb3IucmVzcG9uc2VUZXh0KSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnc2VydmVycyBhbnN3ZXI6XFxuJyxlcnJvci5yZXNwb25zZVRleHQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnVUZPIGhhdmUgaW50ZXJydXB0ZWQgb3VyIHNlcnZlclxcJ3Mgd29ya1xcbndlXFwnbCB0cnkgdG8gZml4IGl0Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuYnVzeSA9IGZhbHNlO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRyaXZlckZvcm07IiwiaW1wb3J0IHZhcnMgZnJvbSAnLi4vLi4vY29tcGlsZS92YXJzJztcblxuY29uc3QgZ2FsbGVyeSA9IHtcblx0bnVtVG9Mb2FkOiAyMCxcblx0Y29udGFpbmVyOiAkKCcuZ2FsbGVyeScpLFxuXHRsb2FkZXJcdDogJCgnLmdhbGxlcnlfX2xvYWRpbmcnKSxcblx0bW9yZUJ0blx0OiAkKCcuZ2FsbGVyeV9fYnRuJyksXG5cdGJ1c3lcdFx0OiB0cnVlLFxuXHR3YXRjaGVkXHQ6IGZhbHNlLFxuXHRcblx0dXJsczoge1xuXHRcdGFsbFx0OiBbXSxcblx0XHR0b1B1c2g6IFtdLFxuXHR9LFxuXG5cdGl0ZW1zOiB7XG5cdFx0dG9QdXNoOiBudWxsLFxuXHR9LFxuXHQvKipcblx0ICog0L/QvtC70YPRh9C10L3QuNC1INGB0L/QuNGB0LrQsCDQuNC30L7QsdGA0LDQttC10L3QuNC5XG5cdCAqL1xuXHRnZXRVcmxzKCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzdWx0LCBlcnJvcikgPT4ge1xuXHRcdFx0bGV0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0XHRcdHJlcXVlc3Qub3BlbignUE9TVCcsIHZhcnMuc2VydmVyICsgdmFycy5hcGkuZ2FsbGVyeSk7XG5cdFx0XHRyZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04Jyk7XG5cdFx0XHRyZXF1ZXN0Lm9ubG9hZCA9ICgpID0+IHtcblx0XHRcdFx0aWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcblx0XHRcdFx0XHRyZXN1bHQoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZXJyb3IoRXJyb3IoJ0ltYWdlIGRpZG5cXCd0IGxvYWQgc3VjY2Vzc2Z1bGx5OyBlcnJvciBjb2RlOicgKyByZXF1ZXN0LnN0YXR1c1RleHQpKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdHJlcXVlc3Qub25lcnJvciA9ICgpID0+IHtcblx0XHRcdFx0ZXJyb3IoRXJyb3IoJ1RoZXJlIHdhcyBhIG5ldHdvcmsgZXJyb3IuJykpO1xuXHRcdFx0fTtcblxuXHRcdFx0cmVxdWVzdC5zZW5kKEpTT04uc3RyaW5naWZ5KHt0YWdzOiBbJ21haW4nXX0pKTtcblx0XHR9KTtcblx0fSxcblx0bG9hZFN0YXJ0KCkge1xuXHRcdHRoaXMuYnVzeSA9IHRydWU7XG5cdFx0dGhpcy5sb2FkZXIuc2hvdygpO1xuXG5cdFx0JCgnLnNlY3Rpb24tLWdhbGxlcnkgLnNlY3Rpb25fX2NvbnRlbnQnKS5jc3MoJ3BhZGRpbmctYm90dG9tJywgJzUwcHgnKTtcblx0fSxcblx0bG9hZEVuZCgpIHtcblx0XHR0aGlzLmJ1c3kgPSBmYWxzZTtcblx0XHR0aGlzLmxvYWRlci5oaWRlKCk7XG5cblx0XHQkKCcuc2VjdGlvbi0tZ2FsbGVyeSAuc2VjdGlvbl9fY29udGVudCcpLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0L3QuNC1INC60LDRgNGC0LjQvdC+0Log0LIg0JTQntCc0LVcblx0ICogQHBhcmFtICB7Qm9vbGVhbn0gaXNGaXJzdCDQv9C10YDQstGL0Lkg0LvQuCDQstGL0LfQvtCyINGE0YPQvdC60YbQuNC4XG5cdCAqL1xuXHRtYWtlSW1ncyhpc0ZpcnN0KSB7XG5cdFx0aWYgKCF0aGlzLnVybHMuYWxsLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICghaXNGaXJzdCkge1xuXHRcdFx0dGhpcy5sb2FkU3RhcnQoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy51cmxzLmFsbC5sZW5ndGggPj0gdGhpcy5udW1Ub0xvYWQpIHtcblx0XHRcdHRoaXMudXJscy50b1B1c2ggPSB0aGlzLnVybHMuYWxsLnNwbGljZSgtdGhpcy5udW1Ub0xvYWQsIHRoaXMubnVtVG9Mb2FkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy51cmxzLnRvUHVzaCA9IHRoaXMudXJscy5hbGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5pdGVtcy50b1B1c2ggPSAkKHRoaXMudXJscy50b1B1c2guam9pbignJykpO1xuXHRcdHRoaXMudXJscy50b1B1c2gubGVuZ3RoID0gMDtcblxuXHRcdGlmIChpc0ZpcnN0KSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclxuXHRcdFx0XHQubWFzb25yeSh7XG5cdFx0XHRcdFx0Y29sdW1uV2lkdGhcdFx0OiAnLmdhbGxlcnlfX2l0ZW0nLFxuXHRcdFx0XHRcdGlzQW5pbWF0ZWRcdFx0OiB0cnVlLFxuXHRcdFx0XHRcdGlzSW5pdExheW91dFx0OiB0cnVlLFxuXHRcdFx0XHRcdGlzUmVzaXphYmxlXHRcdDogdHJ1ZSxcblx0XHRcdFx0XHRpdGVtU2VsZWN0b3JcdDogJy5nYWxsZXJ5X19pdGVtJyxcblx0XHRcdFx0XHRwZXJjZW50UG9zaXRpb246IHRydWUsXG5cdFx0XHRcdFx0c2luZ2xlTW9kZVx0XHQ6IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5hcHBlbmQodGhpcy5pdGVtcy50b1B1c2gpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy5pdGVtcy50b1B1c2gpO1xuXHRcdH1cblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoXG5cdFx0XHQuaGlkZSgpXG5cdFx0XHQuaW1hZ2VzTG9hZGVkKClcblx0XHRcdC5wcm9ncmVzcygoaW1nTG9hZCwgaW1hZ2UpID0+IHtcblx0XHRcdFx0Y29uc3QgJGl0ZW0gPSAkKGltYWdlLmltZykucGFyZW50cygnLmdhbGxlcnlfX2l0ZW0nKTtcblxuXHRcdFx0XHRpZiAodGhpcy5sb2FkZXIuaGFzQ2xhc3MoJ2dhbGxlcnlfX2xvYWRpbmctLWZpcnN0JykpIHtcblx0XHRcdFx0XHR0aGlzLmxvYWRlci5yZW1vdmVDbGFzcygnZ2FsbGVyeV9fbG9hZGluZy0tZmlyc3QnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCRpdGVtLnNob3coKTtcblxuXHRcdFx0XHR0aGlzLmNvbnRhaW5lclxuXHRcdFx0XHRcdC5tYXNvbnJ5KCdhcHBlbmRlZCcsICRpdGVtKVxuXHRcdFx0XHRcdC5tYXNvbnJ5KCk7XG5cdFx0XHR9KVxuXHRcdFx0LmRvbmUoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmxvYWRFbmQoKTtcblx0XHRcdFx0dGhpcy5vblNjcm9sbCgpO1xuXG5cdFx0XHRcdGlmICghdGhpcy53YXRjaGVkKSB7XG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7dGhpcy5vblNjcm9sbCgpfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0dGhpcy5pdGVtcy50b1B1c2gubGVuZ3RoID0gMDtcblx0fSxcblx0LyoqXG5cdCAqINC90LDQstC10YjQuNCy0LDQtdC80LDRjyDQvdCwINGB0LrRgNC+0LvQuyDRhNGD0L3QutGG0LjRj1xuXHQgKiDQt9Cw0L/Rg9GB0LrQsNC10YIg0L/QvtC00LPRgNGD0LfQutGDINGE0L7RgtC+0Log0LXRgdC00Lgg0L3QsNC00L5cblx0ICovXG5cdG9uU2Nyb2xsKCkge1xuXHRcdGNvbnN0IHBhZ2VIZWlnaHRcdFx0PSAkKGRvY3VtZW50KS5oZWlnaHQoKTtcblx0XHRjb25zdCB3aW5kb3dIZWlnaHRcdD0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXHRcdGNvbnN0IHdpbmRvd1Njcm9sbFx0PSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cdFx0Y29uc3QgbGVmdFRvQm90dG9tXHQ9XHRwYWdlSGVpZ2h0IC0gd2luZG93SGVpZ2h0IC0gd2luZG93U2Nyb2xsO1xuXG5cdFx0aWYgKCF0aGlzLmJ1c3kgJiYgdGhpcy51cmxzLmFsbC5sZW5ndGggJiYgbGVmdFRvQm90dG9tIDw9IDMwMCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3Njcm9sbCBsb2FkJyk7XG5cdFx0XHR0aGlzLm1ha2VJbWdzKCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnLmdhbGxlcnlfX2JnJykuaGlkZSgpO1xuXG5cdFx0dGhpcy5nZXRVcmxzKClcblx0XHRcdC50aGVuKFxuXHRcdFx0XHRyZXN1bHQgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdnb3QgaW1hZ2VzJyk7XG5cdFx0XHRcdFx0dGhpcy51cmxzLmFsbCA9IHJlc3VsdC5yZXZlcnNlKCk7XG5cblx0XHRcdFx0XHR0aGlzLnVybHMuYWxsLmZvckVhY2goKGVsZW0sIGkpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMudXJscy5hbGxbaV0gPSAnPGRpdiBkYXRhLXVybD1cIicgKyB2YXJzLnNlcnZlciArIGVsZW0gK1xuXHRcdFx0XHRcdFx0XHQnXCIgY2xhc3M9XCJnYWxsZXJ5X19pdGVtXCI+PGltZyBzcmM9XCInICsgdmFycy5zZXJ2ZXIgKyBlbGVtICtcblx0XHRcdFx0XHRcdFx0J1wiIGFsdD48ZGl2IGNsYXNzPVwiZ2FsbGVyeV9fZGFya25lc3NcIj48L2Rpdj48L2Rpdj4nO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dGhpcy5tYWtlSW1ncyh0cnVlKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3IgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yLCAnZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmdhbGxlcnlfX2l0ZW0nLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0bGV0IGltZ1VybCA9ICQodGhpcykuYXR0cignZGF0YS11cmwnKTtcblxuXHRcdFx0JCgnW2RhdGEtZ2FsLW1vZGFsXScpXG5cdFx0XHRcdC5hdHRyKCdzcmMnLCBpbWdVcmwpXG5cdFx0XHRcdC5jbG9zZXN0KCcuZ2FsbGVyeV9fYmcnKVxuXHRcdFx0XHQuZmFkZUluKDMwMCk7XG5cdFx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmdhbGxlcnlfX2JnJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdCQodGhpcykuZmFkZU91dCgzMDApO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnYWxsZXJ5OyIsImNvbnN0IGlucHV0ID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdibHVyJywgJy5pbnB1dF9faW5wdXQnLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5pbnB1dF9faW5wdXQnKTtcblxuXHRcdFx0aWYgKGVsZW0udmFsKCkpIHtcblx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWZpbGxlZCcsICd0cnVlJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtZmlsbGVkJywgJ2ZhbHNlJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwndGVsXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCd0ZWxcXCddJyk7XG5cblx0XHRcdGVsZW0udmFsKGlucHV0LmZvcm1hdChlbGVtLnZhbCgpLCAndGVsJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdbZGF0YS1tYXNrPVxcJ3RlbFxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2s9XFwndGVsXFwnXScpO1xuXG5cdFx0XHRlbGVtLnZhbChpbnB1dC5mb3JtYXQoZWxlbS52YWwoKSwgJ3RlbCcpKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbigna2V5dXAnLCAnW2RhdGEtbWFzaz1cXCd5ZWFyXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCd5ZWFyXFwnXScpO1xuXG5cdFx0XHRlbGVtLnZhbChpbnB1dC5mb3JtYXQoZWxlbS52YWwoKSwgJ3llYXInKSk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwnbnVtYmVyXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCdudW1iZXJcXCddJyk7XG5cblx0XHRcdGVsZW0udmFsKGlucHV0LmZvcm1hdChlbGVtLnZhbCgpLCAnbnVtYmVyJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdibHVyJywgJ1tkYXRhLW1hc2tdJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1tYXNrXScpO1xuXG5cdFx0XHRzd2l0Y2ggKGVsZW0uYXR0cignZGF0YS1tYXNrJykpIHtcblx0XHRcdFx0Y2FzZSAnZW1haWwnOlxuXHRcdFx0XHRcdGlmICgvLitALitcXC4uKy9pLnRlc3QoZWxlbS52YWwoKSkpIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAndGVsJzpcblx0XHRcdFx0XHQvLyAvXihbXFwrXSspKlswLTlcXHgyMFxceDI4XFx4MjlcXC1dezcsMTF9JC9cblx0XHRcdFx0XHRpZiAoZWxlbS52YWwoKS5sZW5ndGggPT09IDE4KSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ25hbWUnOlxuXHRcdFx0XHRcdGlmICgvXlthLXpBLVrQsC3Rj9GR0JAt0K/QgV1bYS16QS1a0LAt0Y/RkdCQLdCv0IEwLTktX1xcLl17MSwyMH0kLy50ZXN0KGVsZW0udmFsKCkpKSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ2VtcHR5Jzpcblx0XHRcdFx0Y2FzZSAndGV4dCc6XG5cdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdFx0aWYgKGVsZW0udmFsKCkpIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZW1wdHknKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAneWVhcic6XG5cdFx0XHRcdFx0aWYgKGVsZW0udmFsKCkgJiZcblx0XHRcdFx0XHRcdHBhcnNlSW50KGVsZW0udmFsKCkpID49IDE5MDAgJiZcblx0XHRcdFx0XHRcdHBhcnNlSW50KGVsZW0udmFsKCkpIDw9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignaW5wdXQnLCAnW2RhdGEtbWFza10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2tdJyk7XG5cblx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ251bGwnKTtcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqINGE0L7RgNC80LDRgtC40YDRg9C10YIg0LfQvdCw0YfQtdC90LjQtSDQsiDQuNC90L/Rg9GC0LVcblx0ICogQHBhcmFtICB7c3RyaW5nfSBkYXRhICAg0LfQvdCw0YfQtdC90LjQtSDQsiDQuNC90L/Rg9GC0LVcblx0ICogQHBhcmFtICB7c3RyaW5nfSBmb3JtYXQg0LjQvNGPINGE0L7RgNC80LDRgtCwXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgINC+0YLRhNC+0YDQvNCw0YLQuNGA0L7QstCw0L3QvdC+0LUg0LfQvdCw0YfQtdC90LjQtVxuXHQgKi9cblx0Zm9ybWF0KGRhdGEsIGZvcm1hdCkge1xuXHRcdHN3aXRjaCAoZm9ybWF0KSB7XG5cdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRyZXR1cm4gZGF0YS5yZXBsYWNlKC9cXEQvZywgJycpO1xuXG5cdFx0XHRjYXNlICd5ZWFyJzpcblx0XHRcdFx0ZGF0YSA9IGlucHV0LmZvcm1hdChkYXRhLCAnbnVtYmVyJyk7XG5cblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoID4gNCkge1xuXHRcdFx0XHRcdGRhdGEgPSBkYXRhLnNsaWNlKDAsIDQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cblx0XHRcdGNhc2UgJ3RlbCc6XG5cdFx0XHRcdGRhdGEgPSBpbnB1dC5mb3JtYXQoZGF0YSwgJ251bWJlcicpO1xuXG5cdFx0XHRcdGxldCBuZXdEYXRhID0gJyc7XG5cblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoIDw9IDExKSB7XG5cdFx0XHRcdFx0c3dpdGNoKGRhdGEubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRjYXNlIDA6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCc7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0XHRpZihkYXRhWzBdICE9PSAnNycpIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVswXTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM107XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDY6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDc6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA4OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XSArIGRhdGFbNV0gKyBkYXRhWzZdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzddO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgOTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxMDpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbOV07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxMTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbOV0gKyBkYXRhWzEwXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzddICsgZGF0YVs4XSArXG5cdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzldICsgZGF0YVsxMF07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG5ld0RhdGE7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd3cm9uZyBpbnB1dCBmb3JtYXQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dDsiLCJjb25zdCBtYXAgPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCcjbWFwJykubGF6eWxvYWQoe1xuXHRcdFx0dGhyZXNob2xkOiAyMDAsXG5cdFx0XHRlZmZlY3RcdDogJ2ZhZGVJbicsXG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcDsiLCJjb25zdCBtZXNzYWdlID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcubWVzc2FnZV9fYmcsIC5tZXNzYWdlX19jbG9zZScsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcblx0XHRcdCQoZXZlbnQudGFyZ2V0KVxuXHRcdFx0XHQuY2xvc2VzdCgnLm1lc3NhZ2UnKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ21lc3NhZ2UtLXNob3cnKTtcblx0XHR9KTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZXNzYWdlOyIsImNvbnN0IHBpbiA9IHtcblx0c2VjXHRcdDogNTU1NTUsXG5cdGhvdXJzXHRcdDogbmV3IERhdGUoKS5nZXRIb3VycygpLFxuXHRtaW51dGVzXHQ6IG5ldyBEYXRlKCkuZ2V0TWludXRlcygpLFxuXHRzZWNvbmRzXHQ6IG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpLFxuXHQvKipcblx0ICog0YHRh9C10YLRh9C40LosINGD0LLQtdC70LjRh9C40LLQsNC10YIg0LLRgNC10LzRj1xuXHQgKi9cblx0Y291bnRkb3duKCkge1xuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCddJykudGV4dChNYXRoLmZsb29yKHRoaXMuc2VjLzM2MDApKTtcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnXScpLnRleHQoTWF0aC5mbG9vcih0aGlzLnNlYyUzNjAwLzYwKSk7XG5cdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJ10nKS50ZXh0KE1hdGguZmxvb3IodGhpcy5zZWMlMzYwMCU2MCkpO1xuXG5cdFx0dGhpcy5zZWMgKz0gMTtcblx0fSxcblx0LyoqXG5cdCAqINC00L7QsdCw0LLQu9GP0LXRgiDQuiDRhtC40YTRgNC1INC90L7Qu9GMLCDRh9GC0L7QsSDQv9C+0LvRg9GH0LjRgtGMINC00LLRg9C30L3QsNGH0L3QvtC1INGH0LjRgdC70L5cblx0ICogQHBhcmFtICB7bnVtYmVyfSBudW1iZXIg0YbQuNGE0YDQsCDQuNC70Lgg0YfQuNGB0LvQvlxuXHQgKiBAcmV0dXJuIHtudW1iZXJ9ICAgICAgICDQtNCy0YPQt9C90LDRh9C90L7QtSDRh9C40YHQu9C+XG5cdCAqL1xuXHR0d29OdW1iZXJzKG51bWJlcikge1xuXHRcdGlmIChudW1iZXIgPCAxMCkge1xuXHRcdFx0bnVtYmVyID0gJzAnICsgbnVtYmVyLnRvU3RyaW5nKCk7XG5cdFx0fVxuXHRcdHJldHVybiBudW1iZXI7XG5cdH0sXG5cdC8qKlxuXHQgKiDQvtCx0L3QvtCy0LvRj9C10YIg0LLRgNC10LzRj1xuXHQgKiDQstGL0LfRi9Cy0LDQtdGC0YHRjyDQutCw0LTQttGD0Y4g0YHQtdC60YPQvdC00YNcblx0ICovXG5cdHNldFRpbWUoKSB7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdHRoaXMuaG91cnMgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnJykudGV4dCh0aGlzLnR3b051bWJlcnModGhpcy5ob3VycykpO1xuXG5cdFx0XHR0aGlzLm1pbnV0ZXMgPSBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKTtcblx0XHRcdFxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnbVxcJycpLnRleHQodGhpcy50d29OdW1iZXJzKHRoaXMubWludXRlcykpO1xuXG5cdFx0XHR0aGlzLnNlY29uZHMgPSBuZXcgRGF0ZSgpLmdldFNlY29uZHMoKTtcblx0XHRcdFxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJycpLnRleHQodGhpcy50d29OdW1iZXJzKHRoaXMuc2Vjb25kcykpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcucGluJywgZXZlbnQgPT4ge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0bGV0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnBpbicpO1xuXHRcdFx0XG5cdFx0XHRlbGVtXG5cdFx0XHRcdC5yZW1vdmVDbGFzcygncGluLS1zaG93Jylcblx0XHRcdFx0LmNzcygnei1pbmRleCcsICcyJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdwaW4tLXNob3cnKVxuXHRcdFx0XHQuY3NzKCd6LWluZGV4JywgJzEnKTtcblx0XHR9KTtcblxuXHRcdGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ2Rlc2t0b3AnKSkge1xuXHRcdFx0bGV0IG5ld0RhdGUgPSBuZXcgRGF0ZSgpO1xuXG5cdFx0XHRuZXdEYXRlLnNldERhdGUobmV3RGF0ZS5nZXREYXRlKCkpO1xuXG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnJykudGV4dCh0aGlzLmhvdXJzKTtcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ21cXCcnKS50ZXh0KHRoaXMubWludXRlcyk7XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdzXFwnJykudGV4dCh0aGlzLnNlY29uZHMpO1xuXG5cdFx0XHRzZXRJbnRlcnZhbCh0aGlzLnNldFRpbWUsIDEwMDApO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCddJylcblx0XHRcdFx0LnRleHQoTWF0aC5mbG9vcih0aGlzLnNlYy8zNjAwKSA8IDEwID9cblx0XHRcdFx0XHRcdFx0JzAnICsgTWF0aC5mbG9vcih0aGlzLnNlYy8zNjAwKSA6XG5cdFx0XHRcdFx0XHRcdE1hdGguZmxvb3IodGhpcy5zZWMvMzYwMCkpO1xuXG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnXScpXG5cdFx0XHRcdC50ZXh0KE1hdGguZmxvb3IodGhpcy5zZWMlMzYwMC82MCkgPCAxMCA/XG5cdFx0XHRcdFx0XHRcdCcwJyArIE1hdGguZmxvb3IodGhpcy5zZWMlMzYwMC82MCkgOlxuXHRcdFx0XHRcdFx0XHRNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAvNjApKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJ10nKVxuXHRcdFx0XHQudGV4dChNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAlNjApIDwgMTAgP1xuXHRcdFx0XHRcdFx0XHQnMCcgKyBNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAlNjApIDpcblx0XHRcdFx0XHRcdFx0TWF0aC5mbG9vcih0aGlzLnNlYyUzNjAwJTYwKSk7XG5cblx0XHRcdHRoaXMuc2VjICs9IDE7XG5cblx0XHRcdHNldEludGVydmFsKHRoaXMuY291bnRkb3duLCAxMDAwKTtcblx0XHR9XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBpbjsiLCJjb25zdCBxdWVzdGlvbiA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJy5xdWVzdGlvbnNfX2l0ZW0nKS5lcSgxKS5oaWRlKCk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tYWluLWJ0bi0taGRpdycsIGV2ZW50ID0+IHtcblx0XHRcdGxldCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5tYWluLWJ0bi0taGRpdycpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFxuXHRcdFx0aWYgKCFlbGVtLmhhc0NsYXNzKCdtYWluLWJ0bi0tYWN0aXZlJykpIHtcblx0XHRcdFx0ZWxlbVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbWFpbi1idG4tLWFjdGl2ZScpXG5cdFx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ21haW4tYnRuLS1hY3RpdmUnKTtcblx0XHRcdFxuXHRcdFx0XHQkKCcucXVlc3Rpb25zX19pdGVtJylcblx0XHRcdFx0XHQuZXEoZWxlbS5pbmRleCgpIC0gMilcblx0XHRcdFx0XHQuZmFkZUluKDMwMClcblx0XHRcdFx0XHQuc2libGluZ3MoKVxuXHRcdFx0XHRcdC5mYWRlT3V0KDMwMCk7XG5cblx0XHRcdFx0JCgnLnF1ZXN0aW9uc19faXRlbScpXG5cdFx0XHRcdFx0LmZpbmQoJy5xdWVzdGlvbl9fYm9keScpXG5cdFx0XHRcdFx0LnNsaWRlVXAoMzAwKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLnF1ZXN0aW9uX19oZWFkZXInLCBldmVudCA9PiB7XG5cdFx0XHRsZXQgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcucXVlc3Rpb25fX2hlYWRlcicpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFxuXHRcdFx0ZWxlbVxuXHRcdFx0XHQuc2libGluZ3MoJy5xdWVzdGlvbl9fYm9keScpXG5cdFx0XHRcdC5zbGlkZVRvZ2dsZSgzMDApXG5cdFx0XHRcdC5jbG9zZXN0KCcucXVlc3Rpb24nKVxuXHRcdFx0XHQuc2libGluZ3MoJy5xdWVzdGlvbicpXG5cdFx0XHRcdC5maW5kKCcucXVlc3Rpb25fX2JvZHknKVxuXHRcdFx0XHQuc2xpZGVVcCgzMDApO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBxdWVzdGlvbjsiLCJjb25zdCBzY3JvbGxCdG4gPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zY3JvbGwtYnRuJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuc2Nyb2xsLWJ0bicpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFxuXHRcdFx0JCgnaHRtbCwgYm9keScpXG5cdFx0XHRcdC5hbmltYXRlKFxuXHRcdFx0XHRcdHtzY3JvbGxUb3A6IGVsZW0uY2xvc2VzdCgnLnNlY3Rpb24nKS5vdXRlckhlaWdodCgpfSxcblx0XHRcdFx0XHQ3MDApO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzY3JvbGxCdG47IiwiY29uc3Qgc2VhcmNoID0ge1xuXHRuZWVkZWRTY3JvbGw6IG51bGwsXG5cdHN0YXJ0ZWRcdFx0OiBmYWxzZSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdHRoaXMubmVlZGVkU2Nyb2xsID0gJCgnLnNlYXJjaCcpLm9mZnNldCgpLnRvcCAtICQod2luZG93KS5oZWlnaHQoKSArICQoJy5zZWFyY2gnKS5oZWlnaHQoKSAvIDI7XG5cdFx0XG5cdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7XG5cdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49IHRoaXMubmVlZGVkU2Nyb2xsICYmICF0aGlzLnN0YXJ0ZWQpIHtcblx0XHRcdFx0JCgnLnNlYXJjaCcpLmFkZENsYXNzKCdzZWFyY2gtLWFuaW1hdGUnKTtcblx0XHRcdFx0dGhpcy5zdGFydGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2VhcmNoOyIsImNvbnN0IHNsaWRlUGFjayA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnW2RhdGEtcGFnLXBvc10nLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0JCh0aGlzKVxuXHRcdFx0XHQuYWRkQ2xhc3MoJ3NsaWRlLXBhY2tfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdzbGlkZS1wYWNrX19wYWctLWFjdGl2ZScpXG5cdFx0XHRcdC5jbG9zZXN0KCcuc2xpZGUtcGFja19fcGFncycpXG5cdFx0XHRcdC5zaWJsaW5ncygnW2RhdGEtc2xpZGVyLXBvc10nKVxuXHRcdFx0XHQuYXR0cignZGF0YS1zbGlkZXItcG9zJywgJCh0aGlzKS5hdHRyKCdkYXRhLXBhZy1wb3MnKSk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNsaWRlUGFjazsiLCJjb25zdCB0YWJsZXQgPSB7XG5cdG1vYk9uZVx0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS1tb2IteDEnKSxcblx0bW9iVHdvXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW1vYi14MicpLFxuXHRtb2JUaHJlZVx0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS1tb2IteDMnKSxcblx0dGFiT25lXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLXRhYi14MScpLFxuXHR0YWJUd29cdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtdGFiLXgyJyksXG5cdHRhYlRocmVlXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLXRhYi14MycpLFxuXHQvKipcblx0ICog0LfQsNC/0YPRgdC60LDQtdC80LDRjyDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHRpZiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMykge1xuXHRcdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJykpIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0aGlzLm1vYlRocmVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy50YWJUaHJlZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyKSB7XG5cdFx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSkge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRoaXMubW9iVHdvKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy50YWJUd28pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSAge1xuXHRcdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJykpIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0aGlzLm1vYk9uZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRoaXMudGFiT25lKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQkKCcjdGFibGV0JykubGF6eWxvYWQoe1xuXHRcdFx0dGhyZXNob2xkOiAyMDAsXG5cdFx0XHRlZmZlY3RcdDogJ2ZhZGVJbicsXG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxldDsiLCJjb25zdCB1cEJ0biA9IHtcblx0LyoqXG5cdCAqINCy0LrQu9GO0YfQsNC10YIv0LLRi9C60LvRjtGH0LDQtdGCINCy0LjQtNC40LzQvtGB0YLRjCDQutC90L7Qv9C60Lhcblx0ICovXG5cdHNldFZpc2liaWxpdHkoKSB7XG5cdFx0aWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSA4MDApIHtcblx0XHRcdCQoJy51cC1idG4nKS5hZGRDbGFzcygndXAtYnRuLS1zaG93Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJy51cC1idG4nKS5yZW1vdmVDbGFzcygndXAtYnRuLS1zaG93Jyk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0LfQsNC/0YPRgdC60LDQtdC80LDRjyDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHR1cEJ0bi5zZXRWaXNpYmlsaXR5KCk7XG5cblx0XHQkKHdpbmRvdykuc2Nyb2xsKCgpID0+IHtcblx0XHRcdHVwQnRuLnNldFZpc2liaWxpdHkoKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLnVwLWJ0bicsICgpID0+IHtcblx0XHRcdCQoJ2h0bWwsIGJvZHknKVxuXHRcdFx0XHQuc3RvcCgpXG5cdFx0XHRcdC5hbmltYXRlKFxuXHRcdFx0XHRcdHtzY3JvbGxUb3A6IDB9LFxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGxUb3AoKS80KTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXBCdG47IiwiY29uc3Qgd2RTbGlkZXIgPSB7XG5cdC8qKlxuXHQgKiDQt9Cw0L/Rg9GB0LrQsNC10LzQsNGPINC/0YDQuCDQt9Cw0LPRgNGD0LfQutC1INGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLndkLXNsaWRlcl9fcGFnJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdCQodGhpcylcblx0XHRcdFx0LmFkZENsYXNzKCd3ZC1zbGlkZXJfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCd3ZC1zbGlkZXJfX3BhZy0tYWN0aXZlJyk7XG5cdFx0XHRcdFxuXHRcdFx0aWYgKCQodGhpcykuaW5kZXgoKSA9PT0gMSkge1xuXHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0LmNsb3Nlc3QoJy53ZC1zbGlkZXInKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnd2Qtc2xpZGVyLS10d28nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQodGhpcylcblx0XHRcdFx0XHQuY2xvc2VzdCgnLndkLXNsaWRlcicpXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCd3ZC1zbGlkZXItLXR3bycpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB3ZFNsaWRlcjsiLCJjb25zdCB5YU1hcCA9IHtcblx0cG9pbnRzOiBbXSxcblx0bWFwOiB7fSxcblx0LyoqXG5cdCAqINC+0LHRitGP0LLQu9GP0LXRgiDRgtC+0YfQutC4ICjQvdCw0LTQviDQstGL0L/QvtC70L3Rj9GC0Ywg0L/QvtGB0LvQtSDRgdC+0LfQtNCw0L3QuNGPINC60LDRgNGC0YspXG5cdCAqL1xuXHRzZXRQb2ludHMoKSB7XG5cdFx0dGhpcy5wb2ludHMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdGNvb3JkczogWzU5LjkyMDIyOTc1OTYyNzY5LCAzMC4zNzI5NTU5OTk5OTk5NzddLFxuXHRcdFx0XHR0aXRsZXM6IHtcblx0XHRcdFx0XHRoaW50Q29udGVudFx0XHQ6ICfQkdC+0LrRgSDQtNC70Y8g0L7QutC70LXQudC60LgnLFxuXHRcdFx0XHRcdGJhbGxvb25Db250ZW50XHQ6ICfQodCf0LEsINCa0YDQtdC80LXQvdGH0YPQs9GB0LrQsNGPINGD0LsuLCDQtC44Jyxcblx0XHRcdFx0fSxcblx0XHRcdFx0cGFyYW1zOiB7XG5cdFx0XHRcdFx0aWNvbkxheW91dDogeW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5XG5cdFx0XHRcdFx0XHQuY3JlYXRlQ2xhc3MoJzxkaXYgY2xhc3M9XFwneWEtbWFwX19pY29uIHlhLW1hcF9faWNvbi0tYmx1ZVxcJz48L2Rpdj4nKSxcblxuXHRcdFx0XHRcdGljb25TaGFwZToge1xuXHRcdFx0XHRcdFx0dHlwZVx0XHRcdDogJ1JlY3RhbmdsZScsXG5cdFx0XHRcdFx0XHRjb29yZGluYXRlc1x0OiBbWy03LCAtNDBdLCBbMzMsIDBdXSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0Y29vcmRzOiBbNTkuOTQ0ODQwOTM3NzE5MzEsIDMwLjM4ODU5MDE2Njg0MDE2XSxcblx0XHRcdFx0dGl0bGVzOiB7XG5cdFx0XHRcdFx0aGludENvbnRlbnRcdFx0OiAn0JPQu9Cw0LLQvdGL0Lkg0L7RhNC40YEnLFxuXHRcdFx0XHRcdGJhbGxvb25Db250ZW50XHQ6ICfQodCf0LEsINCh0YPQstC+0YDQvtCy0YHQutC40Lkg0L/RgNC+0YHQv9C10LrRgiwgNjXQsSwg0L7RhNC40YEgMTYnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwYXJhbXM6IHtcblx0XHRcdFx0XHRpY29uTGF5b3V0OiB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3Rvcnlcblx0XHRcdFx0XHRcdC5jcmVhdGVDbGFzcygnPGRpdiBjbGFzcz1cXCd5YS1tYXBfX2ljb24geWEtbWFwX19pY29uLS1yZWRcXCc+PC9kaXY+JyksXG5cblx0XHRcdFx0XHRpY29uU2hhcGU6IHtcblx0XHRcdFx0XHRcdHR5cGVcdFx0XHQ6ICdSZWN0YW5nbGUnLFxuXHRcdFx0XHRcdFx0Y29vcmRpbmF0ZXNcdDogW1stNywgLTQwXSwgWzMzLCAwXV0sXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fVxuXHRcdF07XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0LXRgiDRgtC+0YfQutGDINC90LAg0LrQsNGA0YLQtVxuXHQgKiBAcGFyYW0ge29iamV4dH0gcG9pbnQg0L7QsdGK0LXQutGCINGBINC00LDQvdC90YvQvNC4INGC0L7Rh9C60Lhcblx0ICovXG5cdHNldFBvaW50KHBvaW50KSB7XG5cdFx0dGhpcy5tYXAuZ2VvT2JqZWN0cy5hZGQobmV3IHltYXBzLlBsYWNlbWFyayhwb2ludC5jb29yZHMsIHBvaW50LnRpdGxlcywgcG9pbnQucGFyYW1zKSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0LXRgiDQutCw0YDRgtGDXG5cdCAqL1xuXHRzZXRNYXAoKSB7XG5cdFx0eW1hcHMucmVhZHkoKCkgPT4ge1xuXHRcdFx0dGhpcy5tYXAgPSBuZXcgeW1hcHMuTWFwKCd5YU1hcCcsIHtcblx0XHRcdFx0Y2VudGVyOiBbXG5cdFx0XHRcdFx0NTkuOTMxNTkzMjIyMzM5ODQsXG5cdFx0XHRcdFx0MzAuMzc1MTQ0NjgyNTU2MTIyXG5cdFx0XHRcdF0sXG5cdFx0XHRcdGNvbnRyb2xzOiBbXG5cdFx0XHRcdFx0J3pvb21Db250cm9sJyxcblx0XHRcdFx0XSxcblx0XHRcdFx0em9vbTogMTMsXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXRQb2ludHMoKTtcblxuXHRcdFx0dGhpcy5wb2ludHMuZm9yRWFjaChlbGVtID0+IHtcblx0XHRcdFx0dGhpcy5zZXRQb2ludChlbGVtKTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm1hcC5iZWhhdmlvcnMuZGlzYWJsZSgnc2Nyb2xsWm9vbScpO1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5zZXRNYXAoKTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0geWFNYXA7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZHJpdmVyRm9ybVx0ZnJvbSAnLi4vYmxvY2tzL2RyaXZlci1mb3JtL2RyaXZlci1mb3JtJztcbmltcG9ydCBpbnB1dFx0XHRmcm9tICcuLi9ibG9ja3MvaW5wdXQvaW5wdXQnO1xuaW1wb3J0IG1lc3NhZ2VcdFx0ZnJvbSAnLi4vYmxvY2tzL21lc3NhZ2UvbWVzc2FnZSc7XG5pbXBvcnQgYnVyZ2VyXHRcdGZyb20gJy4uL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyJztcbmltcG9ydCBzY3JvbGxCdG5cdGZyb20gJy4uL2Jsb2Nrcy9zY3JvbGwtYnRuL3Njcm9sbC1idG4nO1xuaW1wb3J0IHdkU2xpZGVyXHRmcm9tICcuLi9ibG9ja3Mvd2Qtc2xpZGVyL3dkLXNsaWRlcic7XG5pbXBvcnQgdGFibGV0XHRcdGZyb20gJy4uL2Jsb2Nrcy90YWJsZXQvdGFibGV0JztcbmltcG9ydCBzZWFyY2hcdFx0ZnJvbSAnLi4vYmxvY2tzL3NlYXJjaC9zZWFyY2gnO1xuaW1wb3J0IHBpblx0XHRcdGZyb20gJy4uL2Jsb2Nrcy9waW4vcGluJztcbmltcG9ydCBtYXBcdFx0XHRmcm9tICcuLi9ibG9ja3MvbWFwL21hcCc7XG5pbXBvcnQgc2xpZGVQYWNrXHRmcm9tICcuLi9ibG9ja3Mvc2xpZGUtcGFjay9zbGlkZS1wYWNrJztcbmltcG9ydCBkb3RTdHJpcFx0ZnJvbSAnLi4vYmxvY2tzL2RvdC1zdHJpcC9kb3Qtc3RyaXAnO1xuaW1wb3J0IHF1ZXN0aW9uXHRmcm9tICcuLi9ibG9ja3MvcXVlc3Rpb24vcXVlc3Rpb24nO1xuaW1wb3J0IHVwQnRuXHRcdGZyb20gJy4uL2Jsb2Nrcy91cC1idG4vdXAtYnRuJztcbmltcG9ydCB5YU1hcFx0XHRmcm9tICcuLi9ibG9ja3MveWEtbWFwL3lhLW1hcCc7XG5pbXBvcnQgdmFyc1x0XHRcdGZyb20gJy4vdmFycyc7XG5pbXBvcnQgZ2FsbGVyeVx0XHRmcm9tICcuLi9ibG9ja3MvZ2FsbGVyeS9nYWxsZXJ5JztcblxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9qcXVlcnlfbGF6eWxvYWQvanF1ZXJ5Lmxhenlsb2FkJyk7XG5yZXF1aXJlKCdkZXZpY2UuanMnKTtcblxuY29uc3QgamF0YSA9IHtcblx0LyoqXG5cdCAqINC30LDQv9GD0YHQutCw0LXQvNCw0Y8g0L/RgNC4INC30LDQs9GA0YPQt9C60LUg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdHJlYWR5KCkge1xuXHRcdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xuXHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCB0aGlzLmluaXQpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdGJ1cmdlci5pbml0KCk7XG5cdFx0dXBCdG4uaW5pdCgpO1xuXG5cdFx0c3dpdGNoICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpIHtcblx0XHRcdGNhc2UgJy8nOlxuXHRcdFx0XHRkcml2ZXJGb3JtLmluaXQoKTtcblx0XHRcdFx0aW5wdXQuaW5pdCgpO1xuXHRcdFx0XHRtZXNzYWdlLmluaXQoKTtcblx0XHRcdFx0c2Nyb2xsQnRuLmluaXQoKTtcblx0XHRcdFx0d2RTbGlkZXIuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2ZvcmFkdi5odG1sJzpcblx0XHRcdFx0ZG90U3RyaXAuaW5pdCgpO1xuXHRcdFx0XHRtYXAuaW5pdCgpO1xuXHRcdFx0XHRwaW4uaW5pdCgpO1xuXHRcdFx0XHRzY3JvbGxCdG4uaW5pdCgpO1xuXHRcdFx0XHRzZWFyY2guaW5pdCgpO1xuXHRcdFx0XHRzbGlkZVBhY2suaW5pdCgpO1xuXHRcdFx0XHR0YWJsZXQuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2NvbnRhY3RzLmh0bWwnOlxuXHRcdFx0XHR5YU1hcC5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvaG93Lmh0bWwnOlxuXHRcdFx0XHRxdWVzdGlvbi5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvZ2FsbGVyeS5odG1sJzpcblx0XHRcdFx0Z2FsbGVyeS5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRsb2NhdGlvbi5ocmVmID0gdmFycy5zZXJ2ZXI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fSxcbn07XG5cbmphdGEucmVhZHkoKTsiLCJjb25zdCBOT0RFX0VOViA9IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCc7XG5jb25zdCBwcm9kdWN0aW9uID0gTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/IHRydWUgOiBmYWxzZTtcblxuY29uc3QgdmFycyA9IHtcblx0c2VydmVyOiBwcm9kdWN0aW9uID8gJ2h0dHBzOi8vamF0YS5ydScgOiAnaHR0cDovL2Rldi5qYXRhLnJ1Jyxcblx0YXBpXHQ6IHtcblx0XHRiZWNvbWVEcml2ZXI6ICcvYXBpL3YxL2FjY291bnRzL2JlY29tZWRyaXZlcicsXG5cdFx0Z2FsbGVyeVx0XHQ6ICcvYXBpL3YxL2dhbGxlcnknLFxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB2YXJzOyJdfQ==
