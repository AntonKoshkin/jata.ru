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
	init: function init() {
		$('body').on('click', '.dot-strip__input', function (event) {
			switch ($(event.target).attr('id')) {
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

			$(event.target).closest('.slider').find('.slide-pack').attr('data-slider-pos', $(event.target).attr('data-dot-pos'));
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

	init: function init() {
		$('body').on('click', '[data-way]', function (event) {
			event.preventDefault();

			var elem = event.target;
			var page = $('.driver-form');
			var dataPage = Number(page.attr('data-page'));
			var currentPage = $('.driver-form__page[data-page=' + dataPage + ']');
			var nextPage = dataPage + 1;
			var prevPage = dataPage - 1;

			if ($(elem).attr('data-way') === 'prev') {
				if (prevPage === 1 || prevPage === 2) {
					page.attr('data-page', prevPage);
				}
			} else {
				switch (dataPage) {
					case 1:
						driverForm.data.how_did_you_know = $('#how_did_you_know').val();

					case 2:
						currentPage.find('[data-mask]').each(function (index, el) {
							if ($(el).length && $(el).attr('data-correct') !== 'true') {
								currentPage.find('[data-mask]').each(function (index, el) {
									if ($(el).attr('data-correct') !== 'true') {
										$(el).attr('data-correct', 'false');
									}
								});

								driverForm.fieldsCorrect = false;
								return false;
							} else {
								driverForm.data[$(el).attr('id')] = $(el).val();

								driverForm.fieldsCorrect = true;
							}
						});

						driverForm.data.phone = driverForm.data.phone.replace(/\D/g, '');
						break;

					case 3:
						currentPage.find('[data-mask]').each(function (index, el) {
							if ($(el).length && $(el).attr('data-correct') !== 'true') {
								currentPage.find('[data-mask]').each(function (index, el) {
									if ($(el).attr('data-correct') !== 'true') {
										$(el).attr('data-correct', 'false');
									}
								});

								driverForm.fieldsCorrect = false;

								return false;
							} else {
								currentPage.find('[data-filled]').each(function (index, el) {
									driverForm.data[$(el).attr('id')] = $(el).val();
								});

								driverForm.fieldsCorrect = true;
							}
						});
						break;

					default:
						console.log('wrong page number');
						break;
				}

				if (driverForm.fieldsCorrect) {
					switch (nextPage) {
						// на первой странице
						case 2:
							// переключить страницу
							page.attr('data-page', '2');
							// сбросить переменную
							driverForm.fieldsCorrect = false;
							break;

						// на второй странице
						case 3:
							// переключить страницу
							page.attr('data-page', '3');
							// сбросить переменную
							driverForm.fieldsCorrect = false;
							break;

						// на третьей странице
						case 4:
							// запустить функцию отправки формы
							driverForm.sendForm();
							// сбросить переменную
							driverForm.fieldsCorrect = false;
							break;

						default:
							console.log('wrong next page number');
							break;
					}
				}
			}
		});
	},
	sendForm: function sendForm() {
		if (!driverForm.busy) {
			console.log('start sending form');

			driverForm.busy = true;

			$.ajax({
				url: _vars2.default.server + _vars2.default.api.becomeDriver,
				type: 'POST',
				data: driverForm.data
			}).success(function (result) {
				$('.message--success').addClass('message--show');

				// переключить страницу
				$('.driver-form').attr('data-page', '1');

				// очистка полей формы
				$('[data-field-type]').each(function (index, el) {
					$(el).val('').attr('data-filled', 'false').attr('data-correct', 'null');
				});

				driverForm.busy = false;

				console.log('form has beed sent');
			}).fail(function (error) {
				$('.message--fail').addClass('message--show');
				if (error.responseText) {
					console.log('servers answer:\n', error.responseText);
				} else {
					console.log('UFO have interrupted our server\'s work\nwe\'l try to fix it');
				}
				driverForm.busy = false;
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
	numToLoad: 10,
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
	},
	loadEnd: function loadEnd() {
		this.busy = false;
		this.loader.hide();
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
	}
};

module.exports = gallery;

},{"../../compile/vars":21}],8:[function(require,module,exports){
'use strict';

var input = {
	/**
  * навешивает события на инпут
  */
	init: function init() {
		$('body').on('blur', '.input__input', function (event) {
			var elem = event.target;

			if ($(elem).val()) {
				$(elem).attr('data-filled', 'true');
			} else {
				$(elem).attr('data-filled', 'false');
			}
		});

		$('body').on('keyup', '[data-mask=\'tel\']', function (event) {
			var elem = event.target;

			$(elem).val(input.format($(elem).val(), 'tel'));
		});

		$('body').on('click', '[data-mask=\'tel\']', function (event) {
			var elem = event.target;

			$(elem).val(input.format($(elem).val(), 'tel'));
		});

		$('body').on('keyup', '[data-mask=\'year\']', function (event) {
			var elem = event.target;

			$(elem).val(input.format($(elem).val(), 'year'));
		});

		$('body').on('keyup', '[data-mask=\'number\']', function (event) {
			var elem = event.target;

			$(elem).val(input.format($(elem).val(), 'number'));
		});

		$('body').on('blur', '[data-mask]', function (event) {
			var elem = event.target;

			switch ($(elem).attr('data-mask')) {
				case 'email':
					if (/.+@.+\..+/i.test($(elem).val())) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'false');
					}
					break;

				case 'tel':
					// /^([\+]+)*[0-9\x20\x28\x29\-]{7,11}$/
					if ($(elem).val().length === 18) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'false');
					}
					break;

				case 'name':
					if (/^[a-zA-Zа-яёА-ЯЁ][a-zA-Zа-яёА-ЯЁ0-9-_\.]{1,20}$/.test($(elem).val())) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'false');
					}
					break;

				case 'empty':
				case 'text':
				case 'number':
					if ($(elem).val()) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'empty');
					}
					break;

				case 'year':
					if ($(elem).val() && parseInt($(elem).val()) >= 1900 && parseInt($(elem).val()) <= new Date().getFullYear()) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'false');
					}
					break;
			}
		});

		$('body').on('input', '[data-mask]', function (event) {
			var elem = event.target;

			$(elem).attr('data-correct', 'null');
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
	init: function init() {
		$('body').on('click', '.message__bg, .message__close', function (event) {
			event.preventDefault();

			$(elem).closest('.message').removeClass('message--show');
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
		$('[data-clock=\'h\']').text(Math.floor(pin.sec / 3600));
		$('[data-clock=\'m\']').text(Math.floor(pin.sec % 3600 / 60));
		$('[data-clock=\'s\']').text(Math.floor(pin.sec % 3600 % 60));

		pin.sec += 1;
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
	setTime: function setTime() {
		pin.hours = new Date().getHours();

		$('[data-clock=\'h\'').text(pin.twoNumbers(pin.hours));

		pin.minutes = new Date().getMinutes();

		$('[data-clock=\'m\'').text(pin.twoNumbers(pin.minutes));

		pin.seconds = new Date().getSeconds();

		$('[data-clock=\'s\'').text(pin.twoNumbers(pin.seconds));
	},
	init: function init() {
		$('body').on('mouseenter', '.pin', function (event) {
			event.preventDefault();

			var elem = event.target;

			if (!$(elem).hasClass('pin')) {
				elem = $(elem).closest('.pin');
			}

			$(elem).removeClass('pin--show').css('z-index', '2').siblings().removeClass('pin--show').css('z-index', '1');
		});

		if ($('html').hasClass('desktop')) {
			var newDate = new Date();

			newDate.setDate(newDate.getDate());

			$('[data-clock=\'h\'').text(pin.hours);
			$('[data-clock=\'m\'').text(pin.minutes);
			$('[data-clock=\'s\'').text(pin.seconds);

			setInterval(pin.setTime, 1000);
		} else {
			$('[data-clock=\'h\']').text(Math.floor(pin.sec / 3600) < 10 ? '0' + Math.floor(pin.sec / 3600) : Math.floor(pin.sec / 3600));

			$('[data-clock=\'m\']').text(Math.floor(pin.sec % 3600 / 60) < 10 ? '0' + Math.floor(pin.sec % 3600 / 60) : Math.floor(pin.sec % 3600 / 60));

			$('[data-clock=\'s\']').text(Math.floor(pin.sec % 3600 % 60) < 10 ? '0' + Math.floor(pin.sec % 3600 % 60) : Math.floor(pin.sec % 3600 % 60));

			pin.sec += 1;

			setInterval(pin.countdown, 1000);
		}
	}
};

module.exports = pin;

},{}],12:[function(require,module,exports){
'use strict';

var question = {
	init: function init() {
		$('.questions__item').eq(1).hide();

		$('body').on('click', '.main-btn--hdiw', function (event) {
			var elem = event.target;
			event.preventDefault();

			if (!$(elem).hasClass('main-btn--hdiw')) {
				elem = $(elem).closest('.main-btn--hdiw');
			}

			if (!$(elem).hasClass('main-btn--active')) {
				$(elem).addClass('main-btn--active').siblings().removeClass('main-btn--active');

				$('.questions__item').eq($(elem).index() - 2).fadeIn(300).siblings().fadeOut(300);

				$('.questions__item').find('.question__body').slideUp(300);
			}
		});

		$('body').on('click', '.question__header', function (event) {
			var elem = event.target;
			event.preventDefault();

			if (!$(elem).hasClass('question__header')) {
				elem = elem.closest('.question__header');
			}

			$(elem).siblings('.question__body').slideToggle(300).closest('.question').siblings('.question').find('.question__body').slideUp(300);
		});
	}
};

module.exports = question;

},{}],13:[function(require,module,exports){
'use strict';

var scrollBtn = {
	init: function init() {
		$('body').on('click', '.scroll-btn', function (event) {
			var elem = event.target;
			event.preventDefault();

			$('html, body').animate({ scrollTop: $(elem).closest('.section').outerHeight() }, 700);
		});
	}
};

module.exports = scrollBtn;

},{}],14:[function(require,module,exports){
'use strict';

var search = {
	neededScroll: null,
	started: false,

	init: function init() {
		search.neededScroll = $('.search').offset().top - $(window).height() + $('.search').height() / 2;

		$(window).scroll(function () {
			if ($(window).scrollTop() >= search.neededScroll && !search.started) {
				$('.search').addClass('search--animate');
				search.started = true;
			}
		});
	}
};

module.exports = search;

},{}],15:[function(require,module,exports){
'use strict';

var slidePack = {
	init: function init() {
		$('body').on('click', '[data-pag-pos]', function (event) {
			event.preventDefault();

			$(event.target).addClass('slide-pack__pag--active').siblings().removeClass('slide-pack__pag--active').closest('.slide-pack__pags').siblings('[data-slider-pos]').attr('data-slider-pos', $(event.target).attr('data-pag-pos'));
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

	init: function init() {
		if (window.devicePixelRatio >= 3) {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', tablet.mobThree);
			} else {
				$('#tablet').attr('data-original', tablet.tabThree);
			}
		} else if (window.devicePixelRatio >= 2) {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', tablet.mobTwo);
			} else {
				$('#tablet').attr('data-original', tablet.tabTwo);
			}
		} else {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', tablet.mobOne);
			} else {
				$('#tablet').attr('data-original', tablet.tabOne);
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
	setVisibility: function setVisibility() {
		if ($(window).scrollTop() >= 800) {
			$('.up-btn').addClass('up-btn--show');
		} else {
			$('.up-btn').removeClass('up-btn--show');
		}
	},
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
	init: function init() {
		$('body').on('click', '.wd-slider__pag', function (event) {
			var elem = event.target;
			event.preventDefault();

			$(elem).addClass('wd-slider__pag--active').siblings().removeClass('wd-slider__pag--active');

			if ($(elem).index() === 1) {
				$(elem).closest('.wd-slider').addClass('wd-slider--two');
			} else {
				$(elem).closest('.wd-slider').removeClass('wd-slider--two');
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
		yaMap.points = [{
			coords: [59.92022975962769, 30.372955999999977],
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
		}, {
			coords: [59.94484093771931, 30.38859016684016],
			titles: {
				hintContent: 'Главный офис',
				balloonContent: 'СПб, Суворовский проспект, 65б, офис 16'
			},
			params: {
				iconLayout: ymaps.templateLayoutFactory.createClass('<div class=\'ya-map__icon ya-map__icon--blue\'></div>'),

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
		yaMap.map.geoObjects.add(new ymaps.Placemark(point.coords, point.titles, point.params));
	},

	/**
  * создает карту
  */
	setMap: function setMap() {
		yaMap.map = new ymaps.Map('yaMap', {
			center: [59.93159322233984, 30.375144682556122],
			controls: ['zoomControl'],
			zoom: 13
		});

		yaMap.setPoints();

		yaMap.points.forEach(function (elem) {
			yaMap.setPoint(elem);
		});

		yaMap.map.behaviors.disable('scrollZoom');
	},

	/**
  * инит функция
  */
	init: function init() {
		ymaps.ready(yaMap.setMap);
	}
};

module.exports = yaMap;

},{}],20:[function(require,module,exports){
'use strict';

var _driverForm = require('../blocks/driver-form/driver-form2');

var _driverForm2 = _interopRequireDefault(_driverForm);

var _input = require('../blocks/input/input2');

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

var _gallery = require('../blocks/gallery/gallery2');

var _gallery2 = _interopRequireDefault(_gallery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../../bower_components/jquery_lazyload/jquery.lazyload');
require('device.js');

var jata = {
	ready: function ready() {
		if (document.readyState !== 'loading') {
			jata.init();
		} else {
			document.addEventListener('DOMContentLoaded', jata.init);
		}
	},
	init: function init() {
		console.log(window.location.pathname);

		_burger2.default.init();
		_upBtn2.default.init();

		switch (window.location.pathname) {
			case '/':
				console.log('main');

				_driverForm2.default.init();
				_input2.default.init();
				_message2.default.init();
				_scrollBtn2.default.init();
				_wdSlider2.default.init();
				break;

			case '/foradv.html':
				console.log('foradv');

				_scrollBtn2.default.init();
				_tablet2.default.init();
				_search2.default.init();
				_pin2.default.init();
				_map2.default.init();
				_slidePack2.default.init();
				_dotStrip2.default.init();
				break;

			case '/contacts.html':
				console.log('contacts');
				_yaMap2.default.init();
				break;

			case '/how.html':
				console.log('how');
				_question2.default.init();
				break;

			case '/gallery.html':
				console.log('gallery');
				_gallery2.default.init();
				break;

			// default:
			// 	location.href = vars.server + '/404.html';
			// 	break;
		}
	}
};

jata.ready();

},{"../../bower_components/jquery_lazyload/jquery.lazyload":1,"../blocks/burger/burger":4,"../blocks/dot-strip/dot-strip":5,"../blocks/driver-form/driver-form2":6,"../blocks/gallery/gallery2":7,"../blocks/input/input2":8,"../blocks/map/map":9,"../blocks/message/message":10,"../blocks/pin/pin":11,"../blocks/question/question":12,"../blocks/scroll-btn/scroll-btn":13,"../blocks/search/search":14,"../blocks/slide-pack/slide-pack":15,"../blocks/tablet/tablet":16,"../blocks/up-btn/up-btn":17,"../blocks/wd-slider/wd-slider":18,"../blocks/ya-map/ya-map":19,"./vars":21,"device.js":2}],21:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL2pxdWVyeV9sYXp5bG9hZC9qcXVlcnkubGF6eWxvYWQuanMiLCJub2RlX21vZHVsZXMvZGV2aWNlLmpzL2xpYi9kZXZpY2UuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyLmpzIiwic3JjL2Jsb2Nrcy9kb3Qtc3RyaXAvZG90LXN0cmlwLmpzIiwic3JjL2Jsb2Nrcy9kcml2ZXItZm9ybS9kcml2ZXItZm9ybTIuanMiLCJzcmMvYmxvY2tzL2dhbGxlcnkvZ2FsbGVyeTIuanMiLCJzcmMvYmxvY2tzL2lucHV0L2lucHV0Mi5qcyIsInNyYy9ibG9ja3MvbWFwL21hcC5qcyIsInNyYy9ibG9ja3MvbWVzc2FnZS9tZXNzYWdlLmpzIiwic3JjL2Jsb2Nrcy9waW4vcGluLmpzIiwic3JjL2Jsb2Nrcy9xdWVzdGlvbi9xdWVzdGlvbi5qcyIsInNyYy9ibG9ja3Mvc2Nyb2xsLWJ0bi9zY3JvbGwtYnRuLmpzIiwic3JjL2Jsb2Nrcy9zZWFyY2gvc2VhcmNoLmpzIiwic3JjL2Jsb2Nrcy9zbGlkZS1wYWNrL3NsaWRlLXBhY2suanMiLCJzcmMvYmxvY2tzL3RhYmxldC90YWJsZXQuanMiLCJzcmMvYmxvY2tzL3VwLWJ0bi91cC1idG4uanMiLCJzcmMvYmxvY2tzL3dkLXNsaWRlci93ZC1zbGlkZXIuanMiLCJzcmMvYmxvY2tzL3lhLW1hcC95YS1tYXAuanMiLCJzcmMvY29tcGlsZS9jdXN0b20uanMiLCJzcmMvY29tcGlsZS92YXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsQ0FBQyxVQUFTLENBQVQsRUFBWSxNQUFaLEVBQW9CLFFBQXBCLEVBQThCLFNBQTlCLEVBQXlDO0FBQ3RDLFFBQUksVUFBVSxFQUFFLE1BQUYsQ0FBZDs7QUFFQSxN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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFhLGFBQWEsWUFBYixHQUE0QixJQUE1QixHQUFtQyxLQUF0RDs7QUFFQSxJQUFNLE9BQU87QUFDWixTQUFRLGFBQWEsaUJBQWIsR0FBaUMsb0JBRDdCO0FBRVosTUFBTTtBQUNMLGdCQUFjLCtCQURUO0FBRUwsV0FBVztBQUZOO0FBRk0sQ0FBYjs7QUFRQSxPQUFPLE9BQVAsR0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBMYXp5IExvYWQgLSBqUXVlcnkgcGx1Z2luIGZvciBsYXp5IGxvYWRpbmcgaW1hZ2VzXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTUgTWlrYSBUdXVwb2xhXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIFByb2plY3QgaG9tZTpcbiAqICAgaHR0cDovL3d3dy5hcHBlbHNpaW5pLm5ldC9wcm9qZWN0cy9sYXp5bG9hZFxuICpcbiAqIFZlcnNpb246ICAxLjkuN1xuICpcbiAqL1xuXG4oZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cbiAgICAkLmZuLmxhenlsb2FkID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSB0aGlzO1xuICAgICAgICB2YXIgJGNvbnRhaW5lcjtcbiAgICAgICAgdmFyIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgdGhyZXNob2xkICAgICAgIDogMCxcbiAgICAgICAgICAgIGZhaWx1cmVfbGltaXQgICA6IDAsXG4gICAgICAgICAgICBldmVudCAgICAgICAgICAgOiBcInNjcm9sbFwiLFxuICAgICAgICAgICAgZWZmZWN0ICAgICAgICAgIDogXCJzaG93XCIsXG4gICAgICAgICAgICBjb250YWluZXIgICAgICAgOiB3aW5kb3csXG4gICAgICAgICAgICBkYXRhX2F0dHJpYnV0ZSAgOiBcIm9yaWdpbmFsXCIsXG4gICAgICAgICAgICBza2lwX2ludmlzaWJsZSAgOiBmYWxzZSxcbiAgICAgICAgICAgIGFwcGVhciAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICBsb2FkICAgICAgICAgICAgOiBudWxsLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXIgICAgIDogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQVhOU1IwSUFyczRjNlFBQUFBUm5RVTFCQUFDeGp3djhZUVVBQUFBSmNFaFpjd0FBRHNRQUFBN0VBWlVyRGhzQUFBQU5TVVJCVkJoWFl6aDgrUEIvQUFmZkEwbk5QdUNMQUFBQUFFbEZUa1N1UW1DQ1wiXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gICAgICAgICAgICBlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNraXBfaW52aXNpYmxlICYmICEkdGhpcy5pcyhcIjp2aXNpYmxlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCQuYWJvdmV0aGV0b3AodGhpcywgc2V0dGluZ3MpIHx8XG4gICAgICAgICAgICAgICAgICAgICQubGVmdG9mYmVnaW4odGhpcywgc2V0dGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBOb3RoaW5nLiAqL1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoISQuYmVsb3d0aGVmb2xkKHRoaXMsIHNldHRpbmdzKSAmJlxuICAgICAgICAgICAgICAgICAgICAhJC5yaWdodG9mZm9sZCh0aGlzLCBzZXR0aW5ncykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnRyaWdnZXIoXCJhcHBlYXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpZiB3ZSBmb3VuZCBhbiBpbWFnZSB3ZSdsbCBsb2FkLCByZXNldCB0aGUgY291bnRlciAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCsrY291bnRlciA+IHNldHRpbmdzLmZhaWx1cmVfbGltaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZihvcHRpb25zKSB7XG4gICAgICAgICAgICAvKiBNYWludGFpbiBCQyBmb3IgYSBjb3VwbGUgb2YgdmVyc2lvbnMuICovXG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBvcHRpb25zLmZhaWx1cmVsaW1pdCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZmFpbHVyZV9saW1pdCA9IG9wdGlvbnMuZmFpbHVyZWxpbWl0O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLmZhaWx1cmVsaW1pdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IG9wdGlvbnMuZWZmZWN0c3BlZWQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmVmZmVjdF9zcGVlZCA9IG9wdGlvbnMuZWZmZWN0c3BlZWQ7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuZWZmZWN0c3BlZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKHNldHRpbmdzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIENhY2hlIGNvbnRhaW5lciBhcyBqUXVlcnkgYXMgb2JqZWN0LiAqL1xuICAgICAgICAkY29udGFpbmVyID0gKHNldHRpbmdzLmNvbnRhaW5lciA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpID8gJHdpbmRvdyA6ICQoc2V0dGluZ3MuY29udGFpbmVyKTtcblxuICAgICAgICAvKiBGaXJlIG9uZSBzY3JvbGwgZXZlbnQgcGVyIHNjcm9sbC4gTm90IG9uZSBzY3JvbGwgZXZlbnQgcGVyIGltYWdlLiAqL1xuICAgICAgICBpZiAoMCA9PT0gc2V0dGluZ3MuZXZlbnQuaW5kZXhPZihcInNjcm9sbFwiKSkge1xuICAgICAgICAgICAgJGNvbnRhaW5lci5iaW5kKHNldHRpbmdzLmV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHZhciAkc2VsZiA9ICQoc2VsZik7XG5cbiAgICAgICAgICAgIHNlbGYubG9hZGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8qIElmIG5vIHNyYyBhdHRyaWJ1dGUgZ2l2ZW4gdXNlIGRhdGE6dXJpLiAqL1xuICAgICAgICAgICAgaWYgKCRzZWxmLmF0dHIoXCJzcmNcIikgPT09IHVuZGVmaW5lZCB8fCAkc2VsZi5hdHRyKFwic3JjXCIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGlmICgkc2VsZi5pcyhcImltZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAkc2VsZi5hdHRyKFwic3JjXCIsIHNldHRpbmdzLnBsYWNlaG9sZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIFdoZW4gYXBwZWFyIGlzIHRyaWdnZXJlZCBsb2FkIG9yaWdpbmFsIGltYWdlLiAqL1xuICAgICAgICAgICAgJHNlbGYub25lKFwiYXBwZWFyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLmFwcGVhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzX2xlZnQgPSBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5hcHBlYXIuY2FsbChzZWxmLCBlbGVtZW50c19sZWZ0LCBzZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgJChcIjxpbWcgLz5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5iaW5kKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmlnaW5hbCA9ICRzZWxmLmF0dHIoXCJkYXRhLVwiICsgc2V0dGluZ3MuZGF0YV9hdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNlbGYuaXMoXCJpbWdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGYuYXR0cihcInNyY1wiLCBvcmlnaW5hbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGYuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBcInVybCgnXCIgKyBvcmlnaW5hbCArIFwiJylcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmW3NldHRpbmdzLmVmZmVjdF0oc2V0dGluZ3MuZWZmZWN0X3NwZWVkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIFJlbW92ZSBpbWFnZSBmcm9tIGFycmF5IHNvIGl0IGlzIG5vdCBsb29wZWQgbmV4dCB0aW1lLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gJC5ncmVwKGVsZW1lbnRzLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhZWxlbWVudC5sb2FkZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMgPSAkKHRlbXApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLmxvYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzX2xlZnQgPSBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmxvYWQuY2FsbChzZWxmLCBlbGVtZW50c19sZWZ0LCBzZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3JjXCIsICRzZWxmLmF0dHIoXCJkYXRhLVwiICsgc2V0dGluZ3MuZGF0YV9hdHRyaWJ1dGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyogV2hlbiB3YW50ZWQgZXZlbnQgaXMgdHJpZ2dlcmVkIGxvYWQgb3JpZ2luYWwgaW1hZ2UgKi9cbiAgICAgICAgICAgIC8qIGJ5IHRyaWdnZXJpbmcgYXBwZWFyLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoMCAhPT0gc2V0dGluZ3MuZXZlbnQuaW5kZXhPZihcInNjcm9sbFwiKSkge1xuICAgICAgICAgICAgICAgICRzZWxmLmJpbmQoc2V0dGluZ3MuZXZlbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbGYubG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VsZi50cmlnZ2VyKFwiYXBwZWFyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qIENoZWNrIGlmIHNvbWV0aGluZyBhcHBlYXJzIHdoZW4gd2luZG93IGlzIHJlc2l6ZWQuICovXG4gICAgICAgICR3aW5kb3cuYmluZChcInJlc2l6ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvKiBXaXRoIElPUzUgZm9yY2UgbG9hZGluZyBpbWFnZXMgd2hlbiBuYXZpZ2F0aW5nIHdpdGggYmFjayBidXR0b24uICovXG4gICAgICAgIC8qIE5vbiBvcHRpbWFsIHdvcmthcm91bmQuICovXG4gICAgICAgIGlmICgoLyg/OmlwaG9uZXxpcG9kfGlwYWQpLipvcyA1L2dpKS50ZXN0KG5hdmlnYXRvci5hcHBWZXJzaW9uKSkge1xuICAgICAgICAgICAgJHdpbmRvdy5iaW5kKFwicGFnZXNob3dcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnBlcnNpc3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFwiYXBwZWFyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEZvcmNlIGluaXRpYWwgY2hlY2sgaWYgaW1hZ2VzIHNob3VsZCBhcHBlYXIuICovXG4gICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKiBDb252ZW5pZW5jZSBtZXRob2RzIGluIGpRdWVyeSBuYW1lc3BhY2UuICAgICAgICAgICAqL1xuICAgIC8qIFVzZSBhcyAgJC5iZWxvd3RoZWZvbGQoZWxlbWVudCwge3RocmVzaG9sZCA6IDEwMCwgY29udGFpbmVyIDogd2luZG93fSkgKi9cblxuICAgICQuYmVsb3d0aGVmb2xkID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGZvbGQ7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lciA9PT0gdW5kZWZpbmVkIHx8IHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSB7XG4gICAgICAgICAgICBmb2xkID0gKHdpbmRvdy5pbm5lckhlaWdodCA/IHdpbmRvdy5pbm5lckhlaWdodCA6ICR3aW5kb3cuaGVpZ2h0KCkpICsgJHdpbmRvdy5zY3JvbGxUb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvbGQgPSAkKHNldHRpbmdzLmNvbnRhaW5lcikub2Zmc2V0KCkudG9wICsgJChzZXR0aW5ncy5jb250YWluZXIpLmhlaWdodCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvbGQgPD0gJChlbGVtZW50KS5vZmZzZXQoKS50b3AgLSBzZXR0aW5ncy50aHJlc2hvbGQ7XG4gICAgfTtcblxuICAgICQucmlnaHRvZmZvbGQgPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICB2YXIgZm9sZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHwgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpIHtcbiAgICAgICAgICAgIGZvbGQgPSAkd2luZG93LndpZHRoKCkgKyAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvbGQgPSAkKHNldHRpbmdzLmNvbnRhaW5lcikub2Zmc2V0KCkubGVmdCArICQoc2V0dGluZ3MuY29udGFpbmVyKS53aWR0aCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvbGQgPD0gJChlbGVtZW50KS5vZmZzZXQoKS5sZWZ0IC0gc2V0dGluZ3MudGhyZXNob2xkO1xuICAgIH07XG5cbiAgICAkLmFib3ZldGhldG9wID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGZvbGQ7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lciA9PT0gdW5kZWZpbmVkIHx8IHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSB7XG4gICAgICAgICAgICBmb2xkID0gJHdpbmRvdy5zY3JvbGxUb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvbGQgPSAkKHNldHRpbmdzLmNvbnRhaW5lcikub2Zmc2V0KCkudG9wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvbGQgPj0gJChlbGVtZW50KS5vZmZzZXQoKS50b3AgKyBzZXR0aW5ncy50aHJlc2hvbGQgICsgJChlbGVtZW50KS5oZWlnaHQoKTtcbiAgICB9O1xuXG4gICAgJC5sZWZ0b2ZiZWdpbiA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9sZCA9ICQoc2V0dGluZ3MuY29udGFpbmVyKS5vZmZzZXQoKS5sZWZ0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvbGQgPj0gJChlbGVtZW50KS5vZmZzZXQoKS5sZWZ0ICsgc2V0dGluZ3MudGhyZXNob2xkICsgJChlbGVtZW50KS53aWR0aCgpO1xuICAgIH07XG5cbiAgICAkLmludmlld3BvcnQgPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICAgcmV0dXJuICEkLnJpZ2h0b2Zmb2xkKGVsZW1lbnQsIHNldHRpbmdzKSAmJiAhJC5sZWZ0b2ZiZWdpbihlbGVtZW50LCBzZXR0aW5ncykgJiZcbiAgICAgICAgICAgICAgICAhJC5iZWxvd3RoZWZvbGQoZWxlbWVudCwgc2V0dGluZ3MpICYmICEkLmFib3ZldGhldG9wKGVsZW1lbnQsIHNldHRpbmdzKTtcbiAgICAgfTtcblxuICAgIC8qIEN1c3RvbSBzZWxlY3RvcnMgZm9yIHlvdXIgY29udmVuaWVuY2UuICAgKi9cbiAgICAvKiBVc2UgYXMgJChcImltZzpiZWxvdy10aGUtZm9sZFwiKS5zb21ldGhpbmcoKSBvciAqL1xuICAgIC8qICQoXCJpbWdcIikuZmlsdGVyKFwiOmJlbG93LXRoZS1mb2xkXCIpLnNvbWV0aGluZygpIHdoaWNoIGlzIGZhc3RlciAqL1xuXG4gICAgJC5leHRlbmQoJC5leHByW1wiOlwiXSwge1xuICAgICAgICBcImJlbG93LXRoZS1mb2xkXCIgOiBmdW5jdGlvbihhKSB7IHJldHVybiAkLmJlbG93dGhlZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcImFib3ZlLXRoZS10b3BcIiAgOiBmdW5jdGlvbihhKSB7IHJldHVybiAhJC5iZWxvd3RoZWZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJyaWdodC1vZi1zY3JlZW5cIjogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5yaWdodG9mZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcImxlZnQtb2Ytc2NyZWVuXCIgOiBmdW5jdGlvbihhKSB7IHJldHVybiAhJC5yaWdodG9mZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcImluLXZpZXdwb3J0XCIgICAgOiBmdW5jdGlvbihhKSB7IHJldHVybiAkLmludmlld3BvcnQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgLyogTWFpbnRhaW4gQkMgZm9yIGNvdXBsZSBvZiB2ZXJzaW9ucy4gKi9cbiAgICAgICAgXCJhYm92ZS10aGUtZm9sZFwiIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gISQuYmVsb3d0aGVmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwicmlnaHQtb2YtZm9sZFwiICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICQucmlnaHRvZmZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJsZWZ0LW9mLWZvbGRcIiAgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gISQucmlnaHRvZmZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiLy8gRGV2aWNlLmpzXG4vLyAoYykgMjAxNCBNYXR0aGV3IEh1ZHNvblxuLy8gRGV2aWNlLmpzIGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbi8vIEZvciBhbGwgZGV0YWlscyBhbmQgZG9jdW1lbnRhdGlvbjpcbi8vIGh0dHA6Ly9tYXR0aGV3aHVkc29uLm1lL3Byb2plY3RzL2RldmljZS5qcy9cblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBkZXZpY2UsXG4gICAgcHJldmlvdXNEZXZpY2UsXG4gICAgYWRkQ2xhc3MsXG4gICAgZG9jdW1lbnRFbGVtZW50LFxuICAgIGZpbmQsXG4gICAgaGFuZGxlT3JpZW50YXRpb24sXG4gICAgaGFzQ2xhc3MsXG4gICAgb3JpZW50YXRpb25FdmVudCxcbiAgICByZW1vdmVDbGFzcyxcbiAgICB1c2VyQWdlbnQ7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGRldmljZSB2YXJpYWJsZS5cbiAgcHJldmlvdXNEZXZpY2UgPSB3aW5kb3cuZGV2aWNlO1xuXG4gIGRldmljZSA9IHt9O1xuXG4gIC8vIEFkZCBkZXZpY2UgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICB3aW5kb3cuZGV2aWNlID0gZGV2aWNlO1xuXG4gIC8vIFRoZSA8aHRtbD4gZWxlbWVudC5cbiAgZG9jdW1lbnRFbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuICAvLyBUaGUgY2xpZW50IHVzZXIgYWdlbnQgc3RyaW5nLlxuICAvLyBMb3dlcmNhc2UsIHNvIHdlIGNhbiB1c2UgdGhlIG1vcmUgZWZmaWNpZW50IGluZGV4T2YoKSwgaW5zdGVhZCBvZiBSZWdleFxuICB1c2VyQWdlbnQgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIE1haW4gZnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgZGV2aWNlLmlvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmlwaG9uZSgpIHx8IGRldmljZS5pcG9kKCkgfHwgZGV2aWNlLmlwYWQoKTtcbiAgfTtcblxuICBkZXZpY2UuaXBob25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhZGV2aWNlLndpbmRvd3MoKSAmJiBmaW5kKCdpcGhvbmUnKTtcbiAgfTtcblxuICBkZXZpY2UuaXBvZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmluZCgnaXBvZCcpO1xuICB9O1xuXG4gIGRldmljZS5pcGFkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCdpcGFkJyk7XG4gIH07XG5cbiAgZGV2aWNlLmFuZHJvaWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICFkZXZpY2Uud2luZG93cygpICYmIGZpbmQoJ2FuZHJvaWQnKTtcbiAgfTtcblxuICBkZXZpY2UuYW5kcm9pZFBob25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuYW5kcm9pZCgpICYmIGZpbmQoJ21vYmlsZScpO1xuICB9O1xuXG4gIGRldmljZS5hbmRyb2lkVGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuYW5kcm9pZCgpICYmICFmaW5kKCdtb2JpbGUnKTtcbiAgfTtcblxuICBkZXZpY2UuYmxhY2tiZXJyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmluZCgnYmxhY2tiZXJyeScpIHx8IGZpbmQoJ2JiMTAnKSB8fCBmaW5kKCdyaW0nKTtcbiAgfTtcblxuICBkZXZpY2UuYmxhY2tiZXJyeVBob25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuYmxhY2tiZXJyeSgpICYmICFmaW5kKCd0YWJsZXQnKTtcbiAgfTtcblxuICBkZXZpY2UuYmxhY2tiZXJyeVRhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmJsYWNrYmVycnkoKSAmJiBmaW5kKCd0YWJsZXQnKTtcbiAgfTtcblxuICBkZXZpY2Uud2luZG93cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmluZCgnd2luZG93cycpO1xuICB9O1xuXG4gIGRldmljZS53aW5kb3dzUGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS53aW5kb3dzKCkgJiYgZmluZCgncGhvbmUnKTtcbiAgfTtcblxuICBkZXZpY2Uud2luZG93c1RhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLndpbmRvd3MoKSAmJiAoZmluZCgndG91Y2gnKSAmJiAhZGV2aWNlLndpbmRvd3NQaG9uZSgpKTtcbiAgfTtcblxuICBkZXZpY2UuZnhvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKGZpbmQoJyhtb2JpbGU7JykgfHwgZmluZCgnKHRhYmxldDsnKSkgJiYgZmluZCgnOyBydjonKTtcbiAgfTtcblxuICBkZXZpY2UuZnhvc1Bob25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuZnhvcygpICYmIGZpbmQoJ21vYmlsZScpO1xuICB9O1xuXG4gIGRldmljZS5meG9zVGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuZnhvcygpICYmIGZpbmQoJ3RhYmxldCcpO1xuICB9O1xuXG4gIGRldmljZS5tZWVnbyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmluZCgnbWVlZ28nKTtcbiAgfTtcblxuICBkZXZpY2UuY29yZG92YSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gd2luZG93LmNvcmRvdmEgJiYgbG9jYXRpb24ucHJvdG9jb2wgPT09ICdmaWxlOic7XG4gIH07XG5cbiAgZGV2aWNlLm5vZGVXZWJraXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cucHJvY2VzcyA9PT0gJ29iamVjdCc7XG4gIH07XG5cbiAgZGV2aWNlLm1vYmlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmFuZHJvaWRQaG9uZSgpIHx8IGRldmljZS5pcGhvbmUoKSB8fCBkZXZpY2UuaXBvZCgpIHx8IGRldmljZS53aW5kb3dzUGhvbmUoKSB8fCBkZXZpY2UuYmxhY2tiZXJyeVBob25lKCkgfHwgZGV2aWNlLmZ4b3NQaG9uZSgpIHx8IGRldmljZS5tZWVnbygpO1xuICB9O1xuXG4gIGRldmljZS50YWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5pcGFkKCkgfHwgZGV2aWNlLmFuZHJvaWRUYWJsZXQoKSB8fCBkZXZpY2UuYmxhY2tiZXJyeVRhYmxldCgpIHx8IGRldmljZS53aW5kb3dzVGFibGV0KCkgfHwgZGV2aWNlLmZ4b3NUYWJsZXQoKTtcbiAgfTtcblxuICBkZXZpY2UuZGVza3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gIWRldmljZS50YWJsZXQoKSAmJiAhZGV2aWNlLm1vYmlsZSgpO1xuICB9O1xuXG4gIGRldmljZS50ZWxldmlzaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIHRlbGV2aXNpb247XG5cbiAgICB0ZWxldmlzaW9uID0gW1xuICAgICAgXCJnb29nbGV0dlwiLFxuICAgICAgXCJ2aWVyYVwiLFxuICAgICAgXCJzbWFydHR2XCIsXG4gICAgICBcImludGVybmV0LnR2XCIsXG4gICAgICBcIm5ldGNhc3RcIixcbiAgICAgIFwibmV0dHZcIixcbiAgICAgIFwiYXBwbGV0dlwiLFxuICAgICAgXCJib3hlZVwiLFxuICAgICAgXCJreWxvXCIsXG4gICAgICBcInJva3VcIixcbiAgICAgIFwiZGxuYWRvY1wiLFxuICAgICAgXCJyb2t1XCIsXG4gICAgICBcInBvdl90dlwiLFxuICAgICAgXCJoYmJ0dlwiLFxuICAgICAgXCJjZS1odG1sXCJcbiAgICBdO1xuXG4gICAgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCB0ZWxldmlzaW9uLmxlbmd0aCkge1xuICAgICAgaWYgKGZpbmQodGVsZXZpc2lvbltpXSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9O1xuXG4gIGRldmljZS5wb3J0cmFpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHdpbmRvdy5pbm5lckhlaWdodCAvIHdpbmRvdy5pbm5lcldpZHRoKSA+IDE7XG4gIH07XG5cbiAgZGV2aWNlLmxhbmRzY2FwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHdpbmRvdy5pbm5lckhlaWdodCAvIHdpbmRvdy5pbm5lcldpZHRoKSA8IDE7XG4gIH07XG5cbiAgLy8gUHVibGljIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBkZXZpY2UuanMgaW4gbm9Db25mbGljdCBtb2RlLFxuICAvLyByZXR1cm5pbmcgdGhlIGRldmljZSB2YXJpYWJsZSB0byBpdHMgcHJldmlvdXMgb3duZXIuXG4gIGRldmljZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHdpbmRvdy5kZXZpY2UgPSBwcmV2aW91c0RldmljZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBQcml2YXRlIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBTaW1wbGUgVUEgc3RyaW5nIHNlYXJjaFxuICBmaW5kID0gZnVuY3Rpb24gKG5lZWRsZSkge1xuICAgIHJldHVybiB1c2VyQWdlbnQuaW5kZXhPZihuZWVkbGUpICE9PSAtMTtcbiAgfTtcblxuICAvLyBDaGVjayBpZiBkb2N1bWVudEVsZW1lbnQgYWxyZWFkeSBoYXMgYSBnaXZlbiBjbGFzcy5cbiAgaGFzQ2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgdmFyIHJlZ2V4O1xuICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChjbGFzc05hbWUsICdpJyk7XG4gICAgcmV0dXJuIGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUubWF0Y2gocmVnZXgpO1xuICB9O1xuXG4gIC8vIEFkZCBvbmUgb3IgbW9yZSBDU1MgY2xhc3NlcyB0byB0aGUgPGh0bWw+IGVsZW1lbnQuXG4gIGFkZENsYXNzID0gZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgIHZhciBjdXJyZW50Q2xhc3NOYW1lcyA9IG51bGw7XG4gICAgaWYgKCFoYXNDbGFzcyhjbGFzc05hbWUpKSB7XG4gICAgICBjdXJyZW50Q2xhc3NOYW1lcyA9IGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgICAgZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZSA9IGN1cnJlbnRDbGFzc05hbWVzICsgXCIgXCIgKyBjbGFzc05hbWU7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlbW92ZSBzaW5nbGUgQ1NTIGNsYXNzIGZyb20gdGhlIDxodG1sPiBlbGVtZW50LlxuICByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICBpZiAoaGFzQ2xhc3MoY2xhc3NOYW1lKSkge1xuICAgICAgZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZSA9IGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUucmVwbGFjZShcIiBcIiArIGNsYXNzTmFtZSwgXCJcIik7XG4gICAgfVxuICB9O1xuXG4gIC8vIEhUTUwgRWxlbWVudCBIYW5kbGluZ1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBJbnNlcnQgdGhlIGFwcHJvcHJpYXRlIENTUyBjbGFzcyBiYXNlZCBvbiB0aGUgX3VzZXJfYWdlbnQuXG5cbiAgaWYgKGRldmljZS5pb3MoKSkge1xuICAgIGlmIChkZXZpY2UuaXBhZCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImlvcyBpcGFkIHRhYmxldFwiKTtcbiAgICB9IGVsc2UgaWYgKGRldmljZS5pcGhvbmUoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJpb3MgaXBob25lIG1vYmlsZVwiKTtcbiAgICB9IGVsc2UgaWYgKGRldmljZS5pcG9kKCkpIHtcbiAgICAgIGFkZENsYXNzKFwiaW9zIGlwb2QgbW9iaWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UuYW5kcm9pZCgpKSB7XG4gICAgaWYgKGRldmljZS5hbmRyb2lkVGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwiYW5kcm9pZCB0YWJsZXRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiYW5kcm9pZCBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS5ibGFja2JlcnJ5KCkpIHtcbiAgICBpZiAoZGV2aWNlLmJsYWNrYmVycnlUYWJsZXQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJibGFja2JlcnJ5IHRhYmxldFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkQ2xhc3MoXCJibGFja2JlcnJ5IG1vYmlsZVwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLndpbmRvd3MoKSkge1xuICAgIGlmIChkZXZpY2Uud2luZG93c1RhYmxldCgpKSB7XG4gICAgICBhZGRDbGFzcyhcIndpbmRvd3MgdGFibGV0XCIpO1xuICAgIH0gZWxzZSBpZiAoZGV2aWNlLndpbmRvd3NQaG9uZSgpKSB7XG4gICAgICBhZGRDbGFzcyhcIndpbmRvd3MgbW9iaWxlXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhcImRlc2t0b3BcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS5meG9zKCkpIHtcbiAgICBpZiAoZGV2aWNlLmZ4b3NUYWJsZXQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJmeG9zIHRhYmxldFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkQ2xhc3MoXCJmeG9zIG1vYmlsZVwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLm1lZWdvKCkpIHtcbiAgICBhZGRDbGFzcyhcIm1lZWdvIG1vYmlsZVwiKTtcbiAgfSBlbHNlIGlmIChkZXZpY2Uubm9kZVdlYmtpdCgpKSB7XG4gICAgYWRkQ2xhc3MoXCJub2RlLXdlYmtpdFwiKTtcbiAgfSBlbHNlIGlmIChkZXZpY2UudGVsZXZpc2lvbigpKSB7XG4gICAgYWRkQ2xhc3MoXCJ0ZWxldmlzaW9uXCIpO1xuICB9IGVsc2UgaWYgKGRldmljZS5kZXNrdG9wKCkpIHtcbiAgICBhZGRDbGFzcyhcImRlc2t0b3BcIik7XG4gIH1cblxuICBpZiAoZGV2aWNlLmNvcmRvdmEoKSkge1xuICAgIGFkZENsYXNzKFwiY29yZG92YVwiKTtcbiAgfVxuXG4gIC8vIE9yaWVudGF0aW9uIEhhbmRsaW5nXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gSGFuZGxlIGRldmljZSBvcmllbnRhdGlvbiBjaGFuZ2VzLlxuICBoYW5kbGVPcmllbnRhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZGV2aWNlLmxhbmRzY2FwZSgpKSB7XG4gICAgICByZW1vdmVDbGFzcyhcInBvcnRyYWl0XCIpO1xuICAgICAgYWRkQ2xhc3MoXCJsYW5kc2NhcGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZUNsYXNzKFwibGFuZHNjYXBlXCIpO1xuICAgICAgYWRkQ2xhc3MoXCJwb3J0cmFpdFwiKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9O1xuXG4gIC8vIERldGVjdCB3aGV0aGVyIGRldmljZSBzdXBwb3J0cyBvcmllbnRhdGlvbmNoYW5nZSBldmVudCxcbiAgLy8gb3RoZXJ3aXNlIGZhbGwgYmFjayB0byB0aGUgcmVzaXplIGV2ZW50LlxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHdpbmRvdywgXCJvbm9yaWVudGF0aW9uY2hhbmdlXCIpKSB7XG4gICAgb3JpZW50YXRpb25FdmVudCA9IFwib3JpZW50YXRpb25jaGFuZ2VcIjtcbiAgfSBlbHNlIHtcbiAgICBvcmllbnRhdGlvbkV2ZW50ID0gXCJyZXNpemVcIjtcbiAgfVxuXG4gIC8vIExpc3RlbiBmb3IgY2hhbmdlcyBpbiBvcmllbnRhdGlvbi5cbiAgaWYgKHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIob3JpZW50YXRpb25FdmVudCwgaGFuZGxlT3JpZW50YXRpb24sIGZhbHNlKTtcbiAgfSBlbHNlIGlmICh3aW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICB3aW5kb3cuYXR0YWNoRXZlbnQob3JpZW50YXRpb25FdmVudCwgaGFuZGxlT3JpZW50YXRpb24pO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvd1tvcmllbnRhdGlvbkV2ZW50XSA9IGhhbmRsZU9yaWVudGF0aW9uO1xuICB9XG5cbiAgaGFuZGxlT3JpZW50YXRpb24oKTtcblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZXZpY2U7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRldmljZTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cuZGV2aWNlID0gZGV2aWNlO1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiY29uc3QgYnVyZ2VyID0ge1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmJ1cmdlcicsICgpID0+IHtcdFx0XHRcblx0XHRcdCQoJy5uYXZpZ2F0aW9uJykudG9nZ2xlQ2xhc3MoJ25hdmlnYXRpb24tLW9wZW4nKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYnVyZ2VyOyIsImNvbnN0IGRvdFN0cmlwID0ge1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmRvdC1zdHJpcF9faW5wdXQnLCBldmVudCA9PiB7XG5cdFx0XHRzd2l0Y2ggKCQoZXZlbnQudGFyZ2V0KS5hdHRyKCdpZCcpKSB7XG5cdFx0XHRcdGNhc2UgJ2RvdENhcic6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAnb25lJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ2RvdExvcnJ5Jzpcblx0XHRcdFx0XHQkKCcuZG90LXN0cmlwX19ydW5uZXInKS5hdHRyKCdkYXRhLXBvcycsICd0d28nKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnZG90QnVzJzpcblx0XHRcdFx0XHQkKCcuZG90LXN0cmlwX19ydW5uZXInKS5hdHRyKCdkYXRhLXBvcycsICd0aHJlZScpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHQkKGV2ZW50LnRhcmdldClcblx0XHRcdFx0LmNsb3Nlc3QoJy5zbGlkZXInKVxuXHRcdFx0XHQuZmluZCgnLnNsaWRlLXBhY2snKVxuXHRcdFx0XHQuYXR0cignZGF0YS1zbGlkZXItcG9zJywgJChldmVudC50YXJnZXQpLmF0dHIoJ2RhdGEtZG90LXBvcycpKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZG90U3RyaXA7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdmFycyBmcm9tICcuLi8uLi9jb21waWxlL3ZhcnMnO1xuXG5jb25zdCBkcml2ZXJGb3JtID0ge1xuXHRidXN5XHRcdFx0XHQ6IGZhbHNlLFxuXHRmaWVsZHNDb3JyZWN0XHQ6IGZhbHNlLFxuXHRcblx0ZGF0YToge1xuXHRcdGZpcnN0X25hbWVcdFx0XHRcdDogJycsXG5cdFx0bGFzdF9uYW1lXHRcdFx0XHQ6ICcnLFxuXHRcdGVtYWlsXHRcdFx0XHRcdFx0OiAnJyxcblx0XHRwaG9uZVx0XHRcdFx0XHRcdDogJycsXG5cdFx0aG93X2RpZF95b3Vfa25vd1x0XHQ6ICcnLFxuXHRcdGNhcl95ZWFyXHRcdFx0XHRcdDogJycsXG5cdFx0Y2FyX3N0YXRlXHRcdFx0XHQ6ICcnLFxuXHRcdGNhcl9icmFuZFx0XHRcdFx0OiAnJyxcblx0XHRjYXJfbW9kZWxcdFx0XHRcdDogJycsXG5cdFx0Y2FyX2NvbG9yXHRcdFx0XHQ6ICcnLFxuXHRcdGF2Z19taWxlYWdlX2RheVx0XHQ6ICcnLFxuXHRcdGF2Z19taWxlYWdlX3dlZWtlbmRcdDogJycsXG5cdFx0Y29tbWVudFx0XHRcdFx0XHQ6ICcnLFxuXHR9LFxuXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdbZGF0YS13YXldJywgZXZlbnQgPT4ge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0Y29uc3QgZWxlbVx0XHRcdD0gZXZlbnQudGFyZ2V0O1xuXHRcdFx0Y29uc3QgcGFnZVx0XHRcdD0gJCgnLmRyaXZlci1mb3JtJyk7XG5cdFx0XHRjb25zdCBkYXRhUGFnZVx0XHQ9IE51bWJlcihwYWdlLmF0dHIoJ2RhdGEtcGFnZScpKTtcblx0XHRcdGNvbnN0IGN1cnJlbnRQYWdlXHQ9ICQoYC5kcml2ZXItZm9ybV9fcGFnZVtkYXRhLXBhZ2U9JHtkYXRhUGFnZX1dYCk7XG5cdFx0XHRjb25zdCBuZXh0UGFnZVx0XHQ9IGRhdGFQYWdlICsgMTtcblx0XHRcdGNvbnN0IHByZXZQYWdlXHRcdD0gZGF0YVBhZ2UgLSAxO1xuXG5cdFx0XHRpZiAoJChlbGVtKS5hdHRyKCdkYXRhLXdheScpID09PSAncHJldicpIHtcblx0XHRcdFx0aWYgKHByZXZQYWdlID09PSAxIHx8IHByZXZQYWdlID09PSAyKSB7XG5cdFx0XHRcdFx0cGFnZS5hdHRyKCdkYXRhLXBhZ2UnLCBwcmV2UGFnZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN3aXRjaCAoZGF0YVBhZ2UpIHtcblx0XHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0XHRkcml2ZXJGb3JtLmRhdGEuaG93X2RpZF95b3Vfa25vdyA9ICQoJyNob3dfZGlkX3lvdV9rbm93JykudmFsKCk7XG5cblx0XHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmxlbmd0aCAmJiAoJChlbCkuYXR0cignZGF0YS1jb3JyZWN0JykgIT09ICd0cnVlJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRQYWdlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5maW5kKCdbZGF0YS1tYXNrXScpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5lYWNoKChpbmRleCwgZWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoJChlbCkuYXR0cignZGF0YS1jb3JyZWN0JykgIT09ICd0cnVlJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JChlbCkuYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5maWVsZHNDb3JyZWN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5kYXRhWyQoZWwpLmF0dHIoJ2lkJyldID0gJChlbCkudmFsKCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZmllbGRzQ29ycmVjdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5kYXRhLnBob25lID0gZHJpdmVyRm9ybS5kYXRhLnBob25lLnJlcGxhY2UoL1xcRC9nLCAnJyk7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRcdGN1cnJlbnRQYWdlXG5cdFx0XHRcdFx0XHRcdC5maW5kKCdbZGF0YS1tYXNrXScpXG5cdFx0XHRcdFx0XHRcdC5lYWNoKChpbmRleCwgZWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoJChlbCkubGVuZ3RoICYmICQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcpICE9PSAndHJ1ZScpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRQYWdlXG5cdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JChlbCkuYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5maWVsZHNDb3JyZWN0ID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRQYWdlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5maW5kKCdbZGF0YS1maWxsZWRdJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmVhY2goKGluZGV4LCBlbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZGF0YVskKGVsKS5hdHRyKCdpZCcpXSA9ICQoZWwpLnZhbCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5maWVsZHNDb3JyZWN0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3dyb25nIHBhZ2UgbnVtYmVyJyk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChkcml2ZXJGb3JtLmZpZWxkc0NvcnJlY3QpIHtcblx0XHRcdFx0XHRzd2l0Y2ggKG5leHRQYWdlKSB7XG5cdFx0XHRcdFx0XHQvLyDQvdCwINC/0LXRgNCy0L7QuSDRgdGC0YDQsNC90LjRhtC1XG5cdFx0XHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0XHRcdC8vINC/0LXRgNC10LrQu9GO0YfQuNGC0Ywg0YHRgtGA0LDQvdC40YbRg1xuXHRcdFx0XHRcdFx0XHRwYWdlLmF0dHIoJ2RhdGEtcGFnZScsICcyJyk7XG5cdFx0XHRcdFx0XHRcdC8vINGB0LHRgNC+0YHQuNGC0Ywg0L/QtdGA0LXQvNC10L3QvdGD0Y5cblx0XHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5maWVsZHNDb3JyZWN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHQvLyDQvdCwINCy0YLQvtGA0L7QuSDRgdGC0YDQsNC90LjRhtC1XG5cdFx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRcdC8vINC/0LXRgNC10LrQu9GO0YfQuNGC0Ywg0YHRgtGA0LDQvdC40YbRg1xuXHRcdFx0XHRcdFx0XHRwYWdlLmF0dHIoJ2RhdGEtcGFnZScsICczJyk7XG5cdFx0XHRcdFx0XHRcdC8vINGB0LHRgNC+0YHQuNGC0Ywg0L/QtdGA0LXQvNC10L3QvdGD0Y5cblx0XHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5maWVsZHNDb3JyZWN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHQvLyDQvdCwINGC0YDQtdGC0YzQtdC5INGB0YLRgNCw0L3QuNGG0LVcblx0XHRcdFx0XHRcdGNhc2UgNDpcblx0XHRcdFx0XHRcdFx0Ly8g0LfQsNC/0YPRgdGC0LjRgtGMINGE0YPQvdC60YbQuNGOINC+0YLQv9GA0LDQstC60Lgg0YTQvtGA0LzRi1xuXHRcdFx0XHRcdFx0XHRkcml2ZXJGb3JtLnNlbmRGb3JtKCk7XG5cdFx0XHRcdFx0XHRcdC8vINGB0LHRgNC+0YHQuNGC0Ywg0L/QtdGA0LXQvNC10L3QvdGD0Y5cblx0XHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5maWVsZHNDb3JyZWN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnd3JvbmcgbmV4dCBwYWdlIG51bWJlcicpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRzZW5kRm9ybSgpIHtcblx0XHRpZiAoIWRyaXZlckZvcm0uYnVzeSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3N0YXJ0IHNlbmRpbmcgZm9ybScpO1xuXG5cdFx0XHRkcml2ZXJGb3JtLmJ1c3kgPSB0cnVlO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmxcdDogdmFycy5zZXJ2ZXIgKyB2YXJzLmFwaS5iZWNvbWVEcml2ZXIsXG5cdFx0XHRcdHR5cGVcdDogJ1BPU1QnLFxuXHRcdFx0XHRkYXRhXHQ6IGRyaXZlckZvcm0uZGF0YSxcblx0XHRcdH0pXG5cdFx0XHRcdC5zdWNjZXNzKHJlc3VsdCA9PiB7XG5cdFx0XHRcdFx0JCgnLm1lc3NhZ2UtLXN1Y2Nlc3MnKS5hZGRDbGFzcygnbWVzc2FnZS0tc2hvdycpO1xuXG5cdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C40YLRjCDRgdGC0YDQsNC90LjRhtGDXG5cdFx0XHRcdFx0JCgnLmRyaXZlci1mb3JtJykuYXR0cignZGF0YS1wYWdlJywgJzEnKTtcblxuXHRcdFx0XHRcdC8vINC+0YfQuNGB0YLQutCwINC/0L7Qu9C10Lkg0YTQvtGA0LzRi1xuXHRcdFx0XHRcdCQoJ1tkYXRhLWZpZWxkLXR5cGVdJylcblx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuXHRcdFx0XHRcdFx0XHQkKGVsKVxuXHRcdFx0XHRcdFx0XHRcdC52YWwoJycpXG5cdFx0XHRcdFx0XHRcdFx0LmF0dHIoJ2RhdGEtZmlsbGVkJywgJ2ZhbHNlJylcblx0XHRcdFx0XHRcdFx0XHQuYXR0cignZGF0YS1jb3JyZWN0JywgJ251bGwnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0ZHJpdmVyRm9ybS5idXN5ID0gZmFsc2U7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZygnZm9ybSBoYXMgYmVlZCBzZW50Jyk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mYWlsKGVycm9yID0+IHtcblx0XHRcdFx0XHQkKCcubWVzc2FnZS0tZmFpbCcpLmFkZENsYXNzKCdtZXNzYWdlLS1zaG93Jyk7XG5cdFx0XHRcdFx0aWYgKGVycm9yLnJlc3BvbnNlVGV4dCkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3NlcnZlcnMgYW5zd2VyOlxcbicsZXJyb3IucmVzcG9uc2VUZXh0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ1VGTyBoYXZlIGludGVycnVwdGVkIG91ciBzZXJ2ZXJcXCdzIHdvcmtcXG53ZVxcJ2wgdHJ5IHRvIGZpeCBpdCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcml2ZXJGb3JtLmJ1c3kgPSBmYWxzZTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkcml2ZXJGb3JtOyIsImltcG9ydCB2YXJzIGZyb20gJy4uLy4uL2NvbXBpbGUvdmFycyc7XG5cbmNvbnN0IGdhbGxlcnkgPSB7XG5cdG51bVRvTG9hZDogMTAsXG5cdGNvbnRhaW5lcjogJCgnLmdhbGxlcnknKSxcblx0bG9hZGVyXHQ6ICQoJy5nYWxsZXJ5X19sb2FkaW5nJyksXG5cdG1vcmVCdG5cdDogJCgnLmdhbGxlcnlfX2J0bicpLFxuXHRidXN5XHRcdDogdHJ1ZSxcblx0d2F0Y2hlZFx0OiBmYWxzZSxcblx0XG5cdHVybHM6IHtcblx0XHRhbGxcdDogW10sXG5cdFx0dG9QdXNoOiBbXSxcblx0fSxcblxuXHRpdGVtczoge1xuXHRcdHRvUHVzaDogbnVsbCxcblx0fSxcblx0LyoqXG5cdCAqINC/0L7Qu9GD0YfQtdC90LjQtSDRgdC/0LjRgdC60LAg0LjQt9C+0LHRgNCw0LbQtdC90LjQuVxuXHQgKi9cblx0Z2V0VXJscygpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc3VsdCwgZXJyb3IpID0+IHtcblx0XHRcdGxldCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdFx0XHRyZXF1ZXN0Lm9wZW4oJ1BPU1QnLCB2YXJzLnNlcnZlciArIHZhcnMuYXBpLmdhbGxlcnkpO1xuXHRcdFx0cmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcpO1xuXHRcdFx0cmVxdWVzdC5vbmxvYWQgPSAoKSA9PiB7XG5cdFx0XHRcdGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0cmVzdWx0KEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGVycm9yKEVycm9yKCdJbWFnZSBkaWRuXFwndCBsb2FkIHN1Y2Nlc3NmdWxseTsgZXJyb3IgY29kZTonICsgcmVxdWVzdC5zdGF0dXNUZXh0KSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRyZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiB7XG5cdFx0XHRcdGVycm9yKEVycm9yKCdUaGVyZSB3YXMgYSBuZXR3b3JrIGVycm9yLicpKTtcblx0XHRcdH07XG5cblx0XHRcdHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeSh7dGFnczogWydtYWluJ119KSk7XG5cdFx0fSk7XG5cdH0sXG5cdGxvYWRTdGFydCgpIHtcblx0XHR0aGlzLmJ1c3kgPSB0cnVlO1xuXHRcdHRoaXMubG9hZGVyLnNob3coKTtcblx0fSxcblx0bG9hZEVuZCgpIHtcblx0XHR0aGlzLmJ1c3kgPSBmYWxzZTtcblx0XHR0aGlzLmxvYWRlci5oaWRlKCk7XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0L3QuNC1INC60LDRgNGC0LjQvdC+0Log0LIg0JTQntCc0LVcblx0ICogQHBhcmFtICB7Qm9vbGVhbn0gaXNGaXJzdCDQv9C10YDQstGL0Lkg0LvQuCDQstGL0LfQvtCyINGE0YPQvdC60YbQuNC4XG5cdCAqL1xuXHRtYWtlSW1ncyhpc0ZpcnN0KSB7XG5cdFx0aWYgKCF0aGlzLnVybHMuYWxsLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICghaXNGaXJzdCkge1xuXHRcdFx0dGhpcy5sb2FkU3RhcnQoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy51cmxzLmFsbC5sZW5ndGggPj0gdGhpcy5udW1Ub0xvYWQpIHtcblx0XHRcdHRoaXMudXJscy50b1B1c2ggPSB0aGlzLnVybHMuYWxsLnNwbGljZSgtdGhpcy5udW1Ub0xvYWQsIHRoaXMubnVtVG9Mb2FkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy51cmxzLnRvUHVzaCA9IHRoaXMudXJscy5hbGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5pdGVtcy50b1B1c2ggPSAkKHRoaXMudXJscy50b1B1c2guam9pbignJykpO1xuXHRcdHRoaXMudXJscy50b1B1c2gubGVuZ3RoID0gMDtcblxuXHRcdGlmIChpc0ZpcnN0KSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclxuXHRcdFx0XHQubWFzb25yeSh7XG5cdFx0XHRcdFx0Y29sdW1uV2lkdGhcdFx0OiAnLmdhbGxlcnlfX2l0ZW0nLFxuXHRcdFx0XHRcdGlzQW5pbWF0ZWRcdFx0OiB0cnVlLFxuXHRcdFx0XHRcdGlzSW5pdExheW91dFx0OiB0cnVlLFxuXHRcdFx0XHRcdGlzUmVzaXphYmxlXHRcdDogdHJ1ZSxcblx0XHRcdFx0XHRpdGVtU2VsZWN0b3JcdDogJy5nYWxsZXJ5X19pdGVtJyxcblx0XHRcdFx0XHRwZXJjZW50UG9zaXRpb246IHRydWUsXG5cdFx0XHRcdFx0c2luZ2xlTW9kZVx0XHQ6IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5hcHBlbmQodGhpcy5pdGVtcy50b1B1c2gpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy5pdGVtcy50b1B1c2gpO1xuXHRcdH1cblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoXG5cdFx0XHQuaGlkZSgpXG5cdFx0XHQuaW1hZ2VzTG9hZGVkKClcblx0XHRcdC5wcm9ncmVzcygoaW1nTG9hZCwgaW1hZ2UpID0+IHtcblx0XHRcdFx0Y29uc3QgJGl0ZW0gPSAkKGltYWdlLmltZykucGFyZW50cygnLmdhbGxlcnlfX2l0ZW0nKTtcblxuXHRcdFx0XHRpZiAodGhpcy5sb2FkZXIuaGFzQ2xhc3MoJ2dhbGxlcnlfX2xvYWRpbmctLWZpcnN0JykpIHtcblx0XHRcdFx0XHR0aGlzLmxvYWRlci5yZW1vdmVDbGFzcygnZ2FsbGVyeV9fbG9hZGluZy0tZmlyc3QnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCRpdGVtLnNob3coKTtcblxuXHRcdFx0XHR0aGlzLmNvbnRhaW5lclxuXHRcdFx0XHRcdC5tYXNvbnJ5KCdhcHBlbmRlZCcsICRpdGVtKVxuXHRcdFx0XHRcdC5tYXNvbnJ5KCk7XG5cdFx0XHR9KVxuXHRcdFx0LmRvbmUoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmxvYWRFbmQoKTtcblx0XHRcdFx0dGhpcy5vblNjcm9sbCgpO1xuXG5cdFx0XHRcdGlmICghdGhpcy53YXRjaGVkKSB7XG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7dGhpcy5vblNjcm9sbCgpfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0dGhpcy5pdGVtcy50b1B1c2gubGVuZ3RoID0gMDtcblx0fSxcblx0LyoqXG5cdCAqINC90LDQstC10YjQuNCy0LDQtdC80LDRjyDQvdCwINGB0LrRgNC+0LvQuyDRhNGD0L3QutGG0LjRj1xuXHQgKiDQt9Cw0L/Rg9GB0LrQsNC10YIg0L/QvtC00LPRgNGD0LfQutGDINGE0L7RgtC+0Log0LXRgdC00Lgg0L3QsNC00L5cblx0ICovXG5cdG9uU2Nyb2xsKCkge1xuXHRcdGNvbnN0IHBhZ2VIZWlnaHRcdFx0PSAkKGRvY3VtZW50KS5oZWlnaHQoKTtcblx0XHRjb25zdCB3aW5kb3dIZWlnaHRcdD0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXHRcdGNvbnN0IHdpbmRvd1Njcm9sbFx0PSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cdFx0Y29uc3QgbGVmdFRvQm90dG9tXHQ9XHRwYWdlSGVpZ2h0IC0gd2luZG93SGVpZ2h0IC0gd2luZG93U2Nyb2xsO1xuXG5cdFx0aWYgKCF0aGlzLmJ1c3kgJiYgdGhpcy51cmxzLmFsbC5sZW5ndGggJiYgbGVmdFRvQm90dG9tIDw9IDMwMCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3Njcm9sbCBsb2FkJyk7XG5cdFx0XHR0aGlzLm1ha2VJbWdzKCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5nZXRVcmxzKClcblx0XHRcdC50aGVuKFxuXHRcdFx0XHRyZXN1bHQgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdnb3QgaW1hZ2VzJyk7XG5cdFx0XHRcdFx0dGhpcy51cmxzLmFsbCA9IHJlc3VsdC5yZXZlcnNlKCk7XG5cblx0XHRcdFx0XHR0aGlzLnVybHMuYWxsLmZvckVhY2goKGVsZW0sIGkpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMudXJscy5hbGxbaV0gPSAnPGRpdiBkYXRhLXVybD1cIicgKyB2YXJzLnNlcnZlciArIGVsZW0gK1xuXHRcdFx0XHRcdFx0XHQnXCIgY2xhc3M9XCJnYWxsZXJ5X19pdGVtXCI+PGltZyBzcmM9XCInICsgdmFycy5zZXJ2ZXIgKyBlbGVtICtcblx0XHRcdFx0XHRcdFx0J1wiIGFsdD48ZGl2IGNsYXNzPVwiZ2FsbGVyeV9fZGFya25lc3NcIj48L2Rpdj48L2Rpdj4nO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dGhpcy5tYWtlSW1ncyh0cnVlKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3IgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yLCAnZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2FsbGVyeTsiLCJjb25zdCBpbnB1dCA9IHtcblx0LyoqXG5cdCAqINC90LDQstC10YjQuNCy0LDQtdGCINGB0L7QsdGL0YLQuNGPINC90LAg0LjQvdC/0YPRglxuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2JsdXInLCAnLmlucHV0X19pbnB1dCcsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSBldmVudC50YXJnZXQ7XG5cblx0XHRcdGlmICgkKGVsZW0pLnZhbCgpKSB7XG5cdFx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1maWxsZWQnLCAndHJ1ZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWZpbGxlZCcsICdmYWxzZScpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdrZXl1cCcsICdbZGF0YS1tYXNrPVxcJ3RlbFxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0XHQkKGVsZW0pLnZhbChpbnB1dC5mb3JtYXQoJChlbGVtKS52YWwoKSwgJ3RlbCcpKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnW2RhdGEtbWFzaz1cXCd0ZWxcXCddJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9IGV2ZW50LnRhcmdldDtcblxuXHRcdFx0JChlbGVtKS52YWwoaW5wdXQuZm9ybWF0KCQoZWxlbSkudmFsKCksICd0ZWwnKSk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwneWVhclxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0XHQkKGVsZW0pLnZhbChpbnB1dC5mb3JtYXQoJChlbGVtKS52YWwoKSwgJ3llYXInKSk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwnbnVtYmVyXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSBldmVudC50YXJnZXQ7XG5cblx0XHRcdCQoZWxlbSkudmFsKGlucHV0LmZvcm1hdCgkKGVsZW0pLnZhbCgpLCAnbnVtYmVyJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdibHVyJywgJ1tkYXRhLW1hc2tdJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9IGV2ZW50LnRhcmdldDtcblxuXHRcdFx0c3dpdGNoICgkKGVsZW0pLmF0dHIoJ2RhdGEtbWFzaycpKSB7XG5cdFx0XHRcdGNhc2UgJ2VtYWlsJzpcblx0XHRcdFx0XHRpZiAoLy4rQC4rXFwuLisvaS50ZXN0KCQoZWxlbSkudmFsKCkpKSB7XG5cdFx0XHRcdFx0XHQkKGVsZW0pLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ3RlbCc6XG5cdFx0XHRcdFx0Ly8gL14oW1xcK10rKSpbMC05XFx4MjBcXHgyOFxceDI5XFwtXXs3LDExfSQvXG5cdFx0XHRcdFx0aWYgKCQoZWxlbSkudmFsKCkubGVuZ3RoID09PSAxOCkge1xuXHRcdFx0XHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkKGVsZW0pLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICduYW1lJzpcblx0XHRcdFx0XHRpZiAoL15bYS16QS1a0LAt0Y/RkdCQLdCv0IFdW2EtekEtWtCwLdGP0ZHQkC3Qr9CBMC05LV9cXC5dezEsMjB9JC8udGVzdCgkKGVsZW0pLnZhbCgpKSkge1xuXHRcdFx0XHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkKGVsZW0pLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdlbXB0eSc6XG5cdFx0XHRcdGNhc2UgJ3RleHQnOlxuXHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdGlmICgkKGVsZW0pLnZhbCgpKSB7XG5cdFx0XHRcdFx0XHQkKGVsZW0pLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1jb3JyZWN0JywgJ2VtcHR5Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ3llYXInOlxuXHRcdFx0XHRcdGlmICgkKGVsZW0pLnZhbCgpICYmXG5cdFx0XHRcdFx0XHRwYXJzZUludCgkKGVsZW0pLnZhbCgpKSA+PSAxOTAwICYmXG5cdFx0XHRcdFx0XHRwYXJzZUludCgkKGVsZW0pLnZhbCgpKSA8PSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdFx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2lucHV0JywgJ1tkYXRhLW1hc2tdJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9IGV2ZW50LnRhcmdldDtcblxuXHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnbnVsbCcpO1xuXHRcdH0pO1xuXHR9LFxuXG5cblx0LyoqXG5cdCAqINGE0L7RgNC80LDRgtC40YDRg9C10YIg0LfQvdCw0YfQtdC90LjQtSDQsiDQuNC90L/Rg9GC0LVcblx0ICogQHBhcmFtICB7c3RyaW5nfSBkYXRhICAg0LfQvdCw0YfQtdC90LjQtSDQsiDQuNC90L/Rg9GC0LVcblx0ICogQHBhcmFtICB7c3RyaW5nfSBmb3JtYXQg0LjQvNGPINGE0L7RgNC80LDRgtCwXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgINC+0YLRhNC+0YDQvNCw0YLQuNGA0L7QstCw0L3QvdC+0LUg0LfQvdCw0YfQtdC90LjQtVxuXHQgKi9cblx0Zm9ybWF0KGRhdGEsIGZvcm1hdCkge1xuXHRcdHN3aXRjaCAoZm9ybWF0KSB7XG5cdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRyZXR1cm4gZGF0YS5yZXBsYWNlKC9cXEQvZywgJycpO1xuXG5cdFx0XHRjYXNlICd5ZWFyJzpcblx0XHRcdFx0ZGF0YSA9IGlucHV0LmZvcm1hdChkYXRhLCAnbnVtYmVyJyk7XG5cblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoID4gNCkge1xuXHRcdFx0XHRcdGRhdGEgPSBkYXRhLnNsaWNlKDAsIDQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cblx0XHRcdGNhc2UgJ3RlbCc6XG5cdFx0XHRcdGRhdGEgPSBpbnB1dC5mb3JtYXQoZGF0YSwgJ251bWJlcicpO1xuXG5cdFx0XHRcdGxldCBuZXdEYXRhID0gJyc7XG5cblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoIDw9IDExKSB7XG5cdFx0XHRcdFx0c3dpdGNoKGRhdGEubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRjYXNlIDA6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCc7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0XHRpZihkYXRhWzBdICE9PSAnNycpIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVswXTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM107XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDY6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDc6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA4OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XSArIGRhdGFbNV0gKyBkYXRhWzZdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzddO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgOTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxMDpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbOV07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxMTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbOV0gKyBkYXRhWzEwXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzddICsgZGF0YVs4XSArXG5cdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzldICsgZGF0YVsxMF07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG5ld0RhdGE7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd3cm9uZyBpbnB1dCBmb3JtYXQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dDsiLCJjb25zdCBtYXAgPSB7XG5cdGluaXQoKSB7XG5cdFx0JCgnI21hcCcpLmxhenlsb2FkKHtcblx0XHRcdHRocmVzaG9sZDogMjAwLFxuXHRcdFx0ZWZmZWN0XHQ6ICdmYWRlSW4nLFxuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYXA7IiwiY29uc3QgbWVzc2FnZSA9IHtcblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tZXNzYWdlX19iZywgLm1lc3NhZ2VfX2Nsb3NlJywgZXZlbnQgPT4ge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFxuXHRcdFx0JChlbGVtKVxuXHRcdFx0XHQuY2xvc2VzdCgnLm1lc3NhZ2UnKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ21lc3NhZ2UtLXNob3cnKTtcblx0XHR9KTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZXNzYWdlOyIsImNvbnN0IHBpbiA9IHtcblx0c2VjXHRcdDogNTU1NTUsXG5cdGhvdXJzXHRcdDogbmV3IERhdGUoKS5nZXRIb3VycygpLFxuXHRtaW51dGVzXHQ6IG5ldyBEYXRlKCkuZ2V0TWludXRlcygpLFxuXHRzZWNvbmRzXHQ6IG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpLFxuXHQvKipcblx0ICog0YHRh9C10YLRh9C40LosINGD0LLQtdC70LjRh9C40LLQsNC10YIg0LLRgNC10LzRj1xuXHQgKi9cblx0Y291bnRkb3duKCkge1xuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCddJykudGV4dChNYXRoLmZsb29yKHBpbi5zZWMvMzYwMCkpO1xuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ21cXCddJykudGV4dChNYXRoLmZsb29yKHBpbi5zZWMlMzYwMC82MCkpO1xuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ3NcXCddJykudGV4dChNYXRoLmZsb29yKHBpbi5zZWMlMzYwMCU2MCkpO1xuXG5cdFx0cGluLnNlYyArPSAxO1xuXHR9LFxuXHQvKipcblx0ICog0LTQvtCx0LDQstC70Y/QtdGCINC6INGG0LjRhNGA0LUg0L3QvtC70YwsINGH0YLQvtCxINC/0L7Qu9GD0YfQuNGC0Ywg0LTQstGD0LfQvdCw0YfQvdC+0LUg0YfQuNGB0LvQvlxuXHQgKiBAcGFyYW0gIHtudW1iZXJ9IG51bWJlciDRhtC40YTRgNCwINC40LvQuCDRh9C40YHQu9C+XG5cdCAqIEByZXR1cm4ge251bWJlcn0gICAgICAgINC00LLRg9C30L3QsNGH0L3QvtC1INGH0LjRgdC70L5cblx0ICovXG5cdHR3b051bWJlcnMobnVtYmVyKSB7XG5cdFx0aWYgKG51bWJlciA8IDEwKSB7XG5cdFx0XHRudW1iZXIgPSAnMCcgKyBudW1iZXIudG9TdHJpbmcoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG51bWJlcjtcblx0fSxcblxuXHRzZXRUaW1lKCkge1xuXHRcdHBpbi5ob3VycyA9IG5ldyBEYXRlKCkuZ2V0SG91cnMoKTtcblx0XHRcdFx0XG5cdFx0JCgnW2RhdGEtY2xvY2s9XFwnaFxcJycpLnRleHQocGluLnR3b051bWJlcnMocGluLmhvdXJzKSk7XG5cblx0XHRwaW4ubWludXRlcyA9IG5ldyBEYXRlKCkuZ2V0TWludXRlcygpO1xuXHRcdFxuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ21cXCcnKS50ZXh0KHBpbi50d29OdW1iZXJzKHBpbi5taW51dGVzKSk7XG5cblx0XHRwaW4uc2Vjb25kcyA9IG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpO1xuXHRcdFxuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ3NcXCcnKS50ZXh0KHBpbi50d29OdW1iZXJzKHBpbi5zZWNvbmRzKSk7XG5cdH0sXG5cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLnBpbicsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGxldCBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0XHRpZiAoISQoZWxlbSkuaGFzQ2xhc3MoJ3BpbicpKSB7XG5cdFx0XHRcdGVsZW0gPSAkKGVsZW0pLmNsb3Nlc3QoJy5waW4nKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0JChlbGVtKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3Bpbi0tc2hvdycpXG5cdFx0XHRcdC5jc3MoJ3otaW5kZXgnLCAnMicpXG5cdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdC5yZW1vdmVDbGFzcygncGluLS1zaG93Jylcblx0XHRcdFx0LmNzcygnei1pbmRleCcsICcxJyk7XG5cdFx0fSk7XG5cblx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdkZXNrdG9wJykpIHtcblx0XHRcdGxldCBuZXdEYXRlID0gbmV3IERhdGUoKTtcblxuXHRcdFx0bmV3RGF0ZS5zZXREYXRlKG5ld0RhdGUuZ2V0RGF0ZSgpKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnaFxcJycpLnRleHQocGluLmhvdXJzKTtcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ21cXCcnKS50ZXh0KHBpbi5taW51dGVzKTtcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ3NcXCcnKS50ZXh0KHBpbi5zZWNvbmRzKTtcblxuXHRcdFx0c2V0SW50ZXJ2YWwocGluLnNldFRpbWUsIDEwMDApO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCddJylcblx0XHRcdFx0LnRleHQoTWF0aC5mbG9vcihwaW4uc2VjLzM2MDApIDwgMTAgP1xuXHRcdFx0XHRcdFx0XHQnMCcgKyBNYXRoLmZsb29yKHBpbi5zZWMvMzYwMCkgOlxuXHRcdFx0XHRcdFx0XHRNYXRoLmZsb29yKHBpbi5zZWMvMzYwMCkpO1xuXG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnXScpXG5cdFx0XHRcdC50ZXh0KE1hdGguZmxvb3IocGluLnNlYyUzNjAwLzYwKSA8IDEwID9cblx0XHRcdFx0XHRcdFx0JzAnICsgTWF0aC5mbG9vcihwaW4uc2VjJTM2MDAvNjApIDpcblx0XHRcdFx0XHRcdFx0TWF0aC5mbG9vcihwaW4uc2VjJTM2MDAvNjApKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJ10nKVxuXHRcdFx0XHQudGV4dChNYXRoLmZsb29yKHBpbi5zZWMlMzYwMCU2MCkgPCAxMCA/XG5cdFx0XHRcdFx0XHRcdCcwJyArIE1hdGguZmxvb3IocGluLnNlYyUzNjAwJTYwKSA6XG5cdFx0XHRcdFx0XHRcdE1hdGguZmxvb3IocGluLnNlYyUzNjAwJTYwKSk7XG5cblx0XHRcdHBpbi5zZWMgKz0gMTtcblxuXHRcdFx0c2V0SW50ZXJ2YWwocGluLmNvdW50ZG93biwgMTAwMCk7XG5cdFx0fVxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwaW47IiwiY29uc3QgcXVlc3Rpb24gPSB7XG5cdGluaXQoKSB7XG5cdFx0JCgnLnF1ZXN0aW9uc19faXRlbScpLmVxKDEpLmhpZGUoKTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLm1haW4tYnRuLS1oZGl3JywgZXZlbnQgPT4ge1xuXHRcdFx0bGV0IGVsZW0gPSBldmVudC50YXJnZXQ7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRpZiAoISQoZWxlbSkuaGFzQ2xhc3MoJ21haW4tYnRuLS1oZGl3JykpIHtcblx0XHRcdFx0ZWxlbSA9ICQoZWxlbSkuY2xvc2VzdCgnLm1haW4tYnRuLS1oZGl3Jyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmICghJChlbGVtKS5oYXNDbGFzcygnbWFpbi1idG4tLWFjdGl2ZScpKSB7XG5cdFx0XHRcdCQoZWxlbSlcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ21haW4tYnRuLS1hY3RpdmUnKVxuXHRcdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCdtYWluLWJ0bi0tYWN0aXZlJyk7XG5cdFx0XHRcblx0XHRcdFx0JCgnLnF1ZXN0aW9uc19faXRlbScpXG5cdFx0XHRcdFx0LmVxKCQoZWxlbSkuaW5kZXgoKSAtIDIpXG5cdFx0XHRcdFx0LmZhZGVJbigzMDApXG5cdFx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0XHQuZmFkZU91dCgzMDApO1xuXG5cdFx0XHRcdCQoJy5xdWVzdGlvbnNfX2l0ZW0nKVxuXHRcdFx0XHRcdC5maW5kKCcucXVlc3Rpb25fX2JvZHknKVxuXHRcdFx0XHRcdC5zbGlkZVVwKDMwMCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5xdWVzdGlvbl9faGVhZGVyJywgZXZlbnQgPT4ge1xuXHRcdFx0bGV0IGVsZW0gPSBldmVudC50YXJnZXQ7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRpZiAoISQoZWxlbSkuaGFzQ2xhc3MoJ3F1ZXN0aW9uX19oZWFkZXInKSkge1xuXHRcdFx0XHRlbGVtID0gZWxlbS5jbG9zZXN0KCcucXVlc3Rpb25fX2hlYWRlcicpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQkKGVsZW0pXG5cdFx0XHRcdC5zaWJsaW5ncygnLnF1ZXN0aW9uX19ib2R5Jylcblx0XHRcdFx0LnNsaWRlVG9nZ2xlKDMwMClcblx0XHRcdFx0LmNsb3Nlc3QoJy5xdWVzdGlvbicpXG5cdFx0XHRcdC5zaWJsaW5ncygnLnF1ZXN0aW9uJylcblx0XHRcdFx0LmZpbmQoJy5xdWVzdGlvbl9fYm9keScpXG5cdFx0XHRcdC5zbGlkZVVwKDMwMCk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHF1ZXN0aW9uOyIsImNvbnN0IHNjcm9sbEJ0biA9IHtcblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zY3JvbGwtYnRuJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9IGV2ZW50LnRhcmdldDtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcblx0XHRcdCQoJ2h0bWwsIGJvZHknKVxuXHRcdFx0XHQuYW5pbWF0ZShcblx0XHRcdFx0XHR7c2Nyb2xsVG9wOiAkKGVsZW0pLmNsb3Nlc3QoJy5zZWN0aW9uJykub3V0ZXJIZWlnaHQoKX0sXG5cdFx0XHRcdFx0NzAwKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2Nyb2xsQnRuOyIsImNvbnN0IHNlYXJjaCA9IHtcblx0bmVlZGVkU2Nyb2xsOiBudWxsLFxuXHRzdGFydGVkXHRcdDogZmFsc2UsXG5cblx0aW5pdCgpIHtcblx0XHRzZWFyY2gubmVlZGVkU2Nyb2xsID0gJCgnLnNlYXJjaCcpLm9mZnNldCgpLnRvcCAtICQod2luZG93KS5oZWlnaHQoKSArICQoJy5zZWFyY2gnKS5oZWlnaHQoKSAvIDI7XG5cdFx0XG5cdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7XG5cdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49IHNlYXJjaC5uZWVkZWRTY3JvbGwgJiYgIXNlYXJjaC5zdGFydGVkKSB7XG5cdFx0XHRcdCQoJy5zZWFyY2gnKS5hZGRDbGFzcygnc2VhcmNoLS1hbmltYXRlJyk7XG5cdFx0XHRcdHNlYXJjaC5zdGFydGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2VhcmNoOyIsImNvbnN0IHNsaWRlUGFjayA9IHtcblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJ1tkYXRhLXBhZy1wb3NdJywgZXZlbnQgPT4ge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0JChldmVudC50YXJnZXQpXG5cdFx0XHRcdC5hZGRDbGFzcygnc2xpZGUtcGFja19fcGFnLS1hY3RpdmUnKVxuXHRcdFx0XHQuc2libGluZ3MoKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3NsaWRlLXBhY2tfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LmNsb3Nlc3QoJy5zbGlkZS1wYWNrX19wYWdzJylcblx0XHRcdFx0LnNpYmxpbmdzKCdbZGF0YS1zbGlkZXItcG9zXScpXG5cdFx0XHRcdC5hdHRyKCdkYXRhLXNsaWRlci1wb3MnLCAkKGV2ZW50LnRhcmdldCkuYXR0cignZGF0YS1wYWctcG9zJykpO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzbGlkZVBhY2s7IiwiY29uc3QgdGFibGV0ID0ge1xuXHRtb2JPbmVcdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtbW9iLXgxJyksXG5cdG1vYlR3b1x0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS1tb2IteDInKSxcblx0bW9iVGhyZWVcdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtbW9iLXgzJyksXG5cdHRhYk9uZVx0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS10YWIteDEnKSxcblx0dGFiVHdvXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLXRhYi14MicpLFxuXHR0YWJUaHJlZVx0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS10YWIteDMnKSxcblxuXHRpbml0KCkge1xuXHRcdGlmICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAzKSB7XG5cdFx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSkge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRhYmxldC5tb2JUaHJlZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRhYmxldC50YWJUaHJlZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyKSB7XG5cdFx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSkge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRhYmxldC5tb2JUd28pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0YWJsZXQudGFiVHdvKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgIHtcblx0XHRcdGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpKSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGFibGV0Lm1vYk9uZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRhYmxldC50YWJPbmUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdCQoJyN0YWJsZXQnKS5sYXp5bG9hZCh7XG5cdFx0XHR0aHJlc2hvbGQ6IDIwMCxcblx0XHRcdGVmZmVjdFx0OiAnZmFkZUluJyxcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdGFibGV0OyIsImNvbnN0IHVwQnRuID0ge1xuXHRzZXRWaXNpYmlsaXR5KCkge1xuXHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPj0gODAwKSB7XG5cdFx0XHQkKCcudXAtYnRuJykuYWRkQ2xhc3MoJ3VwLWJ0bi0tc2hvdycpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCcudXAtYnRuJykucmVtb3ZlQ2xhc3MoJ3VwLWJ0bi0tc2hvdycpO1xuXHRcdH1cblx0fSxcblx0aW5pdCgpIHtcblx0XHR1cEJ0bi5zZXRWaXNpYmlsaXR5KCk7XG5cblx0XHQkKHdpbmRvdykuc2Nyb2xsKCgpID0+IHtcblx0XHRcdHVwQnRuLnNldFZpc2liaWxpdHkoKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLnVwLWJ0bicsICgpID0+IHtcblx0XHRcdCQoJ2h0bWwsIGJvZHknKVxuXHRcdFx0XHQuc3RvcCgpXG5cdFx0XHRcdC5hbmltYXRlKFxuXHRcdFx0XHRcdHtzY3JvbGxUb3A6IDB9LFxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGxUb3AoKS80KTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXBCdG47IiwiY29uc3Qgd2RTbGlkZXIgPSB7XG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcud2Qtc2xpZGVyX19wYWcnLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0JChlbGVtKVxuXHRcdFx0XHQuYWRkQ2xhc3MoJ3dkLXNsaWRlcl9fcGFnLS1hY3RpdmUnKVxuXHRcdFx0XHQuc2libGluZ3MoKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3dkLXNsaWRlcl9fcGFnLS1hY3RpdmUnKTtcblx0XHRcdFx0XG5cdFx0XHRpZiAoJChlbGVtKS5pbmRleCgpID09PSAxKSB7XG5cdFx0XHRcdCQoZWxlbSlcblx0XHRcdFx0XHQuY2xvc2VzdCgnLndkLXNsaWRlcicpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCd3ZC1zbGlkZXItLXR3bycpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChlbGVtKVxuXHRcdFx0XHRcdC5jbG9zZXN0KCcud2Qtc2xpZGVyJylcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3dkLXNsaWRlci0tdHdvJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdkU2xpZGVyOyIsImNvbnN0IHlhTWFwID0ge1xuXHRwb2ludHM6IFtdLFxuXHRtYXA6IHt9LFxuXHQvKipcblx0ICog0L7QsdGK0Y/QstC70Y/QtdGCINGC0L7Rh9C60LggKNC90LDQtNC+INCy0YvQv9C+0LvQvdGP0YLRjCDQv9C+0YHQu9C1INGB0L7Qt9C00LDQvdC40Y8g0LrQsNGA0YLRiylcblx0ICovXG5cdHNldFBvaW50cygpIHtcblx0XHR5YU1hcC5wb2ludHMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdGNvb3JkczogWzU5LjkyMDIyOTc1OTYyNzY5LCAzMC4zNzI5NTU5OTk5OTk5NzddLFxuXHRcdFx0XHR0aXRsZXM6IHtcblx0XHRcdFx0XHRoaW50Q29udGVudFx0XHQ6ICfQk9C70LDQstC90YvQuSDQvtGE0LjRgScsXG5cdFx0XHRcdFx0YmFsbG9vbkNvbnRlbnRcdDogJ9Ch0J/QsSwg0KHRg9Cy0L7RgNC+0LLRgdC60LjQuSDQv9GA0L7RgdC/0LXQutGCLCA2NdCxLCDQvtGE0LjRgSAxNicsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBhcmFtczoge1xuXHRcdFx0XHRcdGljb25MYXlvdXQ6IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeVxuXHRcdFx0XHRcdFx0LmNyZWF0ZUNsYXNzKCc8ZGl2IGNsYXNzPVxcJ3lhLW1hcF9faWNvbiB5YS1tYXBfX2ljb24tLXJlZFxcJz48L2Rpdj4nKSxcblxuXHRcdFx0XHRcdGljb25TaGFwZToge1xuXHRcdFx0XHRcdFx0dHlwZVx0XHRcdDogJ1JlY3RhbmdsZScsXG5cdFx0XHRcdFx0XHRjb29yZGluYXRlc1x0OiBbWy03LCAtNDBdLCBbMzMsIDBdXSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0Y29vcmRzOiBbNTkuOTQ0ODQwOTM3NzE5MzEsIDMwLjM4ODU5MDE2Njg0MDE2XSxcblx0XHRcdFx0dGl0bGVzOiB7XG5cdFx0XHRcdFx0aGludENvbnRlbnRcdFx0OiAn0JPQu9Cw0LLQvdGL0Lkg0L7RhNC40YEnLFxuXHRcdFx0XHRcdGJhbGxvb25Db250ZW50XHQ6ICfQodCf0LEsINCh0YPQstC+0YDQvtCy0YHQutC40Lkg0L/RgNC+0YHQv9C10LrRgiwgNjXQsSwg0L7RhNC40YEgMTYnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwYXJhbXM6IHtcblx0XHRcdFx0XHRpY29uTGF5b3V0OiB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3Rvcnlcblx0XHRcdFx0XHRcdC5jcmVhdGVDbGFzcygnPGRpdiBjbGFzcz1cXCd5YS1tYXBfX2ljb24geWEtbWFwX19pY29uLS1ibHVlXFwnPjwvZGl2PicpLFxuXG5cdFx0XHRcdFx0aWNvblNoYXBlOiB7XG5cdFx0XHRcdFx0XHR0eXBlXHRcdFx0OiAnUmVjdGFuZ2xlJyxcblx0XHRcdFx0XHRcdGNvb3JkaW5hdGVzXHQ6IFtbLTcsIC00MF0sIFszMywgMF1dLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdH1cblx0XHRdO1xuXHR9LFxuXHQvKipcblx0ICog0YHQvtC30LTQsNC10YIg0YLQvtGH0LrRgyDQvdCwINC60LDRgNGC0LVcblx0ICogQHBhcmFtIHtvYmpleHR9IHBvaW50INC+0LHRitC10LrRgiDRgSDQtNCw0L3QvdGL0LzQuCDRgtC+0YfQutC4XG5cdCAqL1xuXHRzZXRQb2ludChwb2ludCkge1xuXHRcdHlhTWFwLm1hcC5nZW9PYmplY3RzLmFkZChuZXcgeW1hcHMuUGxhY2VtYXJrKHBvaW50LmNvb3JkcywgcG9pbnQudGl0bGVzLCBwb2ludC5wYXJhbXMpKTtcblx0fSxcblx0LyoqXG5cdCAqINGB0L7Qt9C00LDQtdGCINC60LDRgNGC0YNcblx0ICovXG5cdHNldE1hcCgpIHtcblx0XHR5YU1hcC5tYXAgPSBuZXcgeW1hcHMuTWFwKCd5YU1hcCcsIHtcblx0XHRcdGNlbnRlcjogW1xuXHRcdFx0XHQ1OS45MzE1OTMyMjIzMzk4NCxcblx0XHRcdFx0MzAuMzc1MTQ0NjgyNTU2MTIyXG5cdFx0XHRdLFxuXHRcdFx0Y29udHJvbHM6IFtcblx0XHRcdFx0J3pvb21Db250cm9sJyxcblx0XHRcdF0sXG5cdFx0XHR6b29tOiAxMyxcblx0XHR9KTtcblxuXHRcdHlhTWFwLnNldFBvaW50cygpO1xuXG5cdFx0eWFNYXAucG9pbnRzLmZvckVhY2goZWxlbSA9PiB7XG5cdFx0XHR5YU1hcC5zZXRQb2ludChlbGVtKTtcblx0XHR9KTtcblxuXHRcdHlhTWFwLm1hcC5iZWhhdmlvcnMuZGlzYWJsZSgnc2Nyb2xsWm9vbScpO1xuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0eW1hcHMucmVhZHkoeWFNYXAuc2V0TWFwKTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0geWFNYXA7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZHJpdmVyRm9ybVx0ZnJvbSAnLi4vYmxvY2tzL2RyaXZlci1mb3JtL2RyaXZlci1mb3JtMic7XG5pbXBvcnQgaW5wdXRcdFx0ZnJvbSAnLi4vYmxvY2tzL2lucHV0L2lucHV0Mic7XG5pbXBvcnQgbWVzc2FnZVx0XHRmcm9tICcuLi9ibG9ja3MvbWVzc2FnZS9tZXNzYWdlJztcbmltcG9ydCBidXJnZXJcdFx0ZnJvbSAnLi4vYmxvY2tzL2J1cmdlci9idXJnZXInO1xuaW1wb3J0IHNjcm9sbEJ0blx0ZnJvbSAnLi4vYmxvY2tzL3Njcm9sbC1idG4vc2Nyb2xsLWJ0bic7XG5pbXBvcnQgd2RTbGlkZXJcdGZyb20gJy4uL2Jsb2Nrcy93ZC1zbGlkZXIvd2Qtc2xpZGVyJztcbmltcG9ydCB0YWJsZXRcdFx0ZnJvbSAnLi4vYmxvY2tzL3RhYmxldC90YWJsZXQnO1xuaW1wb3J0IHNlYXJjaFx0XHRmcm9tICcuLi9ibG9ja3Mvc2VhcmNoL3NlYXJjaCc7XG5pbXBvcnQgcGluXHRcdFx0ZnJvbSAnLi4vYmxvY2tzL3Bpbi9waW4nO1xuaW1wb3J0IG1hcFx0XHRcdGZyb20gJy4uL2Jsb2Nrcy9tYXAvbWFwJztcbmltcG9ydCBzbGlkZVBhY2tcdGZyb20gJy4uL2Jsb2Nrcy9zbGlkZS1wYWNrL3NsaWRlLXBhY2snO1xuaW1wb3J0IGRvdFN0cmlwXHRmcm9tICcuLi9ibG9ja3MvZG90LXN0cmlwL2RvdC1zdHJpcCc7XG5pbXBvcnQgcXVlc3Rpb25cdGZyb20gJy4uL2Jsb2Nrcy9xdWVzdGlvbi9xdWVzdGlvbic7XG5pbXBvcnQgdXBCdG5cdFx0ZnJvbSAnLi4vYmxvY2tzL3VwLWJ0bi91cC1idG4nO1xuaW1wb3J0IHlhTWFwXHRcdGZyb20gJy4uL2Jsb2Nrcy95YS1tYXAveWEtbWFwJztcbmltcG9ydCB2YXJzXHRcdFx0ZnJvbSAnLi92YXJzJztcbmltcG9ydCBnYWxsZXJ5XHRcdGZyb20gJy4uL2Jsb2Nrcy9nYWxsZXJ5L2dhbGxlcnkyJztcblxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9qcXVlcnlfbGF6eWxvYWQvanF1ZXJ5Lmxhenlsb2FkJyk7XG5yZXF1aXJlKCdkZXZpY2UuanMnKTtcblxuY29uc3QgamF0YSA9IHtcblx0cmVhZHkoKSB7XG5cdFx0aWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJyl7XG5cdFx0XHRqYXRhLmluaXQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGphdGEuaW5pdCk7XG5cdFx0fVxuXHR9LFxuXG5cdGluaXQoKSB7XG5cdFx0Y29uc29sZS5sb2cod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcblxuXHRcdGJ1cmdlci5pbml0KCk7XG5cdFx0dXBCdG4uaW5pdCgpO1xuXG5cdFx0c3dpdGNoICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpIHtcblx0XHRcdGNhc2UgJy8nOlxuXHRcdFx0XHRjb25zb2xlLmxvZygnbWFpbicpO1xuXG5cdFx0XHRcdGRyaXZlckZvcm0uaW5pdCgpO1xuXHRcdFx0XHRpbnB1dC5pbml0KCk7XG5cdFx0XHRcdG1lc3NhZ2UuaW5pdCgpO1xuXHRcdFx0XHRzY3JvbGxCdG4uaW5pdCgpO1xuXHRcdFx0XHR3ZFNsaWRlci5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvZm9yYWR2Lmh0bWwnOlxuXHRcdFx0XHRjb25zb2xlLmxvZygnZm9yYWR2Jyk7XG5cblx0XHRcdFx0c2Nyb2xsQnRuLmluaXQoKTtcblx0XHRcdFx0dGFibGV0LmluaXQoKTtcblx0XHRcdFx0c2VhcmNoLmluaXQoKTtcblx0XHRcdFx0cGluLmluaXQoKTtcblx0XHRcdFx0bWFwLmluaXQoKTtcblx0XHRcdFx0c2xpZGVQYWNrLmluaXQoKTtcblx0XHRcdFx0ZG90U3RyaXAuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2NvbnRhY3RzLmh0bWwnOlxuXHRcdFx0XHRjb25zb2xlLmxvZygnY29udGFjdHMnKTtcblx0XHRcdFx0eWFNYXAuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2hvdy5odG1sJzpcblx0XHRcdFx0Y29uc29sZS5sb2coJ2hvdycpO1xuXHRcdFx0XHRxdWVzdGlvbi5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvZ2FsbGVyeS5odG1sJzpcblx0XHRcdFx0Y29uc29sZS5sb2coJ2dhbGxlcnknKTtcblx0XHRcdFx0Z2FsbGVyeS5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvLyBkZWZhdWx0OlxuXHRcdFx0Ly8gXHRsb2NhdGlvbi5ocmVmID0gdmFycy5zZXJ2ZXIgKyAnLzQwNC5odG1sJztcblx0XHRcdC8vIFx0YnJlYWs7XG5cdFx0fVxuXHR9LFxufTtcblxuamF0YS5yZWFkeSgpOyIsImNvbnN0IE5PREVfRU5WID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2RldmVsb3BtZW50JztcbmNvbnN0IHByb2R1Y3Rpb24gPSBOT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gdHJ1ZSA6IGZhbHNlO1xuXG5jb25zdCB2YXJzID0ge1xuXHRzZXJ2ZXI6IHByb2R1Y3Rpb24gPyAnaHR0cHM6Ly9qYXRhLnJ1JyA6ICdodHRwOi8vZGV2LmphdGEucnUnLFxuXHRhcGlcdDoge1xuXHRcdGJlY29tZURyaXZlcjogJy9hcGkvdjEvYWNjb3VudHMvYmVjb21lZHJpdmVyJyxcblx0XHRnYWxsZXJ5XHRcdDogJy9hcGkvdjEvZ2FsbGVyeScsXG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZhcnM7Il19
