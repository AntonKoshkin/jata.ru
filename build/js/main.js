(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/bower_components/jquery_lazyload/jquery.lazyload.js","/bower_components/jquery_lazyload")

},{"_process":7,"buffer":3}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/base64-js/index.js","/node_modules/base64-js")

},{"_process":7,"buffer":3}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/buffer/index.js","/node_modules/buffer")

},{"_process":7,"base64-js":2,"buffer":3,"ieee754":5,"isarray":6}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/device.js/lib/device.js","/node_modules/device.js/lib")

},{"_process":7,"buffer":3}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/ieee754/index.js","/node_modules/ieee754")

},{"_process":7,"buffer":3}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/isarray/index.js","/node_modules/isarray")

},{"_process":7,"buffer":3}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/process/browser.js","/node_modules/process")

},{"_process":7,"buffer":3}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/burger/burger.js","/src/blocks/burger")

},{"_process":7,"buffer":3}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

var dotStrip = {
	/**
  * инит функция
  */
	init: function init() {
		$('body').on('click', '.dot-strip__input', function () {
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

				// skip default
			}

			$(this).closest('.slider').find('.slide-pack').attr('data-slider-pos', $(this).attr('data-dot-pos'));
		});
	}
};

module.exports = dotStrip;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/dot-strip/dot-strip.js","/src/blocks/dot-strip")

},{"_process":7,"buffer":3}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/* global $*/

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
					// falls through

					case 2:
						currentPage.find('[data-mask]').each(function (index, el) {
							if ($(el).length && $(el).attr('data-correct') !== 'true') {
								currentPage.find('[data-mask]').each(function (i, item) {
									if ($(item).attr('data-correct') !== 'true') {
										$(item).attr('data-correct', 'false');
									}
								});

								_this.fieldsCorrect = false;
								return false;
							}

							_this.data[$(el).attr('id')] = $(el).val();
							_this.fieldsCorrect = true;

							return true;
						});

						_this.data.phone = _this.data.phone.replace(/\D/g, '');
						break;

					case 3:
						currentPage.find('[data-mask]').each(function (index, el) {
							if ($(el).length && $(el).attr('data-correct') !== 'true') {
								currentPage.find('[data-mask]').each(function (i, item) {
									if ($(item).attr('data-correct') !== 'true') {
										$(item).attr('data-correct', 'false');
									}
								});

								_this.fieldsCorrect = false;

								return false;
							}

							currentPage.find('[data-filled]').each(function (i, item) {
								_this.data[$(item).attr('id')] = $(item).val();
							});

							_this.fieldsCorrect = true;

							return true;
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
			}).success(function () {
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/driver-form/driver-form.js","/src/blocks/driver-form")

},{"../../compile/vars":25,"_process":7,"buffer":3}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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
					return _this.onScroll();
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

		$('body').on('click', '.gallery__item', function () {
			var imgUrl = $(this).attr('data-url');

			$('[data-gal-modal]').attr('src', imgUrl).closest('.gallery__bg').fadeIn(300);
		});

		$('body').on('click', '.gallery__bg', function () {
			$(this).fadeOut(300);
		});
	}
}; /* global $ */

module.exports = gallery;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/gallery/gallery.js","/src/blocks/gallery")

},{"../../compile/vars":25,"_process":7,"buffer":3}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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
					if (elem.val().length === 18) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				case 'name':
					if (/^[a-zA-Zа-яёА-ЯЁ][a-zA-Zа-яёА-ЯЁ0-9-_.]{1,20}$/.test(elem.val())) {
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
					if (elem.val() && parseInt(elem.val(), 10) >= 1900 && parseInt(elem.val(), 10) <= new Date().getFullYear()) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				// skip default
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
		var newData = '';

		switch (_format) {
			case 'number':
				newData = data.replace(/\D/g, '');
				break;

			case 'year':
				newData = input.format(data, 'number');

				if (newData.length > 4) {
					newData = newData.slice(0, 4);
				}
				break;

			case 'tel':
				newData = input.format(data, 'number');

				if (newData.length <= 11) {
					switch (newData.length) {
						case 0:
							newData = '+7 (';
							break;
						case 1:
							if (newData[0] !== '7') {
								newData = '+7 (' + newData[0];
							} else {
								newData = '+7 (';
							}
							break;
						case 2:
							newData = '+7 (' + newData[1];
							break;
						case 3:
							newData = '+7 (' + newData[1] + newData[2];
							break;
						case 4:
							newData = '+7 (' + newData[1] + newData[2] + newData[3];
							break;
						case 5:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] + ') ' + newData[4];
							break;
						case 6:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] + ') ' + newData[4] + newData[5];
							break;
						case 7:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] + ') ' + newData[4] + newData[5] + newData[6];
							break;
						case 8:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] + ') ' + newData[4] + newData[5] + newData[6] + '-' + newData[7];
							break;
						case 9:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] + ') ' + newData[4] + newData[5] + newData[6] + '-' + newData[7] + newData[8];
							break;
						case 10:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] + ') ' + newData[4] + newData[5] + newData[6] + '-' + newData[7] + newData[8] + '-' + newData[9];
							break;
						case 11:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] + ') ' + newData[4] + newData[5] + newData[6] + '-' + newData[7] + newData[8] + '-' + newData[9] + newData[10];
							break;

						// skip default
					}
				} else {
					newData = '+7 (' + newData[1] + newData[2] + newData[3] + ') ' + newData[4] + newData[5] + newData[6] + '-' + newData[7] + newData[8] + '-' + newData[9] + newData[10];
				}
				break;

			default:
				newData = data;
				console.log('wrong input format');
				break;
		}

		return newData;
	}
};

module.exports = input;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/input/input.js","/src/blocks/input")

},{"_process":7,"buffer":3}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/map/map.js","/src/blocks/map")

},{"_process":7,"buffer":3}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/message/message.js","/src/blocks/message")

},{"_process":7,"buffer":3}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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
		var newNumber = null;

		if (number < 10) {
			newNumber = '0' + number.toString();
		}

		return newNumber;
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/pin/pin.js","/src/blocks/pin")

},{"_process":7,"buffer":3}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/question/question.js","/src/blocks/question")

},{"_process":7,"buffer":3}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/scroll-btn/scroll-btn.js","/src/blocks/scroll-btn")

},{"_process":7,"buffer":3}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/search/search.js","/src/blocks/search")

},{"_process":7,"buffer":3}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/slide-pack/slide-pack.js","/src/blocks/slide-pack")

},{"_process":7,"buffer":3}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/tablet/tablet.js","/src/blocks/tablet")

},{"_process":7,"buffer":3}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/up-btn/up-btn.js","/src/blocks/up-btn")

},{"_process":7,"buffer":3}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $ */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/wd-slider/wd-slider.js","/src/blocks/wd-slider")

},{"_process":7,"buffer":3}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/* global $, ymaps */

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/ya-map/ya-map.js","/src/blocks/ya-map")

},{"_process":7,"buffer":3}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var _vars = require('./vars');

var _vars2 = _interopRequireDefault(_vars);

var _burger = require('../blocks/burger/burger');

var _burger2 = _interopRequireDefault(_burger);

var _dotStrip = require('../blocks/dot-strip/dot-strip');

var _dotStrip2 = _interopRequireDefault(_dotStrip);

var _driverForm = require('../blocks/driver-form/driver-form');

var _driverForm2 = _interopRequireDefault(_driverForm);

var _gallery = require('../blocks/gallery/gallery');

var _gallery2 = _interopRequireDefault(_gallery);

var _input = require('../blocks/input/input');

var _input2 = _interopRequireDefault(_input);

var _map = require('../blocks/map/map');

var _map2 = _interopRequireDefault(_map);

var _message = require('../blocks/message/message');

var _message2 = _interopRequireDefault(_message);

var _pin = require('../blocks/pin/pin');

var _pin2 = _interopRequireDefault(_pin);

var _question = require('../blocks/question/question');

var _question2 = _interopRequireDefault(_question);

var _scrollBtn = require('../blocks/scroll-btn/scroll-btn');

var _scrollBtn2 = _interopRequireDefault(_scrollBtn);

var _search = require('../blocks/search/search');

var _search2 = _interopRequireDefault(_search);

var _slidePack = require('../blocks/slide-pack/slide-pack');

var _slidePack2 = _interopRequireDefault(_slidePack);

var _tablet = require('../blocks/tablet/tablet');

var _tablet2 = _interopRequireDefault(_tablet);

var _upBtn = require('../blocks/up-btn/up-btn');

var _upBtn2 = _interopRequireDefault(_upBtn);

var _wdSlider = require('../blocks/wd-slider/wd-slider');

var _wdSlider2 = _interopRequireDefault(_wdSlider);

var _yaMap = require('../blocks/ya-map/ya-map');

var _yaMap2 = _interopRequireDefault(_yaMap);

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

			// skip default
		}
	}
};

jata.ready();

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/compile/custom.js","/src/compile")

},{"../../bower_components/jquery_lazyload/jquery.lazyload":1,"../blocks/burger/burger":8,"../blocks/dot-strip/dot-strip":9,"../blocks/driver-form/driver-form":10,"../blocks/gallery/gallery":11,"../blocks/input/input":12,"../blocks/map/map":13,"../blocks/message/message":14,"../blocks/pin/pin":15,"../blocks/question/question":16,"../blocks/scroll-btn/scroll-btn":17,"../blocks/search/search":18,"../blocks/slide-pack/slide-pack":19,"../blocks/tablet/tablet":20,"../blocks/up-btn/up-btn":21,"../blocks/wd-slider/wd-slider":22,"../blocks/ya-map/ya-map":23,"./vars":25,"_process":7,"buffer":3,"device.js":4}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var vars = {
	production: '' === 'production',
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/compile/vars.js","/src/compile")

},{"_process":7,"buffer":3}]},{},[24])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL2pxdWVyeV9sYXp5bG9hZC9qcXVlcnkubGF6eWxvYWQuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZXZpY2UuanMvbGliL2RldmljZS5qcyIsIm5vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyLmpzIiwic3JjL2Jsb2Nrcy9kb3Qtc3RyaXAvZG90LXN0cmlwLmpzIiwic3JjL2Jsb2Nrcy9kcml2ZXItZm9ybS9kcml2ZXItZm9ybS5qcyIsInNyYy9ibG9ja3MvZ2FsbGVyeS9nYWxsZXJ5LmpzIiwic3JjL2Jsb2Nrcy9pbnB1dC9pbnB1dC5qcyIsInNyYy9ibG9ja3MvbWFwL21hcC5qcyIsInNyYy9ibG9ja3MvbWVzc2FnZS9tZXNzYWdlLmpzIiwic3JjL2Jsb2Nrcy9waW4vcGluLmpzIiwic3JjL2Jsb2Nrcy9xdWVzdGlvbi9xdWVzdGlvbi5qcyIsInNyYy9ibG9ja3Mvc2Nyb2xsLWJ0bi9zY3JvbGwtYnRuLmpzIiwic3JjL2Jsb2Nrcy9zZWFyY2gvc2VhcmNoLmpzIiwic3JjL2Jsb2Nrcy9zbGlkZS1wYWNrL3NsaWRlLXBhY2suanMiLCJzcmMvYmxvY2tzL3RhYmxldC90YWJsZXQuanMiLCJzcmMvYmxvY2tzL3VwLWJ0bi91cC1idG4uanMiLCJzcmMvYmxvY2tzL3dkLXNsaWRlci93ZC1zbGlkZXIuanMiLCJzcmMvYmxvY2tzL3lhLW1hcC95YS1tYXAuanMiLCJzcmMvY29tcGlsZS9jdXN0b20uanMiLCJzcmMvY29tcGlsZS92YXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3Mi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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDN3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDTixZQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxLQUFLLElBQW5EO0FBQ0E7QUFDRCxFQVZXOztBQVdaOzs7QUFHQSxLQWRZLGtCQWNMO0FBQ04saUJBQUssSUFBTDtBQUNBLG1CQUFPLElBQVA7QUFDQSxrQkFBTSxJQUFOOztBQUVBLFVBQVEsT0FBTyxRQUFQLENBQWdCLFFBQXhCO0FBQ0MsUUFBSyxHQUFMO0FBQ0MseUJBQVcsSUFBWDtBQUNBLG9CQUFNLElBQU47QUFDQSxzQkFBUSxJQUFSO0FBQ0Esd0JBQVUsSUFBVjtBQUNBLHVCQUFTLElBQVQ7QUFDQTs7QUFFRCxRQUFLLGNBQUw7QUFDQyx1QkFBUyxJQUFUO0FBQ0Esa0JBQUksSUFBSjtBQUNBLGtCQUFJLElBQUo7QUFDQSx3QkFBVSxJQUFWO0FBQ0EscUJBQU8sSUFBUDtBQUNBLHdCQUFVLElBQVY7QUFDQSxxQkFBTyxJQUFQO0FBQ0E7O0FBRUQsUUFBSyxnQkFBTDtBQUNDLG9CQUFNLElBQU47QUFDQTs7QUFFRCxRQUFLLFdBQUw7QUFDQyx1QkFBUyxJQUFUO0FBQ0E7O0FBRUQsUUFBSyxlQUFMO0FBQ0Msc0JBQVEsSUFBUjtBQUNBOztBQUVEO0FBL0JEO0FBaUNBO0FBcERXLENBQWI7O0FBdURBLEtBQUssS0FBTDs7Ozs7Ozs7QUMvRUEsSUFBTSxPQUFPO0FBQ1osYUFBWSxrQkFBa0IsWUFEbEI7QUFFWixTQUFZLEVBRkE7O0FBSVosTUFBSztBQUNKLGdCQUFjLCtCQURWO0FBRUosV0FBYztBQUZWLEVBSk87O0FBU1osS0FUWSxrQkFTTDtBQUNOLE9BQUssTUFBTCxHQUFjLEtBQUssVUFBTCxHQUFrQixpQkFBbEIsR0FBc0Msb0JBQXBEO0FBQ0E7QUFYVyxDQUFiOztBQWNBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIExhenkgTG9hZCAtIGpRdWVyeSBwbHVnaW4gZm9yIGxhenkgbG9hZGluZyBpbWFnZXNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxNSBNaWthIFR1dXBvbGFcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogUHJvamVjdCBob21lOlxuICogICBodHRwOi8vd3d3LmFwcGVsc2lpbmkubmV0L3Byb2plY3RzL2xhenlsb2FkXG4gKlxuICogVmVyc2lvbjogIDEuOS43XG4gKlxuICovXG5cbihmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcblxuICAgICQuZm4ubGF6eWxvYWQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IHRoaXM7XG4gICAgICAgIHZhciAkY29udGFpbmVyO1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICB0aHJlc2hvbGQgICAgICAgOiAwLFxuICAgICAgICAgICAgZmFpbHVyZV9saW1pdCAgIDogMCxcbiAgICAgICAgICAgIGV2ZW50ICAgICAgICAgICA6IFwic2Nyb2xsXCIsXG4gICAgICAgICAgICBlZmZlY3QgICAgICAgICAgOiBcInNob3dcIixcbiAgICAgICAgICAgIGNvbnRhaW5lciAgICAgICA6IHdpbmRvdyxcbiAgICAgICAgICAgIGRhdGFfYXR0cmlidXRlICA6IFwib3JpZ2luYWxcIixcbiAgICAgICAgICAgIHNraXBfaW52aXNpYmxlICA6IGZhbHNlLFxuICAgICAgICAgICAgYXBwZWFyICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICAgIGxvYWQgICAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICBwbGFjZWhvbGRlciAgICAgOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBWUFBQUFmRmNTSkFBQUFBWE5TUjBJQXJzNGM2UUFBQUFSblFVMUJBQUN4and2OFlRVUFBQUFKY0VoWmN3QUFEc1FBQUE3RUFaVXJEaHNBQUFBTlNVUkJWQmhYWXpoOCtQQi9BQWZmQTBuTlB1Q0xBQUFBQUVsRlRrU3VRbUNDXCJcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB2YXIgY291bnRlciA9IDA7XG5cbiAgICAgICAgICAgIGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2tpcF9pbnZpc2libGUgJiYgISR0aGlzLmlzKFwiOnZpc2libGVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoJC5hYm92ZXRoZXRvcCh0aGlzLCBzZXR0aW5ncykgfHxcbiAgICAgICAgICAgICAgICAgICAgJC5sZWZ0b2ZiZWdpbih0aGlzLCBzZXR0aW5ncykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIE5vdGhpbmcuICovXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghJC5iZWxvd3RoZWZvbGQodGhpcywgc2V0dGluZ3MpICYmXG4gICAgICAgICAgICAgICAgICAgICEkLnJpZ2h0b2Zmb2xkKHRoaXMsIHNldHRpbmdzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMudHJpZ2dlcihcImFwcGVhclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlmIHdlIGZvdW5kIGFuIGltYWdlIHdlJ2xsIGxvYWQsIHJlc2V0IHRoZSBjb3VudGVyICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKytjb3VudGVyID4gc2V0dGluZ3MuZmFpbHVyZV9saW1pdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIC8qIE1haW50YWluIEJDIGZvciBhIGNvdXBsZSBvZiB2ZXJzaW9ucy4gKi9cbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IG9wdGlvbnMuZmFpbHVyZWxpbWl0KSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5mYWlsdXJlX2xpbWl0ID0gb3B0aW9ucy5mYWlsdXJlbGltaXQ7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuZmFpbHVyZWxpbWl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gb3B0aW9ucy5lZmZlY3RzcGVlZCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZWZmZWN0X3NwZWVkID0gb3B0aW9ucy5lZmZlY3RzcGVlZDtcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5lZmZlY3RzcGVlZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5leHRlbmQoc2V0dGluZ3MsIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ2FjaGUgY29udGFpbmVyIGFzIGpRdWVyeSBhcyBvYmplY3QuICovXG4gICAgICAgICRjb250YWluZXIgPSAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykgPyAkd2luZG93IDogJChzZXR0aW5ncy5jb250YWluZXIpO1xuXG4gICAgICAgIC8qIEZpcmUgb25lIHNjcm9sbCBldmVudCBwZXIgc2Nyb2xsLiBOb3Qgb25lIHNjcm9sbCBldmVudCBwZXIgaW1hZ2UuICovXG4gICAgICAgIGlmICgwID09PSBzZXR0aW5ncy5ldmVudC5pbmRleE9mKFwic2Nyb2xsXCIpKSB7XG4gICAgICAgICAgICAkY29udGFpbmVyLmJpbmQoc2V0dGluZ3MuZXZlbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyICRzZWxmID0gJChzZWxmKTtcblxuICAgICAgICAgICAgc2VsZi5sb2FkZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgLyogSWYgbm8gc3JjIGF0dHJpYnV0ZSBnaXZlbiB1c2UgZGF0YTp1cmkuICovXG4gICAgICAgICAgICBpZiAoJHNlbGYuYXR0cihcInNyY1wiKSA9PT0gdW5kZWZpbmVkIHx8ICRzZWxmLmF0dHIoXCJzcmNcIikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCRzZWxmLmlzKFwiaW1nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICRzZWxmLmF0dHIoXCJzcmNcIiwgc2V0dGluZ3MucGxhY2Vob2xkZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogV2hlbiBhcHBlYXIgaXMgdHJpZ2dlcmVkIGxvYWQgb3JpZ2luYWwgaW1hZ2UuICovXG4gICAgICAgICAgICAkc2VsZi5vbmUoXCJhcHBlYXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MuYXBwZWFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHNfbGVmdCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmFwcGVhci5jYWxsKHNlbGYsIGVsZW1lbnRzX2xlZnQsIHNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkKFwiPGltZyAvPlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmJpbmQoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsID0gJHNlbGYuYXR0cihcImRhdGEtXCIgKyBzZXR0aW5ncy5kYXRhX2F0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2VsZi5pcyhcImltZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZi5hdHRyKFwic3JjXCIsIG9yaWdpbmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZi5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwidXJsKCdcIiArIG9yaWdpbmFsICsgXCInKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGZbc2V0dGluZ3MuZWZmZWN0XShzZXR0aW5ncy5lZmZlY3Rfc3BlZWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogUmVtb3ZlIGltYWdlIGZyb20gYXJyYXkgc28gaXQgaXMgbm90IGxvb3BlZCBuZXh0IHRpbWUuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXAgPSAkLmdyZXAoZWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFlbGVtZW50LmxvYWRlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50cyA9ICQodGVtcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MubG9hZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHNfbGVmdCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MubG9hZC5jYWxsKHNlbGYsIGVsZW1lbnRzX2xlZnQsIHNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzcmNcIiwgJHNlbGYuYXR0cihcImRhdGEtXCIgKyBzZXR0aW5ncy5kYXRhX2F0dHJpYnV0ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKiBXaGVuIHdhbnRlZCBldmVudCBpcyB0cmlnZ2VyZWQgbG9hZCBvcmlnaW5hbCBpbWFnZSAqL1xuICAgICAgICAgICAgLyogYnkgdHJpZ2dlcmluZyBhcHBlYXIuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICgwICE9PSBzZXR0aW5ncy5ldmVudC5pbmRleE9mKFwic2Nyb2xsXCIpKSB7XG4gICAgICAgICAgICAgICAgJHNlbGYuYmluZChzZXR0aW5ncy5ldmVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VsZi5sb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLnRyaWdnZXIoXCJhcHBlYXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgc29tZXRoaW5nIGFwcGVhcnMgd2hlbiB3aW5kb3cgaXMgcmVzaXplZC4gKi9cbiAgICAgICAgJHdpbmRvdy5iaW5kKFwicmVzaXplXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qIFdpdGggSU9TNSBmb3JjZSBsb2FkaW5nIGltYWdlcyB3aGVuIG5hdmlnYXRpbmcgd2l0aCBiYWNrIGJ1dHRvbi4gKi9cbiAgICAgICAgLyogTm9uIG9wdGltYWwgd29ya2Fyb3VuZC4gKi9cbiAgICAgICAgaWYgKCgvKD86aXBob25lfGlwb2R8aXBhZCkuKm9zIDUvZ2kpLnRlc3QobmF2aWdhdG9yLmFwcFZlcnNpb24pKSB7XG4gICAgICAgICAgICAkd2luZG93LmJpbmQoXCJwYWdlc2hvd1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQucGVyc2lzdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXCJhcHBlYXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yY2UgaW5pdGlhbCBjaGVjayBpZiBpbWFnZXMgc2hvdWxkIGFwcGVhci4gKi9cbiAgICAgICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qIENvbnZlbmllbmNlIG1ldGhvZHMgaW4galF1ZXJ5IG5hbWVzcGFjZS4gICAgICAgICAgICovXG4gICAgLyogVXNlIGFzICAkLmJlbG93dGhlZm9sZChlbGVtZW50LCB7dGhyZXNob2xkIDogMTAwLCBjb250YWluZXIgOiB3aW5kb3d9KSAqL1xuXG4gICAgJC5iZWxvd3RoZWZvbGQgPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICB2YXIgZm9sZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHwgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpIHtcbiAgICAgICAgICAgIGZvbGQgPSAod2luZG93LmlubmVySGVpZ2h0ID8gd2luZG93LmlubmVySGVpZ2h0IDogJHdpbmRvdy5oZWlnaHQoKSkgKyAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9sZCA9ICQoc2V0dGluZ3MuY29udGFpbmVyKS5vZmZzZXQoKS50b3AgKyAkKHNldHRpbmdzLmNvbnRhaW5lcikuaGVpZ2h0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9sZCA8PSAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcCAtIHNldHRpbmdzLnRocmVzaG9sZDtcbiAgICB9O1xuXG4gICAgJC5yaWdodG9mZm9sZCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICR3aW5kb3cud2lkdGgoKSArICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9sZCA9ICQoc2V0dGluZ3MuY29udGFpbmVyKS5vZmZzZXQoKS5sZWZ0ICsgJChzZXR0aW5ncy5jb250YWluZXIpLndpZHRoKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9sZCA8PSAkKGVsZW1lbnQpLm9mZnNldCgpLmxlZnQgLSBzZXR0aW5ncy50aHJlc2hvbGQ7XG4gICAgfTtcblxuICAgICQuYWJvdmV0aGV0b3AgPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICB2YXIgZm9sZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHwgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpIHtcbiAgICAgICAgICAgIGZvbGQgPSAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9sZCA9ICQoc2V0dGluZ3MuY29udGFpbmVyKS5vZmZzZXQoKS50b3A7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9sZCA+PSAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcCArIHNldHRpbmdzLnRocmVzaG9sZCAgKyAkKGVsZW1lbnQpLmhlaWdodCgpO1xuICAgIH07XG5cbiAgICAkLmxlZnRvZmJlZ2luID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGZvbGQ7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lciA9PT0gdW5kZWZpbmVkIHx8IHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSB7XG4gICAgICAgICAgICBmb2xkID0gJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLmxlZnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9sZCA+PSAkKGVsZW1lbnQpLm9mZnNldCgpLmxlZnQgKyBzZXR0aW5ncy50aHJlc2hvbGQgKyAkKGVsZW1lbnQpLndpZHRoKCk7XG4gICAgfTtcblxuICAgICQuaW52aWV3cG9ydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgICByZXR1cm4gISQucmlnaHRvZmZvbGQoZWxlbWVudCwgc2V0dGluZ3MpICYmICEkLmxlZnRvZmJlZ2luKGVsZW1lbnQsIHNldHRpbmdzKSAmJlxuICAgICAgICAgICAgICAgICEkLmJlbG93dGhlZm9sZChlbGVtZW50LCBzZXR0aW5ncykgJiYgISQuYWJvdmV0aGV0b3AoZWxlbWVudCwgc2V0dGluZ3MpO1xuICAgICB9O1xuXG4gICAgLyogQ3VzdG9tIHNlbGVjdG9ycyBmb3IgeW91ciBjb252ZW5pZW5jZS4gICAqL1xuICAgIC8qIFVzZSBhcyAkKFwiaW1nOmJlbG93LXRoZS1mb2xkXCIpLnNvbWV0aGluZygpIG9yICovXG4gICAgLyogJChcImltZ1wiKS5maWx0ZXIoXCI6YmVsb3ctdGhlLWZvbGRcIikuc29tZXRoaW5nKCkgd2hpY2ggaXMgZmFzdGVyICovXG5cbiAgICAkLmV4dGVuZCgkLmV4cHJbXCI6XCJdLCB7XG4gICAgICAgIFwiYmVsb3ctdGhlLWZvbGRcIiA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICQuYmVsb3d0aGVmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwiYWJvdmUtdGhlLXRvcFwiICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLmJlbG93dGhlZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcInJpZ2h0LW9mLXNjcmVlblwiOiBmdW5jdGlvbihhKSB7IHJldHVybiAkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwibGVmdC1vZi1zY3JlZW5cIiA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwiaW4tdmlld3BvcnRcIiAgICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICQuaW52aWV3cG9ydChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICAvKiBNYWludGFpbiBCQyBmb3IgY291cGxlIG9mIHZlcnNpb25zLiAqL1xuICAgICAgICBcImFib3ZlLXRoZS1mb2xkXCIgOiBmdW5jdGlvbihhKSB7IHJldHVybiAhJC5iZWxvd3RoZWZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJyaWdodC1vZi1mb2xkXCIgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5yaWdodG9mZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcImxlZnQtb2YtZm9sZFwiICAgOiBmdW5jdGlvbihhKSB7IHJldHVybiAhJC5yaWdodG9mZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBwbGFjZUhvbGRlcnNDb3VudCAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuICAvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG4gIC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuICAvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcbiAgLy8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuICByZXR1cm4gYjY0W2xlbiAtIDJdID09PSAnPScgPyAyIDogYjY0W2xlbiAtIDFdID09PSAnPScgPyAxIDogMFxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG4gIHJldHVybiBiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIobGVuICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICBsID0gcGxhY2VIb2xkZXJzID4gMCA/IGxlbiAtIDQgOiBsZW5cblxuICB2YXIgTCA9IDBcblxuICBmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBvdXRwdXQgPSAnJ1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPT0nXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArICh1aW50OFtsZW4gLSAxXSlcbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAxMF1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9J1xuICB9XG5cbiAgcGFydHMucHVzaChvdXRwdXQpXG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBEdWUgdG8gdmFyaW91cyBicm93c2VyIGJ1Z3MsIHNvbWV0aW1lcyB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uIHdpbGwgYmUgdXNlZCBldmVuXG4gKiB3aGVuIHRoZSBicm93c2VyIHN1cHBvcnRzIHR5cGVkIGFycmF5cy5cbiAqXG4gKiBOb3RlOlxuICpcbiAqICAgLSBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsXG4gKiAgICAgU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzguXG4gKlxuICogICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogICAtIElFMTAgaGFzIGEgYnJva2VuIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhcnJheXMgb2ZcbiAqICAgICBpbmNvcnJlY3QgbGVuZ3RoIGluIHNvbWUgc2l0dWF0aW9ucy5cblxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXlcbiAqIGdldCB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uLCB3aGljaCBpcyBzbG93ZXIgYnV0IGJlaGF2ZXMgY29ycmVjdGx5LlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IGdsb2JhbC5UWVBFRF9BUlJBWV9TVVBQT1JUICE9PSB1bmRlZmluZWRcbiAgPyBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVFxuICA6IHR5cGVkQXJyYXlTdXBwb3J0KClcblxuLypcbiAqIEV4cG9ydCBrTWF4TGVuZ3RoIGFmdGVyIHR5cGVkIGFycmF5IHN1cHBvcnQgaXMgZGV0ZXJtaW5lZC5cbiAqL1xuZXhwb3J0cy5rTWF4TGVuZ3RoID0ga01heExlbmd0aCgpXG5cbmZ1bmN0aW9uIHR5cGVkQXJyYXlTdXBwb3J0ICgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0ge19fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfX1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MiAmJiAvLyB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZFxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nICYmIC8vIGNocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICAgICAgICBhcnIuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24ga01heExlbmd0aCAoKSB7XG4gIHJldHVybiBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVFxuICAgID8gMHg3ZmZmZmZmZlxuICAgIDogMHgzZmZmZmZmZlxufVxuXG5mdW5jdGlvbiBjcmVhdGVCdWZmZXIgKHRoYXQsIGxlbmd0aCkge1xuICBpZiAoa01heExlbmd0aCgpIDwgbGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgdHlwZWQgYXJyYXkgbGVuZ3RoJylcbiAgfVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICB0aGF0ID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICAgIHRoYXQuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICBpZiAodGhhdCA9PT0gbnVsbCkge1xuICAgICAgdGhhdCA9IG5ldyBCdWZmZXIobGVuZ3RoKVxuICAgIH1cbiAgICB0aGF0Lmxlbmd0aCA9IGxlbmd0aFxuICB9XG5cbiAgcmV0dXJuIHRoYXRcbn1cblxuLyoqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGhhdmUgdGhlaXJcbiAqIHByb3RvdHlwZSBjaGFuZ2VkIHRvIGBCdWZmZXIucHJvdG90eXBlYC4gRnVydGhlcm1vcmUsIGBCdWZmZXJgIGlzIGEgc3ViY2xhc3Mgb2ZcbiAqIGBVaW50OEFycmF5YCwgc28gdGhlIHJldHVybmVkIGluc3RhbmNlcyB3aWxsIGhhdmUgYWxsIHRoZSBub2RlIGBCdWZmZXJgIG1ldGhvZHNcbiAqIGFuZCB0aGUgYFVpbnQ4QXJyYXlgIG1ldGhvZHMuIFNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0XG4gKiByZXR1cm5zIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIFRoZSBgVWludDhBcnJheWAgcHJvdG90eXBlIHJlbWFpbnMgdW5tb2RpZmllZC5cbiAqL1xuXG5mdW5jdGlvbiBCdWZmZXIgKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0lmIGVuY29kaW5nIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUodGhpcywgYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKHRoaXMsIGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuLy8gVE9ETzogTGVnYWN5LCBub3QgbmVlZGVkIGFueW1vcmUuIFJlbW92ZSBpbiBuZXh0IG1ham9yIHZlcnNpb24uXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gZnJvbSAodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpXG4gIH1cblxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIHJldHVybiBmcm9tT2JqZWN0KHRoYXQsIHZhbHVlKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKG51bGwsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbmlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICBCdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXkucHJvdG90eXBlXG4gIEJ1ZmZlci5fX3Byb3RvX18gPSBVaW50OEFycmF5XG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuc3BlY2llcyAmJlxuICAgICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gICAgLy8gRml4IHN1YmFycmF5KCkgaW4gRVMyMDE2LiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvOTdcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLCBTeW1ib2wuc3BlY2llcywge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFNpemUgKHNpemUpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3QgYmUgYSBudW1iZXInKVxuICB9IGVsc2UgaWYgKHNpemUgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIG5lZ2F0aXZlJylcbiAgfVxufVxuXG5mdW5jdGlvbiBhbGxvYyAodGhhdCwgc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICBpZiAoc2l6ZSA8PSAwKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKVxuICB9XG4gIGlmIChmaWxsICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBPbmx5IHBheSBhdHRlbnRpb24gdG8gZW5jb2RpbmcgaWYgaXQncyBhIHN0cmluZy4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGFjY2lkZW50YWxseSBzZW5kaW5nIGluIGEgbnVtYmVyIHRoYXQgd291bGRcbiAgICAvLyBiZSBpbnRlcnByZXR0ZWQgYXMgYSBzdGFydCBvZmZzZXQuXG4gICAgcmV0dXJuIHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZydcbiAgICAgID8gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpLmZpbGwoZmlsbCwgZW5jb2RpbmcpXG4gICAgICA6IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKS5maWxsKGZpbGwpXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqIGFsbG9jKHNpemVbLCBmaWxsWywgZW5jb2RpbmddXSlcbiAqKi9cbkJ1ZmZlci5hbGxvYyA9IGZ1bmN0aW9uIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICByZXR1cm4gYWxsb2MobnVsbCwgc2l6ZSwgZmlsbCwgZW5jb2RpbmcpXG59XG5cbmZ1bmN0aW9uIGFsbG9jVW5zYWZlICh0aGF0LCBzaXplKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplIDwgMCA/IDAgOiBjaGVja2VkKHNpemUpIHwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgKytpKSB7XG4gICAgICB0aGF0W2ldID0gMFxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKG51bGwsIHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKG51bGwsIHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHRoYXQsIHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJlbmNvZGluZ1wiIG11c3QgYmUgYSB2YWxpZCBzdHJpbmcgZW5jb2RpbmcnKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSB0aGF0LndyaXRlKHN0cmluZywgZW5jb2RpbmcpXG5cbiAgaWYgKGFjdHVhbCAhPT0gbGVuZ3RoKSB7XG4gICAgLy8gV3JpdGluZyBhIGhleCBzdHJpbmcsIGZvciBleGFtcGxlLCB0aGF0IGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVycyB3aWxsXG4gICAgLy8gY2F1c2UgZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3QgaW52YWxpZCBjaGFyYWN0ZXIgdG8gYmUgaWdub3JlZC4gKGUuZy5cbiAgICAvLyAnYWJ4eGNkJyB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2FiJylcbiAgICB0aGF0ID0gdGhhdC5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlMaWtlICh0aGF0LCBhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIDwgMCA/IDAgOiBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuZ3RoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhhdFtpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyICh0aGF0LCBhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGFycmF5LmJ5dGVMZW5ndGggLy8gdGhpcyB0aHJvd3MgaWYgYGFycmF5YCBpcyBub3QgYSB2YWxpZCBBcnJheUJ1ZmZlclxuXG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldClcbiAgfSBlbHNlIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICB0aGF0ID0gYXJyYXlcbiAgICB0aGF0Ll9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgdGhhdCA9IGZyb21BcnJheUxpa2UodGhhdCwgYXJyYXkpXG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAodGhhdCwgb2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuKVxuXG4gICAgaWYgKHRoYXQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhhdFxuICAgIH1cblxuICAgIG9iai5jb3B5KHRoYXQsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gdGhhdFxuICB9XG5cbiAgaWYgKG9iaikge1xuICAgIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICBvYmouYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHx8ICdsZW5ndGgnIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBpc25hbihvYmoubGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIDApXG4gICAgICB9XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmopXG4gICAgfVxuXG4gICAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBpc0FycmF5KG9iai5kYXRhKSkge1xuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqLmRhdGEpXG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksIG9yIGFycmF5LWxpa2Ugb2JqZWN0LicpXG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBrTWF4TGVuZ3RoKClgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0ga01heExlbmd0aCgpKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIGtNYXhMZW5ndGgoKS50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuICEhKGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIHZhciB4ID0gYS5sZW5ndGhcbiAgdmFyIHkgPSBiLmxlbmd0aFxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIWlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKGxlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgYnVmID0gbGlzdFtpXVxuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfVxuICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIHBvcyArPSBidWYubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmcubGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIEFycmF5QnVmZmVyLmlzVmlldyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgKEFycmF5QnVmZmVyLmlzVmlldyhzdHJpbmcpIHx8IHN0cmluZyBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSkge1xuICAgIHJldHVybiBzdHJpbmcuYnl0ZUxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHN0cmluZyA9ICcnICsgc3RyaW5nXG4gIH1cblxuICB2YXIgbGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAobGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJzaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoZSBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIGFuZCBgaXMtYnVmZmVyYCAoaW4gU2FmYXJpIDUtNykgdG8gZGV0ZWN0XG4vLyBCdWZmZXIgaW5zdGFuY2VzLlxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgdmFyIGkgPSBiW25dXG4gIGJbbl0gPSBiW21dXG4gIGJbbV0gPSBpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDE2ID0gZnVuY3Rpb24gc3dhcDE2ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSAyICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAxNi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMSlcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAzMiA9IGZ1bmN0aW9uIHN3YXAzMiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDY0LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDgpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyA3KVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyA2KVxuICAgIHN3YXAodGhpcywgaSArIDIsIGkgKyA1KVxuICAgIHN3YXAodGhpcywgaSArIDMsIGkgKyA0KVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCB8IDBcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICB2YXIgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgdmFyIHkgPSBlbmQgLSBzdGFydFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICB2YXIgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgdmFyIHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0ICAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAoaXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJlxuICAgICAgICB0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKGlzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBsYXRpbjFXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCB8IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICAvLyBsZWdhY3kgd3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpIC0gcmVtb3ZlIGluIHYwLjEzXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0J1ZmZlci53cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXRbLCBsZW5ndGhdKSBpcyBubyBsb25nZXIgc3VwcG9ydGVkJ1xuICAgIClcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gbGF0aW4xU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIG5ld0J1ZiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZClcbiAgICBuZXdCdWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47ICsraSkge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDIpOyBpIDwgajsgKytpKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCA0KTsgaSA8IGo7ICsraSkge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcbiAgdmFyIGlcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHN0YXJ0IDwgdGFyZ2V0U3RhcnQgJiYgdGFyZ2V0U3RhcnQgPCBlbmQpIHtcbiAgICAvLyBkZXNjZW5kaW5nIGNvcHkgZnJvbSBlbmRcbiAgICBmb3IgKGkgPSBsZW4gLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSBpZiAobGVuIDwgMTAwMCB8fCAhQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBhc2NlbmRpbmcgY29weSBmcm9tIHN0YXJ0XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiB1dGY4VG9CeXRlcyhuZXcgQnVmZmVyKHZhbCwgZW5jb2RpbmcpLnRvU3RyaW5nKCkpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teK1xcLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0cmluZ3RyaW0oc3RyKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGlzbmFuICh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gdmFsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG4iLCIvLyBEZXZpY2UuanNcbi8vIChjKSAyMDE0IE1hdHRoZXcgSHVkc29uXG4vLyBEZXZpY2UuanMgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuLy8gRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2N1bWVudGF0aW9uOlxuLy8gaHR0cDovL21hdHRoZXdodWRzb24ubWUvcHJvamVjdHMvZGV2aWNlLmpzL1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIGRldmljZSxcbiAgICBwcmV2aW91c0RldmljZSxcbiAgICBhZGRDbGFzcyxcbiAgICBkb2N1bWVudEVsZW1lbnQsXG4gICAgZmluZCxcbiAgICBoYW5kbGVPcmllbnRhdGlvbixcbiAgICBoYXNDbGFzcyxcbiAgICBvcmllbnRhdGlvbkV2ZW50LFxuICAgIHJlbW92ZUNsYXNzLFxuICAgIHVzZXJBZ2VudDtcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgZGV2aWNlIHZhcmlhYmxlLlxuICBwcmV2aW91c0RldmljZSA9IHdpbmRvdy5kZXZpY2U7XG5cbiAgZGV2aWNlID0ge307XG5cbiAgLy8gQWRkIGRldmljZSBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIHdpbmRvdy5kZXZpY2UgPSBkZXZpY2U7XG5cbiAgLy8gVGhlIDxodG1sPiBlbGVtZW50LlxuICBkb2N1bWVudEVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gIC8vIFRoZSBjbGllbnQgdXNlciBhZ2VudCBzdHJpbmcuXG4gIC8vIExvd2VyY2FzZSwgc28gd2UgY2FuIHVzZSB0aGUgbW9yZSBlZmZpY2llbnQgaW5kZXhPZigpLCBpbnN0ZWFkIG9mIFJlZ2V4XG4gIHVzZXJBZ2VudCA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbiAgLy8gTWFpbiBmdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICBkZXZpY2UuaW9zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuaXBob25lKCkgfHwgZGV2aWNlLmlwb2QoKSB8fCBkZXZpY2UuaXBhZCgpO1xuICB9O1xuXG4gIGRldmljZS5pcGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICFkZXZpY2Uud2luZG93cygpICYmIGZpbmQoJ2lwaG9uZScpO1xuICB9O1xuXG4gIGRldmljZS5pcG9kID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCdpcG9kJyk7XG4gIH07XG5cbiAgZGV2aWNlLmlwYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ2lwYWQnKTtcbiAgfTtcblxuICBkZXZpY2UuYW5kcm9pZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gIWRldmljZS53aW5kb3dzKCkgJiYgZmluZCgnYW5kcm9pZCcpO1xuICB9O1xuXG4gIGRldmljZS5hbmRyb2lkUGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5hbmRyb2lkKCkgJiYgZmluZCgnbW9iaWxlJyk7XG4gIH07XG5cbiAgZGV2aWNlLmFuZHJvaWRUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5hbmRyb2lkKCkgJiYgIWZpbmQoJ21vYmlsZScpO1xuICB9O1xuXG4gIGRldmljZS5ibGFja2JlcnJ5ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCdibGFja2JlcnJ5JykgfHwgZmluZCgnYmIxMCcpIHx8IGZpbmQoJ3JpbScpO1xuICB9O1xuXG4gIGRldmljZS5ibGFja2JlcnJ5UGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5ibGFja2JlcnJ5KCkgJiYgIWZpbmQoJ3RhYmxldCcpO1xuICB9O1xuXG4gIGRldmljZS5ibGFja2JlcnJ5VGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuYmxhY2tiZXJyeSgpICYmIGZpbmQoJ3RhYmxldCcpO1xuICB9O1xuXG4gIGRldmljZS53aW5kb3dzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCd3aW5kb3dzJyk7XG4gIH07XG5cbiAgZGV2aWNlLndpbmRvd3NQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLndpbmRvd3MoKSAmJiBmaW5kKCdwaG9uZScpO1xuICB9O1xuXG4gIGRldmljZS53aW5kb3dzVGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2Uud2luZG93cygpICYmIChmaW5kKCd0b3VjaCcpICYmICFkZXZpY2Uud2luZG93c1Bob25lKCkpO1xuICB9O1xuXG4gIGRldmljZS5meG9zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoZmluZCgnKG1vYmlsZTsnKSB8fCBmaW5kKCcodGFibGV0OycpKSAmJiBmaW5kKCc7IHJ2OicpO1xuICB9O1xuXG4gIGRldmljZS5meG9zUGhvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5meG9zKCkgJiYgZmluZCgnbW9iaWxlJyk7XG4gIH07XG5cbiAgZGV2aWNlLmZ4b3NUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5meG9zKCkgJiYgZmluZCgndGFibGV0Jyk7XG4gIH07XG5cbiAgZGV2aWNlLm1lZWdvID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5kKCdtZWVnbycpO1xuICB9O1xuXG4gIGRldmljZS5jb3Jkb3ZhID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB3aW5kb3cuY29yZG92YSAmJiBsb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2ZpbGU6JztcbiAgfTtcblxuICBkZXZpY2Uubm9kZVdlYmtpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdy5wcm9jZXNzID09PSAnb2JqZWN0JztcbiAgfTtcblxuICBkZXZpY2UubW9iaWxlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuYW5kcm9pZFBob25lKCkgfHwgZGV2aWNlLmlwaG9uZSgpIHx8IGRldmljZS5pcG9kKCkgfHwgZGV2aWNlLndpbmRvd3NQaG9uZSgpIHx8IGRldmljZS5ibGFja2JlcnJ5UGhvbmUoKSB8fCBkZXZpY2UuZnhvc1Bob25lKCkgfHwgZGV2aWNlLm1lZWdvKCk7XG4gIH07XG5cbiAgZGV2aWNlLnRhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmlwYWQoKSB8fCBkZXZpY2UuYW5kcm9pZFRhYmxldCgpIHx8IGRldmljZS5ibGFja2JlcnJ5VGFibGV0KCkgfHwgZGV2aWNlLndpbmRvd3NUYWJsZXQoKSB8fCBkZXZpY2UuZnhvc1RhYmxldCgpO1xuICB9O1xuXG4gIGRldmljZS5kZXNrdG9wID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhZGV2aWNlLnRhYmxldCgpICYmICFkZXZpY2UubW9iaWxlKCk7XG4gIH07XG5cbiAgZGV2aWNlLnRlbGV2aXNpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgdGVsZXZpc2lvbjtcblxuICAgIHRlbGV2aXNpb24gPSBbXG4gICAgICBcImdvb2dsZXR2XCIsXG4gICAgICBcInZpZXJhXCIsXG4gICAgICBcInNtYXJ0dHZcIixcbiAgICAgIFwiaW50ZXJuZXQudHZcIixcbiAgICAgIFwibmV0Y2FzdFwiLFxuICAgICAgXCJuZXR0dlwiLFxuICAgICAgXCJhcHBsZXR2XCIsXG4gICAgICBcImJveGVlXCIsXG4gICAgICBcImt5bG9cIixcbiAgICAgIFwicm9rdVwiLFxuICAgICAgXCJkbG5hZG9jXCIsXG4gICAgICBcInJva3VcIixcbiAgICAgIFwicG92X3R2XCIsXG4gICAgICBcImhiYnR2XCIsXG4gICAgICBcImNlLWh0bWxcIlxuICAgIF07XG5cbiAgICBpID0gMDtcbiAgICB3aGlsZSAoaSA8IHRlbGV2aXNpb24ubGVuZ3RoKSB7XG4gICAgICBpZiAoZmluZCh0ZWxldmlzaW9uW2ldKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gIH07XG5cbiAgZGV2aWNlLnBvcnRyYWl0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAod2luZG93LmlubmVySGVpZ2h0IC8gd2luZG93LmlubmVyV2lkdGgpID4gMTtcbiAgfTtcblxuICBkZXZpY2UubGFuZHNjYXBlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAod2luZG93LmlubmVySGVpZ2h0IC8gd2luZG93LmlubmVyV2lkdGgpIDwgMTtcbiAgfTtcblxuICAvLyBQdWJsaWMgVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIGRldmljZS5qcyBpbiBub0NvbmZsaWN0IG1vZGUsXG4gIC8vIHJldHVybmluZyB0aGUgZGV2aWNlIHZhcmlhYmxlIHRvIGl0cyBwcmV2aW91cyBvd25lci5cbiAgZGV2aWNlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmRldmljZSA9IHByZXZpb3VzRGV2aWNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIFByaXZhdGUgVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFNpbXBsZSBVQSBzdHJpbmcgc2VhcmNoXG4gIGZpbmQgPSBmdW5jdGlvbiAobmVlZGxlKSB7XG4gICAgcmV0dXJuIHVzZXJBZ2VudC5pbmRleE9mKG5lZWRsZSkgIT09IC0xO1xuICB9O1xuXG4gIC8vIENoZWNrIGlmIGRvY3VtZW50RWxlbWVudCBhbHJlYWR5IGhhcyBhIGdpdmVuIGNsYXNzLlxuICBoYXNDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICB2YXIgcmVnZXg7XG4gICAgcmVnZXggPSBuZXcgUmVnRXhwKGNsYXNzTmFtZSwgJ2knKTtcbiAgICByZXR1cm4gZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZS5tYXRjaChyZWdleCk7XG4gIH07XG5cbiAgLy8gQWRkIG9uZSBvciBtb3JlIENTUyBjbGFzc2VzIHRvIHRoZSA8aHRtbD4gZWxlbWVudC5cbiAgYWRkQ2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgdmFyIGN1cnJlbnRDbGFzc05hbWVzID0gbnVsbDtcbiAgICBpZiAoIWhhc0NsYXNzKGNsYXNzTmFtZSkpIHtcbiAgICAgIGN1cnJlbnRDbGFzc05hbWVzID0gZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgICBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lID0gY3VycmVudENsYXNzTmFtZXMgKyBcIiBcIiArIGNsYXNzTmFtZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVtb3ZlIHNpbmdsZSBDU1MgY2xhc3MgZnJvbSB0aGUgPGh0bWw+IGVsZW1lbnQuXG4gIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgIGlmIChoYXNDbGFzcyhjbGFzc05hbWUpKSB7XG4gICAgICBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lID0gZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKFwiIFwiICsgY2xhc3NOYW1lLCBcIlwiKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSFRNTCBFbGVtZW50IEhhbmRsaW5nXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEluc2VydCB0aGUgYXBwcm9wcmlhdGUgQ1NTIGNsYXNzIGJhc2VkIG9uIHRoZSBfdXNlcl9hZ2VudC5cblxuICBpZiAoZGV2aWNlLmlvcygpKSB7XG4gICAgaWYgKGRldmljZS5pcGFkKCkpIHtcbiAgICAgIGFkZENsYXNzKFwiaW9zIGlwYWQgdGFibGV0XCIpO1xuICAgIH0gZWxzZSBpZiAoZGV2aWNlLmlwaG9uZSgpKSB7XG4gICAgICBhZGRDbGFzcyhcImlvcyBpcGhvbmUgbW9iaWxlXCIpO1xuICAgIH0gZWxzZSBpZiAoZGV2aWNlLmlwb2QoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJpb3MgaXBvZCBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS5hbmRyb2lkKCkpIHtcbiAgICBpZiAoZGV2aWNlLmFuZHJvaWRUYWJsZXQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJhbmRyb2lkIHRhYmxldFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkQ2xhc3MoXCJhbmRyb2lkIG1vYmlsZVwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmJsYWNrYmVycnkoKSkge1xuICAgIGlmIChkZXZpY2UuYmxhY2tiZXJyeVRhYmxldCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImJsYWNrYmVycnkgdGFibGV0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhcImJsYWNrYmVycnkgbW9iaWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2Uud2luZG93cygpKSB7XG4gICAgaWYgKGRldmljZS53aW5kb3dzVGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwid2luZG93cyB0YWJsZXRcIik7XG4gICAgfSBlbHNlIGlmIChkZXZpY2Uud2luZG93c1Bob25lKCkpIHtcbiAgICAgIGFkZENsYXNzKFwid2luZG93cyBtb2JpbGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiZGVza3RvcFwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmZ4b3MoKSkge1xuICAgIGlmIChkZXZpY2UuZnhvc1RhYmxldCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImZ4b3MgdGFibGV0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhcImZ4b3MgbW9iaWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UubWVlZ28oKSkge1xuICAgIGFkZENsYXNzKFwibWVlZ28gbW9iaWxlXCIpO1xuICB9IGVsc2UgaWYgKGRldmljZS5ub2RlV2Via2l0KCkpIHtcbiAgICBhZGRDbGFzcyhcIm5vZGUtd2Via2l0XCIpO1xuICB9IGVsc2UgaWYgKGRldmljZS50ZWxldmlzaW9uKCkpIHtcbiAgICBhZGRDbGFzcyhcInRlbGV2aXNpb25cIik7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmRlc2t0b3AoKSkge1xuICAgIGFkZENsYXNzKFwiZGVza3RvcFwiKTtcbiAgfVxuXG4gIGlmIChkZXZpY2UuY29yZG92YSgpKSB7XG4gICAgYWRkQ2xhc3MoXCJjb3Jkb3ZhXCIpO1xuICB9XG5cbiAgLy8gT3JpZW50YXRpb24gSGFuZGxpbmdcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBIYW5kbGUgZGV2aWNlIG9yaWVudGF0aW9uIGNoYW5nZXMuXG4gIGhhbmRsZU9yaWVudGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChkZXZpY2UubGFuZHNjYXBlKCkpIHtcbiAgICAgIHJlbW92ZUNsYXNzKFwicG9ydHJhaXRcIik7XG4gICAgICBhZGRDbGFzcyhcImxhbmRzY2FwZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlQ2xhc3MoXCJsYW5kc2NhcGVcIik7XG4gICAgICBhZGRDbGFzcyhcInBvcnRyYWl0XCIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH07XG5cbiAgLy8gRGV0ZWN0IHdoZXRoZXIgZGV2aWNlIHN1cHBvcnRzIG9yaWVudGF0aW9uY2hhbmdlIGV2ZW50LFxuICAvLyBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIHRoZSByZXNpemUgZXZlbnQuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwod2luZG93LCBcIm9ub3JpZW50YXRpb25jaGFuZ2VcIikpIHtcbiAgICBvcmllbnRhdGlvbkV2ZW50ID0gXCJvcmllbnRhdGlvbmNoYW5nZVwiO1xuICB9IGVsc2Uge1xuICAgIG9yaWVudGF0aW9uRXZlbnQgPSBcInJlc2l6ZVwiO1xuICB9XG5cbiAgLy8gTGlzdGVuIGZvciBjaGFuZ2VzIGluIG9yaWVudGF0aW9uLlxuICBpZiAod2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihvcmllbnRhdGlvbkV2ZW50LCBoYW5kbGVPcmllbnRhdGlvbiwgZmFsc2UpO1xuICB9IGVsc2UgaWYgKHdpbmRvdy5hdHRhY2hFdmVudCkge1xuICAgIHdpbmRvdy5hdHRhY2hFdmVudChvcmllbnRhdGlvbkV2ZW50LCBoYW5kbGVPcmllbnRhdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93W29yaWVudGF0aW9uRXZlbnRdID0gaGFuZGxlT3JpZW50YXRpb247XG4gIH1cblxuICBoYW5kbGVPcmllbnRhdGlvbigpO1xuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRldmljZTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZGV2aWNlO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5kZXZpY2UgPSBkZXZpY2U7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyogZ2xvYmFsICQgKi9cblxuY29uc3QgYnVyZ2VyID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcuYnVyZ2VyJywgKCkgPT4ge1xuXHRcdFx0JCgnLm5hdmlnYXRpb24nKS50b2dnbGVDbGFzcygnbmF2aWdhdGlvbi0tb3BlbicpO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBidXJnZXI7XG4iLCIvKiBnbG9iYWwgJCAqL1xuXG5jb25zdCBkb3RTdHJpcCA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmRvdC1zdHJpcF9faW5wdXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdHN3aXRjaCAoJCh0aGlzKS5hdHRyKCdpZCcpKSB7XG5cdFx0XHRcdGNhc2UgJ2RvdENhcic6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAnb25lJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnZG90TG9ycnknOlxuXHRcdFx0XHRcdCQoJy5kb3Qtc3RyaXBfX3J1bm5lcicpLmF0dHIoJ2RhdGEtcG9zJywgJ3R3bycpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ2RvdEJ1cyc6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAndGhyZWUnKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHQvLyBza2lwIGRlZmF1bHRcblx0XHRcdH1cblxuXHRcdFx0JCh0aGlzKVxuXHRcdFx0XHQuY2xvc2VzdCgnLnNsaWRlcicpXG5cdFx0XHRcdC5maW5kKCcuc2xpZGUtcGFjaycpXG5cdFx0XHRcdC5hdHRyKCdkYXRhLXNsaWRlci1wb3MnLCAkKHRoaXMpLmF0dHIoJ2RhdGEtZG90LXBvcycpKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZG90U3RyaXA7XG4iLCIvKiBnbG9iYWwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHZhcnMgZnJvbSAnLi4vLi4vY29tcGlsZS92YXJzJztcblxuY29uc3QgZHJpdmVyRm9ybSA9IHtcblx0YnVzeSAgICAgICAgIDogZmFsc2UsXG5cdGZpZWxkc0NvcnJlY3Q6IGZhbHNlLFxuXG5cdGRhdGE6IHtcblx0XHRmaXJzdF9uYW1lICAgICAgICAgOiAnJyxcblx0XHRsYXN0X25hbWUgICAgICAgICAgOiAnJyxcblx0XHRlbWFpbCAgICAgICAgICAgICAgOiAnJyxcblx0XHRwaG9uZSAgICAgICAgICAgICAgOiAnJyxcblx0XHRob3dfZGlkX3lvdV9rbm93ICAgOiAnJyxcblx0XHRjYXJfeWVhciAgICAgICAgICAgOiAnJyxcblx0XHRjYXJfc3RhdGUgICAgICAgICAgOiAnJyxcblx0XHRjYXJfYnJhbmQgICAgICAgICAgOiAnJyxcblx0XHRjYXJfbW9kZWwgICAgICAgICAgOiAnJyxcblx0XHRjYXJfY29sb3IgICAgICAgICAgOiAnJyxcblx0XHRhdmdfbWlsZWFnZV9kYXkgICAgOiAnJyxcblx0XHRhdmdfbWlsZWFnZV93ZWVrZW5kOiAnJyxcblx0XHRjb21tZW50ICAgICAgICAgICAgOiAnJyxcblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnW2RhdGEtd2F5XScsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGNvbnN0IGVsZW1cdFx0XHQ9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS13YXldJyk7XG5cdFx0XHRjb25zdCBwYWdlXHRcdFx0PSAkKCcuZHJpdmVyLWZvcm0nKTtcblx0XHRcdGNvbnN0IGRhdGFQYWdlXHRcdD0gTnVtYmVyKHBhZ2UuYXR0cignZGF0YS1wYWdlJykpO1xuXHRcdFx0Y29uc3QgY3VycmVudFBhZ2VcdD0gJChgLmRyaXZlci1mb3JtX19wYWdlW2RhdGEtcGFnZT0ke2RhdGFQYWdlfV1gKTtcblx0XHRcdGNvbnN0IG5leHRQYWdlXHRcdD0gZGF0YVBhZ2UgKyAxO1xuXHRcdFx0Y29uc3QgcHJldlBhZ2VcdFx0PSBkYXRhUGFnZSAtIDE7XG5cblx0XHRcdGlmIChlbGVtLmF0dHIoJ2RhdGEtd2F5JykgPT09ICdwcmV2Jykge1xuXHRcdFx0XHRpZiAocHJldlBhZ2UgPT09IDEgfHwgcHJldlBhZ2UgPT09IDIpIHtcblx0XHRcdFx0XHRwYWdlLmF0dHIoJ2RhdGEtcGFnZScsIHByZXZQYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3dpdGNoIChkYXRhUGFnZSkge1xuXHRcdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRcdHRoaXMuZGF0YS5ob3dfZGlkX3lvdV9rbm93ID0gJCgnI2hvd19kaWRfeW91X2tub3cnKS52YWwoKTtcblx0XHRcdFx0XHRcdC8vIGZhbGxzIHRocm91Z2hcblxuXHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdGN1cnJlbnRQYWdlXG5cdFx0XHRcdFx0XHRcdC5maW5kKCdbZGF0YS1tYXNrXScpXG5cdFx0XHRcdFx0XHRcdC5lYWNoKChpbmRleCwgZWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoJChlbCkubGVuZ3RoICYmICgkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudFBhZ2Vcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmVhY2goKGksIGl0ZW0pID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoJChpdGVtKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkKGl0ZW0pLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZGF0YVskKGVsKS5hdHRyKCdpZCcpXSA9ICQoZWwpLnZhbCgpO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHRoaXMuZGF0YS5waG9uZSA9IHRoaXMuZGF0YS5waG9uZS5yZXBsYWNlKC9cXEQvZywgJycpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmxlbmd0aCAmJiAkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCQoaXRlbSkuYXR0cignZGF0YS1jb3JyZWN0JykgIT09ICd0cnVlJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQoaXRlbSkuYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRQYWdlXG5cdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtZmlsbGVkXScpXG5cdFx0XHRcdFx0XHRcdFx0XHQuZWFjaCgoaSwgaXRlbSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmRhdGFbJChpdGVtKS5hdHRyKCdpZCcpXSA9ICQoaXRlbSkudmFsKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnd3JvbmcgcGFnZSBudW1iZXInKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHRoaXMuZmllbGRzQ29ycmVjdCkge1xuXHRcdFx0XHRcdHN3aXRjaCAobmV4dFBhZ2UpIHtcblx0XHRcdFx0XHRcdC8vINC90LAg0L/QtdGA0LLQvtC5INGB0YLRgNCw0L3QuNGG0LVcblx0XHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C40YLRjCDRgdGC0YDQsNC90LjRhtGDXG5cdFx0XHRcdFx0XHRcdHBhZ2UuYXR0cignZGF0YS1wYWdlJywgJzInKTtcblx0XHRcdFx0XHRcdFx0Ly8g0YHQsdGA0L7RgdC40YLRjCDQv9C10YDQtdC80LXQvdC90YPRjlxuXHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdC8vINC90LAg0LLRgtC+0YDQvtC5INGB0YLRgNCw0L3QuNGG0LVcblx0XHRcdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C40YLRjCDRgdGC0YDQsNC90LjRhtGDXG5cdFx0XHRcdFx0XHRcdHBhZ2UuYXR0cignZGF0YS1wYWdlJywgJzMnKTtcblx0XHRcdFx0XHRcdFx0Ly8g0YHQsdGA0L7RgdC40YLRjCDQv9C10YDQtdC80LXQvdC90YPRjlxuXHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdC8vINC90LAg0YLRgNC10YLRjNC10Lkg0YHRgtGA0LDQvdC40YbQtVxuXHRcdFx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdFx0XHQvLyDQt9Cw0L/Rg9GB0YLQuNGC0Ywg0YTRg9C90LrRhtC40Y4g0L7RgtC/0YDQsNCy0LrQuCDRhNC+0YDQvNGLXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2VuZEZvcm0oKTtcblx0XHRcdFx0XHRcdFx0Ly8g0YHQsdGA0L7RgdC40YLRjCDQv9C10YDQtdC80LXQvdC90YPRjlxuXHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCd3cm9uZyBuZXh0IHBhZ2UgbnVtYmVyJyk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICog0L7RgtC/0YDQsNCy0LrQsCDRhNC+0YDQvNGLINC90LAg0YHQtdGA0LLQtdGAXG5cdCAqL1xuXHRzZW5kRm9ybSgpIHtcblx0XHRpZiAoIXRoaXMuYnVzeSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3N0YXJ0IHNlbmRpbmcgZm9ybScpO1xuXG5cdFx0XHR0aGlzLmJ1c3kgPSB0cnVlO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmwgOiB2YXJzLnNlcnZlciArIHZhcnMuYXBpLmJlY29tZURyaXZlcixcblx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRkYXRhOiB0aGlzLmRhdGEsXG5cdFx0XHR9KVxuXHRcdFx0XHQuc3VjY2VzcygoKSA9PiB7XG5cdFx0XHRcdFx0JCgnLm1lc3NhZ2UtLXN1Y2Nlc3MnKS5hZGRDbGFzcygnbWVzc2FnZS0tc2hvdycpO1xuXG5cdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C40YLRjCDRgdGC0YDQsNC90LjRhtGDXG5cdFx0XHRcdFx0JCgnLmRyaXZlci1mb3JtJykuYXR0cignZGF0YS1wYWdlJywgJzEnKTtcblxuXHRcdFx0XHRcdC8vINC+0YfQuNGB0YLQutCwINC/0L7Qu9C10Lkg0YTQvtGA0LzRi1xuXHRcdFx0XHRcdCQoJ1tkYXRhLWZpZWxkLXR5cGVdJylcblx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuXHRcdFx0XHRcdFx0XHQkKGVsKVxuXHRcdFx0XHRcdFx0XHRcdC52YWwoJycpXG5cdFx0XHRcdFx0XHRcdFx0LmF0dHIoJ2RhdGEtZmlsbGVkJywgJ2ZhbHNlJylcblx0XHRcdFx0XHRcdFx0XHQuYXR0cignZGF0YS1jb3JyZWN0JywgJ251bGwnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dGhpcy5idXN5ID0gZmFsc2U7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZygnZm9ybSBoYXMgYmVlZCBzZW50Jyk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mYWlsKGVycm9yID0+IHtcblx0XHRcdFx0XHQkKCcubWVzc2FnZS0tZmFpbCcpLmFkZENsYXNzKCdtZXNzYWdlLS1zaG93Jyk7XG5cdFx0XHRcdFx0aWYgKGVycm9yLnJlc3BvbnNlVGV4dCkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3NlcnZlcnMgYW5zd2VyOlxcbicsIGVycm9yLnJlc3BvbnNlVGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdVRk8gaGF2ZSBpbnRlcnJ1cHRlZCBvdXIgc2VydmVyXFwncyB3b3JrXFxud2VcXCdsIHRyeSB0byBmaXggaXQnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5idXN5ID0gZmFsc2U7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZHJpdmVyRm9ybTtcbiIsIi8qIGdsb2JhbCAkICovXG5cbmltcG9ydCB2YXJzIGZyb20gJy4uLy4uL2NvbXBpbGUvdmFycyc7XG5cbmNvbnN0IGdhbGxlcnkgPSB7XG5cdG51bVRvTG9hZDogMjAsXG5cdGNvbnRhaW5lcjogJCgnLmdhbGxlcnknKSxcblx0bG9hZGVyICAgOiAkKCcuZ2FsbGVyeV9fbG9hZGluZycpLFxuXHRtb3JlQnRuICA6ICQoJy5nYWxsZXJ5X19idG4nKSxcblx0YnVzeSAgICAgOiB0cnVlLFxuXHR3YXRjaGVkICA6IGZhbHNlLFxuXG5cdHVybHM6IHtcblx0XHRhbGwgICA6IFtdLFxuXHRcdHRvUHVzaDogW10sXG5cdH0sXG5cblx0aXRlbXM6IHtcblx0XHR0b1B1c2g6IG51bGwsXG5cdH0sXG5cdC8qKlxuXHQgKiDQv9C+0LvRg9GH0LXQvdC40LUg0YHQv9C40YHQutCwINC40LfQvtCx0YDQsNC20LXQvdC40Llcblx0ICovXG5cdGdldFVybHMoKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXN1bHQsIGVycm9yKSA9PiB7XG5cdFx0XHRsZXQgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdFx0cmVxdWVzdC5vcGVuKCdQT1NUJywgdmFycy5zZXJ2ZXIgKyB2YXJzLmFwaS5nYWxsZXJ5KTtcblx0XHRcdHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnKTtcblx0XHRcdHJlcXVlc3Qub25sb2FkID0gKCkgPT4ge1xuXHRcdFx0XHRpZiAocmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuXHRcdFx0XHRcdHJlc3VsdChKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlcnJvcihFcnJvcignSW1hZ2UgZGlkblxcJ3QgbG9hZCBzdWNjZXNzZnVsbHk7IGVycm9yIGNvZGU6JyArIHJlcXVlc3Quc3RhdHVzVGV4dCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0cmVxdWVzdC5vbmVycm9yID0gKCkgPT4ge1xuXHRcdFx0XHRlcnJvcihFcnJvcignVGhlcmUgd2FzIGEgbmV0d29yayBlcnJvci4nKSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe3RhZ3M6IFsnbWFpbiddfSkpO1xuXHRcdH0pO1xuXHR9LFxuXHRsb2FkU3RhcnQoKSB7XG5cdFx0dGhpcy5idXN5ID0gdHJ1ZTtcblx0XHR0aGlzLmxvYWRlci5zaG93KCk7XG5cblx0XHQkKCcuc2VjdGlvbi0tZ2FsbGVyeSAuc2VjdGlvbl9fY29udGVudCcpLmNzcygncGFkZGluZy1ib3R0b20nLCAnNTBweCcpO1xuXHR9LFxuXHRsb2FkRW5kKCkge1xuXHRcdHRoaXMuYnVzeSA9IGZhbHNlO1xuXHRcdHRoaXMubG9hZGVyLmhpZGUoKTtcblxuXHRcdCQoJy5zZWN0aW9uLS1nYWxsZXJ5IC5zZWN0aW9uX19jb250ZW50JykucmVtb3ZlQXR0cignc3R5bGUnKTtcblx0fSxcblx0LyoqXG5cdCAqINGB0L7Qt9C00LDQvdC40LUg0LrQsNGA0YLQuNC90L7QuiDQsiDQlNCe0JzQtVxuXHQgKiBAcGFyYW0gIHtCb29sZWFufSBpc0ZpcnN0INC/0LXRgNCy0YvQuSDQu9C4INCy0YvQt9C+0LIg0YTRg9C90LrRhtC40Lhcblx0ICovXG5cdG1ha2VJbWdzKGlzRmlyc3QpIHtcblx0XHRpZiAoIXRoaXMudXJscy5hbGwubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCFpc0ZpcnN0KSB7XG5cdFx0XHR0aGlzLmxvYWRTdGFydCgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnVybHMuYWxsLmxlbmd0aCA+PSB0aGlzLm51bVRvTG9hZCkge1xuXHRcdFx0dGhpcy51cmxzLnRvUHVzaCA9IHRoaXMudXJscy5hbGwuc3BsaWNlKC10aGlzLm51bVRvTG9hZCwgdGhpcy5udW1Ub0xvYWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnVybHMudG9QdXNoID0gdGhpcy51cmxzLmFsbDtcblx0XHR9XG5cblx0XHR0aGlzLml0ZW1zLnRvUHVzaCA9ICQodGhpcy51cmxzLnRvUHVzaC5qb2luKCcnKSk7XG5cdFx0dGhpcy51cmxzLnRvUHVzaC5sZW5ndGggPSAwO1xuXG5cdFx0aWYgKGlzRmlyc3QpIHtcblx0XHRcdHRoaXMuY29udGFpbmVyXG5cdFx0XHRcdC5tYXNvbnJ5KHtcblx0XHRcdFx0XHRjb2x1bW5XaWR0aCAgICA6ICcuZ2FsbGVyeV9faXRlbScsXG5cdFx0XHRcdFx0aXNBbmltYXRlZCAgICAgOiB0cnVlLFxuXHRcdFx0XHRcdGlzSW5pdExheW91dCAgIDogdHJ1ZSxcblx0XHRcdFx0XHRpc1Jlc2l6YWJsZSAgICA6IHRydWUsXG5cdFx0XHRcdFx0aXRlbVNlbGVjdG9yICAgOiAnLmdhbGxlcnlfX2l0ZW0nLFxuXHRcdFx0XHRcdHBlcmNlbnRQb3NpdGlvbjogdHJ1ZSxcblx0XHRcdFx0XHRzaW5nbGVNb2RlICAgICA6IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5hcHBlbmQodGhpcy5pdGVtcy50b1B1c2gpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy5pdGVtcy50b1B1c2gpO1xuXHRcdH1cblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoXG5cdFx0XHQuaGlkZSgpXG5cdFx0XHQuaW1hZ2VzTG9hZGVkKClcblx0XHRcdC5wcm9ncmVzcygoaW1nTG9hZCwgaW1hZ2UpID0+IHtcblx0XHRcdFx0Y29uc3QgJGl0ZW0gPSAkKGltYWdlLmltZykucGFyZW50cygnLmdhbGxlcnlfX2l0ZW0nKTtcblxuXHRcdFx0XHRpZiAodGhpcy5sb2FkZXIuaGFzQ2xhc3MoJ2dhbGxlcnlfX2xvYWRpbmctLWZpcnN0JykpIHtcblx0XHRcdFx0XHR0aGlzLmxvYWRlci5yZW1vdmVDbGFzcygnZ2FsbGVyeV9fbG9hZGluZy0tZmlyc3QnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCRpdGVtLnNob3coKTtcblxuXHRcdFx0XHR0aGlzLmNvbnRhaW5lclxuXHRcdFx0XHRcdC5tYXNvbnJ5KCdhcHBlbmRlZCcsICRpdGVtKVxuXHRcdFx0XHRcdC5tYXNvbnJ5KCk7XG5cdFx0XHR9KVxuXHRcdFx0LmRvbmUoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmxvYWRFbmQoKTtcblx0XHRcdFx0dGhpcy5vblNjcm9sbCgpO1xuXG5cdFx0XHRcdGlmICghdGhpcy53YXRjaGVkKSB7XG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB0aGlzLm9uU2Nyb2xsKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoLmxlbmd0aCA9IDA7XG5cdH0sXG5cdC8qKlxuXHQgKiDQvdCw0LLQtdGI0LjQstCw0LXQvNCw0Y8g0L3QsCDRgdC60YDQvtC70Lsg0YTRg9C90LrRhtC40Y9cblx0ICog0LfQsNC/0YPRgdC60LDQtdGCINC/0L7QtNCz0YDRg9C30LrRgyDRhNC+0YLQvtC6INC10YHQtNC4INC90LDQtNC+XG5cdCAqL1xuXHRvblNjcm9sbCgpIHtcblx0XHRjb25zdCBwYWdlSGVpZ2h0XHRcdD0gJChkb2N1bWVudCkuaGVpZ2h0KCk7XG5cdFx0Y29uc3Qgd2luZG93SGVpZ2h0XHQ9ICQod2luZG93KS5oZWlnaHQoKTtcblx0XHRjb25zdCB3aW5kb3dTY3JvbGxcdD0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXHRcdGNvbnN0IGxlZnRUb0JvdHRvbVx0PVx0cGFnZUhlaWdodCAtIHdpbmRvd0hlaWdodCAtIHdpbmRvd1Njcm9sbDtcblxuXHRcdGlmICghdGhpcy5idXN5ICYmIHRoaXMudXJscy5hbGwubGVuZ3RoICYmIGxlZnRUb0JvdHRvbSA8PSAzMDApIHtcblx0XHRcdGNvbnNvbGUubG9nKCdzY3JvbGwgbG9hZCcpO1xuXHRcdFx0dGhpcy5tYWtlSW1ncygpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJy5nYWxsZXJ5X19iZycpLmhpZGUoKTtcblxuXHRcdHRoaXMuZ2V0VXJscygpXG5cdFx0XHQudGhlbihcblx0XHRcdFx0cmVzdWx0ID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnZ290IGltYWdlcycpO1xuXHRcdFx0XHRcdHRoaXMudXJscy5hbGwgPSByZXN1bHQucmV2ZXJzZSgpO1xuXG5cdFx0XHRcdFx0dGhpcy51cmxzLmFsbC5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnVybHMuYWxsW2ldID0gJzxkaXYgZGF0YS11cmw9XCInICsgdmFycy5zZXJ2ZXIgKyBlbGVtICtcblx0XHRcdFx0XHRcdFx0J1wiIGNsYXNzPVwiZ2FsbGVyeV9faXRlbVwiPjxpbWcgc3JjPVwiJyArIHZhcnMuc2VydmVyICsgZWxlbSArXG5cdFx0XHRcdFx0XHRcdCdcIiBhbHQ+PGRpdiBjbGFzcz1cImdhbGxlcnlfX2RhcmtuZXNzXCI+PC9kaXY+PC9kaXY+Jztcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHRoaXMubWFrZUltZ3ModHJ1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvciwgJ2Vycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5nYWxsZXJ5X19pdGVtJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRsZXQgaW1nVXJsID0gJCh0aGlzKS5hdHRyKCdkYXRhLXVybCcpO1xuXG5cdFx0XHQkKCdbZGF0YS1nYWwtbW9kYWxdJylcblx0XHRcdFx0LmF0dHIoJ3NyYycsIGltZ1VybClcblx0XHRcdFx0LmNsb3Nlc3QoJy5nYWxsZXJ5X19iZycpXG5cdFx0XHRcdC5mYWRlSW4oMzAwKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmdhbGxlcnlfX2JnJywgZnVuY3Rpb24oKSB7XG5cdFx0XHQkKHRoaXMpLmZhZGVPdXQoMzAwKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2FsbGVyeTtcbiIsIi8qIGdsb2JhbCAkICovXG5cbmNvbnN0IGlucHV0ID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdibHVyJywgJy5pbnB1dF9faW5wdXQnLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5pbnB1dF9faW5wdXQnKTtcblxuXHRcdFx0aWYgKGVsZW0udmFsKCkpIHtcblx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWZpbGxlZCcsICd0cnVlJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtZmlsbGVkJywgJ2ZhbHNlJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwndGVsXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCd0ZWxcXCddJyk7XG5cblx0XHRcdGVsZW0udmFsKGlucHV0LmZvcm1hdChlbGVtLnZhbCgpLCAndGVsJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdbZGF0YS1tYXNrPVxcJ3RlbFxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2s9XFwndGVsXFwnXScpO1xuXG5cdFx0XHRlbGVtLnZhbChpbnB1dC5mb3JtYXQoZWxlbS52YWwoKSwgJ3RlbCcpKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbigna2V5dXAnLCAnW2RhdGEtbWFzaz1cXCd5ZWFyXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCd5ZWFyXFwnXScpO1xuXG5cdFx0XHRlbGVtLnZhbChpbnB1dC5mb3JtYXQoZWxlbS52YWwoKSwgJ3llYXInKSk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwnbnVtYmVyXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCdudW1iZXJcXCddJyk7XG5cblx0XHRcdGVsZW0udmFsKGlucHV0LmZvcm1hdChlbGVtLnZhbCgpLCAnbnVtYmVyJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdibHVyJywgJ1tkYXRhLW1hc2tdJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1tYXNrXScpO1xuXG5cdFx0XHRzd2l0Y2ggKGVsZW0uYXR0cignZGF0YS1tYXNrJykpIHtcblx0XHRcdFx0Y2FzZSAnZW1haWwnOlxuXHRcdFx0XHRcdGlmICgvLitALitcXC4uKy9pLnRlc3QoZWxlbS52YWwoKSkpIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAndGVsJzpcblx0XHRcdFx0XHRpZiAoZWxlbS52YWwoKS5sZW5ndGggPT09IDE4KSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ25hbWUnOlxuXHRcdFx0XHRcdGlmICgvXlthLXpBLVrQsC3Rj9GR0JAt0K/QgV1bYS16QS1a0LAt0Y/RkdCQLdCv0IEwLTktXy5dezEsMjB9JC8udGVzdChlbGVtLnZhbCgpKSkge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdlbXB0eSc6XG5cdFx0XHRcdGNhc2UgJ3RleHQnOlxuXHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdGlmIChlbGVtLnZhbCgpKSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ2VtcHR5Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ3llYXInOlxuXHRcdFx0XHRcdGlmIChlbGVtLnZhbCgpICYmXG5cdFx0XHRcdFx0XHRwYXJzZUludChlbGVtLnZhbCgpLCAxMCkgPj0gMTkwMCAmJlxuXHRcdFx0XHRcdFx0cGFyc2VJbnQoZWxlbS52YWwoKSwgMTApIDw9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHQvLyBza2lwIGRlZmF1bHRcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignaW5wdXQnLCAnW2RhdGEtbWFza10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2tdJyk7XG5cblx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ251bGwnKTtcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqINGE0L7RgNC80LDRgtC40YDRg9C10YIg0LfQvdCw0YfQtdC90LjQtSDQsiDQuNC90L/Rg9GC0LVcblx0ICogQHBhcmFtICB7c3RyaW5nfSBkYXRhICAg0LfQvdCw0YfQtdC90LjQtSDQsiDQuNC90L/Rg9GC0LVcblx0ICogQHBhcmFtICB7c3RyaW5nfSBmb3JtYXQg0LjQvNGPINGE0L7RgNC80LDRgtCwXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgINC+0YLRhNC+0YDQvNCw0YLQuNGA0L7QstCw0L3QvdC+0LUg0LfQvdCw0YfQtdC90LjQtVxuXHQgKi9cblx0Zm9ybWF0KGRhdGEsIGZvcm1hdCkge1xuXHRcdGxldCBuZXdEYXRhID0gJyc7XG5cblx0XHRzd2l0Y2ggKGZvcm1hdCkge1xuXHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0bmV3RGF0YSA9IGRhdGEucmVwbGFjZSgvXFxEL2csICcnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ3llYXInOlxuXHRcdFx0XHRuZXdEYXRhID0gaW5wdXQuZm9ybWF0KGRhdGEsICdudW1iZXInKTtcblxuXHRcdFx0XHRpZiAobmV3RGF0YS5sZW5ndGggPiA0KSB7XG5cdFx0XHRcdFx0bmV3RGF0YSA9IG5ld0RhdGEuc2xpY2UoMCwgNCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ3RlbCc6XG5cdFx0XHRcdG5ld0RhdGEgPSBpbnB1dC5mb3JtYXQoZGF0YSwgJ251bWJlcicpO1xuXG5cdFx0XHRcdGlmIChuZXdEYXRhLmxlbmd0aCA8PSAxMSkge1xuXHRcdFx0XHRcdHN3aXRjaCAobmV3RGF0YS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdGNhc2UgMDpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJztcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0XHRcdGlmIChuZXdEYXRhWzBdICE9PSAnNycpIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgbmV3RGF0YVswXTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgbmV3RGF0YVsxXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBuZXdEYXRhWzFdICsgbmV3RGF0YVsyXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBuZXdEYXRhWzFdICsgbmV3RGF0YVsyXSArIG5ld0RhdGFbM107XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgbmV3RGF0YVsxXSArIG5ld0RhdGFbMl0gKyBuZXdEYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgbmV3RGF0YVs0XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDY6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBuZXdEYXRhWzFdICsgbmV3RGF0YVsyXSArIG5ld0RhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBuZXdEYXRhWzRdICsgbmV3RGF0YVs1XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDc6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBuZXdEYXRhWzFdICsgbmV3RGF0YVsyXSArIG5ld0RhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBuZXdEYXRhWzRdICsgbmV3RGF0YVs1XSArIG5ld0RhdGFbNl07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA4OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgbmV3RGF0YVsxXSArIG5ld0RhdGFbMl0gKyBuZXdEYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgbmV3RGF0YVs0XSArIG5ld0RhdGFbNV0gKyBuZXdEYXRhWzZdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBuZXdEYXRhWzddO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgOTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIG5ld0RhdGFbMV0gKyBuZXdEYXRhWzJdICsgbmV3RGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIG5ld0RhdGFbNF0gKyBuZXdEYXRhWzVdICsgbmV3RGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgbmV3RGF0YVs3XSArIG5ld0RhdGFbOF07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxMDpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIG5ld0RhdGFbMV0gKyBuZXdEYXRhWzJdICsgbmV3RGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIG5ld0RhdGFbNF0gKyBuZXdEYXRhWzVdICsgbmV3RGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgbmV3RGF0YVs3XSArIG5ld0RhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIG5ld0RhdGFbOV07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxMTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIG5ld0RhdGFbMV0gKyBuZXdEYXRhWzJdICsgbmV3RGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIG5ld0RhdGFbNF0gKyBuZXdEYXRhWzVdICsgbmV3RGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgbmV3RGF0YVs3XSArIG5ld0RhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIG5ld0RhdGFbOV0gKyBuZXdEYXRhWzEwXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdC8vIHNraXAgZGVmYXVsdFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgbmV3RGF0YVsxXSArIG5ld0RhdGFbMl0gKyBuZXdEYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBuZXdEYXRhWzRdICsgbmV3RGF0YVs1XSArIG5ld0RhdGFbNl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgbmV3RGF0YVs3XSArIG5ld0RhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgbmV3RGF0YVs5XSArIG5ld0RhdGFbMTBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRuZXdEYXRhID0gZGF0YTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ3dyb25nIGlucHV0IGZvcm1hdCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3RGF0YTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdXQ7XG4iLCIvKiBnbG9iYWwgJCAqL1xuXG5jb25zdCBtYXAgPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCcjbWFwJykubGF6eWxvYWQoe1xuXHRcdFx0dGhyZXNob2xkOiAyMDAsXG5cdFx0XHRlZmZlY3QgICA6ICdmYWRlSW4nLFxuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYXA7XG4iLCIvKiBnbG9iYWwgJCAqL1xuXG5jb25zdCBtZXNzYWdlID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcubWVzc2FnZV9fYmcsIC5tZXNzYWdlX19jbG9zZScsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdCQoZXZlbnQudGFyZ2V0KVxuXHRcdFx0XHQuY2xvc2VzdCgnLm1lc3NhZ2UnKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ21lc3NhZ2UtLXNob3cnKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWVzc2FnZTtcbiIsIi8qIGdsb2JhbCAkICovXG5cbmNvbnN0IHBpbiA9IHtcblx0c2VjICAgIDogNTU1NTUsXG5cdGhvdXJzICA6IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSxcblx0bWludXRlczogbmV3IERhdGUoKS5nZXRNaW51dGVzKCksXG5cdHNlY29uZHM6IG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpLFxuXHQvKipcblx0ICog0YHRh9C10YLRh9C40LosINGD0LLQtdC70LjRh9C40LLQsNC10YIg0LLRgNC10LzRj1xuXHQgKi9cblx0Y291bnRkb3duKCkge1xuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCddJykudGV4dChNYXRoLmZsb29yKHRoaXMuc2VjIC8gMzYwMCkpO1xuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ21cXCddJykudGV4dChNYXRoLmZsb29yKCh0aGlzLnNlYyAlIDM2MDApIC8gNjApKTtcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdzXFwnXScpLnRleHQoTWF0aC5mbG9vcih0aGlzLnNlYyAlIDM2MDAgJSA2MCkpO1xuXG5cdFx0dGhpcy5zZWMgKz0gMTtcblx0fSxcblx0LyoqXG5cdCAqINC00L7QsdCw0LLQu9GP0LXRgiDQuiDRhtC40YTRgNC1INC90L7Qu9GMLCDRh9GC0L7QsSDQv9C+0LvRg9GH0LjRgtGMINC00LLRg9C30L3QsNGH0L3QvtC1INGH0LjRgdC70L5cblx0ICogQHBhcmFtICB7bnVtYmVyfSBudW1iZXIg0YbQuNGE0YDQsCDQuNC70Lgg0YfQuNGB0LvQvlxuXHQgKiBAcmV0dXJuIHtudW1iZXJ9ICAgICAgICDQtNCy0YPQt9C90LDRh9C90L7QtSDRh9C40YHQu9C+XG5cdCAqL1xuXHR0d29OdW1iZXJzKG51bWJlcikge1xuXHRcdGxldCBuZXdOdW1iZXIgPSBudWxsO1xuXG5cdFx0aWYgKG51bWJlciA8IDEwKSB7XG5cdFx0XHRuZXdOdW1iZXIgPSAnMCcgKyBudW1iZXIudG9TdHJpbmcoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3TnVtYmVyO1xuXHR9LFxuXHQvKipcblx0ICog0L7QsdC90L7QstC70Y/QtdGCINCy0YDQtdC80Y9cblx0ICog0LLRi9C30YvQstCw0LXRgtGB0Y8g0LrQsNC00LbRg9GOINGB0LXQutGD0L3QtNGDXG5cdCAqL1xuXHRzZXRUaW1lKCkge1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHR0aGlzLmhvdXJzID0gbmV3IERhdGUoKS5nZXRIb3VycygpO1xuXG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnJykudGV4dCh0aGlzLnR3b051bWJlcnModGhpcy5ob3VycykpO1xuXG5cdFx0XHR0aGlzLm1pbnV0ZXMgPSBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnbVxcJycpLnRleHQodGhpcy50d29OdW1iZXJzKHRoaXMubWludXRlcykpO1xuXG5cdFx0XHR0aGlzLnNlY29uZHMgPSBuZXcgRGF0ZSgpLmdldFNlY29uZHMoKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJycpLnRleHQodGhpcy50d29OdW1iZXJzKHRoaXMuc2Vjb25kcykpO1xuXHRcdH07XG5cdH0sXG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLnBpbicsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGxldCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5waW4nKTtcblxuXHRcdFx0ZWxlbVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3Bpbi0tc2hvdycpXG5cdFx0XHRcdC5jc3MoJ3otaW5kZXgnLCAnMicpXG5cdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdC5yZW1vdmVDbGFzcygncGluLS1zaG93Jylcblx0XHRcdFx0LmNzcygnei1pbmRleCcsICcxJyk7XG5cdFx0fSk7XG5cblx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdkZXNrdG9wJykpIHtcblx0XHRcdGxldCBuZXdEYXRlID0gbmV3IERhdGUoKTtcblxuXHRcdFx0bmV3RGF0ZS5zZXREYXRlKG5ld0RhdGUuZ2V0RGF0ZSgpKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnaFxcJycpLnRleHQodGhpcy5ob3Vycyk7XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnJykudGV4dCh0aGlzLm1pbnV0ZXMpO1xuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJycpLnRleHQodGhpcy5zZWNvbmRzKTtcblxuXHRcdFx0c2V0SW50ZXJ2YWwodGhpcy5zZXRUaW1lLCAxMDAwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnaFxcJ10nKVxuXHRcdFx0XHQudGV4dChNYXRoLmZsb29yKHRoaXMuc2VjIC8gMzYwMCkgPCAxMCA/XG5cdFx0XHRcdFx0XHRcdCcwJyArIE1hdGguZmxvb3IodGhpcy5zZWMgLyAzNjAwKSA6XG5cdFx0XHRcdFx0XHRcdE1hdGguZmxvb3IodGhpcy5zZWMgLyAzNjAwKSk7XG5cblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ21cXCddJylcblx0XHRcdFx0LnRleHQoTWF0aC5mbG9vcigodGhpcy5zZWMgJSAzNjAwKSAvIDYwKSA8IDEwID9cblx0XHRcdFx0XHRcdFx0JzAnICsgTWF0aC5mbG9vcigodGhpcy5zZWMgJSAzNjAwKSAvIDYwKSA6XG5cdFx0XHRcdFx0XHRcdE1hdGguZmxvb3IoKHRoaXMuc2VjICUgMzYwMCkgLyA2MCkpO1xuXG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdzXFwnXScpXG5cdFx0XHRcdC50ZXh0KE1hdGguZmxvb3IoKHRoaXMuc2VjICUgMzYwMCkgJSA2MCkgPCAxMCA/XG5cdFx0XHRcdFx0XHRcdCcwJyArIE1hdGguZmxvb3IoKHRoaXMuc2VjICUgMzYwMCkgJSA2MCkgOlxuXHRcdFx0XHRcdFx0XHRNYXRoLmZsb29yKCh0aGlzLnNlYyAlIDM2MDApICUgNjApKTtcblxuXHRcdFx0dGhpcy5zZWMgKz0gMTtcblxuXHRcdFx0c2V0SW50ZXJ2YWwodGhpcy5jb3VudGRvd24sIDEwMDApO1xuXHRcdH1cblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcGluO1xuIiwiLyogZ2xvYmFsICQgKi9cblxuY29uc3QgcXVlc3Rpb24gPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCcucXVlc3Rpb25zX19pdGVtJykuZXEoMSkuaGlkZSgpO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcubWFpbi1idG4tLWhkaXcnLCBldmVudCA9PiB7XG5cdFx0XHRsZXQgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcubWFpbi1idG4tLWhkaXcnKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGlmICghZWxlbS5oYXNDbGFzcygnbWFpbi1idG4tLWFjdGl2ZScpKSB7XG5cdFx0XHRcdGVsZW1cblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ21haW4tYnRuLS1hY3RpdmUnKVxuXHRcdFx0XHRcdC5zaWJsaW5ncygpXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCdtYWluLWJ0bi0tYWN0aXZlJyk7XG5cblx0XHRcdFx0JCgnLnF1ZXN0aW9uc19faXRlbScpXG5cdFx0XHRcdFx0LmVxKGVsZW0uaW5kZXgoKSAtIDIpXG5cdFx0XHRcdFx0LmZhZGVJbigzMDApXG5cdFx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0XHQuZmFkZU91dCgzMDApO1xuXG5cdFx0XHRcdCQoJy5xdWVzdGlvbnNfX2l0ZW0nKVxuXHRcdFx0XHRcdC5maW5kKCcucXVlc3Rpb25fX2JvZHknKVxuXHRcdFx0XHRcdC5zbGlkZVVwKDMwMCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5xdWVzdGlvbl9faGVhZGVyJywgZXZlbnQgPT4ge1xuXHRcdFx0bGV0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnF1ZXN0aW9uX19oZWFkZXInKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGVsZW1cblx0XHRcdFx0LnNpYmxpbmdzKCcucXVlc3Rpb25fX2JvZHknKVxuXHRcdFx0XHQuc2xpZGVUb2dnbGUoMzAwKVxuXHRcdFx0XHQuY2xvc2VzdCgnLnF1ZXN0aW9uJylcblx0XHRcdFx0LnNpYmxpbmdzKCcucXVlc3Rpb24nKVxuXHRcdFx0XHQuZmluZCgnLnF1ZXN0aW9uX19ib2R5Jylcblx0XHRcdFx0LnNsaWRlVXAoMzAwKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcXVlc3Rpb247XG4iLCIvKiBnbG9iYWwgJCAqL1xuXG5jb25zdCBzY3JvbGxCdG4gPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zY3JvbGwtYnRuJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuc2Nyb2xsLWJ0bicpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0JCgnaHRtbCwgYm9keScpXG5cdFx0XHRcdC5hbmltYXRlKFxuXHRcdFx0XHRcdHtzY3JvbGxUb3A6IGVsZW0uY2xvc2VzdCgnLnNlY3Rpb24nKS5vdXRlckhlaWdodCgpfSxcblx0XHRcdFx0XHQ3MDApO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzY3JvbGxCdG47XG4iLCIvKiBnbG9iYWwgJCAqL1xuXG5jb25zdCBzZWFyY2ggPSB7XG5cdG5lZWRlZFNjcm9sbDogbnVsbCxcblx0c3RhcnRlZCAgICAgOiBmYWxzZSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdHRoaXMubmVlZGVkU2Nyb2xsID0gKCQoJy5zZWFyY2gnKS5vZmZzZXQoKS50b3AgLSAkKHdpbmRvdykuaGVpZ2h0KCkpICsgKCQoJy5zZWFyY2gnKS5oZWlnaHQoKSAvIDIpO1xuXG5cdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7XG5cdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49IHRoaXMubmVlZGVkU2Nyb2xsICYmICF0aGlzLnN0YXJ0ZWQpIHtcblx0XHRcdFx0JCgnLnNlYXJjaCcpLmFkZENsYXNzKCdzZWFyY2gtLWFuaW1hdGUnKTtcblx0XHRcdFx0dGhpcy5zdGFydGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2VhcmNoO1xuIiwiLyogZ2xvYmFsICQgKi9cblxuY29uc3Qgc2xpZGVQYWNrID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdbZGF0YS1wYWctcG9zXScsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQkKHRoaXMpXG5cdFx0XHRcdC5hZGRDbGFzcygnc2xpZGUtcGFja19fcGFnLS1hY3RpdmUnKVxuXHRcdFx0XHQuc2libGluZ3MoKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3NsaWRlLXBhY2tfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LmNsb3Nlc3QoJy5zbGlkZS1wYWNrX19wYWdzJylcblx0XHRcdFx0LnNpYmxpbmdzKCdbZGF0YS1zbGlkZXItcG9zXScpXG5cdFx0XHRcdC5hdHRyKCdkYXRhLXNsaWRlci1wb3MnLCAkKHRoaXMpLmF0dHIoJ2RhdGEtcGFnLXBvcycpKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2xpZGVQYWNrO1xuIiwiLyogZ2xvYmFsICQgKi9cblxuY29uc3QgdGFibGV0ID0ge1xuXHRtb2JPbmUgIDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtbW9iLXgxJyksXG5cdG1vYlR3byAgOiAkKCcjdGFibGV0JykuYXR0cignZGF0YS1tb2IteDInKSxcblx0bW9iVGhyZWU6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW1vYi14MycpLFxuXHR0YWJPbmUgIDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtdGFiLXgxJyksXG5cdHRhYlR3byAgOiAkKCcjdGFibGV0JykuYXR0cignZGF0YS10YWIteDInKSxcblx0dGFiVGhyZWU6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLXRhYi14MycpLFxuXHQvKipcblx0ICog0LfQsNC/0YPRgdC60LDQtdC80LDRjyDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHRpZiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMykge1xuXHRcdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJykpIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0aGlzLm1vYlRocmVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy50YWJUaHJlZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyKSB7XG5cdFx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSkge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRoaXMubW9iVHdvKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy50YWJUd28pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSkge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRoaXMubW9iT25lKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy50YWJPbmUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdCQoJyN0YWJsZXQnKS5sYXp5bG9hZCh7XG5cdFx0XHR0aHJlc2hvbGQ6IDIwMCxcblx0XHRcdGVmZmVjdCAgIDogJ2ZhZGVJbicsXG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxldDtcbiIsIi8qIGdsb2JhbCAkICovXG5cbmNvbnN0IHVwQnRuID0ge1xuXHQvKipcblx0ICog0LLQutC70Y7Rh9Cw0LXRgi/QstGL0LrQu9GO0YfQsNC10YIg0LLQuNC00LjQvNC+0YHRgtGMINC60L3QvtC/0LrQuFxuXHQgKi9cblx0c2V0VmlzaWJpbGl0eSgpIHtcblx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49IDgwMCkge1xuXHRcdFx0JCgnLnVwLWJ0bicpLmFkZENsYXNzKCd1cC1idG4tLXNob3cnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnLnVwLWJ0bicpLnJlbW92ZUNsYXNzKCd1cC1idG4tLXNob3cnKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiDQt9Cw0L/Rg9GB0LrQsNC10LzQsNGPINC/0YDQuCDQt9Cw0LPRgNGD0LfQutC1INGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdHVwQnRuLnNldFZpc2liaWxpdHkoKTtcblxuXHRcdCQod2luZG93KS5zY3JvbGwoKCkgPT4ge1xuXHRcdFx0dXBCdG4uc2V0VmlzaWJpbGl0eSgpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcudXAtYnRuJywgKCkgPT4ge1xuXHRcdFx0JCgnaHRtbCwgYm9keScpXG5cdFx0XHRcdC5zdG9wKClcblx0XHRcdFx0LmFuaW1hdGUoXG5cdFx0XHRcdFx0e3Njcm9sbFRvcDogMH0sXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbFRvcCgpIC8gNCk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVwQnRuO1xuIiwiLyogZ2xvYmFsICQgKi9cblxuY29uc3Qgd2RTbGlkZXIgPSB7XG5cdC8qKlxuXHQgKiDQt9Cw0L/Rg9GB0LrQsNC10LzQsNGPINC/0YDQuCDQt9Cw0LPRgNGD0LfQutC1INGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLndkLXNsaWRlcl9fcGFnJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdCQodGhpcylcblx0XHRcdFx0LmFkZENsYXNzKCd3ZC1zbGlkZXJfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCd3ZC1zbGlkZXJfX3BhZy0tYWN0aXZlJyk7XG5cblx0XHRcdGlmICgkKHRoaXMpLmluZGV4KCkgPT09IDEpIHtcblx0XHRcdFx0JCh0aGlzKVxuXHRcdFx0XHRcdC5jbG9zZXN0KCcud2Qtc2xpZGVyJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ3dkLXNsaWRlci0tdHdvJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0LmNsb3Nlc3QoJy53ZC1zbGlkZXInKVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnd2Qtc2xpZGVyLS10d28nKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gd2RTbGlkZXI7XG4iLCIvKiBnbG9iYWwgJCwgeW1hcHMgKi9cblxuY29uc3QgeWFNYXAgPSB7XG5cdHBvaW50czogW10sXG5cdG1hcCAgIDoge30sXG5cdC8qKlxuXHQgKiDQvtCx0YrRj9Cy0LvRj9C10YIg0YLQvtGH0LrQuCAo0L3QsNC00L4g0LLRi9C/0L7Qu9C90Y/RgtGMINC/0L7RgdC70LUg0YHQvtC30LTQsNC90LjRjyDQutCw0YDRgtGLKVxuXHQgKi9cblx0c2V0UG9pbnRzKCkge1xuXHRcdHRoaXMucG9pbnRzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRjb29yZHM6IFs1OS45MjAyMjk3NTk2Mjc2OSwgMzAuMzcyOTU1OTk5OTk5OTc3XSxcblx0XHRcdFx0dGl0bGVzOiB7XG5cdFx0XHRcdFx0aGludENvbnRlbnQgICA6ICfQkdC+0LrRgSDQtNC70Y8g0L7QutC70LXQudC60LgnLFxuXHRcdFx0XHRcdGJhbGxvb25Db250ZW50OiAn0KHQn9CxLCDQmtGA0LXQvNC10L3Rh9GD0LPRgdC60LDRjyDRg9C7Liwg0LQuOCcsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBhcmFtczoge1xuXHRcdFx0XHRcdGljb25MYXlvdXQ6IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeVxuXHRcdFx0XHRcdFx0LmNyZWF0ZUNsYXNzKCc8ZGl2IGNsYXNzPVxcJ3lhLW1hcF9faWNvbiB5YS1tYXBfX2ljb24tLWJsdWVcXCc+PC9kaXY+JyksXG5cblx0XHRcdFx0XHRpY29uU2hhcGU6IHtcblx0XHRcdFx0XHRcdHR5cGUgICAgICAgOiAnUmVjdGFuZ2xlJyxcblx0XHRcdFx0XHRcdGNvb3JkaW5hdGVzOiBbWy03LCAtNDBdLCBbMzMsIDBdXSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0Y29vcmRzOiBbNTkuOTQ0ODQwOTM3NzE5MzEsIDMwLjM4ODU5MDE2Njg0MDE2XSxcblx0XHRcdFx0dGl0bGVzOiB7XG5cdFx0XHRcdFx0aGludENvbnRlbnQgICA6ICfQk9C70LDQstC90YvQuSDQvtGE0LjRgScsXG5cdFx0XHRcdFx0YmFsbG9vbkNvbnRlbnQ6ICfQodCf0LEsINCh0YPQstC+0YDQvtCy0YHQutC40Lkg0L/RgNC+0YHQv9C10LrRgiwgNjXQsSwg0L7RhNC40YEgMTYnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwYXJhbXM6IHtcblx0XHRcdFx0XHRpY29uTGF5b3V0OiB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3Rvcnlcblx0XHRcdFx0XHRcdC5jcmVhdGVDbGFzcygnPGRpdiBjbGFzcz1cXCd5YS1tYXBfX2ljb24geWEtbWFwX19pY29uLS1yZWRcXCc+PC9kaXY+JyksXG5cblx0XHRcdFx0XHRpY29uU2hhcGU6IHtcblx0XHRcdFx0XHRcdHR5cGUgICAgICAgOiAnUmVjdGFuZ2xlJyxcblx0XHRcdFx0XHRcdGNvb3JkaW5hdGVzOiBbWy03LCAtNDBdLCBbMzMsIDBdXSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0fVxuXHRcdF07XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0LXRgiDRgtC+0YfQutGDINC90LAg0LrQsNGA0YLQtVxuXHQgKiBAcGFyYW0ge29iamV4dH0gcG9pbnQg0L7QsdGK0LXQutGCINGBINC00LDQvdC90YvQvNC4INGC0L7Rh9C60Lhcblx0ICovXG5cdHNldFBvaW50KHBvaW50KSB7XG5cdFx0dGhpcy5tYXAuZ2VvT2JqZWN0cy5hZGQobmV3IHltYXBzLlBsYWNlbWFyayhwb2ludC5jb29yZHMsIHBvaW50LnRpdGxlcywgcG9pbnQucGFyYW1zKSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0LXRgiDQutCw0YDRgtGDXG5cdCAqL1xuXHRzZXRNYXAoKSB7XG5cdFx0eW1hcHMucmVhZHkoKCkgPT4ge1xuXHRcdFx0dGhpcy5tYXAgPSBuZXcgeW1hcHMuTWFwKCd5YU1hcCcsIHtcblx0XHRcdFx0Y2VudGVyOiBbXG5cdFx0XHRcdFx0NTkuOTMxNTkzMjIyMzM5ODQsXG5cdFx0XHRcdFx0MzAuMzc1MTQ0NjgyNTU2MTIyXG5cdFx0XHRcdF0sXG5cdFx0XHRcdGNvbnRyb2xzOiBbXG5cdFx0XHRcdFx0J3pvb21Db250cm9sJ1xuXHRcdFx0XHRdLFxuXHRcdFx0XHR6b29tOiAxMyxcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnNldFBvaW50cygpO1xuXG5cdFx0XHR0aGlzLnBvaW50cy5mb3JFYWNoKGVsZW0gPT4ge1xuXHRcdFx0XHR0aGlzLnNldFBvaW50KGVsZW0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMubWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdzY3JvbGxab29tJyk7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHR0aGlzLnNldE1hcCgpO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB5YU1hcDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHZhcnNcdFx0XHRmcm9tICcuL3ZhcnMnO1xuXG5pbXBvcnQgYnVyZ2VyXHRcdGZyb20gJy4uL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyJztcbmltcG9ydCBkb3RTdHJpcFx0ZnJvbSAnLi4vYmxvY2tzL2RvdC1zdHJpcC9kb3Qtc3RyaXAnO1xuaW1wb3J0IGRyaXZlckZvcm1cdGZyb20gJy4uL2Jsb2Nrcy9kcml2ZXItZm9ybS9kcml2ZXItZm9ybSc7XG5pbXBvcnQgZ2FsbGVyeVx0XHRmcm9tICcuLi9ibG9ja3MvZ2FsbGVyeS9nYWxsZXJ5JztcbmltcG9ydCBpbnB1dFx0XHRmcm9tICcuLi9ibG9ja3MvaW5wdXQvaW5wdXQnO1xuaW1wb3J0IG1hcFx0XHRcdGZyb20gJy4uL2Jsb2Nrcy9tYXAvbWFwJztcbmltcG9ydCBtZXNzYWdlXHRcdGZyb20gJy4uL2Jsb2Nrcy9tZXNzYWdlL21lc3NhZ2UnO1xuaW1wb3J0IHBpblx0XHRcdGZyb20gJy4uL2Jsb2Nrcy9waW4vcGluJztcbmltcG9ydCBxdWVzdGlvblx0ZnJvbSAnLi4vYmxvY2tzL3F1ZXN0aW9uL3F1ZXN0aW9uJztcbmltcG9ydCBzY3JvbGxCdG5cdGZyb20gJy4uL2Jsb2Nrcy9zY3JvbGwtYnRuL3Njcm9sbC1idG4nO1xuaW1wb3J0IHNlYXJjaFx0XHRmcm9tICcuLi9ibG9ja3Mvc2VhcmNoL3NlYXJjaCc7XG5pbXBvcnQgc2xpZGVQYWNrXHRmcm9tICcuLi9ibG9ja3Mvc2xpZGUtcGFjay9zbGlkZS1wYWNrJztcbmltcG9ydCB0YWJsZXRcdFx0ZnJvbSAnLi4vYmxvY2tzL3RhYmxldC90YWJsZXQnO1xuaW1wb3J0IHVwQnRuXHRcdGZyb20gJy4uL2Jsb2Nrcy91cC1idG4vdXAtYnRuJztcbmltcG9ydCB3ZFNsaWRlclx0ZnJvbSAnLi4vYmxvY2tzL3dkLXNsaWRlci93ZC1zbGlkZXInO1xuaW1wb3J0IHlhTWFwXHRcdGZyb20gJy4uL2Jsb2Nrcy95YS1tYXAveWEtbWFwJztcblxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9qcXVlcnlfbGF6eWxvYWQvanF1ZXJ5Lmxhenlsb2FkJyk7XG5yZXF1aXJlKCdkZXZpY2UuanMnKTtcblxuY29uc3QgamF0YSA9IHtcblx0LyoqXG5cdCAqINC30LDQv9GD0YHQutCw0LXQvNCw0Y8g0L/RgNC4INC30LDQs9GA0YPQt9C60LUg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdHJlYWR5KCkge1xuXHRcdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcblx0XHRcdHRoaXMuaW5pdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgdGhpcy5pbml0KTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHR2YXJzLmluaXQoKTtcblx0XHRidXJnZXIuaW5pdCgpO1xuXHRcdHVwQnRuLmluaXQoKTtcblxuXHRcdHN3aXRjaCAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKSB7XG5cdFx0XHRjYXNlICcvJzpcblx0XHRcdFx0ZHJpdmVyRm9ybS5pbml0KCk7XG5cdFx0XHRcdGlucHV0LmluaXQoKTtcblx0XHRcdFx0bWVzc2FnZS5pbml0KCk7XG5cdFx0XHRcdHNjcm9sbEJ0bi5pbml0KCk7XG5cdFx0XHRcdHdkU2xpZGVyLmluaXQoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy9mb3JhZHYuaHRtbCc6XG5cdFx0XHRcdGRvdFN0cmlwLmluaXQoKTtcblx0XHRcdFx0bWFwLmluaXQoKTtcblx0XHRcdFx0cGluLmluaXQoKTtcblx0XHRcdFx0c2Nyb2xsQnRuLmluaXQoKTtcblx0XHRcdFx0c2VhcmNoLmluaXQoKTtcblx0XHRcdFx0c2xpZGVQYWNrLmluaXQoKTtcblx0XHRcdFx0dGFibGV0LmluaXQoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy9jb250YWN0cy5odG1sJzpcblx0XHRcdFx0eWFNYXAuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2hvdy5odG1sJzpcblx0XHRcdFx0cXVlc3Rpb24uaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnL2dhbGxlcnkuaHRtbCc6XG5cdFx0XHRcdGdhbGxlcnkuaW5pdCgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Ly8gc2tpcCBkZWZhdWx0XG5cdFx0fVxuXHR9LFxufTtcblxuamF0YS5yZWFkeSgpO1xuIiwiY29uc3QgdmFycyA9IHtcblx0cHJvZHVjdGlvbjogJ2Vudmlyb25tZW50JyA9PT0gJ3Byb2R1Y3Rpb24nLFxuXHRzZXJ2ZXIgICAgOiAnJyxcblxuXHRhcGk6IHtcblx0XHRiZWNvbWVEcml2ZXI6ICcvYXBpL3YxL2FjY291bnRzL2JlY29tZWRyaXZlcicsXG5cdFx0Z2FsbGVyeSAgICAgOiAnL2FwaS92MS9nYWxsZXJ5Jyxcblx0fSxcblxuXHRpbml0KCkge1xuXHRcdHRoaXMuc2VydmVyID0gdGhpcy5wcm9kdWN0aW9uID8gJ2h0dHBzOi8vamF0YS5ydScgOiAnaHR0cDovL2Rldi5qYXRhLnJ1Jztcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdmFycztcbiJdfQ==
