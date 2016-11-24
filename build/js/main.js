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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL2pxdWVyeV9sYXp5bG9hZC9qcXVlcnkubGF6eWxvYWQuanMiLCJub2RlX21vZHVsZXMvZGV2aWNlLmpzL2xpYi9kZXZpY2UuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyLmpzIiwic3JjL2Jsb2Nrcy9kb3Qtc3RyaXAvZG90LXN0cmlwLmpzIiwic3JjL2Jsb2Nrcy9kcml2ZXItZm9ybS9kcml2ZXItZm9ybTIuanMiLCJzcmMvYmxvY2tzL2dhbGxlcnkvZ2FsbGVyeTIuanMiLCJzcmMvYmxvY2tzL2lucHV0L2lucHV0Mi5qcyIsInNyYy9ibG9ja3MvbWFwL21hcC5qcyIsInNyYy9ibG9ja3MvbWVzc2FnZS9tZXNzYWdlLmpzIiwic3JjL2Jsb2Nrcy9waW4vcGluLmpzIiwic3JjL2Jsb2Nrcy9xdWVzdGlvbi9xdWVzdGlvbi5qcyIsInNyYy9ibG9ja3Mvc2Nyb2xsLWJ0bi9zY3JvbGwtYnRuLmpzIiwic3JjL2Jsb2Nrcy9zZWFyY2gvc2VhcmNoLmpzIiwic3JjL2Jsb2Nrcy9zbGlkZS1wYWNrL3NsaWRlLXBhY2suanMiLCJzcmMvYmxvY2tzL3RhYmxldC90YWJsZXQuanMiLCJzcmMvYmxvY2tzL3VwLWJ0bi91cC1idG4uanMiLCJzcmMvYmxvY2tzL3dkLXNsaWRlci93ZC1zbGlkZXIuanMiLCJzcmMvYmxvY2tzL3lhLW1hcC95YS1tYXAuanMiLCJzcmMvY29tcGlsZS9jdXN0b20uanMiLCJzcmMvY29tcGlsZS92YXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsQ0FBQyxVQUFTLENBQVQsRUFBWSxNQUFaLEVBQW9CLFFBQXBCLEVBQThCLFNBQTlCLEVBQXlDO0FBQ3RDLFFBQUksVUFBVSxFQUFFLE1BQUYsQ0FBZDs7QUFFQSxN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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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ZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogTGF6eSBMb2FkIC0galF1ZXJ5IHBsdWdpbiBmb3IgbGF6eSBsb2FkaW5nIGltYWdlc1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDE1IE1pa2EgVHV1cG9sYVxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBQcm9qZWN0IGhvbWU6XG4gKiAgIGh0dHA6Ly93d3cuYXBwZWxzaWluaS5uZXQvcHJvamVjdHMvbGF6eWxvYWRcbiAqXG4gKiBWZXJzaW9uOiAgMS45LjdcbiAqXG4gKi9cblxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG4gICAgJC5mbi5sYXp5bG9hZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcztcbiAgICAgICAgdmFyICRjb250YWluZXI7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIHRocmVzaG9sZCAgICAgICA6IDAsXG4gICAgICAgICAgICBmYWlsdXJlX2xpbWl0ICAgOiAwLFxuICAgICAgICAgICAgZXZlbnQgICAgICAgICAgIDogXCJzY3JvbGxcIixcbiAgICAgICAgICAgIGVmZmVjdCAgICAgICAgICA6IFwic2hvd1wiLFxuICAgICAgICAgICAgY29udGFpbmVyICAgICAgIDogd2luZG93LFxuICAgICAgICAgICAgZGF0YV9hdHRyaWJ1dGUgIDogXCJvcmlnaW5hbFwiLFxuICAgICAgICAgICAgc2tpcF9pbnZpc2libGUgIDogZmFsc2UsXG4gICAgICAgICAgICBhcHBlYXIgICAgICAgICAgOiBudWxsLFxuICAgICAgICAgICAgbG9hZCAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyICAgICA6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQUFYTlNSMElBcnM0YzZRQUFBQVJuUVUxQkFBQ3hqd3Y4WVFVQUFBQUpjRWhaY3dBQURzUUFBQTdFQVpVckRoc0FBQUFOU1VSQlZCaFhZemg4K1BCL0FBZmZBMG5OUHVDTEFBQUFBRWxGVGtTdVFtQ0NcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBjb3VudGVyID0gMDtcblxuICAgICAgICAgICAgZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5za2lwX2ludmlzaWJsZSAmJiAhJHRoaXMuaXMoXCI6dmlzaWJsZVwiKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgkLmFib3ZldGhldG9wKHRoaXMsIHNldHRpbmdzKSB8fFxuICAgICAgICAgICAgICAgICAgICAkLmxlZnRvZmJlZ2luKHRoaXMsIHNldHRpbmdzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogTm90aGluZy4gKi9cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEkLmJlbG93dGhlZm9sZCh0aGlzLCBzZXR0aW5ncykgJiZcbiAgICAgICAgICAgICAgICAgICAgISQucmlnaHRvZmZvbGQodGhpcywgc2V0dGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy50cmlnZ2VyKFwiYXBwZWFyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaWYgd2UgZm91bmQgYW4gaW1hZ2Ugd2UnbGwgbG9hZCwgcmVzZXQgdGhlIGNvdW50ZXIgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgrK2NvdW50ZXIgPiBzZXR0aW5ncy5mYWlsdXJlX2xpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYob3B0aW9ucykge1xuICAgICAgICAgICAgLyogTWFpbnRhaW4gQkMgZm9yIGEgY291cGxlIG9mIHZlcnNpb25zLiAqL1xuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gb3B0aW9ucy5mYWlsdXJlbGltaXQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZhaWx1cmVfbGltaXQgPSBvcHRpb25zLmZhaWx1cmVsaW1pdDtcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5mYWlsdXJlbGltaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBvcHRpb25zLmVmZmVjdHNwZWVkKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lZmZlY3Rfc3BlZWQgPSBvcHRpb25zLmVmZmVjdHNwZWVkO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLmVmZmVjdHNwZWVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmV4dGVuZChzZXR0aW5ncywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDYWNoZSBjb250YWluZXIgYXMgalF1ZXJ5IGFzIG9iamVjdC4gKi9cbiAgICAgICAgJGNvbnRhaW5lciA9IChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSA/ICR3aW5kb3cgOiAkKHNldHRpbmdzLmNvbnRhaW5lcik7XG5cbiAgICAgICAgLyogRmlyZSBvbmUgc2Nyb2xsIGV2ZW50IHBlciBzY3JvbGwuIE5vdCBvbmUgc2Nyb2xsIGV2ZW50IHBlciBpbWFnZS4gKi9cbiAgICAgICAgaWYgKDAgPT09IHNldHRpbmdzLmV2ZW50LmluZGV4T2YoXCJzY3JvbGxcIikpIHtcbiAgICAgICAgICAgICRjb250YWluZXIuYmluZChzZXR0aW5ncy5ldmVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgJHNlbGYgPSAkKHNlbGYpO1xuXG4gICAgICAgICAgICBzZWxmLmxvYWRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvKiBJZiBubyBzcmMgYXR0cmlidXRlIGdpdmVuIHVzZSBkYXRhOnVyaS4gKi9cbiAgICAgICAgICAgIGlmICgkc2VsZi5hdHRyKFwic3JjXCIpID09PSB1bmRlZmluZWQgfHwgJHNlbGYuYXR0cihcInNyY1wiKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHNlbGYuaXMoXCJpbWdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNlbGYuYXR0cihcInNyY1wiLCBzZXR0aW5ncy5wbGFjZWhvbGRlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBXaGVuIGFwcGVhciBpcyB0cmlnZ2VyZWQgbG9hZCBvcmlnaW5hbCBpbWFnZS4gKi9cbiAgICAgICAgICAgICRzZWxmLm9uZShcImFwcGVhclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5hcHBlYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50c19sZWZ0ID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuYXBwZWFyLmNhbGwoc2VsZiwgZWxlbWVudHNfbGVmdCwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICQoXCI8aW1nIC8+XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYmluZChcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luYWwgPSAkc2VsZi5hdHRyKFwiZGF0YS1cIiArIHNldHRpbmdzLmRhdGFfYXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzZWxmLmlzKFwiaW1nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLmF0dHIoXCJzcmNcIiwgb3JpZ2luYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgXCJ1cmwoJ1wiICsgb3JpZ2luYWwgKyBcIicpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZltzZXR0aW5ncy5lZmZlY3RdKHNldHRpbmdzLmVmZmVjdF9zcGVlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBSZW1vdmUgaW1hZ2UgZnJvbSBhcnJheSBzbyBpdCBpcyBub3QgbG9vcGVkIG5leHQgdGltZS4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9ICQuZ3JlcChlbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWVsZW1lbnQubG9hZGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gJCh0ZW1wKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5sb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50c19sZWZ0ID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5sb2FkLmNhbGwoc2VsZiwgZWxlbWVudHNfbGVmdCwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInNyY1wiLCAkc2VsZi5hdHRyKFwiZGF0YS1cIiArIHNldHRpbmdzLmRhdGFfYXR0cmlidXRlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qIFdoZW4gd2FudGVkIGV2ZW50IGlzIHRyaWdnZXJlZCBsb2FkIG9yaWdpbmFsIGltYWdlICovXG4gICAgICAgICAgICAvKiBieSB0cmlnZ2VyaW5nIGFwcGVhci4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKDAgIT09IHNldHRpbmdzLmV2ZW50LmluZGV4T2YoXCJzY3JvbGxcIikpIHtcbiAgICAgICAgICAgICAgICAkc2VsZi5iaW5kKHNldHRpbmdzLmV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGYudHJpZ2dlcihcImFwcGVhclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKiBDaGVjayBpZiBzb21ldGhpbmcgYXBwZWFycyB3aGVuIHdpbmRvdyBpcyByZXNpemVkLiAqL1xuICAgICAgICAkd2luZG93LmJpbmQoXCJyZXNpemVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyogV2l0aCBJT1M1IGZvcmNlIGxvYWRpbmcgaW1hZ2VzIHdoZW4gbmF2aWdhdGluZyB3aXRoIGJhY2sgYnV0dG9uLiAqL1xuICAgICAgICAvKiBOb24gb3B0aW1hbCB3b3JrYXJvdW5kLiAqL1xuICAgICAgICBpZiAoKC8oPzppcGhvbmV8aXBvZHxpcGFkKS4qb3MgNS9naSkudGVzdChuYXZpZ2F0b3IuYXBwVmVyc2lvbikpIHtcbiAgICAgICAgICAgICR3aW5kb3cuYmluZChcInBhZ2VzaG93XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5wZXJzaXN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykudHJpZ2dlcihcImFwcGVhclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBGb3JjZSBpbml0aWFsIGNoZWNrIGlmIGltYWdlcyBzaG91bGQgYXBwZWFyLiAqL1xuICAgICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyogQ29udmVuaWVuY2UgbWV0aG9kcyBpbiBqUXVlcnkgbmFtZXNwYWNlLiAgICAgICAgICAgKi9cbiAgICAvKiBVc2UgYXMgICQuYmVsb3d0aGVmb2xkKGVsZW1lbnQsIHt0aHJlc2hvbGQgOiAxMDAsIGNvbnRhaW5lciA6IHdpbmRvd30pICovXG5cbiAgICAkLmJlbG93dGhlZm9sZCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgPyB3aW5kb3cuaW5uZXJIZWlnaHQgOiAkd2luZG93LmhlaWdodCgpKSArICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLnRvcCArICQoc2V0dGluZ3MuY29udGFpbmVyKS5oZWlnaHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkIDw9ICQoZWxlbWVudCkub2Zmc2V0KCkudG9wIC0gc2V0dGluZ3MudGhyZXNob2xkO1xuICAgIH07XG5cbiAgICAkLnJpZ2h0b2Zmb2xkID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGZvbGQ7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lciA9PT0gdW5kZWZpbmVkIHx8IHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSB7XG4gICAgICAgICAgICBmb2xkID0gJHdpbmRvdy53aWR0aCgpICsgJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLmxlZnQgKyAkKHNldHRpbmdzLmNvbnRhaW5lcikud2lkdGgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkIDw9ICQoZWxlbWVudCkub2Zmc2V0KCkubGVmdCAtIHNldHRpbmdzLnRocmVzaG9sZDtcbiAgICB9O1xuXG4gICAgJC5hYm92ZXRoZXRvcCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLnRvcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkID49ICQoZWxlbWVudCkub2Zmc2V0KCkudG9wICsgc2V0dGluZ3MudGhyZXNob2xkICArICQoZWxlbWVudCkuaGVpZ2h0KCk7XG4gICAgfTtcblxuICAgICQubGVmdG9mYmVnaW4gPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICB2YXIgZm9sZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHwgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpIHtcbiAgICAgICAgICAgIGZvbGQgPSAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvbGQgPSAkKHNldHRpbmdzLmNvbnRhaW5lcikub2Zmc2V0KCkubGVmdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkID49ICQoZWxlbWVudCkub2Zmc2V0KCkubGVmdCArIHNldHRpbmdzLnRocmVzaG9sZCArICQoZWxlbWVudCkud2lkdGgoKTtcbiAgICB9O1xuXG4gICAgJC5pbnZpZXdwb3J0ID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgIHJldHVybiAhJC5yaWdodG9mZm9sZChlbGVtZW50LCBzZXR0aW5ncykgJiYgISQubGVmdG9mYmVnaW4oZWxlbWVudCwgc2V0dGluZ3MpICYmXG4gICAgICAgICAgICAgICAgISQuYmVsb3d0aGVmb2xkKGVsZW1lbnQsIHNldHRpbmdzKSAmJiAhJC5hYm92ZXRoZXRvcChlbGVtZW50LCBzZXR0aW5ncyk7XG4gICAgIH07XG5cbiAgICAvKiBDdXN0b20gc2VsZWN0b3JzIGZvciB5b3VyIGNvbnZlbmllbmNlLiAgICovXG4gICAgLyogVXNlIGFzICQoXCJpbWc6YmVsb3ctdGhlLWZvbGRcIikuc29tZXRoaW5nKCkgb3IgKi9cbiAgICAvKiAkKFwiaW1nXCIpLmZpbHRlcihcIjpiZWxvdy10aGUtZm9sZFwiKS5zb21ldGhpbmcoKSB3aGljaCBpcyBmYXN0ZXIgKi9cblxuICAgICQuZXh0ZW5kKCQuZXhwcltcIjpcIl0sIHtcbiAgICAgICAgXCJiZWxvdy10aGUtZm9sZFwiIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5iZWxvd3RoZWZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJhYm92ZS10aGUtdG9wXCIgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gISQuYmVsb3d0aGVmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwicmlnaHQtb2Ytc2NyZWVuXCI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICQucmlnaHRvZmZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJsZWZ0LW9mLXNjcmVlblwiIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gISQucmlnaHRvZmZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJpbi12aWV3cG9ydFwiICAgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5pbnZpZXdwb3J0KGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIC8qIE1haW50YWluIEJDIGZvciBjb3VwbGUgb2YgdmVyc2lvbnMuICovXG4gICAgICAgIFwiYWJvdmUtdGhlLWZvbGRcIiA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLmJlbG93dGhlZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcInJpZ2h0LW9mLWZvbGRcIiAgOiBmdW5jdGlvbihhKSB7IHJldHVybiAkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwibGVmdC1vZi1mb2xkXCIgICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcbiIsIi8vIERldmljZS5qc1xuLy8gKGMpIDIwMTQgTWF0dGhldyBIdWRzb25cbi8vIERldmljZS5qcyBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4vLyBGb3IgYWxsIGRldGFpbHMgYW5kIGRvY3VtZW50YXRpb246XG4vLyBodHRwOi8vbWF0dGhld2h1ZHNvbi5tZS9wcm9qZWN0cy9kZXZpY2UuanMvXG5cbihmdW5jdGlvbigpIHtcblxuICB2YXIgZGV2aWNlLFxuICAgIHByZXZpb3VzRGV2aWNlLFxuICAgIGFkZENsYXNzLFxuICAgIGRvY3VtZW50RWxlbWVudCxcbiAgICBmaW5kLFxuICAgIGhhbmRsZU9yaWVudGF0aW9uLFxuICAgIGhhc0NsYXNzLFxuICAgIG9yaWVudGF0aW9uRXZlbnQsXG4gICAgcmVtb3ZlQ2xhc3MsXG4gICAgdXNlckFnZW50O1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBkZXZpY2UgdmFyaWFibGUuXG4gIHByZXZpb3VzRGV2aWNlID0gd2luZG93LmRldmljZTtcblxuICBkZXZpY2UgPSB7fTtcblxuICAvLyBBZGQgZGV2aWNlIGFzIGEgZ2xvYmFsIG9iamVjdC5cbiAgd2luZG93LmRldmljZSA9IGRldmljZTtcblxuICAvLyBUaGUgPGh0bWw+IGVsZW1lbnQuXG4gIGRvY3VtZW50RWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgLy8gVGhlIGNsaWVudCB1c2VyIGFnZW50IHN0cmluZy5cbiAgLy8gTG93ZXJjYXNlLCBzbyB3ZSBjYW4gdXNlIHRoZSBtb3JlIGVmZmljaWVudCBpbmRleE9mKCksIGluc3RlYWQgb2YgUmVnZXhcbiAgdXNlckFnZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuICAvLyBNYWluIGZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIGRldmljZS5pb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5pcGhvbmUoKSB8fCBkZXZpY2UuaXBvZCgpIHx8IGRldmljZS5pcGFkKCk7XG4gIH07XG5cbiAgZGV2aWNlLmlwaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gIWRldmljZS53aW5kb3dzKCkgJiYgZmluZCgnaXBob25lJyk7XG4gIH07XG5cbiAgZGV2aWNlLmlwb2QgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ2lwb2QnKTtcbiAgfTtcblxuICBkZXZpY2UuaXBhZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmluZCgnaXBhZCcpO1xuICB9O1xuXG4gIGRldmljZS5hbmRyb2lkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhZGV2aWNlLndpbmRvd3MoKSAmJiBmaW5kKCdhbmRyb2lkJyk7XG4gIH07XG5cbiAgZGV2aWNlLmFuZHJvaWRQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmFuZHJvaWQoKSAmJiBmaW5kKCdtb2JpbGUnKTtcbiAgfTtcblxuICBkZXZpY2UuYW5kcm9pZFRhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmFuZHJvaWQoKSAmJiAhZmluZCgnbW9iaWxlJyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ2JsYWNrYmVycnknKSB8fCBmaW5kKCdiYjEwJykgfHwgZmluZCgncmltJyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnlQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmJsYWNrYmVycnkoKSAmJiAhZmluZCgndGFibGV0Jyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnlUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5ibGFja2JlcnJ5KCkgJiYgZmluZCgndGFibGV0Jyk7XG4gIH07XG5cbiAgZGV2aWNlLndpbmRvd3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ3dpbmRvd3MnKTtcbiAgfTtcblxuICBkZXZpY2Uud2luZG93c1Bob25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2Uud2luZG93cygpICYmIGZpbmQoJ3Bob25lJyk7XG4gIH07XG5cbiAgZGV2aWNlLndpbmRvd3NUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS53aW5kb3dzKCkgJiYgKGZpbmQoJ3RvdWNoJykgJiYgIWRldmljZS53aW5kb3dzUGhvbmUoKSk7XG4gIH07XG5cbiAgZGV2aWNlLmZ4b3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChmaW5kKCcobW9iaWxlOycpIHx8IGZpbmQoJyh0YWJsZXQ7JykpICYmIGZpbmQoJzsgcnY6Jyk7XG4gIH07XG5cbiAgZGV2aWNlLmZ4b3NQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmZ4b3MoKSAmJiBmaW5kKCdtb2JpbGUnKTtcbiAgfTtcblxuICBkZXZpY2UuZnhvc1RhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmZ4b3MoKSAmJiBmaW5kKCd0YWJsZXQnKTtcbiAgfTtcblxuICBkZXZpY2UubWVlZ28gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ21lZWdvJyk7XG4gIH07XG5cbiAgZGV2aWNlLmNvcmRvdmEgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5jb3Jkb3ZhICYmIGxvY2F0aW9uLnByb3RvY29sID09PSAnZmlsZTonO1xuICB9O1xuXG4gIGRldmljZS5ub2RlV2Via2l0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93LnByb2Nlc3MgPT09ICdvYmplY3QnO1xuICB9O1xuXG4gIGRldmljZS5tb2JpbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5hbmRyb2lkUGhvbmUoKSB8fCBkZXZpY2UuaXBob25lKCkgfHwgZGV2aWNlLmlwb2QoKSB8fCBkZXZpY2Uud2luZG93c1Bob25lKCkgfHwgZGV2aWNlLmJsYWNrYmVycnlQaG9uZSgpIHx8IGRldmljZS5meG9zUGhvbmUoKSB8fCBkZXZpY2UubWVlZ28oKTtcbiAgfTtcblxuICBkZXZpY2UudGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuaXBhZCgpIHx8IGRldmljZS5hbmRyb2lkVGFibGV0KCkgfHwgZGV2aWNlLmJsYWNrYmVycnlUYWJsZXQoKSB8fCBkZXZpY2Uud2luZG93c1RhYmxldCgpIHx8IGRldmljZS5meG9zVGFibGV0KCk7XG4gIH07XG5cbiAgZGV2aWNlLmRlc2t0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICFkZXZpY2UudGFibGV0KCkgJiYgIWRldmljZS5tb2JpbGUoKTtcbiAgfTtcblxuICBkZXZpY2UudGVsZXZpc2lvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCB0ZWxldmlzaW9uO1xuXG4gICAgdGVsZXZpc2lvbiA9IFtcbiAgICAgIFwiZ29vZ2xldHZcIixcbiAgICAgIFwidmllcmFcIixcbiAgICAgIFwic21hcnR0dlwiLFxuICAgICAgXCJpbnRlcm5ldC50dlwiLFxuICAgICAgXCJuZXRjYXN0XCIsXG4gICAgICBcIm5ldHR2XCIsXG4gICAgICBcImFwcGxldHZcIixcbiAgICAgIFwiYm94ZWVcIixcbiAgICAgIFwia3lsb1wiLFxuICAgICAgXCJyb2t1XCIsXG4gICAgICBcImRsbmFkb2NcIixcbiAgICAgIFwicm9rdVwiLFxuICAgICAgXCJwb3ZfdHZcIixcbiAgICAgIFwiaGJidHZcIixcbiAgICAgIFwiY2UtaHRtbFwiXG4gICAgXTtcblxuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgdGVsZXZpc2lvbi5sZW5ndGgpIHtcbiAgICAgIGlmIChmaW5kKHRlbGV2aXNpb25baV0pKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfTtcblxuICBkZXZpY2UucG9ydHJhaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aCkgPiAxO1xuICB9O1xuXG4gIGRldmljZS5sYW5kc2NhcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aCkgPCAxO1xuICB9O1xuXG4gIC8vIFB1YmxpYyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gZGV2aWNlLmpzIGluIG5vQ29uZmxpY3QgbW9kZSxcbiAgLy8gcmV0dXJuaW5nIHRoZSBkZXZpY2UgdmFyaWFibGUgdG8gaXRzIHByZXZpb3VzIG93bmVyLlxuICBkZXZpY2Uubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuZGV2aWNlID0gcHJldmlvdXNEZXZpY2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gUHJpdmF0ZSBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gU2ltcGxlIFVBIHN0cmluZyBzZWFyY2hcbiAgZmluZCA9IGZ1bmN0aW9uIChuZWVkbGUpIHtcbiAgICByZXR1cm4gdXNlckFnZW50LmluZGV4T2YobmVlZGxlKSAhPT0gLTE7XG4gIH07XG5cbiAgLy8gQ2hlY2sgaWYgZG9jdW1lbnRFbGVtZW50IGFscmVhZHkgaGFzIGEgZ2l2ZW4gY2xhc3MuXG4gIGhhc0NsYXNzID0gZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgIHZhciByZWdleDtcbiAgICByZWdleCA9IG5ldyBSZWdFeHAoY2xhc3NOYW1lLCAnaScpO1xuICAgIHJldHVybiBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLm1hdGNoKHJlZ2V4KTtcbiAgfTtcblxuICAvLyBBZGQgb25lIG9yIG1vcmUgQ1NTIGNsYXNzZXMgdG8gdGhlIDxodG1sPiBlbGVtZW50LlxuICBhZGRDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICB2YXIgY3VycmVudENsYXNzTmFtZXMgPSBudWxsO1xuICAgIGlmICghaGFzQ2xhc3MoY2xhc3NOYW1lKSkge1xuICAgICAgY3VycmVudENsYXNzTmFtZXMgPSBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICAgIGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUgPSBjdXJyZW50Q2xhc3NOYW1lcyArIFwiIFwiICsgY2xhc3NOYW1lO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZW1vdmUgc2luZ2xlIENTUyBjbGFzcyBmcm9tIHRoZSA8aHRtbD4gZWxlbWVudC5cbiAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgaWYgKGhhc0NsYXNzKGNsYXNzTmFtZSkpIHtcbiAgICAgIGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUgPSBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UoXCIgXCIgKyBjbGFzc05hbWUsIFwiXCIpO1xuICAgIH1cbiAgfTtcblxuICAvLyBIVE1MIEVsZW1lbnQgSGFuZGxpbmdcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gSW5zZXJ0IHRoZSBhcHByb3ByaWF0ZSBDU1MgY2xhc3MgYmFzZWQgb24gdGhlIF91c2VyX2FnZW50LlxuXG4gIGlmIChkZXZpY2UuaW9zKCkpIHtcbiAgICBpZiAoZGV2aWNlLmlwYWQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJpb3MgaXBhZCB0YWJsZXRcIik7XG4gICAgfSBlbHNlIGlmIChkZXZpY2UuaXBob25lKCkpIHtcbiAgICAgIGFkZENsYXNzKFwiaW9zIGlwaG9uZSBtb2JpbGVcIik7XG4gICAgfSBlbHNlIGlmIChkZXZpY2UuaXBvZCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImlvcyBpcG9kIG1vYmlsZVwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmFuZHJvaWQoKSkge1xuICAgIGlmIChkZXZpY2UuYW5kcm9pZFRhYmxldCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImFuZHJvaWQgdGFibGV0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhcImFuZHJvaWQgbW9iaWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UuYmxhY2tiZXJyeSgpKSB7XG4gICAgaWYgKGRldmljZS5ibGFja2JlcnJ5VGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwiYmxhY2tiZXJyeSB0YWJsZXRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiYmxhY2tiZXJyeSBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS53aW5kb3dzKCkpIHtcbiAgICBpZiAoZGV2aWNlLndpbmRvd3NUYWJsZXQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJ3aW5kb3dzIHRhYmxldFwiKTtcbiAgICB9IGVsc2UgaWYgKGRldmljZS53aW5kb3dzUGhvbmUoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJ3aW5kb3dzIG1vYmlsZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkQ2xhc3MoXCJkZXNrdG9wXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UuZnhvcygpKSB7XG4gICAgaWYgKGRldmljZS5meG9zVGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwiZnhvcyB0YWJsZXRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiZnhvcyBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS5tZWVnbygpKSB7XG4gICAgYWRkQ2xhc3MoXCJtZWVnbyBtb2JpbGVcIik7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLm5vZGVXZWJraXQoKSkge1xuICAgIGFkZENsYXNzKFwibm9kZS13ZWJraXRcIik7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLnRlbGV2aXNpb24oKSkge1xuICAgIGFkZENsYXNzKFwidGVsZXZpc2lvblwiKTtcbiAgfSBlbHNlIGlmIChkZXZpY2UuZGVza3RvcCgpKSB7XG4gICAgYWRkQ2xhc3MoXCJkZXNrdG9wXCIpO1xuICB9XG5cbiAgaWYgKGRldmljZS5jb3Jkb3ZhKCkpIHtcbiAgICBhZGRDbGFzcyhcImNvcmRvdmFcIik7XG4gIH1cblxuICAvLyBPcmllbnRhdGlvbiBIYW5kbGluZ1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEhhbmRsZSBkZXZpY2Ugb3JpZW50YXRpb24gY2hhbmdlcy5cbiAgaGFuZGxlT3JpZW50YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGRldmljZS5sYW5kc2NhcGUoKSkge1xuICAgICAgcmVtb3ZlQ2xhc3MoXCJwb3J0cmFpdFwiKTtcbiAgICAgIGFkZENsYXNzKFwibGFuZHNjYXBlXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVDbGFzcyhcImxhbmRzY2FwZVwiKTtcbiAgICAgIGFkZENsYXNzKFwicG9ydHJhaXRcIik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfTtcblxuICAvLyBEZXRlY3Qgd2hldGhlciBkZXZpY2Ugc3VwcG9ydHMgb3JpZW50YXRpb25jaGFuZ2UgZXZlbnQsXG4gIC8vIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gdGhlIHJlc2l6ZSBldmVudC5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh3aW5kb3csIFwib25vcmllbnRhdGlvbmNoYW5nZVwiKSkge1xuICAgIG9yaWVudGF0aW9uRXZlbnQgPSBcIm9yaWVudGF0aW9uY2hhbmdlXCI7XG4gIH0gZWxzZSB7XG4gICAgb3JpZW50YXRpb25FdmVudCA9IFwicmVzaXplXCI7XG4gIH1cblxuICAvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgaW4gb3JpZW50YXRpb24uXG4gIGlmICh3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKG9yaWVudGF0aW9uRXZlbnQsIGhhbmRsZU9yaWVudGF0aW9uLCBmYWxzZSk7XG4gIH0gZWxzZSBpZiAod2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgd2luZG93LmF0dGFjaEV2ZW50KG9yaWVudGF0aW9uRXZlbnQsIGhhbmRsZU9yaWVudGF0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3dbb3JpZW50YXRpb25FdmVudF0gPSBoYW5kbGVPcmllbnRhdGlvbjtcbiAgfVxuXG4gIGhhbmRsZU9yaWVudGF0aW9uKCk7XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGV2aWNlO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkZXZpY2U7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LmRldmljZSA9IGRldmljZTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImNvbnN0IGJ1cmdlciA9IHtcblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5idXJnZXInLCAoKSA9PiB7XHRcdFx0XG5cdFx0XHQkKCcubmF2aWdhdGlvbicpLnRvZ2dsZUNsYXNzKCduYXZpZ2F0aW9uLS1vcGVuJyk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJ1cmdlcjsiLCJjb25zdCBkb3RTdHJpcCA9IHtcblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5kb3Qtc3RyaXBfX2lucHV0JywgZXZlbnQgPT4ge1xuXHRcdFx0c3dpdGNoICgkKGV2ZW50LnRhcmdldCkuYXR0cignaWQnKSkge1xuXHRcdFx0XHRjYXNlICdkb3RDYXInOlxuXHRcdFx0XHRcdCQoJy5kb3Qtc3RyaXBfX3J1bm5lcicpLmF0dHIoJ2RhdGEtcG9zJywgJ29uZScpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdkb3RMb3JyeSc6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAndHdvJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ2RvdEJ1cyc6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAndGhyZWUnKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0JChldmVudC50YXJnZXQpXG5cdFx0XHRcdC5jbG9zZXN0KCcuc2xpZGVyJylcblx0XHRcdFx0LmZpbmQoJy5zbGlkZS1wYWNrJylcblx0XHRcdFx0LmF0dHIoJ2RhdGEtc2xpZGVyLXBvcycsICQoZXZlbnQudGFyZ2V0KS5hdHRyKCdkYXRhLWRvdC1wb3MnKSk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvdFN0cmlwOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHZhcnMgZnJvbSAnLi4vLi4vY29tcGlsZS92YXJzJztcblxuY29uc3QgZHJpdmVyRm9ybSA9IHtcblx0YnVzeVx0XHRcdFx0OiBmYWxzZSxcblx0ZmllbGRzQ29ycmVjdFx0OiBmYWxzZSxcblx0XG5cdGRhdGE6IHtcblx0XHRmaXJzdF9uYW1lXHRcdFx0XHQ6ICcnLFxuXHRcdGxhc3RfbmFtZVx0XHRcdFx0OiAnJyxcblx0XHRlbWFpbFx0XHRcdFx0XHRcdDogJycsXG5cdFx0cGhvbmVcdFx0XHRcdFx0XHQ6ICcnLFxuXHRcdGhvd19kaWRfeW91X2tub3dcdFx0OiAnJyxcblx0XHRjYXJfeWVhclx0XHRcdFx0XHQ6ICcnLFxuXHRcdGNhcl9zdGF0ZVx0XHRcdFx0OiAnJyxcblx0XHRjYXJfYnJhbmRcdFx0XHRcdDogJycsXG5cdFx0Y2FyX21vZGVsXHRcdFx0XHQ6ICcnLFxuXHRcdGNhcl9jb2xvclx0XHRcdFx0OiAnJyxcblx0XHRhdmdfbWlsZWFnZV9kYXlcdFx0OiAnJyxcblx0XHRhdmdfbWlsZWFnZV93ZWVrZW5kXHQ6ICcnLFxuXHRcdGNvbW1lbnRcdFx0XHRcdFx0OiAnJyxcblx0fSxcblxuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnW2RhdGEtd2F5XScsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGNvbnN0IGVsZW1cdFx0XHQ9IGV2ZW50LnRhcmdldDtcblx0XHRcdGNvbnN0IHBhZ2VcdFx0XHQ9ICQoJy5kcml2ZXItZm9ybScpO1xuXHRcdFx0Y29uc3QgZGF0YVBhZ2VcdFx0PSBOdW1iZXIocGFnZS5hdHRyKCdkYXRhLXBhZ2UnKSk7XG5cdFx0XHRjb25zdCBjdXJyZW50UGFnZVx0PSAkKGAuZHJpdmVyLWZvcm1fX3BhZ2VbZGF0YS1wYWdlPSR7ZGF0YVBhZ2V9XWApO1xuXHRcdFx0Y29uc3QgbmV4dFBhZ2VcdFx0PSBkYXRhUGFnZSArIDE7XG5cdFx0XHRjb25zdCBwcmV2UGFnZVx0XHQ9IGRhdGFQYWdlIC0gMTtcblxuXHRcdFx0aWYgKCQoZWxlbSkuYXR0cignZGF0YS13YXknKSA9PT0gJ3ByZXYnKSB7XG5cdFx0XHRcdGlmIChwcmV2UGFnZSA9PT0gMSB8fCBwcmV2UGFnZSA9PT0gMikge1xuXHRcdFx0XHRcdHBhZ2UuYXR0cignZGF0YS1wYWdlJywgcHJldlBhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzd2l0Y2ggKGRhdGFQYWdlKSB7XG5cdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5kYXRhLmhvd19kaWRfeW91X2tub3cgPSAkKCcjaG93X2RpZF95b3Vfa25vdycpLnZhbCgpO1xuXG5cdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0Y3VycmVudFBhZ2Vcblx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0LmVhY2goKGluZGV4LCBlbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmICgkKGVsKS5sZW5ndGggJiYgKCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcpICE9PSAndHJ1ZScpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcpICE9PSAndHJ1ZScpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZGF0YVskKGVsKS5hdHRyKCdpZCcpXSA9ICQoZWwpLnZhbCgpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRkcml2ZXJGb3JtLmZpZWxkc0NvcnJlY3QgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZGF0YS5waG9uZSA9IGRyaXZlckZvcm0uZGF0YS5waG9uZS5yZXBsYWNlKC9cXEQvZywgJycpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmxlbmd0aCAmJiAkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoJChlbCkuYXR0cignZGF0YS1jb3JyZWN0JykgIT09ICd0cnVlJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtZmlsbGVkXScpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5lYWNoKChpbmRleCwgZWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkcml2ZXJGb3JtLmRhdGFbJChlbCkuYXR0cignaWQnKV0gPSAkKGVsKS52YWwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZmllbGRzQ29ycmVjdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCd3cm9uZyBwYWdlIG51bWJlcicpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZHJpdmVyRm9ybS5maWVsZHNDb3JyZWN0KSB7XG5cdFx0XHRcdFx0c3dpdGNoIChuZXh0UGFnZSkge1xuXHRcdFx0XHRcdFx0Ly8g0L3QsCDQv9C10YDQstC+0Lkg0YHRgtGA0LDQvdC40YbQtVxuXHRcdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LjRgtGMINGB0YLRgNCw0L3QuNGG0YNcblx0XHRcdFx0XHRcdFx0cGFnZS5hdHRyKCdkYXRhLXBhZ2UnLCAnMicpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0Ly8g0L3QsCDQstGC0L7RgNC+0Lkg0YHRgtGA0LDQvdC40YbQtVxuXHRcdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LjRgtGMINGB0YLRgNCw0L3QuNGG0YNcblx0XHRcdFx0XHRcdFx0cGFnZS5hdHRyKCdkYXRhLXBhZ2UnLCAnMycpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0Ly8g0L3QsCDRgtGA0LXRgtGM0LXQuSDRgdGC0YDQsNC90LjRhtC1XG5cdFx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRcdC8vINC30LDQv9GD0YHRgtC40YLRjCDRhNGD0L3QutGG0LjRjiDQvtGC0L/RgNCw0LLQutC4INGE0L7RgNC80Ytcblx0XHRcdFx0XHRcdFx0ZHJpdmVyRm9ybS5zZW5kRm9ybSgpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdGRyaXZlckZvcm0uZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3dyb25nIG5leHQgcGFnZSBudW1iZXInKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0c2VuZEZvcm0oKSB7XG5cdFx0aWYgKCFkcml2ZXJGb3JtLmJ1c3kpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdzdGFydCBzZW5kaW5nIGZvcm0nKTtcblxuXHRcdFx0ZHJpdmVyRm9ybS5idXN5ID0gdHJ1ZTtcblxuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dXJsXHQ6IHZhcnMuc2VydmVyICsgdmFycy5hcGkuYmVjb21lRHJpdmVyLFxuXHRcdFx0XHR0eXBlXHQ6ICdQT1NUJyxcblx0XHRcdFx0ZGF0YVx0OiBkcml2ZXJGb3JtLmRhdGEsXG5cdFx0XHR9KVxuXHRcdFx0XHQuc3VjY2VzcyhyZXN1bHQgPT4ge1xuXHRcdFx0XHRcdCQoJy5tZXNzYWdlLS1zdWNjZXNzJykuYWRkQ2xhc3MoJ21lc3NhZ2UtLXNob3cnKTtcblxuXHRcdFx0XHRcdC8vINC/0LXRgNC10LrQu9GO0YfQuNGC0Ywg0YHRgtGA0LDQvdC40YbRg1xuXHRcdFx0XHRcdCQoJy5kcml2ZXItZm9ybScpLmF0dHIoJ2RhdGEtcGFnZScsICcxJyk7XG5cblx0XHRcdFx0XHQvLyDQvtGH0LjRgdGC0LrQsCDQv9C+0LvQtdC5INGE0L7RgNC80Ytcblx0XHRcdFx0XHQkKCdbZGF0YS1maWVsZC10eXBlXScpXG5cdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcblx0XHRcdFx0XHRcdFx0JChlbClcblx0XHRcdFx0XHRcdFx0XHQudmFsKCcnKVxuXHRcdFx0XHRcdFx0XHRcdC5hdHRyKCdkYXRhLWZpbGxlZCcsICdmYWxzZScpXG5cdFx0XHRcdFx0XHRcdFx0LmF0dHIoJ2RhdGEtY29ycmVjdCcsICdudWxsJyk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGRyaXZlckZvcm0uYnVzeSA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2Zvcm0gaGFzIGJlZWQgc2VudCcpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZmFpbChlcnJvciA9PiB7XG5cdFx0XHRcdFx0JCgnLm1lc3NhZ2UtLWZhaWwnKS5hZGRDbGFzcygnbWVzc2FnZS0tc2hvdycpO1xuXHRcdFx0XHRcdGlmIChlcnJvci5yZXNwb25zZVRleHQpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdzZXJ2ZXJzIGFuc3dlcjpcXG4nLGVycm9yLnJlc3BvbnNlVGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdVRk8gaGF2ZSBpbnRlcnJ1cHRlZCBvdXIgc2VydmVyXFwncyB3b3JrXFxud2VcXCdsIHRyeSB0byBmaXggaXQnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZHJpdmVyRm9ybS5idXN5ID0gZmFsc2U7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZHJpdmVyRm9ybTsiLCJpbXBvcnQgdmFycyBmcm9tICcuLi8uLi9jb21waWxlL3ZhcnMnO1xuXG5jb25zdCBnYWxsZXJ5ID0ge1xuXHRudW1Ub0xvYWQ6IDEwLFxuXHRjb250YWluZXI6ICQoJy5nYWxsZXJ5JyksXG5cdGxvYWRlclx0OiAkKCcuZ2FsbGVyeV9fbG9hZGluZycpLFxuXHRtb3JlQnRuXHQ6ICQoJy5nYWxsZXJ5X19idG4nKSxcblx0YnVzeVx0XHQ6IHRydWUsXG5cdHdhdGNoZWRcdDogZmFsc2UsXG5cdFxuXHR1cmxzOiB7XG5cdFx0YWxsXHQ6IFtdLFxuXHRcdHRvUHVzaDogW10sXG5cdH0sXG5cblx0aXRlbXM6IHtcblx0XHR0b1B1c2g6IG51bGwsXG5cdH0sXG5cdC8qKlxuXHQgKiDQv9C+0LvRg9GH0LXQvdC40LUg0YHQv9C40YHQutCwINC40LfQvtCx0YDQsNC20LXQvdC40Llcblx0ICovXG5cdGdldFVybHMoKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXN1bHQsIGVycm9yKSA9PiB7XG5cdFx0XHRsZXQgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdFx0cmVxdWVzdC5vcGVuKCdQT1NUJywgdmFycy5zZXJ2ZXIgKyB2YXJzLmFwaS5nYWxsZXJ5KTtcblx0XHRcdHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnKTtcblx0XHRcdHJlcXVlc3Qub25sb2FkID0gKCkgPT4ge1xuXHRcdFx0XHRpZiAocmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuXHRcdFx0XHRcdHJlc3VsdChKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlcnJvcihFcnJvcignSW1hZ2UgZGlkblxcJ3QgbG9hZCBzdWNjZXNzZnVsbHk7IGVycm9yIGNvZGU6JyArIHJlcXVlc3Quc3RhdHVzVGV4dCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0cmVxdWVzdC5vbmVycm9yID0gKCkgPT4ge1xuXHRcdFx0XHRlcnJvcihFcnJvcignVGhlcmUgd2FzIGEgbmV0d29yayBlcnJvci4nKSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe3RhZ3M6IFsnbWFpbiddfSkpO1xuXHRcdH0pO1xuXHR9LFxuXHRsb2FkU3RhcnQoKSB7XG5cdFx0dGhpcy5idXN5ID0gdHJ1ZTtcblx0XHR0aGlzLmxvYWRlci5zaG93KCk7XG5cdH0sXG5cdGxvYWRFbmQoKSB7XG5cdFx0dGhpcy5idXN5ID0gZmFsc2U7XG5cdFx0dGhpcy5sb2FkZXIuaGlkZSgpO1xuXHR9LFxuXHQvKipcblx0ICog0YHQvtC30LTQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6INCyINCU0J7QnNC1XG5cdCAqIEBwYXJhbSAge0Jvb2xlYW59IGlzRmlyc3Qg0L/QtdGA0LLRi9C5INC70Lgg0LLRi9C30L7QsiDRhNGD0L3QutGG0LjQuFxuXHQgKi9cblx0bWFrZUltZ3MoaXNGaXJzdCkge1xuXHRcdGlmICghdGhpcy51cmxzLmFsbC5sZW5ndGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIWlzRmlyc3QpIHtcblx0XHRcdHRoaXMubG9hZFN0YXJ0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMudXJscy5hbGwubGVuZ3RoID49IHRoaXMubnVtVG9Mb2FkKSB7XG5cdFx0XHR0aGlzLnVybHMudG9QdXNoID0gdGhpcy51cmxzLmFsbC5zcGxpY2UoLXRoaXMubnVtVG9Mb2FkLCB0aGlzLm51bVRvTG9hZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudXJscy50b1B1c2ggPSB0aGlzLnVybHMuYWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoID0gJCh0aGlzLnVybHMudG9QdXNoLmpvaW4oJycpKTtcblx0XHR0aGlzLnVybHMudG9QdXNoLmxlbmd0aCA9IDA7XG5cblx0XHRpZiAoaXNGaXJzdCkge1xuXHRcdFx0dGhpcy5jb250YWluZXJcblx0XHRcdFx0Lm1hc29ucnkoe1xuXHRcdFx0XHRcdGNvbHVtbldpZHRoXHRcdDogJy5nYWxsZXJ5X19pdGVtJyxcblx0XHRcdFx0XHRpc0FuaW1hdGVkXHRcdDogdHJ1ZSxcblx0XHRcdFx0XHRpc0luaXRMYXlvdXRcdDogdHJ1ZSxcblx0XHRcdFx0XHRpc1Jlc2l6YWJsZVx0XHQ6IHRydWUsXG5cdFx0XHRcdFx0aXRlbVNlbGVjdG9yXHQ6ICcuZ2FsbGVyeV9faXRlbScsXG5cdFx0XHRcdFx0cGVyY2VudFBvc2l0aW9uOiB0cnVlLFxuXHRcdFx0XHRcdHNpbmdsZU1vZGVcdFx0OiB0cnVlLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuYXBwZW5kKHRoaXMuaXRlbXMudG9QdXNoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jb250YWluZXIuYXBwZW5kKHRoaXMuaXRlbXMudG9QdXNoKTtcblx0XHR9XG5cblx0XHR0aGlzLml0ZW1zLnRvUHVzaFxuXHRcdFx0LmhpZGUoKVxuXHRcdFx0LmltYWdlc0xvYWRlZCgpXG5cdFx0XHQucHJvZ3Jlc3MoKGltZ0xvYWQsIGltYWdlKSA9PiB7XG5cdFx0XHRcdGNvbnN0ICRpdGVtID0gJChpbWFnZS5pbWcpLnBhcmVudHMoJy5nYWxsZXJ5X19pdGVtJyk7XG5cblx0XHRcdFx0aWYgKHRoaXMubG9hZGVyLmhhc0NsYXNzKCdnYWxsZXJ5X19sb2FkaW5nLS1maXJzdCcpKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2FkZXIucmVtb3ZlQ2xhc3MoJ2dhbGxlcnlfX2xvYWRpbmctLWZpcnN0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkaXRlbS5zaG93KCk7XG5cblx0XHRcdFx0dGhpcy5jb250YWluZXJcblx0XHRcdFx0XHQubWFzb25yeSgnYXBwZW5kZWQnLCAkaXRlbSlcblx0XHRcdFx0XHQubWFzb25yeSgpO1xuXHRcdFx0fSlcblx0XHRcdC5kb25lKCgpID0+IHtcblx0XHRcdFx0dGhpcy5sb2FkRW5kKCk7XG5cdFx0XHRcdHRoaXMub25TY3JvbGwoKTtcblxuXHRcdFx0XHRpZiAoIXRoaXMud2F0Y2hlZCkge1xuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGwoKCkgPT4ge3RoaXMub25TY3JvbGwoKX0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoLmxlbmd0aCA9IDA7XG5cdH0sXG5cdC8qKlxuXHQgKiDQvdCw0LLQtdGI0LjQstCw0LXQvNCw0Y8g0L3QsCDRgdC60YDQvtC70Lsg0YTRg9C90LrRhtC40Y9cblx0ICog0LfQsNC/0YPRgdC60LDQtdGCINC/0L7QtNCz0YDRg9C30LrRgyDRhNC+0YLQvtC6INC10YHQtNC4INC90LDQtNC+XG5cdCAqL1xuXHRvblNjcm9sbCgpIHtcblx0XHRjb25zdCBwYWdlSGVpZ2h0XHRcdD0gJChkb2N1bWVudCkuaGVpZ2h0KCk7XG5cdFx0Y29uc3Qgd2luZG93SGVpZ2h0XHQ9ICQod2luZG93KS5oZWlnaHQoKTtcblx0XHRjb25zdCB3aW5kb3dTY3JvbGxcdD0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXHRcdGNvbnN0IGxlZnRUb0JvdHRvbVx0PVx0cGFnZUhlaWdodCAtIHdpbmRvd0hlaWdodCAtIHdpbmRvd1Njcm9sbDtcblxuXHRcdGlmICghdGhpcy5idXN5ICYmIHRoaXMudXJscy5hbGwubGVuZ3RoICYmIGxlZnRUb0JvdHRvbSA8PSAzMDApIHtcblx0XHRcdGNvbnNvbGUubG9nKCdzY3JvbGwgbG9hZCcpO1xuXHRcdFx0dGhpcy5tYWtlSW1ncygpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdHRoaXMuZ2V0VXJscygpXG5cdFx0XHQudGhlbihcblx0XHRcdFx0cmVzdWx0ID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnZ290IGltYWdlcycpO1xuXHRcdFx0XHRcdHRoaXMudXJscy5hbGwgPSByZXN1bHQucmV2ZXJzZSgpO1xuXG5cdFx0XHRcdFx0dGhpcy51cmxzLmFsbC5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnVybHMuYWxsW2ldID0gJzxkaXYgZGF0YS11cmw9XCInICsgdmFycy5zZXJ2ZXIgKyBlbGVtICtcblx0XHRcdFx0XHRcdFx0J1wiIGNsYXNzPVwiZ2FsbGVyeV9faXRlbVwiPjxpbWcgc3JjPVwiJyArIHZhcnMuc2VydmVyICsgZWxlbSArXG5cdFx0XHRcdFx0XHRcdCdcIiBhbHQ+PGRpdiBjbGFzcz1cImdhbGxlcnlfX2RhcmtuZXNzXCI+PC9kaXY+PC9kaXY+Jztcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHRoaXMubWFrZUltZ3ModHJ1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvciwgJ2Vycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdhbGxlcnk7IiwiY29uc3QgaW5wdXQgPSB7XG5cdC8qKlxuXHQgKiDQvdCw0LLQtdGI0LjQstCw0LXRgiDRgdC+0LHRi9GC0LjRjyDQvdCwINC40L3Qv9GD0YJcblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdibHVyJywgJy5pbnB1dF9faW5wdXQnLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0XHRpZiAoJChlbGVtKS52YWwoKSkge1xuXHRcdFx0XHQkKGVsZW0pLmF0dHIoJ2RhdGEtZmlsbGVkJywgJ3RydWUnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1maWxsZWQnLCAnZmFsc2UnKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbigna2V5dXAnLCAnW2RhdGEtbWFzaz1cXCd0ZWxcXCddJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9IGV2ZW50LnRhcmdldDtcblxuXHRcdFx0JChlbGVtKS52YWwoaW5wdXQuZm9ybWF0KCQoZWxlbSkudmFsKCksICd0ZWwnKSk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJ1tkYXRhLW1hc2s9XFwndGVsXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSBldmVudC50YXJnZXQ7XG5cblx0XHRcdCQoZWxlbSkudmFsKGlucHV0LmZvcm1hdCgkKGVsZW0pLnZhbCgpLCAndGVsJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdrZXl1cCcsICdbZGF0YS1tYXNrPVxcJ3llYXJcXCddJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9IGV2ZW50LnRhcmdldDtcblxuXHRcdFx0JChlbGVtKS52YWwoaW5wdXQuZm9ybWF0KCQoZWxlbSkudmFsKCksICd5ZWFyJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdrZXl1cCcsICdbZGF0YS1tYXNrPVxcJ251bWJlclxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0XHQkKGVsZW0pLnZhbChpbnB1dC5mb3JtYXQoJChlbGVtKS52YWwoKSwgJ251bWJlcicpKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignYmx1cicsICdbZGF0YS1tYXNrXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSBldmVudC50YXJnZXQ7XG5cblx0XHRcdHN3aXRjaCAoJChlbGVtKS5hdHRyKCdkYXRhLW1hc2snKSkge1xuXHRcdFx0XHRjYXNlICdlbWFpbCc6XG5cdFx0XHRcdFx0aWYgKC8uK0AuK1xcLi4rL2kudGVzdCgkKGVsZW0pLnZhbCgpKSkge1xuXHRcdFx0XHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkKGVsZW0pLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICd0ZWwnOlxuXHRcdFx0XHRcdC8vIC9eKFtcXCtdKykqWzAtOVxceDIwXFx4MjhcXHgyOVxcLV17NywxMX0kL1xuXHRcdFx0XHRcdGlmICgkKGVsZW0pLnZhbCgpLmxlbmd0aCA9PT0gMTgpIHtcblx0XHRcdFx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnbmFtZSc6XG5cdFx0XHRcdFx0aWYgKC9eW2EtekEtWtCwLdGP0ZHQkC3Qr9CBXVthLXpBLVrQsC3Rj9GR0JAt0K/QgTAtOS1fXFwuXXsxLDIwfSQvLnRlc3QoJChlbGVtKS52YWwoKSkpIHtcblx0XHRcdFx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnZW1wdHknOlxuXHRcdFx0XHRjYXNlICd0ZXh0Jzpcblx0XHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0XHRpZiAoJChlbGVtKS52YWwoKSkge1xuXHRcdFx0XHRcdFx0JChlbGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkKGVsZW0pLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdlbXB0eScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICd5ZWFyJzpcblx0XHRcdFx0XHRpZiAoJChlbGVtKS52YWwoKSAmJlxuXHRcdFx0XHRcdFx0cGFyc2VJbnQoJChlbGVtKS52YWwoKSkgPj0gMTkwMCAmJlxuXHRcdFx0XHRcdFx0cGFyc2VJbnQoJChlbGVtKS52YWwoKSkgPD0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHRcdFx0XHQkKGVsZW0pLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdpbnB1dCcsICdbZGF0YS1tYXNrXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSBldmVudC50YXJnZXQ7XG5cblx0XHRcdCQoZWxlbSkuYXR0cignZGF0YS1jb3JyZWN0JywgJ251bGwnKTtcblx0XHR9KTtcblx0fSxcblxuXG5cdC8qKlxuXHQgKiDRhNC+0YDQvNCw0YLQuNGA0YPQtdGCINC30L3QsNGH0LXQvdC40LUg0LIg0LjQvdC/0YPRgtC1XG5cdCAqIEBwYXJhbSAge3N0cmluZ30gZGF0YSAgINC30L3QsNGH0LXQvdC40LUg0LIg0LjQvdC/0YPRgtC1XG5cdCAqIEBwYXJhbSAge3N0cmluZ30gZm9ybWF0INC40LzRjyDRhNC+0YDQvNCw0YLQsFxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICDQvtGC0YTQvtGA0LzQsNGC0LjRgNC+0LLQsNC90L3QvtC1INC30L3QsNGH0LXQvdC40LVcblx0ICovXG5cdGZvcm1hdChkYXRhLCBmb3JtYXQpIHtcblx0XHRzd2l0Y2ggKGZvcm1hdCkge1xuXHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0cmV0dXJuIGRhdGEucmVwbGFjZSgvXFxEL2csICcnKTtcblxuXHRcdFx0Y2FzZSAneWVhcic6XG5cdFx0XHRcdGRhdGEgPSBpbnB1dC5mb3JtYXQoZGF0YSwgJ251bWJlcicpO1xuXG5cdFx0XHRcdGlmIChkYXRhLmxlbmd0aCA+IDQpIHtcblx0XHRcdFx0XHRkYXRhID0gZGF0YS5zbGljZSgwLCA0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBkYXRhO1xuXG5cdFx0XHRjYXNlICd0ZWwnOlxuXHRcdFx0XHRkYXRhID0gaW5wdXQuZm9ybWF0KGRhdGEsICdudW1iZXInKTtcblxuXHRcdFx0XHRsZXQgbmV3RGF0YSA9ICcnO1xuXG5cdFx0XHRcdGlmIChkYXRhLmxlbmd0aCA8PSAxMSkge1xuXHRcdFx0XHRcdHN3aXRjaChkYXRhLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRcdFx0aWYoZGF0YVswXSAhPT0gJzcnKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMF07XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgNTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA2OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XSArIGRhdGFbNV07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA3OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XSArIGRhdGFbNV0gKyBkYXRhWzZdO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgODpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDk6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbN10gKyBkYXRhWzhdO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMTA6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbN10gKyBkYXRhWzhdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzldO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMTE6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbN10gKyBkYXRhWzhdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzldICsgZGF0YVsxMF07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs5XSArIGRhdGFbMTBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBuZXdEYXRhO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb25zb2xlLmxvZygnd3JvbmcgaW5wdXQgZm9ybWF0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdXQ7IiwiY29uc3QgbWFwID0ge1xuXHRpbml0KCkge1xuXHRcdCQoJyNtYXAnKS5sYXp5bG9hZCh7XG5cdFx0XHR0aHJlc2hvbGQ6IDIwMCxcblx0XHRcdGVmZmVjdFx0OiAnZmFkZUluJyxcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwOyIsImNvbnN0IG1lc3NhZ2UgPSB7XG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcubWVzc2FnZV9fYmcsIC5tZXNzYWdlX19jbG9zZScsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcblx0XHRcdCQoZWxlbSlcblx0XHRcdFx0LmNsb3Nlc3QoJy5tZXNzYWdlJylcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdtZXNzYWdlLS1zaG93Jyk7XG5cdFx0fSk7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWVzc2FnZTsiLCJjb25zdCBwaW4gPSB7XG5cdHNlY1x0XHQ6IDU1NTU1LFxuXHRob3Vyc1x0XHQ6IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSxcblx0bWludXRlc1x0OiBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKSxcblx0c2Vjb25kc1x0OiBuZXcgRGF0ZSgpLmdldFNlY29uZHMoKSxcblx0LyoqXG5cdCAqINGB0YfQtdGC0YfQuNC6LCDRg9Cy0LXQu9C40YfQuNCy0LDQtdGCINCy0YDQtdC80Y9cblx0ICovXG5cdGNvdW50ZG93bigpIHtcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnXScpLnRleHQoTWF0aC5mbG9vcihwaW4uc2VjLzM2MDApKTtcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnXScpLnRleHQoTWF0aC5mbG9vcihwaW4uc2VjJTM2MDAvNjApKTtcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdzXFwnXScpLnRleHQoTWF0aC5mbG9vcihwaW4uc2VjJTM2MDAlNjApKTtcblxuXHRcdHBpbi5zZWMgKz0gMTtcblx0fSxcblx0LyoqXG5cdCAqINC00L7QsdCw0LLQu9GP0LXRgiDQuiDRhtC40YTRgNC1INC90L7Qu9GMLCDRh9GC0L7QsSDQv9C+0LvRg9GH0LjRgtGMINC00LLRg9C30L3QsNGH0L3QvtC1INGH0LjRgdC70L5cblx0ICogQHBhcmFtICB7bnVtYmVyfSBudW1iZXIg0YbQuNGE0YDQsCDQuNC70Lgg0YfQuNGB0LvQvlxuXHQgKiBAcmV0dXJuIHtudW1iZXJ9ICAgICAgICDQtNCy0YPQt9C90LDRh9C90L7QtSDRh9C40YHQu9C+XG5cdCAqL1xuXHR0d29OdW1iZXJzKG51bWJlcikge1xuXHRcdGlmIChudW1iZXIgPCAxMCkge1xuXHRcdFx0bnVtYmVyID0gJzAnICsgbnVtYmVyLnRvU3RyaW5nKCk7XG5cdFx0fVxuXHRcdHJldHVybiBudW1iZXI7XG5cdH0sXG5cblx0c2V0VGltZSgpIHtcblx0XHRwaW4uaG91cnMgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCk7XG5cdFx0XHRcdFxuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCcnKS50ZXh0KHBpbi50d29OdW1iZXJzKHBpbi5ob3VycykpO1xuXG5cdFx0cGluLm1pbnV0ZXMgPSBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKTtcblx0XHRcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnJykudGV4dChwaW4udHdvTnVtYmVycyhwaW4ubWludXRlcykpO1xuXG5cdFx0cGluLnNlY29uZHMgPSBuZXcgRGF0ZSgpLmdldFNlY29uZHMoKTtcblx0XHRcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdzXFwnJykudGV4dChwaW4udHdvTnVtYmVycyhwaW4uc2Vjb25kcykpO1xuXHR9LFxuXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5waW4nLCBldmVudCA9PiB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRsZXQgZWxlbSA9IGV2ZW50LnRhcmdldDtcblxuXHRcdFx0aWYgKCEkKGVsZW0pLmhhc0NsYXNzKCdwaW4nKSkge1xuXHRcdFx0XHRlbGVtID0gJChlbGVtKS5jbG9zZXN0KCcucGluJyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdCQoZWxlbSlcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdwaW4tLXNob3cnKVxuXHRcdFx0XHQuY3NzKCd6LWluZGV4JywgJzInKVxuXHRcdFx0XHQuc2libGluZ3MoKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3Bpbi0tc2hvdycpXG5cdFx0XHRcdC5jc3MoJ3otaW5kZXgnLCAnMScpO1xuXHRcdH0pO1xuXG5cdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnZGVza3RvcCcpKSB7XG5cdFx0XHRsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKCk7XG5cblx0XHRcdG5ld0RhdGUuc2V0RGF0ZShuZXdEYXRlLmdldERhdGUoKSk7XG5cblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCcnKS50ZXh0KHBpbi5ob3Vycyk7XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnJykudGV4dChwaW4ubWludXRlcyk7XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdzXFwnJykudGV4dChwaW4uc2Vjb25kcyk7XG5cblx0XHRcdHNldEludGVydmFsKHBpbi5zZXRUaW1lLCAxMDAwKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnXScpXG5cdFx0XHRcdC50ZXh0KE1hdGguZmxvb3IocGluLnNlYy8zNjAwKSA8IDEwID9cblx0XHRcdFx0XHRcdFx0JzAnICsgTWF0aC5mbG9vcihwaW4uc2VjLzM2MDApIDpcblx0XHRcdFx0XHRcdFx0TWF0aC5mbG9vcihwaW4uc2VjLzM2MDApKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnbVxcJ10nKVxuXHRcdFx0XHQudGV4dChNYXRoLmZsb29yKHBpbi5zZWMlMzYwMC82MCkgPCAxMCA/XG5cdFx0XHRcdFx0XHRcdCcwJyArIE1hdGguZmxvb3IocGluLnNlYyUzNjAwLzYwKSA6XG5cdFx0XHRcdFx0XHRcdE1hdGguZmxvb3IocGluLnNlYyUzNjAwLzYwKSk7XG5cblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ3NcXCddJylcblx0XHRcdFx0LnRleHQoTWF0aC5mbG9vcihwaW4uc2VjJTM2MDAlNjApIDwgMTAgP1xuXHRcdFx0XHRcdFx0XHQnMCcgKyBNYXRoLmZsb29yKHBpbi5zZWMlMzYwMCU2MCkgOlxuXHRcdFx0XHRcdFx0XHRNYXRoLmZsb29yKHBpbi5zZWMlMzYwMCU2MCkpO1xuXG5cdFx0XHRwaW4uc2VjICs9IDE7XG5cblx0XHRcdHNldEludGVydmFsKHBpbi5jb3VudGRvd24sIDEwMDApO1xuXHRcdH1cblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcGluOyIsImNvbnN0IHF1ZXN0aW9uID0ge1xuXHRpbml0KCkge1xuXHRcdCQoJy5xdWVzdGlvbnNfX2l0ZW0nKS5lcSgxKS5oaWRlKCk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tYWluLWJ0bi0taGRpdycsIGV2ZW50ID0+IHtcblx0XHRcdGxldCBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0aWYgKCEkKGVsZW0pLmhhc0NsYXNzKCdtYWluLWJ0bi0taGRpdycpKSB7XG5cdFx0XHRcdGVsZW0gPSAkKGVsZW0pLmNsb3Nlc3QoJy5tYWluLWJ0bi0taGRpdycpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoISQoZWxlbSkuaGFzQ2xhc3MoJ21haW4tYnRuLS1hY3RpdmUnKSkge1xuXHRcdFx0XHQkKGVsZW0pXG5cdFx0XHRcdFx0LmFkZENsYXNzKCdtYWluLWJ0bi0tYWN0aXZlJylcblx0XHRcdFx0XHQuc2libGluZ3MoKVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbWFpbi1idG4tLWFjdGl2ZScpO1xuXHRcdFx0XG5cdFx0XHRcdCQoJy5xdWVzdGlvbnNfX2l0ZW0nKVxuXHRcdFx0XHRcdC5lcSgkKGVsZW0pLmluZGV4KCkgLSAyKVxuXHRcdFx0XHRcdC5mYWRlSW4oMzAwKVxuXHRcdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdFx0LmZhZGVPdXQoMzAwKTtcblxuXHRcdFx0XHQkKCcucXVlc3Rpb25zX19pdGVtJylcblx0XHRcdFx0XHQuZmluZCgnLnF1ZXN0aW9uX19ib2R5Jylcblx0XHRcdFx0XHQuc2xpZGVVcCgzMDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcucXVlc3Rpb25fX2hlYWRlcicsIGV2ZW50ID0+IHtcblx0XHRcdGxldCBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0aWYgKCEkKGVsZW0pLmhhc0NsYXNzKCdxdWVzdGlvbl9faGVhZGVyJykpIHtcblx0XHRcdFx0ZWxlbSA9IGVsZW0uY2xvc2VzdCgnLnF1ZXN0aW9uX19oZWFkZXInKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0JChlbGVtKVxuXHRcdFx0XHQuc2libGluZ3MoJy5xdWVzdGlvbl9fYm9keScpXG5cdFx0XHRcdC5zbGlkZVRvZ2dsZSgzMDApXG5cdFx0XHRcdC5jbG9zZXN0KCcucXVlc3Rpb24nKVxuXHRcdFx0XHQuc2libGluZ3MoJy5xdWVzdGlvbicpXG5cdFx0XHRcdC5maW5kKCcucXVlc3Rpb25fX2JvZHknKVxuXHRcdFx0XHQuc2xpZGVVcCgzMDApO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBxdWVzdGlvbjsiLCJjb25zdCBzY3JvbGxCdG4gPSB7XG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcuc2Nyb2xsLWJ0bicsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSBldmVudC50YXJnZXQ7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XG5cdFx0XHQkKCdodG1sLCBib2R5Jylcblx0XHRcdFx0LmFuaW1hdGUoXG5cdFx0XHRcdFx0e3Njcm9sbFRvcDogJChlbGVtKS5jbG9zZXN0KCcuc2VjdGlvbicpLm91dGVySGVpZ2h0KCl9LFxuXHRcdFx0XHRcdDcwMCk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNjcm9sbEJ0bjsiLCJjb25zdCBzZWFyY2ggPSB7XG5cdG5lZWRlZFNjcm9sbDogbnVsbCxcblx0c3RhcnRlZFx0XHQ6IGZhbHNlLFxuXG5cdGluaXQoKSB7XG5cdFx0c2VhcmNoLm5lZWRlZFNjcm9sbCA9ICQoJy5zZWFyY2gnKS5vZmZzZXQoKS50b3AgLSAkKHdpbmRvdykuaGVpZ2h0KCkgKyAkKCcuc2VhcmNoJykuaGVpZ2h0KCkgLyAyO1xuXHRcdFxuXHRcdCQod2luZG93KS5zY3JvbGwoKCkgPT4ge1xuXHRcdFx0aWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSBzZWFyY2gubmVlZGVkU2Nyb2xsICYmICFzZWFyY2guc3RhcnRlZCkge1xuXHRcdFx0XHQkKCcuc2VhcmNoJykuYWRkQ2xhc3MoJ3NlYXJjaC0tYW5pbWF0ZScpO1xuXHRcdFx0XHRzZWFyY2guc3RhcnRlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlYXJjaDsiLCJjb25zdCBzbGlkZVBhY2sgPSB7XG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdbZGF0YS1wYWctcG9zXScsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdCQoZXZlbnQudGFyZ2V0KVxuXHRcdFx0XHQuYWRkQ2xhc3MoJ3NsaWRlLXBhY2tfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdzbGlkZS1wYWNrX19wYWctLWFjdGl2ZScpXG5cdFx0XHRcdC5jbG9zZXN0KCcuc2xpZGUtcGFja19fcGFncycpXG5cdFx0XHRcdC5zaWJsaW5ncygnW2RhdGEtc2xpZGVyLXBvc10nKVxuXHRcdFx0XHQuYXR0cignZGF0YS1zbGlkZXItcG9zJywgJChldmVudC50YXJnZXQpLmF0dHIoJ2RhdGEtcGFnLXBvcycpKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2xpZGVQYWNrOyIsImNvbnN0IHRhYmxldCA9IHtcblx0bW9iT25lXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW1vYi14MScpLFxuXHRtb2JUd29cdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtbW9iLXgyJyksXG5cdG1vYlRocmVlXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW1vYi14MycpLFxuXHR0YWJPbmVcdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtdGFiLXgxJyksXG5cdHRhYlR3b1x0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS10YWIteDInKSxcblx0dGFiVGhyZWVcdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtdGFiLXgzJyksXG5cblx0aW5pdCgpIHtcblx0XHRpZiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMykge1xuXHRcdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJykpIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0YWJsZXQubW9iVGhyZWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0YWJsZXQudGFiVGhyZWUpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMikge1xuXHRcdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJykpIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0YWJsZXQubW9iVHdvKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGFibGV0LnRhYlR3byk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlICB7XG5cdFx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSkge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRhYmxldC5tb2JPbmUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0YWJsZXQudGFiT25lKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQkKCcjdGFibGV0JykubGF6eWxvYWQoe1xuXHRcdFx0dGhyZXNob2xkOiAyMDAsXG5cdFx0XHRlZmZlY3RcdDogJ2ZhZGVJbicsXG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxldDsiLCJjb25zdCB1cEJ0biA9IHtcblx0c2V0VmlzaWJpbGl0eSgpIHtcblx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49IDgwMCkge1xuXHRcdFx0JCgnLnVwLWJ0bicpLmFkZENsYXNzKCd1cC1idG4tLXNob3cnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnLnVwLWJ0bicpLnJlbW92ZUNsYXNzKCd1cC1idG4tLXNob3cnKTtcblx0XHR9XG5cdH0sXG5cdGluaXQoKSB7XG5cdFx0dXBCdG4uc2V0VmlzaWJpbGl0eSgpO1xuXG5cdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7XG5cdFx0XHR1cEJ0bi5zZXRWaXNpYmlsaXR5KCk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy51cC1idG4nLCAoKSA9PiB7XG5cdFx0XHQkKCdodG1sLCBib2R5Jylcblx0XHRcdFx0LnN0b3AoKVxuXHRcdFx0XHQuYW5pbWF0ZShcblx0XHRcdFx0XHR7c2Nyb2xsVG9wOiAwfSxcblx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsVG9wKCkvNCk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVwQnRuOyIsImNvbnN0IHdkU2xpZGVyID0ge1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLndkLXNsaWRlcl9fcGFnJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9IGV2ZW50LnRhcmdldDtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdCQoZWxlbSlcblx0XHRcdFx0LmFkZENsYXNzKCd3ZC1zbGlkZXJfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCd3ZC1zbGlkZXJfX3BhZy0tYWN0aXZlJyk7XG5cdFx0XHRcdFxuXHRcdFx0aWYgKCQoZWxlbSkuaW5kZXgoKSA9PT0gMSkge1xuXHRcdFx0XHQkKGVsZW0pXG5cdFx0XHRcdFx0LmNsb3Nlc3QoJy53ZC1zbGlkZXInKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnd2Qtc2xpZGVyLS10d28nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoZWxlbSlcblx0XHRcdFx0XHQuY2xvc2VzdCgnLndkLXNsaWRlcicpXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCd3ZC1zbGlkZXItLXR3bycpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB3ZFNsaWRlcjsiLCJjb25zdCB5YU1hcCA9IHtcblx0cG9pbnRzOiBbXSxcblx0bWFwOiB7fSxcblx0LyoqXG5cdCAqINC+0LHRitGP0LLQu9GP0LXRgiDRgtC+0YfQutC4ICjQvdCw0LTQviDQstGL0L/QvtC70L3Rj9GC0Ywg0L/QvtGB0LvQtSDRgdC+0LfQtNCw0L3QuNGPINC60LDRgNGC0YspXG5cdCAqL1xuXHRzZXRQb2ludHMoKSB7XG5cdFx0eWFNYXAucG9pbnRzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRjb29yZHM6IFs1OS45MjAyMjk3NTk2Mjc2OSwgMzAuMzcyOTU1OTk5OTk5OTc3XSxcblx0XHRcdFx0dGl0bGVzOiB7XG5cdFx0XHRcdFx0aGludENvbnRlbnRcdFx0OiAn0JPQu9Cw0LLQvdGL0Lkg0L7RhNC40YEnLFxuXHRcdFx0XHRcdGJhbGxvb25Db250ZW50XHQ6ICfQodCf0LEsINCh0YPQstC+0YDQvtCy0YHQutC40Lkg0L/RgNC+0YHQv9C10LrRgiwgNjXQsSwg0L7RhNC40YEgMTYnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwYXJhbXM6IHtcblx0XHRcdFx0XHRpY29uTGF5b3V0OiB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3Rvcnlcblx0XHRcdFx0XHRcdC5jcmVhdGVDbGFzcygnPGRpdiBjbGFzcz1cXCd5YS1tYXBfX2ljb24geWEtbWFwX19pY29uLS1yZWRcXCc+PC9kaXY+JyksXG5cblx0XHRcdFx0XHRpY29uU2hhcGU6IHtcblx0XHRcdFx0XHRcdHR5cGVcdFx0XHQ6ICdSZWN0YW5nbGUnLFxuXHRcdFx0XHRcdFx0Y29vcmRpbmF0ZXNcdDogW1stNywgLTQwXSwgWzMzLCAwXV0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGNvb3JkczogWzU5Ljk0NDg0MDkzNzcxOTMxLCAzMC4zODg1OTAxNjY4NDAxNl0sXG5cdFx0XHRcdHRpdGxlczoge1xuXHRcdFx0XHRcdGhpbnRDb250ZW50XHRcdDogJ9CT0LvQsNCy0L3Ri9C5INC+0YTQuNGBJyxcblx0XHRcdFx0XHRiYWxsb29uQ29udGVudFx0OiAn0KHQn9CxLCDQodGD0LLQvtGA0L7QstGB0LrQuNC5INC/0YDQvtGB0L/QtdC60YIsIDY10LEsINC+0YTQuNGBIDE2Jyxcblx0XHRcdFx0fSxcblx0XHRcdFx0cGFyYW1zOiB7XG5cdFx0XHRcdFx0aWNvbkxheW91dDogeW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5XG5cdFx0XHRcdFx0XHQuY3JlYXRlQ2xhc3MoJzxkaXYgY2xhc3M9XFwneWEtbWFwX19pY29uIHlhLW1hcF9faWNvbi0tYmx1ZVxcJz48L2Rpdj4nKSxcblxuXHRcdFx0XHRcdGljb25TaGFwZToge1xuXHRcdFx0XHRcdFx0dHlwZVx0XHRcdDogJ1JlY3RhbmdsZScsXG5cdFx0XHRcdFx0XHRjb29yZGluYXRlc1x0OiBbWy03LCAtNDBdLCBbMzMsIDBdXSxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHR9XG5cdFx0XTtcblx0fSxcblx0LyoqXG5cdCAqINGB0L7Qt9C00LDQtdGCINGC0L7Rh9C60YMg0L3QsCDQutCw0YDRgtC1XG5cdCAqIEBwYXJhbSB7b2JqZXh0fSBwb2ludCDQvtCx0YrQtdC60YIg0YEg0LTQsNC90L3Ri9C80Lgg0YLQvtGH0LrQuFxuXHQgKi9cblx0c2V0UG9pbnQocG9pbnQpIHtcblx0XHR5YU1hcC5tYXAuZ2VvT2JqZWN0cy5hZGQobmV3IHltYXBzLlBsYWNlbWFyayhwb2ludC5jb29yZHMsIHBvaW50LnRpdGxlcywgcG9pbnQucGFyYW1zKSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0LXRgiDQutCw0YDRgtGDXG5cdCAqL1xuXHRzZXRNYXAoKSB7XG5cdFx0eWFNYXAubWFwID0gbmV3IHltYXBzLk1hcCgneWFNYXAnLCB7XG5cdFx0XHRjZW50ZXI6IFtcblx0XHRcdFx0NTkuOTMxNTkzMjIyMzM5ODQsXG5cdFx0XHRcdDMwLjM3NTE0NDY4MjU1NjEyMlxuXHRcdFx0XSxcblx0XHRcdGNvbnRyb2xzOiBbXG5cdFx0XHRcdCd6b29tQ29udHJvbCcsXG5cdFx0XHRdLFxuXHRcdFx0em9vbTogMTMsXG5cdFx0fSk7XG5cblx0XHR5YU1hcC5zZXRQb2ludHMoKTtcblxuXHRcdHlhTWFwLnBvaW50cy5mb3JFYWNoKGVsZW0gPT4ge1xuXHRcdFx0eWFNYXAuc2V0UG9pbnQoZWxlbSk7XG5cdFx0fSk7XG5cblx0XHR5YU1hcC5tYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdHltYXBzLnJlYWR5KHlhTWFwLnNldE1hcCk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHlhTWFwOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGRyaXZlckZvcm1cdGZyb20gJy4uL2Jsb2Nrcy9kcml2ZXItZm9ybS9kcml2ZXItZm9ybTInO1xuaW1wb3J0IGlucHV0XHRcdGZyb20gJy4uL2Jsb2Nrcy9pbnB1dC9pbnB1dDInO1xuaW1wb3J0IG1lc3NhZ2VcdFx0ZnJvbSAnLi4vYmxvY2tzL21lc3NhZ2UvbWVzc2FnZSc7XG5pbXBvcnQgYnVyZ2VyXHRcdGZyb20gJy4uL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyJztcbmltcG9ydCBzY3JvbGxCdG5cdGZyb20gJy4uL2Jsb2Nrcy9zY3JvbGwtYnRuL3Njcm9sbC1idG4nO1xuaW1wb3J0IHdkU2xpZGVyXHRmcm9tICcuLi9ibG9ja3Mvd2Qtc2xpZGVyL3dkLXNsaWRlcic7XG5pbXBvcnQgdGFibGV0XHRcdGZyb20gJy4uL2Jsb2Nrcy90YWJsZXQvdGFibGV0JztcbmltcG9ydCBzZWFyY2hcdFx0ZnJvbSAnLi4vYmxvY2tzL3NlYXJjaC9zZWFyY2gnO1xuaW1wb3J0IHBpblx0XHRcdGZyb20gJy4uL2Jsb2Nrcy9waW4vcGluJztcbmltcG9ydCBtYXBcdFx0XHRmcm9tICcuLi9ibG9ja3MvbWFwL21hcCc7XG5pbXBvcnQgc2xpZGVQYWNrXHRmcm9tICcuLi9ibG9ja3Mvc2xpZGUtcGFjay9zbGlkZS1wYWNrJztcbmltcG9ydCBkb3RTdHJpcFx0ZnJvbSAnLi4vYmxvY2tzL2RvdC1zdHJpcC9kb3Qtc3RyaXAnO1xuaW1wb3J0IHF1ZXN0aW9uXHRmcm9tICcuLi9ibG9ja3MvcXVlc3Rpb24vcXVlc3Rpb24nO1xuaW1wb3J0IHVwQnRuXHRcdGZyb20gJy4uL2Jsb2Nrcy91cC1idG4vdXAtYnRuJztcbmltcG9ydCB5YU1hcFx0XHRmcm9tICcuLi9ibG9ja3MveWEtbWFwL3lhLW1hcCc7XG5pbXBvcnQgdmFyc1x0XHRcdGZyb20gJy4vdmFycyc7XG5pbXBvcnQgZ2FsbGVyeVx0XHRmcm9tICcuLi9ibG9ja3MvZ2FsbGVyeS9nYWxsZXJ5Mic7XG5cbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvanF1ZXJ5X2xhenlsb2FkL2pxdWVyeS5sYXp5bG9hZCcpO1xucmVxdWlyZSgnZGV2aWNlLmpzJyk7XG5cbmNvbnN0IGphdGEgPSB7XG5cdHJlYWR5KCkge1xuXHRcdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xuXHRcdFx0amF0YS5pbml0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBqYXRhLmluaXQpO1xuXHRcdH1cblx0fSxcblxuXHRpbml0KCkge1xuXHRcdGJ1cmdlci5pbml0KCk7XG5cdFx0dXBCdG4uaW5pdCgpO1xuXG5cdFx0c3dpdGNoICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpIHtcblx0XHRcdGNhc2UgJy8nOlxuXHRcdFx0XHRkcml2ZXJGb3JtLmluaXQoKTtcblx0XHRcdFx0aW5wdXQuaW5pdCgpO1xuXHRcdFx0XHRtZXNzYWdlLmluaXQoKTtcblx0XHRcdFx0c2Nyb2xsQnRuLmluaXQoKTtcblx0XHRcdFx0d2RTbGlkZXIuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2ZvcmFkdi5odG1sJzpcblx0XHRcdFx0ZG90U3RyaXAuaW5pdCgpO1xuXHRcdFx0XHRtYXAuaW5pdCgpO1xuXHRcdFx0XHRwaW4uaW5pdCgpO1xuXHRcdFx0XHRzY3JvbGxCdG4uaW5pdCgpO1xuXHRcdFx0XHRzZWFyY2guaW5pdCgpO1xuXHRcdFx0XHRzbGlkZVBhY2suaW5pdCgpO1xuXHRcdFx0XHR0YWJsZXQuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2NvbnRhY3RzLmh0bWwnOlxuXHRcdFx0XHR5YU1hcC5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvaG93Lmh0bWwnOlxuXHRcdFx0XHRxdWVzdGlvbi5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvZ2FsbGVyeS5odG1sJzpcblx0XHRcdFx0Z2FsbGVyeS5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvLyBkZWZhdWx0OlxuXHRcdFx0Ly8gXHRsb2NhdGlvbi5ocmVmID0gdmFycy5zZXJ2ZXIgKyAnLzQwNC5odG1sJztcblx0XHRcdC8vIFx0YnJlYWs7XG5cdFx0fVxuXHR9LFxufTtcblxuamF0YS5yZWFkeSgpOyIsImNvbnN0IE5PREVfRU5WID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2RldmVsb3BtZW50JztcbmNvbnN0IHByb2R1Y3Rpb24gPSBOT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gdHJ1ZSA6IGZhbHNlO1xuXG5jb25zdCB2YXJzID0ge1xuXHRzZXJ2ZXI6IHByb2R1Y3Rpb24gPyAnaHR0cHM6Ly9qYXRhLnJ1JyA6ICdodHRwOi8vZGV2LmphdGEucnUnLFxuXHRhcGlcdDoge1xuXHRcdGJlY29tZURyaXZlcjogJy9hcGkvdjEvYWNjb3VudHMvYmVjb21lZHJpdmVyJyxcblx0XHRnYWxsZXJ5XHRcdDogJy9hcGkvdjEvZ2FsbGVyeScsXG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZhcnM7Il19
