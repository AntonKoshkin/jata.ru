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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/dot-strip/dot-strip.js","/src/blocks/dot-strip")

},{"_process":7,"buffer":3}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/gallery/gallery.js","/src/blocks/gallery")

},{"../../compile/vars":25,"_process":7,"buffer":3}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/input/input.js","/src/blocks/input")

},{"_process":7,"buffer":3}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/map/map.js","/src/blocks/map")

},{"_process":7,"buffer":3}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/message/message.js","/src/blocks/message")

},{"_process":7,"buffer":3}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/pin/pin.js","/src/blocks/pin")

},{"_process":7,"buffer":3}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/question/question.js","/src/blocks/question")

},{"_process":7,"buffer":3}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/scroll-btn/scroll-btn.js","/src/blocks/scroll-btn")

},{"_process":7,"buffer":3}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/search/search.js","/src/blocks/search")

},{"_process":7,"buffer":3}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/slide-pack/slide-pack.js","/src/blocks/slide-pack")

},{"_process":7,"buffer":3}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/tablet/tablet.js","/src/blocks/tablet")

},{"_process":7,"buffer":3}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/up-btn/up-btn.js","/src/blocks/up-btn")

},{"_process":7,"buffer":3}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/wd-slider/wd-slider.js","/src/blocks/wd-slider")

},{"_process":7,"buffer":3}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/blocks/ya-map/ya-map.js","/src/blocks/ya-map")

},{"_process":7,"buffer":3}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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
		}
	}
};

jata.ready();

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/compile/custom.js","/src/compile")

},{"../../bower_components/jquery_lazyload/jquery.lazyload":1,"../blocks/burger/burger":8,"../blocks/dot-strip/dot-strip":9,"../blocks/driver-form/driver-form":10,"../blocks/gallery/gallery":11,"../blocks/input/input":12,"../blocks/map/map":13,"../blocks/message/message":14,"../blocks/pin/pin":15,"../blocks/question/question":16,"../blocks/scroll-btn/scroll-btn":17,"../blocks/search/search":18,"../blocks/slide-pack/slide-pack":19,"../blocks/tablet/tablet":20,"../blocks/up-btn/up-btn":21,"../blocks/wd-slider/wd-slider":22,"../blocks/ya-map/ya-map":23,"./vars":25,"_process":7,"buffer":3,"device.js":4}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var vars = {
	production: 'development' === 'production',
	server: '',

	api: {
		becomeDriver: '/api/v1/accounts/becomedriver',
		gallery: '/api/v1/gallery'
	},

	init: function init() {
		this.server = this.production ? 'https://jata.ru' : 'http://dev.jata.ru';
		console.log(this.production);
	}
};

module.exports = vars;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/src/compile/vars.js","/src/compile")

},{"_process":7,"buffer":3}]},{},[24])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL2pxdWVyeV9sYXp5bG9hZC9qcXVlcnkubGF6eWxvYWQuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZXZpY2UuanMvbGliL2RldmljZS5qcyIsIm5vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2Jsb2Nrcy9idXJnZXIvYnVyZ2VyLmpzIiwic3JjL2Jsb2Nrcy9kb3Qtc3RyaXAvZG90LXN0cmlwLmpzIiwic3JjL2Jsb2Nrcy9kcml2ZXItZm9ybS9kcml2ZXItZm9ybS5qcyIsInNyYy9ibG9ja3MvZ2FsbGVyeS9nYWxsZXJ5LmpzIiwic3JjL2Jsb2Nrcy9pbnB1dC9pbnB1dC5qcyIsInNyYy9ibG9ja3MvbWFwL21hcC5qcyIsInNyYy9ibG9ja3MvbWVzc2FnZS9tZXNzYWdlLmpzIiwic3JjL2Jsb2Nrcy9waW4vcGluLmpzIiwic3JjL2Jsb2Nrcy9xdWVzdGlvbi9xdWVzdGlvbi5qcyIsInNyYy9ibG9ja3Mvc2Nyb2xsLWJ0bi9zY3JvbGwtYnRuLmpzIiwic3JjL2Jsb2Nrcy9zZWFyY2gvc2VhcmNoLmpzIiwic3JjL2Jsb2Nrcy9zbGlkZS1wYWNrL3NsaWRlLXBhY2suanMiLCJzcmMvYmxvY2tzL3RhYmxldC90YWJsZXQuanMiLCJzcmMvYmxvY2tzL3VwLWJ0bi91cC1idG4uanMiLCJzcmMvYmxvY2tzL3dkLXNsaWRlci93ZC1zbGlkZXIuanMiLCJzcmMvYmxvY2tzL3lhLW1hcC95YS1tYXAuanMiLCJzcmMvY29tcGlsZS9jdXN0b20uanMiLCJzcmMvY29tcGlsZS92YXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3Mi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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDN3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUNDLFFBQUssR0FBTDtBQUNDLHlCQUFXLElBQVg7QUFDQSxvQkFBTSxJQUFOO0FBQ0Esc0JBQVEsSUFBUjtBQUNBLHdCQUFVLElBQVY7QUFDQSx1QkFBUyxJQUFUO0FBQ0E7O0FBRUQsUUFBSyxjQUFMO0FBQ0MsdUJBQVMsSUFBVDtBQUNBLGtCQUFJLElBQUo7QUFDQSxrQkFBSSxJQUFKO0FBQ0Esd0JBQVUsSUFBVjtBQUNBLHFCQUFPLElBQVA7QUFDQSx3QkFBVSxJQUFWO0FBQ0EscUJBQU8sSUFBUDtBQUNBOztBQUVELFFBQUssZ0JBQUw7QUFDQyxvQkFBTSxJQUFOO0FBQ0E7O0FBRUQsUUFBSyxXQUFMO0FBQ0MsdUJBQVMsSUFBVDtBQUNBOztBQUVELFFBQUssZUFBTDtBQUNDLHNCQUFRLElBQVI7QUFDQTtBQTdCRjtBQStCQTtBQWxEVyxDQUFiOztBQXFEQSxLQUFLLEtBQUw7Ozs7Ozs7O0FDN0VBLElBQU0sT0FBTztBQUNaLGFBQWEsa0JBQWtCLFlBRG5CO0FBRVosU0FBVSxFQUZFOztBQUlaLE1BQUs7QUFDSixnQkFBYywrQkFEVjtBQUVKLFdBQVc7QUFGUCxFQUpPOztBQVNaLEtBVFksa0JBU0w7QUFDTixPQUFLLE1BQUwsR0FBYyxLQUFLLFVBQUwsR0FBa0IsaUJBQWxCLEdBQXNDLG9CQUFwRDtBQUNBLFVBQVEsR0FBUixDQUFZLEtBQUssVUFBakI7QUFDQTtBQVpXLENBQWI7O0FBZUEsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogTGF6eSBMb2FkIC0galF1ZXJ5IHBsdWdpbiBmb3IgbGF6eSBsb2FkaW5nIGltYWdlc1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDE1IE1pa2EgVHV1cG9sYVxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBQcm9qZWN0IGhvbWU6XG4gKiAgIGh0dHA6Ly93d3cuYXBwZWxzaWluaS5uZXQvcHJvamVjdHMvbGF6eWxvYWRcbiAqXG4gKiBWZXJzaW9uOiAgMS45LjdcbiAqXG4gKi9cblxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG4gICAgJC5mbi5sYXp5bG9hZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcztcbiAgICAgICAgdmFyICRjb250YWluZXI7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIHRocmVzaG9sZCAgICAgICA6IDAsXG4gICAgICAgICAgICBmYWlsdXJlX2xpbWl0ICAgOiAwLFxuICAgICAgICAgICAgZXZlbnQgICAgICAgICAgIDogXCJzY3JvbGxcIixcbiAgICAgICAgICAgIGVmZmVjdCAgICAgICAgICA6IFwic2hvd1wiLFxuICAgICAgICAgICAgY29udGFpbmVyICAgICAgIDogd2luZG93LFxuICAgICAgICAgICAgZGF0YV9hdHRyaWJ1dGUgIDogXCJvcmlnaW5hbFwiLFxuICAgICAgICAgICAgc2tpcF9pbnZpc2libGUgIDogZmFsc2UsXG4gICAgICAgICAgICBhcHBlYXIgICAgICAgICAgOiBudWxsLFxuICAgICAgICAgICAgbG9hZCAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyICAgICA6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQUFYTlNSMElBcnM0YzZRQUFBQVJuUVUxQkFBQ3hqd3Y4WVFVQUFBQUpjRWhaY3dBQURzUUFBQTdFQVpVckRoc0FBQUFOU1VSQlZCaFhZemg4K1BCL0FBZmZBMG5OUHVDTEFBQUFBRWxGVGtTdVFtQ0NcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBjb3VudGVyID0gMDtcblxuICAgICAgICAgICAgZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5za2lwX2ludmlzaWJsZSAmJiAhJHRoaXMuaXMoXCI6dmlzaWJsZVwiKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgkLmFib3ZldGhldG9wKHRoaXMsIHNldHRpbmdzKSB8fFxuICAgICAgICAgICAgICAgICAgICAkLmxlZnRvZmJlZ2luKHRoaXMsIHNldHRpbmdzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogTm90aGluZy4gKi9cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEkLmJlbG93dGhlZm9sZCh0aGlzLCBzZXR0aW5ncykgJiZcbiAgICAgICAgICAgICAgICAgICAgISQucmlnaHRvZmZvbGQodGhpcywgc2V0dGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy50cmlnZ2VyKFwiYXBwZWFyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaWYgd2UgZm91bmQgYW4gaW1hZ2Ugd2UnbGwgbG9hZCwgcmVzZXQgdGhlIGNvdW50ZXIgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgrK2NvdW50ZXIgPiBzZXR0aW5ncy5mYWlsdXJlX2xpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYob3B0aW9ucykge1xuICAgICAgICAgICAgLyogTWFpbnRhaW4gQkMgZm9yIGEgY291cGxlIG9mIHZlcnNpb25zLiAqL1xuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gb3B0aW9ucy5mYWlsdXJlbGltaXQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZhaWx1cmVfbGltaXQgPSBvcHRpb25zLmZhaWx1cmVsaW1pdDtcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5mYWlsdXJlbGltaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBvcHRpb25zLmVmZmVjdHNwZWVkKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lZmZlY3Rfc3BlZWQgPSBvcHRpb25zLmVmZmVjdHNwZWVkO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLmVmZmVjdHNwZWVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmV4dGVuZChzZXR0aW5ncywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDYWNoZSBjb250YWluZXIgYXMgalF1ZXJ5IGFzIG9iamVjdC4gKi9cbiAgICAgICAgJGNvbnRhaW5lciA9IChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSA/ICR3aW5kb3cgOiAkKHNldHRpbmdzLmNvbnRhaW5lcik7XG5cbiAgICAgICAgLyogRmlyZSBvbmUgc2Nyb2xsIGV2ZW50IHBlciBzY3JvbGwuIE5vdCBvbmUgc2Nyb2xsIGV2ZW50IHBlciBpbWFnZS4gKi9cbiAgICAgICAgaWYgKDAgPT09IHNldHRpbmdzLmV2ZW50LmluZGV4T2YoXCJzY3JvbGxcIikpIHtcbiAgICAgICAgICAgICRjb250YWluZXIuYmluZChzZXR0aW5ncy5ldmVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgJHNlbGYgPSAkKHNlbGYpO1xuXG4gICAgICAgICAgICBzZWxmLmxvYWRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvKiBJZiBubyBzcmMgYXR0cmlidXRlIGdpdmVuIHVzZSBkYXRhOnVyaS4gKi9cbiAgICAgICAgICAgIGlmICgkc2VsZi5hdHRyKFwic3JjXCIpID09PSB1bmRlZmluZWQgfHwgJHNlbGYuYXR0cihcInNyY1wiKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHNlbGYuaXMoXCJpbWdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNlbGYuYXR0cihcInNyY1wiLCBzZXR0aW5ncy5wbGFjZWhvbGRlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBXaGVuIGFwcGVhciBpcyB0cmlnZ2VyZWQgbG9hZCBvcmlnaW5hbCBpbWFnZS4gKi9cbiAgICAgICAgICAgICRzZWxmLm9uZShcImFwcGVhclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5hcHBlYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50c19sZWZ0ID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuYXBwZWFyLmNhbGwoc2VsZiwgZWxlbWVudHNfbGVmdCwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICQoXCI8aW1nIC8+XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYmluZChcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luYWwgPSAkc2VsZi5hdHRyKFwiZGF0YS1cIiArIHNldHRpbmdzLmRhdGFfYXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzZWxmLmlzKFwiaW1nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLmF0dHIoXCJzcmNcIiwgb3JpZ2luYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZWxmLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgXCJ1cmwoJ1wiICsgb3JpZ2luYWwgKyBcIicpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2VsZltzZXR0aW5ncy5lZmZlY3RdKHNldHRpbmdzLmVmZmVjdF9zcGVlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBSZW1vdmUgaW1hZ2UgZnJvbSBhcnJheSBzbyBpdCBpcyBub3QgbG9vcGVkIG5leHQgdGltZS4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9ICQuZ3JlcChlbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWVsZW1lbnQubG9hZGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gJCh0ZW1wKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5sb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50c19sZWZ0ID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5sb2FkLmNhbGwoc2VsZiwgZWxlbWVudHNfbGVmdCwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInNyY1wiLCAkc2VsZi5hdHRyKFwiZGF0YS1cIiArIHNldHRpbmdzLmRhdGFfYXR0cmlidXRlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qIFdoZW4gd2FudGVkIGV2ZW50IGlzIHRyaWdnZXJlZCBsb2FkIG9yaWdpbmFsIGltYWdlICovXG4gICAgICAgICAgICAvKiBieSB0cmlnZ2VyaW5nIGFwcGVhci4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKDAgIT09IHNldHRpbmdzLmV2ZW50LmluZGV4T2YoXCJzY3JvbGxcIikpIHtcbiAgICAgICAgICAgICAgICAkc2VsZi5iaW5kKHNldHRpbmdzLmV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGYudHJpZ2dlcihcImFwcGVhclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKiBDaGVjayBpZiBzb21ldGhpbmcgYXBwZWFycyB3aGVuIHdpbmRvdyBpcyByZXNpemVkLiAqL1xuICAgICAgICAkd2luZG93LmJpbmQoXCJyZXNpemVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyogV2l0aCBJT1M1IGZvcmNlIGxvYWRpbmcgaW1hZ2VzIHdoZW4gbmF2aWdhdGluZyB3aXRoIGJhY2sgYnV0dG9uLiAqL1xuICAgICAgICAvKiBOb24gb3B0aW1hbCB3b3JrYXJvdW5kLiAqL1xuICAgICAgICBpZiAoKC8oPzppcGhvbmV8aXBvZHxpcGFkKS4qb3MgNS9naSkudGVzdChuYXZpZ2F0b3IuYXBwVmVyc2lvbikpIHtcbiAgICAgICAgICAgICR3aW5kb3cuYmluZChcInBhZ2VzaG93XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5wZXJzaXN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykudHJpZ2dlcihcImFwcGVhclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBGb3JjZSBpbml0aWFsIGNoZWNrIGlmIGltYWdlcyBzaG91bGQgYXBwZWFyLiAqL1xuICAgICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyogQ29udmVuaWVuY2UgbWV0aG9kcyBpbiBqUXVlcnkgbmFtZXNwYWNlLiAgICAgICAgICAgKi9cbiAgICAvKiBVc2UgYXMgICQuYmVsb3d0aGVmb2xkKGVsZW1lbnQsIHt0aHJlc2hvbGQgOiAxMDAsIGNvbnRhaW5lciA6IHdpbmRvd30pICovXG5cbiAgICAkLmJlbG93dGhlZm9sZCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgPyB3aW5kb3cuaW5uZXJIZWlnaHQgOiAkd2luZG93LmhlaWdodCgpKSArICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLnRvcCArICQoc2V0dGluZ3MuY29udGFpbmVyKS5oZWlnaHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkIDw9ICQoZWxlbWVudCkub2Zmc2V0KCkudG9wIC0gc2V0dGluZ3MudGhyZXNob2xkO1xuICAgIH07XG5cbiAgICAkLnJpZ2h0b2Zmb2xkID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGZvbGQ7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lciA9PT0gdW5kZWZpbmVkIHx8IHNldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93KSB7XG4gICAgICAgICAgICBmb2xkID0gJHdpbmRvdy53aWR0aCgpICsgJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLmxlZnQgKyAkKHNldHRpbmdzLmNvbnRhaW5lcikud2lkdGgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkIDw9ICQoZWxlbWVudCkub2Zmc2V0KCkubGVmdCAtIHNldHRpbmdzLnRocmVzaG9sZDtcbiAgICB9O1xuXG4gICAgJC5hYm92ZXRoZXRvcCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBmb2xkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXIgPT09IHVuZGVmaW5lZCB8fCBzZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgZm9sZCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb2xkID0gJChzZXR0aW5ncy5jb250YWluZXIpLm9mZnNldCgpLnRvcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkID49ICQoZWxlbWVudCkub2Zmc2V0KCkudG9wICsgc2V0dGluZ3MudGhyZXNob2xkICArICQoZWxlbWVudCkuaGVpZ2h0KCk7XG4gICAgfTtcblxuICAgICQubGVmdG9mYmVnaW4gPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgICB2YXIgZm9sZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyID09PSB1bmRlZmluZWQgfHwgc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cpIHtcbiAgICAgICAgICAgIGZvbGQgPSAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvbGQgPSAkKHNldHRpbmdzLmNvbnRhaW5lcikub2Zmc2V0KCkubGVmdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb2xkID49ICQoZWxlbWVudCkub2Zmc2V0KCkubGVmdCArIHNldHRpbmdzLnRocmVzaG9sZCArICQoZWxlbWVudCkud2lkdGgoKTtcbiAgICB9O1xuXG4gICAgJC5pbnZpZXdwb3J0ID0gZnVuY3Rpb24oZWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgIHJldHVybiAhJC5yaWdodG9mZm9sZChlbGVtZW50LCBzZXR0aW5ncykgJiYgISQubGVmdG9mYmVnaW4oZWxlbWVudCwgc2V0dGluZ3MpICYmXG4gICAgICAgICAgICAgICAgISQuYmVsb3d0aGVmb2xkKGVsZW1lbnQsIHNldHRpbmdzKSAmJiAhJC5hYm92ZXRoZXRvcChlbGVtZW50LCBzZXR0aW5ncyk7XG4gICAgIH07XG5cbiAgICAvKiBDdXN0b20gc2VsZWN0b3JzIGZvciB5b3VyIGNvbnZlbmllbmNlLiAgICovXG4gICAgLyogVXNlIGFzICQoXCJpbWc6YmVsb3ctdGhlLWZvbGRcIikuc29tZXRoaW5nKCkgb3IgKi9cbiAgICAvKiAkKFwiaW1nXCIpLmZpbHRlcihcIjpiZWxvdy10aGUtZm9sZFwiKS5zb21ldGhpbmcoKSB3aGljaCBpcyBmYXN0ZXIgKi9cblxuICAgICQuZXh0ZW5kKCQuZXhwcltcIjpcIl0sIHtcbiAgICAgICAgXCJiZWxvdy10aGUtZm9sZFwiIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5iZWxvd3RoZWZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJhYm92ZS10aGUtdG9wXCIgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gISQuYmVsb3d0aGVmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwicmlnaHQtb2Ytc2NyZWVuXCI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICQucmlnaHRvZmZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJsZWZ0LW9mLXNjcmVlblwiIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gISQucmlnaHRvZmZvbGQoYSwge3RocmVzaG9sZCA6IDB9KTsgfSxcbiAgICAgICAgXCJpbi12aWV3cG9ydFwiICAgIDogZnVuY3Rpb24oYSkgeyByZXR1cm4gJC5pbnZpZXdwb3J0KGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIC8qIE1haW50YWluIEJDIGZvciBjb3VwbGUgb2YgdmVyc2lvbnMuICovXG4gICAgICAgIFwiYWJvdmUtdGhlLWZvbGRcIiA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLmJlbG93dGhlZm9sZChhLCB7dGhyZXNob2xkIDogMH0pOyB9LFxuICAgICAgICBcInJpZ2h0LW9mLWZvbGRcIiAgOiBmdW5jdGlvbihhKSB7IHJldHVybiAkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH0sXG4gICAgICAgIFwibGVmdC1vZi1mb2xkXCIgICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICEkLnJpZ2h0b2Zmb2xkKGEsIHt0aHJlc2hvbGQgOiAwfSk7IH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIHBsYWNlSG9sZGVyc0NvdW50IChiNjQpIHtcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcbiAgfVxuXG4gIC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG4gIC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcbiAgLy8gcmVwcmVzZW50IG9uZSBieXRlXG4gIC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuICAvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG4gIHJldHVybiBiNjRbbGVuIC0gMl0gPT09ICc9JyA/IDIgOiBiNjRbbGVuIC0gMV0gPT09ICc9JyA/IDEgOiAwXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICAvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbiAgcmV0dXJuIGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVyc0NvdW50KGI2NClcbn1cblxuZnVuY3Rpb24gdG9CeXRlQXJyYXkgKGI2NCkge1xuICB2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuICBwbGFjZUhvbGRlcnMgPSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG5cbiAgYXJyID0gbmV3IEFycihsZW4gKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gbGVuIC0gNCA6IGxlblxuXG4gIHZhciBMID0gMFxuXG4gIGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgMTIpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildIDw8IDYpIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA+PiA0KVxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCA0KSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA+PiAyKVxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcbiAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICsgbG9va3VwW251bSAmIDB4M0ZdXG59XG5cbmZ1bmN0aW9uIGVuY29kZUNodW5rICh1aW50OCwgc3RhcnQsIGVuZCkge1xuICB2YXIgdG1wXG4gIHZhciBvdXRwdXQgPSBbXVxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgIHRtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIG91dHB1dCA9ICcnXG4gIHZhciBwYXJ0cyA9IFtdXG4gIHZhciBtYXhDaHVua0xlbmd0aCA9IDE2MzgzIC8vIG11c3QgYmUgbXVsdGlwbGUgb2YgM1xuXG4gIC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbjIgPSBsZW4gLSBleHRyYUJ5dGVzOyBpIDwgbGVuMjsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsIGksIChpICsgbWF4Q2h1bmtMZW5ndGgpID4gbGVuMiA/IGxlbjIgOiAoaSArIG1heENodW5rTGVuZ3RoKSkpXG4gIH1cblxuICAvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG4gIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgdG1wID0gdWludDhbbGVuIC0gMV1cbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAyXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9PSdcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgKHVpbnQ4W2xlbiAtIDFdKVxuICAgIG91dHB1dCArPSBsb29rdXBbdG1wID4+IDEwXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA+PiA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wIDw8IDIpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gJz0nXG4gIH1cblxuICBwYXJ0cy5wdXNoKG91dHB1dClcblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cbiIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIER1ZSB0byB2YXJpb3VzIGJyb3dzZXIgYnVncywgc29tZXRpbWVzIHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24gd2lsbCBiZSB1c2VkIGV2ZW5cbiAqIHdoZW4gdGhlIGJyb3dzZXIgc3VwcG9ydHMgdHlwZWQgYXJyYXlzLlxuICpcbiAqIE5vdGU6XG4gKlxuICogICAtIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcyxcbiAqICAgICBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOC5cbiAqXG4gKiAgIC0gQ2hyb21lIDktMTAgaXMgbWlzc2luZyB0aGUgYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbi5cbiAqXG4gKiAgIC0gSUUxMCBoYXMgYSBicm9rZW4gYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFycmF5cyBvZlxuICogICAgIGluY29ycmVjdCBsZW5ndGggaW4gc29tZSBzaXR1YXRpb25zLlxuXG4gKiBXZSBkZXRlY3QgdGhlc2UgYnVnZ3kgYnJvd3NlcnMgYW5kIHNldCBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgIHRvIGBmYWxzZWAgc28gdGhleVxuICogZ2V0IHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHNsb3dlciBidXQgYmVoYXZlcyBjb3JyZWN0bHkuXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlQgIT09IHVuZGVmaW5lZFxuICA/IGdsb2JhbC5UWVBFRF9BUlJBWV9TVVBQT1JUXG4gIDogdHlwZWRBcnJheVN1cHBvcnQoKVxuXG4vKlxuICogRXhwb3J0IGtNYXhMZW5ndGggYWZ0ZXIgdHlwZWQgYXJyYXkgc3VwcG9ydCBpcyBkZXRlcm1pbmVkLlxuICovXG5leHBvcnRzLmtNYXhMZW5ndGggPSBrTWF4TGVuZ3RoKClcblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICB0cnkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGFyci5fX3Byb3RvX18gPSB7X19wcm90b19fOiBVaW50OEFycmF5LnByb3RvdHlwZSwgZm9vOiBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9fVxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyICYmIC8vIHR5cGVkIGFycmF5IGluc3RhbmNlcyBjYW4gYmUgYXVnbWVudGVkXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgJiYgLy8gY2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gICAgICAgIGFyci5zdWJhcnJheSgxLCAxKS5ieXRlTGVuZ3RoID09PSAwIC8vIGllMTAgaGFzIGJyb2tlbiBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBrTWF4TGVuZ3RoICgpIHtcbiAgcmV0dXJuIEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUXG4gICAgPyAweDdmZmZmZmZmXG4gICAgOiAweDNmZmZmZmZmXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAodGhhdCwgbGVuZ3RoKSB7XG4gIGlmIChrTWF4TGVuZ3RoKCkgPCBsZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCB0eXBlZCBhcnJheSBsZW5ndGgnKVxuICB9XG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIHRoYXQgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gICAgdGhhdC5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIGlmICh0aGF0ID09PSBudWxsKSB7XG4gICAgICB0aGF0ID0gbmV3IEJ1ZmZlcihsZW5ndGgpXG4gICAgfVxuICAgIHRoYXQubGVuZ3RoID0gbGVuZ3RoXG4gIH1cblxuICByZXR1cm4gdGhhdFxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiAhKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBDb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnSWYgZW5jb2RpbmcgaXMgc3BlY2lmaWVkIHRoZW4gdGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBhbGxvY1Vuc2FmZSh0aGlzLCBhcmcpXG4gIH1cbiAgcmV0dXJuIGZyb20odGhpcywgYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG4vLyBUT0RPOiBMZWdhY3ksIG5vdCBuZWVkZWQgYW55bW9yZS4gUmVtb3ZlIGluIG5leHQgbWFqb3IgdmVyc2lvbi5cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiBmcm9tICh0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIGEgbnVtYmVyJylcbiAgfVxuXG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0KVxuICB9XG5cbiAgcmV0dXJuIGZyb21PYmplY3QodGhhdCwgdmFsdWUpXG59XG5cbi8qKlxuICogRnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdG8gQnVmZmVyKGFyZywgZW5jb2RpbmcpIGJ1dCB0aHJvd3MgYSBUeXBlRXJyb3JcbiAqIGlmIHZhbHVlIGlzIGEgbnVtYmVyLlxuICogQnVmZmVyLmZyb20oc3RyWywgZW5jb2RpbmddKVxuICogQnVmZmVyLmZyb20oYXJyYXkpXG4gKiBCdWZmZXIuZnJvbShidWZmZXIpXG4gKiBCdWZmZXIuZnJvbShhcnJheUJ1ZmZlclssIGJ5dGVPZmZzZXRbLCBsZW5ndGhdXSlcbiAqKi9cbkJ1ZmZlci5mcm9tID0gZnVuY3Rpb24gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGZyb20obnVsbCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gIEJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbiAgQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcbiAgaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICYmXG4gICAgICBCdWZmZXJbU3ltYm9sLnNwZWNpZXNdID09PSBCdWZmZXIpIHtcbiAgICAvLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgbmVnYXRpdmUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jICh0aGF0LCBzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhudWxsLCBzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHRoYXQsIHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyArK2kpIHtcbiAgICAgIHRoYXRbaV0gPSAwXG4gICAgfVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUobnVsbCwgc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUobnVsbCwgc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAodGhhdCwgc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImVuY29kaW5nXCIgbXVzdCBiZSBhIHZhbGlkIHN0cmluZyBlbmNvZGluZycpXG4gIH1cblxuICB2YXIgbGVuZ3RoID0gYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nKSB8IDBcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW5ndGgpXG5cbiAgdmFyIGFjdHVhbCA9IHRoYXQud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIHRoYXQgPSB0aGF0LnNsaWNlKDAsIGFjdHVhbClcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGF0W2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIgKHRoYXQsIGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpIHtcbiAgYXJyYXkuYnl0ZUxlbmd0aCAvLyB0aGlzIHRocm93cyBpZiBgYXJyYXlgIGlzIG5vdCBhIHZhbGlkIEFycmF5QnVmZmVyXG5cbiAgaWYgKGJ5dGVPZmZzZXQgPCAwIHx8IGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ29mZnNldFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIGlmIChhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCArIChsZW5ndGggfHwgMCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnbGVuZ3RoXFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIHRoYXQgPSBhcnJheVxuICAgIHRoYXQuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICB0aGF0ID0gZnJvbUFycmF5TGlrZSh0aGF0LCBhcnJheSlcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0ICh0aGF0LCBvYmopIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmopKSB7XG4gICAgdmFyIGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW4pXG5cbiAgICBpZiAodGhhdC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGF0XG4gICAgfVxuXG4gICAgb2JqLmNvcHkodGhhdCwgMCwgMCwgbGVuKVxuICAgIHJldHVybiB0aGF0XG4gIH1cblxuICBpZiAob2JqKSB7XG4gICAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIG9iai5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikgfHwgJ2xlbmd0aCcgaW4gb2JqKSB7XG4gICAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IGlzbmFuKG9iai5sZW5ndGgpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgMClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIGlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmouZGF0YSlcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgb3IgYXJyYXktbGlrZSBvYmplY3QuJylcbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IGtNYXhMZW5ndGgoKWAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBrTWF4TGVuZ3RoKCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsga01heExlbmd0aCgpLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gISEoYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyBtdXN0IGJlIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgQXJyYXlCdWZmZXIuaXNWaWV3ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAoQXJyYXlCdWZmZXIuaXNWaWV3KHN0cmluZykgfHwgc3RyaW5nIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmdcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcnNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhlIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgYW5kIGBpcy1idWZmZXJgIChpbiBTYWZhcmkgNS03KSB0byBkZXRlY3Rcbi8vIEJ1ZmZlciBpbnN0YW5jZXMuXG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICB2YXIgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoIHwgMFxuICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB1dGY4U2xpY2UodGhpcywgMCwgbGVuZ3RoKVxuICByZXR1cm4gc2xvd1RvU3RyaW5nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMgKGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICBpZiAodGhpcyA9PT0gYikgcmV0dXJuIHRydWVcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpID09PSAwXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCkge1xuICB2YXIgc3RyID0gJydcbiAgdmFyIG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIHN0ciA9IHRoaXMudG9TdHJpbmcoJ2hleCcsIDAsIG1heCkubWF0Y2goLy57Mn0vZykuam9pbignICcpXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gbWF4KSBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIHZhciB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICB2YXIgeSA9IGVuZCAtIHN0YXJ0XG4gIHZhciBsZW4gPSBNYXRoLm1pbih4LCB5KVxuXG4gIHZhciB0aGlzQ29weSA9IHRoaXMuc2xpY2UodGhpc1N0YXJ0LCB0aGlzRW5kKVxuICB2YXIgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgIC8vIENvZXJjZSB0byBOdW1iZXIuXG4gIGlmIChpc05hTihieXRlT2Zmc2V0KSkge1xuICAgIC8vIGJ5dGVPZmZzZXQ6IGl0IGl0J3MgdW5kZWZpbmVkLCBudWxsLCBOYU4sIFwiZm9vXCIsIGV0Yywgc2VhcmNoIHdob2xlIGJ1ZmZlclxuICAgIGJ5dGVPZmZzZXQgPSBkaXIgPyAwIDogKGJ1ZmZlci5sZW5ndGggLSAxKVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXQ6IG5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCArIGJ5dGVPZmZzZXRcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGlmIChkaXIpIHJldHVybiAtMVxuICAgIGVsc2UgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggLSAxXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IDApIHtcbiAgICBpZiAoZGlyKSBieXRlT2Zmc2V0ID0gMFxuICAgIGVsc2UgcmV0dXJuIC0xXG4gIH1cblxuICAvLyBOb3JtYWxpemUgdmFsXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIHZhbCA9IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gIH1cblxuICAvLyBGaW5hbGx5LCBzZWFyY2ggZWl0aGVyIGluZGV4T2YgKGlmIGRpciBpcyB0cnVlKSBvciBsYXN0SW5kZXhPZlxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICAvLyBTcGVjaWFsIGNhc2U6IGxvb2tpbmcgZm9yIGVtcHR5IHN0cmluZy9idWZmZXIgYWx3YXlzIGZhaWxzXG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMHhGRiAvLyBTZWFyY2ggZm9yIGEgYnl0ZSB2YWx1ZSBbMC0yNTVdXG4gICAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmXG4gICAgICAgIHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIFsgdmFsIF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIHZhciBpbmRleFNpemUgPSAxXG4gIHZhciBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIHZhciB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIHZhciBpXG4gIGlmIChkaXIpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAoc3RyTGVuICUgMiAhPT0gMCkgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkgcmV0dXJuIGlcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBwYXJzZWRcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGxhdGluMVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGFzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoIHwgMFxuICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQpIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgfSBlbHNlIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIC8vIGxlZ2FjeSB3cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aCkgLSByZW1vdmUgaW4gdjAuMTNcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQnXG4gICAgKVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICB2YXIgcmVzID0gW11cblxuICB2YXIgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgdmFyIGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIHZhciBjb2RlUG9pbnQgPSBudWxsXG4gICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRikgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKSA/IDNcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICB2YXIgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG52YXIgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIHZhciBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIHZhciByZXMgPSAnJ1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSArIDFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAgIG5ld0J1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgKytpKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFID0gZnVuY3Rpb24gd3JpdGVVSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgMik7IGkgPCBqOyArK2kpIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDQpOyBpIDwgajsgKytpKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpIC0gMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpICsgMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuICB2YXIgaVxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgc3RhcnQgPCB0YXJnZXRTdGFydCAmJiB0YXJnZXRTdGFydCA8IGVuZCkge1xuICAgIC8vIGRlc2NlbmRpbmcgY29weSBmcm9tIGVuZFxuICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIGlmIChsZW4gPCAxMDAwIHx8ICFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIGFzY2VuZGluZyBjb3B5IGZyb20gc3RhcnRcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLFxuICAgICAgdGFyZ2V0U3RhcnRcbiAgICApXG4gIH1cblxuICByZXR1cm4gbGVuXG59XG5cbi8vIFVzYWdlOlxuLy8gICAgYnVmZmVyLmZpbGwobnVtYmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChidWZmZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKHN0cmluZ1ssIG9mZnNldFssIGVuZF1dWywgZW5jb2RpbmddKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gZmlsbCAodmFsLCBzdGFydCwgZW5kLCBlbmNvZGluZykge1xuICAvLyBIYW5kbGUgc3RyaW5nIGNhc2VzOlxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBzdGFydFxuICAgICAgc3RhcnQgPSAwXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gZW5kXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH1cbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdmFyIGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKGNvZGUgPCAyNTYpIHtcbiAgICAgICAgdmFsID0gY29kZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmNvZGluZyBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDI1NVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gQnVmZmVyLmlzQnVmZmVyKHZhbClcbiAgICAgID8gdmFsXG4gICAgICA6IHV0ZjhUb0J5dGVzKG5ldyBCdWZmZXIodmFsLCBlbmNvZGluZykudG9TdHJpbmcoKSlcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rXFwvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gaXNuYW4gKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSB2YWwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbn1cbiIsIi8vIERldmljZS5qc1xuLy8gKGMpIDIwMTQgTWF0dGhldyBIdWRzb25cbi8vIERldmljZS5qcyBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4vLyBGb3IgYWxsIGRldGFpbHMgYW5kIGRvY3VtZW50YXRpb246XG4vLyBodHRwOi8vbWF0dGhld2h1ZHNvbi5tZS9wcm9qZWN0cy9kZXZpY2UuanMvXG5cbihmdW5jdGlvbigpIHtcblxuICB2YXIgZGV2aWNlLFxuICAgIHByZXZpb3VzRGV2aWNlLFxuICAgIGFkZENsYXNzLFxuICAgIGRvY3VtZW50RWxlbWVudCxcbiAgICBmaW5kLFxuICAgIGhhbmRsZU9yaWVudGF0aW9uLFxuICAgIGhhc0NsYXNzLFxuICAgIG9yaWVudGF0aW9uRXZlbnQsXG4gICAgcmVtb3ZlQ2xhc3MsXG4gICAgdXNlckFnZW50O1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBkZXZpY2UgdmFyaWFibGUuXG4gIHByZXZpb3VzRGV2aWNlID0gd2luZG93LmRldmljZTtcblxuICBkZXZpY2UgPSB7fTtcblxuICAvLyBBZGQgZGV2aWNlIGFzIGEgZ2xvYmFsIG9iamVjdC5cbiAgd2luZG93LmRldmljZSA9IGRldmljZTtcblxuICAvLyBUaGUgPGh0bWw+IGVsZW1lbnQuXG4gIGRvY3VtZW50RWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgLy8gVGhlIGNsaWVudCB1c2VyIGFnZW50IHN0cmluZy5cbiAgLy8gTG93ZXJjYXNlLCBzbyB3ZSBjYW4gdXNlIHRoZSBtb3JlIGVmZmljaWVudCBpbmRleE9mKCksIGluc3RlYWQgb2YgUmVnZXhcbiAgdXNlckFnZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuICAvLyBNYWluIGZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIGRldmljZS5pb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5pcGhvbmUoKSB8fCBkZXZpY2UuaXBvZCgpIHx8IGRldmljZS5pcGFkKCk7XG4gIH07XG5cbiAgZGV2aWNlLmlwaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gIWRldmljZS53aW5kb3dzKCkgJiYgZmluZCgnaXBob25lJyk7XG4gIH07XG5cbiAgZGV2aWNlLmlwb2QgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ2lwb2QnKTtcbiAgfTtcblxuICBkZXZpY2UuaXBhZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmluZCgnaXBhZCcpO1xuICB9O1xuXG4gIGRldmljZS5hbmRyb2lkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhZGV2aWNlLndpbmRvd3MoKSAmJiBmaW5kKCdhbmRyb2lkJyk7XG4gIH07XG5cbiAgZGV2aWNlLmFuZHJvaWRQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmFuZHJvaWQoKSAmJiBmaW5kKCdtb2JpbGUnKTtcbiAgfTtcblxuICBkZXZpY2UuYW5kcm9pZFRhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmFuZHJvaWQoKSAmJiAhZmluZCgnbW9iaWxlJyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ2JsYWNrYmVycnknKSB8fCBmaW5kKCdiYjEwJykgfHwgZmluZCgncmltJyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnlQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmJsYWNrYmVycnkoKSAmJiAhZmluZCgndGFibGV0Jyk7XG4gIH07XG5cbiAgZGV2aWNlLmJsYWNrYmVycnlUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5ibGFja2JlcnJ5KCkgJiYgZmluZCgndGFibGV0Jyk7XG4gIH07XG5cbiAgZGV2aWNlLndpbmRvd3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ3dpbmRvd3MnKTtcbiAgfTtcblxuICBkZXZpY2Uud2luZG93c1Bob25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2Uud2luZG93cygpICYmIGZpbmQoJ3Bob25lJyk7XG4gIH07XG5cbiAgZGV2aWNlLndpbmRvd3NUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS53aW5kb3dzKCkgJiYgKGZpbmQoJ3RvdWNoJykgJiYgIWRldmljZS53aW5kb3dzUGhvbmUoKSk7XG4gIH07XG5cbiAgZGV2aWNlLmZ4b3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChmaW5kKCcobW9iaWxlOycpIHx8IGZpbmQoJyh0YWJsZXQ7JykpICYmIGZpbmQoJzsgcnY6Jyk7XG4gIH07XG5cbiAgZGV2aWNlLmZ4b3NQaG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmZ4b3MoKSAmJiBmaW5kKCdtb2JpbGUnKTtcbiAgfTtcblxuICBkZXZpY2UuZnhvc1RhYmxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGV2aWNlLmZ4b3MoKSAmJiBmaW5kKCd0YWJsZXQnKTtcbiAgfTtcblxuICBkZXZpY2UubWVlZ28gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmQoJ21lZWdvJyk7XG4gIH07XG5cbiAgZGV2aWNlLmNvcmRvdmEgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5jb3Jkb3ZhICYmIGxvY2F0aW9uLnByb3RvY29sID09PSAnZmlsZTonO1xuICB9O1xuXG4gIGRldmljZS5ub2RlV2Via2l0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93LnByb2Nlc3MgPT09ICdvYmplY3QnO1xuICB9O1xuXG4gIGRldmljZS5tb2JpbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRldmljZS5hbmRyb2lkUGhvbmUoKSB8fCBkZXZpY2UuaXBob25lKCkgfHwgZGV2aWNlLmlwb2QoKSB8fCBkZXZpY2Uud2luZG93c1Bob25lKCkgfHwgZGV2aWNlLmJsYWNrYmVycnlQaG9uZSgpIHx8IGRldmljZS5meG9zUGhvbmUoKSB8fCBkZXZpY2UubWVlZ28oKTtcbiAgfTtcblxuICBkZXZpY2UudGFibGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZXZpY2UuaXBhZCgpIHx8IGRldmljZS5hbmRyb2lkVGFibGV0KCkgfHwgZGV2aWNlLmJsYWNrYmVycnlUYWJsZXQoKSB8fCBkZXZpY2Uud2luZG93c1RhYmxldCgpIHx8IGRldmljZS5meG9zVGFibGV0KCk7XG4gIH07XG5cbiAgZGV2aWNlLmRlc2t0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICFkZXZpY2UudGFibGV0KCkgJiYgIWRldmljZS5tb2JpbGUoKTtcbiAgfTtcblxuICBkZXZpY2UudGVsZXZpc2lvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCB0ZWxldmlzaW9uO1xuXG4gICAgdGVsZXZpc2lvbiA9IFtcbiAgICAgIFwiZ29vZ2xldHZcIixcbiAgICAgIFwidmllcmFcIixcbiAgICAgIFwic21hcnR0dlwiLFxuICAgICAgXCJpbnRlcm5ldC50dlwiLFxuICAgICAgXCJuZXRjYXN0XCIsXG4gICAgICBcIm5ldHR2XCIsXG4gICAgICBcImFwcGxldHZcIixcbiAgICAgIFwiYm94ZWVcIixcbiAgICAgIFwia3lsb1wiLFxuICAgICAgXCJyb2t1XCIsXG4gICAgICBcImRsbmFkb2NcIixcbiAgICAgIFwicm9rdVwiLFxuICAgICAgXCJwb3ZfdHZcIixcbiAgICAgIFwiaGJidHZcIixcbiAgICAgIFwiY2UtaHRtbFwiXG4gICAgXTtcblxuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgdGVsZXZpc2lvbi5sZW5ndGgpIHtcbiAgICAgIGlmIChmaW5kKHRlbGV2aXNpb25baV0pKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfTtcblxuICBkZXZpY2UucG9ydHJhaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aCkgPiAxO1xuICB9O1xuXG4gIGRldmljZS5sYW5kc2NhcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aCkgPCAxO1xuICB9O1xuXG4gIC8vIFB1YmxpYyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gZGV2aWNlLmpzIGluIG5vQ29uZmxpY3QgbW9kZSxcbiAgLy8gcmV0dXJuaW5nIHRoZSBkZXZpY2UgdmFyaWFibGUgdG8gaXRzIHByZXZpb3VzIG93bmVyLlxuICBkZXZpY2Uubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuZGV2aWNlID0gcHJldmlvdXNEZXZpY2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gUHJpdmF0ZSBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gU2ltcGxlIFVBIHN0cmluZyBzZWFyY2hcbiAgZmluZCA9IGZ1bmN0aW9uIChuZWVkbGUpIHtcbiAgICByZXR1cm4gdXNlckFnZW50LmluZGV4T2YobmVlZGxlKSAhPT0gLTE7XG4gIH07XG5cbiAgLy8gQ2hlY2sgaWYgZG9jdW1lbnRFbGVtZW50IGFscmVhZHkgaGFzIGEgZ2l2ZW4gY2xhc3MuXG4gIGhhc0NsYXNzID0gZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgIHZhciByZWdleDtcbiAgICByZWdleCA9IG5ldyBSZWdFeHAoY2xhc3NOYW1lLCAnaScpO1xuICAgIHJldHVybiBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLm1hdGNoKHJlZ2V4KTtcbiAgfTtcblxuICAvLyBBZGQgb25lIG9yIG1vcmUgQ1NTIGNsYXNzZXMgdG8gdGhlIDxodG1sPiBlbGVtZW50LlxuICBhZGRDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICB2YXIgY3VycmVudENsYXNzTmFtZXMgPSBudWxsO1xuICAgIGlmICghaGFzQ2xhc3MoY2xhc3NOYW1lKSkge1xuICAgICAgY3VycmVudENsYXNzTmFtZXMgPSBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICAgIGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUgPSBjdXJyZW50Q2xhc3NOYW1lcyArIFwiIFwiICsgY2xhc3NOYW1lO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZW1vdmUgc2luZ2xlIENTUyBjbGFzcyBmcm9tIHRoZSA8aHRtbD4gZWxlbWVudC5cbiAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgaWYgKGhhc0NsYXNzKGNsYXNzTmFtZSkpIHtcbiAgICAgIGRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUgPSBkb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UoXCIgXCIgKyBjbGFzc05hbWUsIFwiXCIpO1xuICAgIH1cbiAgfTtcblxuICAvLyBIVE1MIEVsZW1lbnQgSGFuZGxpbmdcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gSW5zZXJ0IHRoZSBhcHByb3ByaWF0ZSBDU1MgY2xhc3MgYmFzZWQgb24gdGhlIF91c2VyX2FnZW50LlxuXG4gIGlmIChkZXZpY2UuaW9zKCkpIHtcbiAgICBpZiAoZGV2aWNlLmlwYWQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJpb3MgaXBhZCB0YWJsZXRcIik7XG4gICAgfSBlbHNlIGlmIChkZXZpY2UuaXBob25lKCkpIHtcbiAgICAgIGFkZENsYXNzKFwiaW9zIGlwaG9uZSBtb2JpbGVcIik7XG4gICAgfSBlbHNlIGlmIChkZXZpY2UuaXBvZCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImlvcyBpcG9kIG1vYmlsZVwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGV2aWNlLmFuZHJvaWQoKSkge1xuICAgIGlmIChkZXZpY2UuYW5kcm9pZFRhYmxldCgpKSB7XG4gICAgICBhZGRDbGFzcyhcImFuZHJvaWQgdGFibGV0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhcImFuZHJvaWQgbW9iaWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UuYmxhY2tiZXJyeSgpKSB7XG4gICAgaWYgKGRldmljZS5ibGFja2JlcnJ5VGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwiYmxhY2tiZXJyeSB0YWJsZXRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiYmxhY2tiZXJyeSBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS53aW5kb3dzKCkpIHtcbiAgICBpZiAoZGV2aWNlLndpbmRvd3NUYWJsZXQoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJ3aW5kb3dzIHRhYmxldFwiKTtcbiAgICB9IGVsc2UgaWYgKGRldmljZS53aW5kb3dzUGhvbmUoKSkge1xuICAgICAgYWRkQ2xhc3MoXCJ3aW5kb3dzIG1vYmlsZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkQ2xhc3MoXCJkZXNrdG9wXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZXZpY2UuZnhvcygpKSB7XG4gICAgaWYgKGRldmljZS5meG9zVGFibGV0KCkpIHtcbiAgICAgIGFkZENsYXNzKFwiZnhvcyB0YWJsZXRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzKFwiZnhvcyBtb2JpbGVcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRldmljZS5tZWVnbygpKSB7XG4gICAgYWRkQ2xhc3MoXCJtZWVnbyBtb2JpbGVcIik7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLm5vZGVXZWJraXQoKSkge1xuICAgIGFkZENsYXNzKFwibm9kZS13ZWJraXRcIik7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLnRlbGV2aXNpb24oKSkge1xuICAgIGFkZENsYXNzKFwidGVsZXZpc2lvblwiKTtcbiAgfSBlbHNlIGlmIChkZXZpY2UuZGVza3RvcCgpKSB7XG4gICAgYWRkQ2xhc3MoXCJkZXNrdG9wXCIpO1xuICB9XG5cbiAgaWYgKGRldmljZS5jb3Jkb3ZhKCkpIHtcbiAgICBhZGRDbGFzcyhcImNvcmRvdmFcIik7XG4gIH1cblxuICAvLyBPcmllbnRhdGlvbiBIYW5kbGluZ1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEhhbmRsZSBkZXZpY2Ugb3JpZW50YXRpb24gY2hhbmdlcy5cbiAgaGFuZGxlT3JpZW50YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGRldmljZS5sYW5kc2NhcGUoKSkge1xuICAgICAgcmVtb3ZlQ2xhc3MoXCJwb3J0cmFpdFwiKTtcbiAgICAgIGFkZENsYXNzKFwibGFuZHNjYXBlXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVDbGFzcyhcImxhbmRzY2FwZVwiKTtcbiAgICAgIGFkZENsYXNzKFwicG9ydHJhaXRcIik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfTtcblxuICAvLyBEZXRlY3Qgd2hldGhlciBkZXZpY2Ugc3VwcG9ydHMgb3JpZW50YXRpb25jaGFuZ2UgZXZlbnQsXG4gIC8vIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gdGhlIHJlc2l6ZSBldmVudC5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh3aW5kb3csIFwib25vcmllbnRhdGlvbmNoYW5nZVwiKSkge1xuICAgIG9yaWVudGF0aW9uRXZlbnQgPSBcIm9yaWVudGF0aW9uY2hhbmdlXCI7XG4gIH0gZWxzZSB7XG4gICAgb3JpZW50YXRpb25FdmVudCA9IFwicmVzaXplXCI7XG4gIH1cblxuICAvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgaW4gb3JpZW50YXRpb24uXG4gIGlmICh3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKG9yaWVudGF0aW9uRXZlbnQsIGhhbmRsZU9yaWVudGF0aW9uLCBmYWxzZSk7XG4gIH0gZWxzZSBpZiAod2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgd2luZG93LmF0dGFjaEV2ZW50KG9yaWVudGF0aW9uRXZlbnQsIGhhbmRsZU9yaWVudGF0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3dbb3JpZW50YXRpb25FdmVudF0gPSBoYW5kbGVPcmllbnRhdGlvbjtcbiAgfVxuXG4gIGhhbmRsZU9yaWVudGF0aW9uKCk7XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGV2aWNlO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkZXZpY2U7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LmRldmljZSA9IGRldmljZTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJjb25zdCBidXJnZXIgPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5idXJnZXInLCAoKSA9PiB7XHRcdFx0XG5cdFx0XHQkKCcubmF2aWdhdGlvbicpLnRvZ2dsZUNsYXNzKCduYXZpZ2F0aW9uLS1vcGVuJyk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJ1cmdlcjsiLCJjb25zdCBkb3RTdHJpcCA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmRvdC1zdHJpcF9faW5wdXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0c3dpdGNoICgkKHRoaXMpLmNsb3Nlc3QoJy5kb3Qtc3RyaXBfX2lucHV0JykuYXR0cignaWQnKSkge1xuXHRcdFx0XHRjYXNlICdkb3RDYXInOlxuXHRcdFx0XHRcdCQoJy5kb3Qtc3RyaXBfX3J1bm5lcicpLmF0dHIoJ2RhdGEtcG9zJywgJ29uZScpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdkb3RMb3JyeSc6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAndHdvJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ2RvdEJ1cyc6XG5cdFx0XHRcdFx0JCgnLmRvdC1zdHJpcF9fcnVubmVyJykuYXR0cignZGF0YS1wb3MnLCAndGhyZWUnKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0JCh0aGlzKVxuXHRcdFx0XHQuY2xvc2VzdCgnLnNsaWRlcicpXG5cdFx0XHRcdC5maW5kKCcuc2xpZGUtcGFjaycpXG5cdFx0XHRcdC5hdHRyKCdkYXRhLXNsaWRlci1wb3MnLCAkKHRoaXMpLmF0dHIoJ2RhdGEtZG90LXBvcycpKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZG90U3RyaXA7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdmFycyBmcm9tICcuLi8uLi9jb21waWxlL3ZhcnMnO1xuXG5jb25zdCBkcml2ZXJGb3JtID0ge1xuXHRidXN5XHRcdFx0XHQ6IGZhbHNlLFxuXHRmaWVsZHNDb3JyZWN0XHQ6IGZhbHNlLFxuXHRcblx0ZGF0YToge1xuXHRcdGZpcnN0X25hbWVcdFx0XHRcdDogJycsXG5cdFx0bGFzdF9uYW1lXHRcdFx0XHQ6ICcnLFxuXHRcdGVtYWlsXHRcdFx0XHRcdFx0OiAnJyxcblx0XHRwaG9uZVx0XHRcdFx0XHRcdDogJycsXG5cdFx0aG93X2RpZF95b3Vfa25vd1x0XHQ6ICcnLFxuXHRcdGNhcl95ZWFyXHRcdFx0XHRcdDogJycsXG5cdFx0Y2FyX3N0YXRlXHRcdFx0XHQ6ICcnLFxuXHRcdGNhcl9icmFuZFx0XHRcdFx0OiAnJyxcblx0XHRjYXJfbW9kZWxcdFx0XHRcdDogJycsXG5cdFx0Y2FyX2NvbG9yXHRcdFx0XHQ6ICcnLFxuXHRcdGF2Z19taWxlYWdlX2RheVx0XHQ6ICcnLFxuXHRcdGF2Z19taWxlYWdlX3dlZWtlbmRcdDogJycsXG5cdFx0Y29tbWVudFx0XHRcdFx0XHQ6ICcnLFxuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdbZGF0YS13YXldJywgZXZlbnQgPT4ge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0Y29uc3QgZWxlbVx0XHRcdD0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLXdheV0nKTtcblx0XHRcdGNvbnN0IHBhZ2VcdFx0XHQ9ICQoJy5kcml2ZXItZm9ybScpO1xuXHRcdFx0Y29uc3QgZGF0YVBhZ2VcdFx0PSBOdW1iZXIocGFnZS5hdHRyKCdkYXRhLXBhZ2UnKSk7XG5cdFx0XHRjb25zdCBjdXJyZW50UGFnZVx0PSAkKGAuZHJpdmVyLWZvcm1fX3BhZ2VbZGF0YS1wYWdlPSR7ZGF0YVBhZ2V9XWApO1xuXHRcdFx0Y29uc3QgbmV4dFBhZ2VcdFx0PSBkYXRhUGFnZSArIDE7XG5cdFx0XHRjb25zdCBwcmV2UGFnZVx0XHQ9IGRhdGFQYWdlIC0gMTtcblxuXHRcdFx0aWYgKGVsZW0uYXR0cignZGF0YS13YXknKSA9PT0gJ3ByZXYnKSB7XG5cdFx0XHRcdGlmIChwcmV2UGFnZSA9PT0gMSB8fCBwcmV2UGFnZSA9PT0gMikge1xuXHRcdFx0XHRcdHBhZ2UuYXR0cignZGF0YS1wYWdlJywgcHJldlBhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzd2l0Y2ggKGRhdGFQYWdlKSB7XG5cdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0dGhpcy5kYXRhLmhvd19kaWRfeW91X2tub3cgPSAkKCcjaG93X2RpZF95b3Vfa25vdycpLnZhbCgpO1xuXG5cdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0Y3VycmVudFBhZ2Vcblx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0LmVhY2goKGluZGV4LCBlbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmICgkKGVsKS5sZW5ndGggJiYgKCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcpICE9PSAndHJ1ZScpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcpICE9PSAndHJ1ZScpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZGF0YVskKGVsKS5hdHRyKCdpZCcpXSA9ICQoZWwpLnZhbCgpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmZpZWxkc0NvcnJlY3QgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHRoaXMuZGF0YS5waG9uZSA9IHRoaXMuZGF0YS5waG9uZS5yZXBsYWNlKC9cXEQvZywgJycpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtbWFza10nKVxuXHRcdFx0XHRcdFx0XHQuZWFjaCgoaW5kZXgsIGVsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCQoZWwpLmxlbmd0aCAmJiAkKGVsKS5hdHRyKCdkYXRhLWNvcnJlY3QnKSAhPT0gJ3RydWUnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tkYXRhLW1hc2tdJylcblx0XHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoJChlbCkuYXR0cignZGF0YS1jb3JyZWN0JykgIT09ICd0cnVlJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQoZWwpLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50UGFnZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnW2RhdGEtZmlsbGVkXScpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5lYWNoKChpbmRleCwgZWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmRhdGFbJChlbCkuYXR0cignaWQnKV0gPSAkKGVsKS52YWwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCd3cm9uZyBwYWdlIG51bWJlcicpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodGhpcy5maWVsZHNDb3JyZWN0KSB7XG5cdFx0XHRcdFx0c3dpdGNoIChuZXh0UGFnZSkge1xuXHRcdFx0XHRcdFx0Ly8g0L3QsCDQv9C10YDQstC+0Lkg0YHRgtGA0LDQvdC40YbQtVxuXHRcdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LjRgtGMINGB0YLRgNCw0L3QuNGG0YNcblx0XHRcdFx0XHRcdFx0cGFnZS5hdHRyKCdkYXRhLXBhZ2UnLCAnMicpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0Ly8g0L3QsCDQstGC0L7RgNC+0Lkg0YHRgtGA0LDQvdC40YbQtVxuXHRcdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LjRgtGMINGB0YLRgNCw0L3QuNGG0YNcblx0XHRcdFx0XHRcdFx0cGFnZS5hdHRyKCdkYXRhLXBhZ2UnLCAnMycpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0Ly8g0L3QsCDRgtGA0LXRgtGM0LXQuSDRgdGC0YDQsNC90LjRhtC1XG5cdFx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRcdC8vINC30LDQv9GD0YHRgtC40YLRjCDRhNGD0L3QutGG0LjRjiDQvtGC0L/RgNCw0LLQutC4INGE0L7RgNC80Ytcblx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kRm9ybSgpO1xuXHRcdFx0XHRcdFx0XHQvLyDRgdCx0YDQvtGB0LjRgtGMINC/0LXRgNC10LzQtdC90L3Rg9GOXG5cdFx0XHRcdFx0XHRcdHRoaXMuZmllbGRzQ29ycmVjdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3dyb25nIG5leHQgcGFnZSBudW1iZXInKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQvtGC0L/RgNCw0LLQutCwINGE0L7RgNC80Ysg0L3QsCDRgdC10YDQstC10YBcblx0ICovXG5cdHNlbmRGb3JtKCkge1xuXHRcdGlmICghdGhpcy5idXN5KSB7XG5cdFx0XHRjb25zb2xlLmxvZygnc3RhcnQgc2VuZGluZyBmb3JtJyk7XG5cblx0XHRcdHRoaXMuYnVzeSA9IHRydWU7XG5cblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHVybFx0OiB2YXJzLnNlcnZlciArIHZhcnMuYXBpLmJlY29tZURyaXZlcixcblx0XHRcdFx0dHlwZVx0OiAnUE9TVCcsXG5cdFx0XHRcdGRhdGFcdDogdGhpcy5kYXRhLFxuXHRcdFx0fSlcblx0XHRcdFx0LnN1Y2Nlc3MocmVzdWx0ID0+IHtcblx0XHRcdFx0XHQkKCcubWVzc2FnZS0tc3VjY2VzcycpLmFkZENsYXNzKCdtZXNzYWdlLS1zaG93Jyk7XG5cblx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LjRgtGMINGB0YLRgNCw0L3QuNGG0YNcblx0XHRcdFx0XHQkKCcuZHJpdmVyLWZvcm0nKS5hdHRyKCdkYXRhLXBhZ2UnLCAnMScpO1xuXG5cdFx0XHRcdFx0Ly8g0L7Rh9C40YHRgtC60LAg0L/QvtC70LXQuSDRhNC+0YDQvNGLXG5cdFx0XHRcdFx0JCgnW2RhdGEtZmllbGQtdHlwZV0nKVxuXHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG5cdFx0XHRcdFx0XHRcdCQoZWwpXG5cdFx0XHRcdFx0XHRcdFx0LnZhbCgnJylcblx0XHRcdFx0XHRcdFx0XHQuYXR0cignZGF0YS1maWxsZWQnLCAnZmFsc2UnKVxuXHRcdFx0XHRcdFx0XHRcdC5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnbnVsbCcpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHR0aGlzLmJ1c3kgPSBmYWxzZTtcblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdmb3JtIGhhcyBiZWVkIHNlbnQnKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZhaWwoZXJyb3IgPT4ge1xuXHRcdFx0XHRcdCQoJy5tZXNzYWdlLS1mYWlsJykuYWRkQ2xhc3MoJ21lc3NhZ2UtLXNob3cnKTtcblx0XHRcdFx0XHRpZiAoZXJyb3IucmVzcG9uc2VUZXh0KSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnc2VydmVycyBhbnN3ZXI6XFxuJyxlcnJvci5yZXNwb25zZVRleHQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnVUZPIGhhdmUgaW50ZXJydXB0ZWQgb3VyIHNlcnZlclxcJ3Mgd29ya1xcbndlXFwnbCB0cnkgdG8gZml4IGl0Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuYnVzeSA9IGZhbHNlO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRyaXZlckZvcm07IiwiaW1wb3J0IHZhcnMgZnJvbSAnLi4vLi4vY29tcGlsZS92YXJzJztcblxuY29uc3QgZ2FsbGVyeSA9IHtcblx0bnVtVG9Mb2FkOiAyMCxcblx0Y29udGFpbmVyOiAkKCcuZ2FsbGVyeScpLFxuXHRsb2FkZXJcdDogJCgnLmdhbGxlcnlfX2xvYWRpbmcnKSxcblx0bW9yZUJ0blx0OiAkKCcuZ2FsbGVyeV9fYnRuJyksXG5cdGJ1c3lcdFx0OiB0cnVlLFxuXHR3YXRjaGVkXHQ6IGZhbHNlLFxuXHRcblx0dXJsczoge1xuXHRcdGFsbFx0OiBbXSxcblx0XHR0b1B1c2g6IFtdLFxuXHR9LFxuXG5cdGl0ZW1zOiB7XG5cdFx0dG9QdXNoOiBudWxsLFxuXHR9LFxuXHQvKipcblx0ICog0L/QvtC70YPRh9C10L3QuNC1INGB0L/QuNGB0LrQsCDQuNC30L7QsdGA0LDQttC10L3QuNC5XG5cdCAqL1xuXHRnZXRVcmxzKCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzdWx0LCBlcnJvcikgPT4ge1xuXHRcdFx0bGV0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0XHRcdHJlcXVlc3Qub3BlbignUE9TVCcsIHZhcnMuc2VydmVyICsgdmFycy5hcGkuZ2FsbGVyeSk7XG5cdFx0XHRyZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04Jyk7XG5cdFx0XHRyZXF1ZXN0Lm9ubG9hZCA9ICgpID0+IHtcblx0XHRcdFx0aWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcblx0XHRcdFx0XHRyZXN1bHQoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZXJyb3IoRXJyb3IoJ0ltYWdlIGRpZG5cXCd0IGxvYWQgc3VjY2Vzc2Z1bGx5OyBlcnJvciBjb2RlOicgKyByZXF1ZXN0LnN0YXR1c1RleHQpKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdHJlcXVlc3Qub25lcnJvciA9ICgpID0+IHtcblx0XHRcdFx0ZXJyb3IoRXJyb3IoJ1RoZXJlIHdhcyBhIG5ldHdvcmsgZXJyb3IuJykpO1xuXHRcdFx0fTtcblxuXHRcdFx0cmVxdWVzdC5zZW5kKEpTT04uc3RyaW5naWZ5KHt0YWdzOiBbJ21haW4nXX0pKTtcblx0XHR9KTtcblx0fSxcblx0bG9hZFN0YXJ0KCkge1xuXHRcdHRoaXMuYnVzeSA9IHRydWU7XG5cdFx0dGhpcy5sb2FkZXIuc2hvdygpO1xuXG5cdFx0JCgnLnNlY3Rpb24tLWdhbGxlcnkgLnNlY3Rpb25fX2NvbnRlbnQnKS5jc3MoJ3BhZGRpbmctYm90dG9tJywgJzUwcHgnKTtcblx0fSxcblx0bG9hZEVuZCgpIHtcblx0XHR0aGlzLmJ1c3kgPSBmYWxzZTtcblx0XHR0aGlzLmxvYWRlci5oaWRlKCk7XG5cblx0XHQkKCcuc2VjdGlvbi0tZ2FsbGVyeSAuc2VjdGlvbl9fY29udGVudCcpLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0L3QuNC1INC60LDRgNGC0LjQvdC+0Log0LIg0JTQntCc0LVcblx0ICogQHBhcmFtICB7Qm9vbGVhbn0gaXNGaXJzdCDQv9C10YDQstGL0Lkg0LvQuCDQstGL0LfQvtCyINGE0YPQvdC60YbQuNC4XG5cdCAqL1xuXHRtYWtlSW1ncyhpc0ZpcnN0KSB7XG5cdFx0aWYgKCF0aGlzLnVybHMuYWxsLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICghaXNGaXJzdCkge1xuXHRcdFx0dGhpcy5sb2FkU3RhcnQoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy51cmxzLmFsbC5sZW5ndGggPj0gdGhpcy5udW1Ub0xvYWQpIHtcblx0XHRcdHRoaXMudXJscy50b1B1c2ggPSB0aGlzLnVybHMuYWxsLnNwbGljZSgtdGhpcy5udW1Ub0xvYWQsIHRoaXMubnVtVG9Mb2FkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy51cmxzLnRvUHVzaCA9IHRoaXMudXJscy5hbGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5pdGVtcy50b1B1c2ggPSAkKHRoaXMudXJscy50b1B1c2guam9pbignJykpO1xuXHRcdHRoaXMudXJscy50b1B1c2gubGVuZ3RoID0gMDtcblxuXHRcdGlmIChpc0ZpcnN0KSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclxuXHRcdFx0XHQubWFzb25yeSh7XG5cdFx0XHRcdFx0Y29sdW1uV2lkdGhcdFx0OiAnLmdhbGxlcnlfX2l0ZW0nLFxuXHRcdFx0XHRcdGlzQW5pbWF0ZWRcdFx0OiB0cnVlLFxuXHRcdFx0XHRcdGlzSW5pdExheW91dFx0OiB0cnVlLFxuXHRcdFx0XHRcdGlzUmVzaXphYmxlXHRcdDogdHJ1ZSxcblx0XHRcdFx0XHRpdGVtU2VsZWN0b3JcdDogJy5nYWxsZXJ5X19pdGVtJyxcblx0XHRcdFx0XHRwZXJjZW50UG9zaXRpb246IHRydWUsXG5cdFx0XHRcdFx0c2luZ2xlTW9kZVx0XHQ6IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5hcHBlbmQodGhpcy5pdGVtcy50b1B1c2gpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy5pdGVtcy50b1B1c2gpO1xuXHRcdH1cblxuXHRcdHRoaXMuaXRlbXMudG9QdXNoXG5cdFx0XHQuaGlkZSgpXG5cdFx0XHQuaW1hZ2VzTG9hZGVkKClcblx0XHRcdC5wcm9ncmVzcygoaW1nTG9hZCwgaW1hZ2UpID0+IHtcblx0XHRcdFx0Y29uc3QgJGl0ZW0gPSAkKGltYWdlLmltZykucGFyZW50cygnLmdhbGxlcnlfX2l0ZW0nKTtcblxuXHRcdFx0XHRpZiAodGhpcy5sb2FkZXIuaGFzQ2xhc3MoJ2dhbGxlcnlfX2xvYWRpbmctLWZpcnN0JykpIHtcblx0XHRcdFx0XHR0aGlzLmxvYWRlci5yZW1vdmVDbGFzcygnZ2FsbGVyeV9fbG9hZGluZy0tZmlyc3QnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCRpdGVtLnNob3coKTtcblxuXHRcdFx0XHR0aGlzLmNvbnRhaW5lclxuXHRcdFx0XHRcdC5tYXNvbnJ5KCdhcHBlbmRlZCcsICRpdGVtKVxuXHRcdFx0XHRcdC5tYXNvbnJ5KCk7XG5cdFx0XHR9KVxuXHRcdFx0LmRvbmUoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmxvYWRFbmQoKTtcblx0XHRcdFx0dGhpcy5vblNjcm9sbCgpO1xuXG5cdFx0XHRcdGlmICghdGhpcy53YXRjaGVkKSB7XG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7dGhpcy5vblNjcm9sbCgpfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0dGhpcy5pdGVtcy50b1B1c2gubGVuZ3RoID0gMDtcblx0fSxcblx0LyoqXG5cdCAqINC90LDQstC10YjQuNCy0LDQtdC80LDRjyDQvdCwINGB0LrRgNC+0LvQuyDRhNGD0L3QutGG0LjRj1xuXHQgKiDQt9Cw0L/Rg9GB0LrQsNC10YIg0L/QvtC00LPRgNGD0LfQutGDINGE0L7RgtC+0Log0LXRgdC00Lgg0L3QsNC00L5cblx0ICovXG5cdG9uU2Nyb2xsKCkge1xuXHRcdGNvbnN0IHBhZ2VIZWlnaHRcdFx0PSAkKGRvY3VtZW50KS5oZWlnaHQoKTtcblx0XHRjb25zdCB3aW5kb3dIZWlnaHRcdD0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXHRcdGNvbnN0IHdpbmRvd1Njcm9sbFx0PSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cdFx0Y29uc3QgbGVmdFRvQm90dG9tXHQ9XHRwYWdlSGVpZ2h0IC0gd2luZG93SGVpZ2h0IC0gd2luZG93U2Nyb2xsO1xuXG5cdFx0aWYgKCF0aGlzLmJ1c3kgJiYgdGhpcy51cmxzLmFsbC5sZW5ndGggJiYgbGVmdFRvQm90dG9tIDw9IDMwMCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3Njcm9sbCBsb2FkJyk7XG5cdFx0XHR0aGlzLm1ha2VJbWdzKCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnLmdhbGxlcnlfX2JnJykuaGlkZSgpO1xuXG5cdFx0dGhpcy5nZXRVcmxzKClcblx0XHRcdC50aGVuKFxuXHRcdFx0XHRyZXN1bHQgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdnb3QgaW1hZ2VzJyk7XG5cdFx0XHRcdFx0dGhpcy51cmxzLmFsbCA9IHJlc3VsdC5yZXZlcnNlKCk7XG5cblx0XHRcdFx0XHR0aGlzLnVybHMuYWxsLmZvckVhY2goKGVsZW0sIGkpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMudXJscy5hbGxbaV0gPSAnPGRpdiBkYXRhLXVybD1cIicgKyB2YXJzLnNlcnZlciArIGVsZW0gK1xuXHRcdFx0XHRcdFx0XHQnXCIgY2xhc3M9XCJnYWxsZXJ5X19pdGVtXCI+PGltZyBzcmM9XCInICsgdmFycy5zZXJ2ZXIgKyBlbGVtICtcblx0XHRcdFx0XHRcdFx0J1wiIGFsdD48ZGl2IGNsYXNzPVwiZ2FsbGVyeV9fZGFya25lc3NcIj48L2Rpdj48L2Rpdj4nO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dGhpcy5tYWtlSW1ncyh0cnVlKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3IgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yLCAnZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmdhbGxlcnlfX2l0ZW0nLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0bGV0IGltZ1VybCA9ICQodGhpcykuYXR0cignZGF0YS11cmwnKTtcblxuXHRcdFx0JCgnW2RhdGEtZ2FsLW1vZGFsXScpXG5cdFx0XHRcdC5hdHRyKCdzcmMnLCBpbWdVcmwpXG5cdFx0XHRcdC5jbG9zZXN0KCcuZ2FsbGVyeV9fYmcnKVxuXHRcdFx0XHQuZmFkZUluKDMwMCk7XG5cdFx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmdhbGxlcnlfX2JnJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdCQodGhpcykuZmFkZU91dCgzMDApO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnYWxsZXJ5OyIsImNvbnN0IGlucHV0ID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdibHVyJywgJy5pbnB1dF9faW5wdXQnLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5pbnB1dF9faW5wdXQnKTtcblxuXHRcdFx0aWYgKGVsZW0udmFsKCkpIHtcblx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWZpbGxlZCcsICd0cnVlJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtZmlsbGVkJywgJ2ZhbHNlJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwndGVsXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCd0ZWxcXCddJyk7XG5cblx0XHRcdGVsZW0udmFsKGlucHV0LmZvcm1hdChlbGVtLnZhbCgpLCAndGVsJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdbZGF0YS1tYXNrPVxcJ3RlbFxcJ10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2s9XFwndGVsXFwnXScpO1xuXG5cdFx0XHRlbGVtLnZhbChpbnB1dC5mb3JtYXQoZWxlbS52YWwoKSwgJ3RlbCcpKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbigna2V5dXAnLCAnW2RhdGEtbWFzaz1cXCd5ZWFyXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCd5ZWFyXFwnXScpO1xuXG5cdFx0XHRlbGVtLnZhbChpbnB1dC5mb3JtYXQoZWxlbS52YWwoKSwgJ3llYXInKSk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2tleXVwJywgJ1tkYXRhLW1hc2s9XFwnbnVtYmVyXFwnXScsIGV2ZW50ID0+IHtcblx0XHRcdGNvbnN0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWFzaz1cXCdudW1iZXJcXCddJyk7XG5cblx0XHRcdGVsZW0udmFsKGlucHV0LmZvcm1hdChlbGVtLnZhbCgpLCAnbnVtYmVyJykpO1xuXHRcdH0pO1xuXG5cdFx0JCgnYm9keScpLm9uKCdibHVyJywgJ1tkYXRhLW1hc2tdJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1tYXNrXScpO1xuXG5cdFx0XHRzd2l0Y2ggKGVsZW0uYXR0cignZGF0YS1tYXNrJykpIHtcblx0XHRcdFx0Y2FzZSAnZW1haWwnOlxuXHRcdFx0XHRcdGlmICgvLitALitcXC4uKy9pLnRlc3QoZWxlbS52YWwoKSkpIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZmFsc2UnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAndGVsJzpcblx0XHRcdFx0XHQvLyAvXihbXFwrXSspKlswLTlcXHgyMFxceDI4XFx4MjlcXC1dezcsMTF9JC9cblx0XHRcdFx0XHRpZiAoZWxlbS52YWwoKS5sZW5ndGggPT09IDE4KSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ25hbWUnOlxuXHRcdFx0XHRcdGlmICgvXlthLXpBLVrQsC3Rj9GR0JAt0K/QgV1bYS16QS1a0LAt0Y/RkdCQLdCv0IEwLTktX1xcLl17MSwyMH0kLy50ZXN0KGVsZW0udmFsKCkpKSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICd0cnVlJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ2ZhbHNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ2VtcHR5Jzpcblx0XHRcdFx0Y2FzZSAndGV4dCc6XG5cdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdFx0aWYgKGVsZW0udmFsKCkpIHtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ3RydWUnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAnZW1wdHknKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAneWVhcic6XG5cdFx0XHRcdFx0aWYgKGVsZW0udmFsKCkgJiZcblx0XHRcdFx0XHRcdHBhcnNlSW50KGVsZW0udmFsKCkpID49IDE5MDAgJiZcblx0XHRcdFx0XHRcdHBhcnNlSW50KGVsZW0udmFsKCkpIDw9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0XHRcdFx0ZWxlbS5hdHRyKCdkYXRhLWNvcnJlY3QnLCAndHJ1ZScpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2RhdGEtY29ycmVjdCcsICdmYWxzZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignaW5wdXQnLCAnW2RhdGEtbWFza10nLCBldmVudCA9PiB7XG5cdFx0XHRjb25zdCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLW1hc2tdJyk7XG5cblx0XHRcdGVsZW0uYXR0cignZGF0YS1jb3JyZWN0JywgJ251bGwnKTtcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqINGE0L7RgNC80LDRgtC40YDRg9C10YIg0LfQvdCw0YfQtdC90LjQtSDQsiDQuNC90L/Rg9GC0LVcblx0ICogQHBhcmFtICB7c3RyaW5nfSBkYXRhICAg0LfQvdCw0YfQtdC90LjQtSDQsiDQuNC90L/Rg9GC0LVcblx0ICogQHBhcmFtICB7c3RyaW5nfSBmb3JtYXQg0LjQvNGPINGE0L7RgNC80LDRgtCwXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgINC+0YLRhNC+0YDQvNCw0YLQuNGA0L7QstCw0L3QvdC+0LUg0LfQvdCw0YfQtdC90LjQtVxuXHQgKi9cblx0Zm9ybWF0KGRhdGEsIGZvcm1hdCkge1xuXHRcdHN3aXRjaCAoZm9ybWF0KSB7XG5cdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRyZXR1cm4gZGF0YS5yZXBsYWNlKC9cXEQvZywgJycpO1xuXG5cdFx0XHRjYXNlICd5ZWFyJzpcblx0XHRcdFx0ZGF0YSA9IGlucHV0LmZvcm1hdChkYXRhLCAnbnVtYmVyJyk7XG5cblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoID4gNCkge1xuXHRcdFx0XHRcdGRhdGEgPSBkYXRhLnNsaWNlKDAsIDQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cblx0XHRcdGNhc2UgJ3RlbCc6XG5cdFx0XHRcdGRhdGEgPSBpbnB1dC5mb3JtYXQoZGF0YSwgJ251bWJlcicpO1xuXG5cdFx0XHRcdGxldCBuZXdEYXRhID0gJyc7XG5cblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoIDw9IDExKSB7XG5cdFx0XHRcdFx0c3dpdGNoKGRhdGEubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRjYXNlIDA6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCc7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0XHRpZihkYXRhWzBdICE9PSAnNycpIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVswXTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM107XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDY6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDc6XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcpICcgKyBkYXRhWzRdICsgZGF0YVs1XSArIGRhdGFbNl07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSA4OlxuXHRcdFx0XHRcdFx0XHRuZXdEYXRhID0gJys3ICgnICsgZGF0YVsxXSArIGRhdGFbMl0gKyBkYXRhWzNdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKSAnICsgZGF0YVs0XSArIGRhdGFbNV0gKyBkYXRhWzZdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzddO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgOTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxMDpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbOV07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAxMTpcblx0XHRcdFx0XHRcdFx0bmV3RGF0YSA9ICcrNyAoJyArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Jy0nICsgZGF0YVs3XSArIGRhdGFbOF0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJyArIGRhdGFbOV0gKyBkYXRhWzEwXTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5ld0RhdGEgPSAnKzcgKCcgKyBkYXRhWzFdICsgZGF0YVsyXSArIGRhdGFbM10gK1xuXHRcdFx0XHRcdFx0XHRcdFx0JykgJyArIGRhdGFbNF0gKyBkYXRhWzVdICsgZGF0YVs2XSArXG5cdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzddICsgZGF0YVs4XSArXG5cdFx0XHRcdFx0XHRcdFx0XHQnLScgKyBkYXRhWzldICsgZGF0YVsxMF07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG5ld0RhdGE7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd3cm9uZyBpbnB1dCBmb3JtYXQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dDsiLCJjb25zdCBtYXAgPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCcjbWFwJykubGF6eWxvYWQoe1xuXHRcdFx0dGhyZXNob2xkOiAyMDAsXG5cdFx0XHRlZmZlY3RcdDogJ2ZhZGVJbicsXG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcDsiLCJjb25zdCBtZXNzYWdlID0ge1xuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcubWVzc2FnZV9fYmcsIC5tZXNzYWdlX19jbG9zZScsIGV2ZW50ID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcblx0XHRcdCQoZXZlbnQudGFyZ2V0KVxuXHRcdFx0XHQuY2xvc2VzdCgnLm1lc3NhZ2UnKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ21lc3NhZ2UtLXNob3cnKTtcblx0XHR9KTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZXNzYWdlOyIsImNvbnN0IHBpbiA9IHtcblx0c2VjXHRcdDogNTU1NTUsXG5cdGhvdXJzXHRcdDogbmV3IERhdGUoKS5nZXRIb3VycygpLFxuXHRtaW51dGVzXHQ6IG5ldyBEYXRlKCkuZ2V0TWludXRlcygpLFxuXHRzZWNvbmRzXHQ6IG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpLFxuXHQvKipcblx0ICog0YHRh9C10YLRh9C40LosINGD0LLQtdC70LjRh9C40LLQsNC10YIg0LLRgNC10LzRj1xuXHQgKi9cblx0Y291bnRkb3duKCkge1xuXHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCddJykudGV4dChNYXRoLmZsb29yKHRoaXMuc2VjLzM2MDApKTtcblx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnXScpLnRleHQoTWF0aC5mbG9vcih0aGlzLnNlYyUzNjAwLzYwKSk7XG5cdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJ10nKS50ZXh0KE1hdGguZmxvb3IodGhpcy5zZWMlMzYwMCU2MCkpO1xuXG5cdFx0dGhpcy5zZWMgKz0gMTtcblx0fSxcblx0LyoqXG5cdCAqINC00L7QsdCw0LLQu9GP0LXRgiDQuiDRhtC40YTRgNC1INC90L7Qu9GMLCDRh9GC0L7QsSDQv9C+0LvRg9GH0LjRgtGMINC00LLRg9C30L3QsNGH0L3QvtC1INGH0LjRgdC70L5cblx0ICogQHBhcmFtICB7bnVtYmVyfSBudW1iZXIg0YbQuNGE0YDQsCDQuNC70Lgg0YfQuNGB0LvQvlxuXHQgKiBAcmV0dXJuIHtudW1iZXJ9ICAgICAgICDQtNCy0YPQt9C90LDRh9C90L7QtSDRh9C40YHQu9C+XG5cdCAqL1xuXHR0d29OdW1iZXJzKG51bWJlcikge1xuXHRcdGlmIChudW1iZXIgPCAxMCkge1xuXHRcdFx0bnVtYmVyID0gJzAnICsgbnVtYmVyLnRvU3RyaW5nKCk7XG5cdFx0fVxuXHRcdHJldHVybiBudW1iZXI7XG5cdH0sXG5cdC8qKlxuXHQgKiDQvtCx0L3QvtCy0LvRj9C10YIg0LLRgNC10LzRj1xuXHQgKiDQstGL0LfRi9Cy0LDQtdGC0YHRjyDQutCw0LTQttGD0Y4g0YHQtdC60YPQvdC00YNcblx0ICovXG5cdHNldFRpbWUoKSB7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdHRoaXMuaG91cnMgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnJykudGV4dCh0aGlzLnR3b051bWJlcnModGhpcy5ob3VycykpO1xuXG5cdFx0XHR0aGlzLm1pbnV0ZXMgPSBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKTtcblx0XHRcdFxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnbVxcJycpLnRleHQodGhpcy50d29OdW1iZXJzKHRoaXMubWludXRlcykpO1xuXG5cdFx0XHR0aGlzLnNlY29uZHMgPSBuZXcgRGF0ZSgpLmdldFNlY29uZHMoKTtcblx0XHRcdFxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJycpLnRleHQodGhpcy50d29OdW1iZXJzKHRoaXMuc2Vjb25kcykpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcucGluJywgZXZlbnQgPT4ge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0bGV0IGVsZW0gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnBpbicpO1xuXHRcdFx0XG5cdFx0XHRlbGVtXG5cdFx0XHRcdC5yZW1vdmVDbGFzcygncGluLS1zaG93Jylcblx0XHRcdFx0LmNzcygnei1pbmRleCcsICcyJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdwaW4tLXNob3cnKVxuXHRcdFx0XHQuY3NzKCd6LWluZGV4JywgJzEnKTtcblx0XHR9KTtcblxuXHRcdGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ2Rlc2t0b3AnKSkge1xuXHRcdFx0bGV0IG5ld0RhdGUgPSBuZXcgRGF0ZSgpO1xuXG5cdFx0XHRuZXdEYXRlLnNldERhdGUobmV3RGF0ZS5nZXREYXRlKCkpO1xuXG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdoXFwnJykudGV4dCh0aGlzLmhvdXJzKTtcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ21cXCcnKS50ZXh0KHRoaXMubWludXRlcyk7XG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdzXFwnJykudGV4dCh0aGlzLnNlY29uZHMpO1xuXG5cdFx0XHRzZXRJbnRlcnZhbCh0aGlzLnNldFRpbWUsIDEwMDApO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ1tkYXRhLWNsb2NrPVxcJ2hcXCddJylcblx0XHRcdFx0LnRleHQoTWF0aC5mbG9vcih0aGlzLnNlYy8zNjAwKSA8IDEwID9cblx0XHRcdFx0XHRcdFx0JzAnICsgTWF0aC5mbG9vcih0aGlzLnNlYy8zNjAwKSA6XG5cdFx0XHRcdFx0XHRcdE1hdGguZmxvb3IodGhpcy5zZWMvMzYwMCkpO1xuXG5cdFx0XHQkKCdbZGF0YS1jbG9jaz1cXCdtXFwnXScpXG5cdFx0XHRcdC50ZXh0KE1hdGguZmxvb3IodGhpcy5zZWMlMzYwMC82MCkgPCAxMCA/XG5cdFx0XHRcdFx0XHRcdCcwJyArIE1hdGguZmxvb3IodGhpcy5zZWMlMzYwMC82MCkgOlxuXHRcdFx0XHRcdFx0XHRNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAvNjApKTtcblxuXHRcdFx0JCgnW2RhdGEtY2xvY2s9XFwnc1xcJ10nKVxuXHRcdFx0XHQudGV4dChNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAlNjApIDwgMTAgP1xuXHRcdFx0XHRcdFx0XHQnMCcgKyBNYXRoLmZsb29yKHRoaXMuc2VjJTM2MDAlNjApIDpcblx0XHRcdFx0XHRcdFx0TWF0aC5mbG9vcih0aGlzLnNlYyUzNjAwJTYwKSk7XG5cblx0XHRcdHRoaXMuc2VjICs9IDE7XG5cblx0XHRcdHNldEludGVydmFsKHRoaXMuY291bnRkb3duLCAxMDAwKTtcblx0XHR9XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBpbjsiLCJjb25zdCBxdWVzdGlvbiA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJy5xdWVzdGlvbnNfX2l0ZW0nKS5lcSgxKS5oaWRlKCk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tYWluLWJ0bi0taGRpdycsIGV2ZW50ID0+IHtcblx0XHRcdGxldCBlbGVtID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5tYWluLWJ0bi0taGRpdycpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFxuXHRcdFx0aWYgKCFlbGVtLmhhc0NsYXNzKCdtYWluLWJ0bi0tYWN0aXZlJykpIHtcblx0XHRcdFx0ZWxlbVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbWFpbi1idG4tLWFjdGl2ZScpXG5cdFx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ21haW4tYnRuLS1hY3RpdmUnKTtcblx0XHRcdFxuXHRcdFx0XHQkKCcucXVlc3Rpb25zX19pdGVtJylcblx0XHRcdFx0XHQuZXEoZWxlbS5pbmRleCgpIC0gMilcblx0XHRcdFx0XHQuZmFkZUluKDMwMClcblx0XHRcdFx0XHQuc2libGluZ3MoKVxuXHRcdFx0XHRcdC5mYWRlT3V0KDMwMCk7XG5cblx0XHRcdFx0JCgnLnF1ZXN0aW9uc19faXRlbScpXG5cdFx0XHRcdFx0LmZpbmQoJy5xdWVzdGlvbl9fYm9keScpXG5cdFx0XHRcdFx0LnNsaWRlVXAoMzAwKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLnF1ZXN0aW9uX19oZWFkZXInLCBldmVudCA9PiB7XG5cdFx0XHRsZXQgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcucXVlc3Rpb25fX2hlYWRlcicpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFxuXHRcdFx0ZWxlbVxuXHRcdFx0XHQuc2libGluZ3MoJy5xdWVzdGlvbl9fYm9keScpXG5cdFx0XHRcdC5zbGlkZVRvZ2dsZSgzMDApXG5cdFx0XHRcdC5jbG9zZXN0KCcucXVlc3Rpb24nKVxuXHRcdFx0XHQuc2libGluZ3MoJy5xdWVzdGlvbicpXG5cdFx0XHRcdC5maW5kKCcucXVlc3Rpb25fX2JvZHknKVxuXHRcdFx0XHQuc2xpZGVVcCgzMDApO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBxdWVzdGlvbjsiLCJjb25zdCBzY3JvbGxCdG4gPSB7XG5cdC8qKlxuXHQgKiDQuNC90LjRgiDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zY3JvbGwtYnRuJywgZXZlbnQgPT4ge1xuXHRcdFx0Y29uc3QgZWxlbSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuc2Nyb2xsLWJ0bicpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFxuXHRcdFx0JCgnaHRtbCwgYm9keScpXG5cdFx0XHRcdC5hbmltYXRlKFxuXHRcdFx0XHRcdHtzY3JvbGxUb3A6IGVsZW0uY2xvc2VzdCgnLnNlY3Rpb24nKS5vdXRlckhlaWdodCgpfSxcblx0XHRcdFx0XHQ3MDApO1xuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzY3JvbGxCdG47IiwiY29uc3Qgc2VhcmNoID0ge1xuXHRuZWVkZWRTY3JvbGw6IG51bGwsXG5cdHN0YXJ0ZWRcdFx0OiBmYWxzZSxcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdHRoaXMubmVlZGVkU2Nyb2xsID0gJCgnLnNlYXJjaCcpLm9mZnNldCgpLnRvcCAtICQod2luZG93KS5oZWlnaHQoKSArICQoJy5zZWFyY2gnKS5oZWlnaHQoKSAvIDI7XG5cdFx0XG5cdFx0JCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7XG5cdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49IHRoaXMubmVlZGVkU2Nyb2xsICYmICF0aGlzLnN0YXJ0ZWQpIHtcblx0XHRcdFx0JCgnLnNlYXJjaCcpLmFkZENsYXNzKCdzZWFyY2gtLWFuaW1hdGUnKTtcblx0XHRcdFx0dGhpcy5zdGFydGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2VhcmNoOyIsImNvbnN0IHNsaWRlUGFjayA9IHtcblx0LyoqXG5cdCAqINC40L3QuNGCINGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnW2RhdGEtcGFnLXBvc10nLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0JCh0aGlzKVxuXHRcdFx0XHQuYWRkQ2xhc3MoJ3NsaWRlLXBhY2tfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdzbGlkZS1wYWNrX19wYWctLWFjdGl2ZScpXG5cdFx0XHRcdC5jbG9zZXN0KCcuc2xpZGUtcGFja19fcGFncycpXG5cdFx0XHRcdC5zaWJsaW5ncygnW2RhdGEtc2xpZGVyLXBvc10nKVxuXHRcdFx0XHQuYXR0cignZGF0YS1zbGlkZXItcG9zJywgJCh0aGlzKS5hdHRyKCdkYXRhLXBhZy1wb3MnKSk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNsaWRlUGFjazsiLCJjb25zdCB0YWJsZXQgPSB7XG5cdG1vYk9uZVx0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS1tb2IteDEnKSxcblx0bW9iVHdvXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW1vYi14MicpLFxuXHRtb2JUaHJlZVx0OiAkKCcjdGFibGV0JykuYXR0cignZGF0YS1tb2IteDMnKSxcblx0dGFiT25lXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLXRhYi14MScpLFxuXHR0YWJUd29cdDogJCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtdGFiLXgyJyksXG5cdHRhYlRocmVlXHQ6ICQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLXRhYi14MycpLFxuXHQvKipcblx0ICog0LfQsNC/0YPRgdC60LDQtdC80LDRjyDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHRpZiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMykge1xuXHRcdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJykpIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0aGlzLm1vYlRocmVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy50YWJUaHJlZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyKSB7XG5cdFx0XHRpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSkge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRoaXMubW9iVHdvKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0YWJsZXQnKS5hdHRyKCdkYXRhLW9yaWdpbmFsJywgdGhpcy50YWJUd28pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSAge1xuXHRcdFx0aWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJykpIHtcblx0XHRcdFx0JCgnI3RhYmxldCcpLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0aGlzLm1vYk9uZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKCcjdGFibGV0JykuYXR0cignZGF0YS1vcmlnaW5hbCcsIHRoaXMudGFiT25lKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQkKCcjdGFibGV0JykubGF6eWxvYWQoe1xuXHRcdFx0dGhyZXNob2xkOiAyMDAsXG5cdFx0XHRlZmZlY3RcdDogJ2ZhZGVJbicsXG5cdFx0fSk7XG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxldDsiLCJjb25zdCB1cEJ0biA9IHtcblx0LyoqXG5cdCAqINCy0LrQu9GO0YfQsNC10YIv0LLRi9C60LvRjtGH0LDQtdGCINCy0LjQtNC40LzQvtGB0YLRjCDQutC90L7Qv9C60Lhcblx0ICovXG5cdHNldFZpc2liaWxpdHkoKSB7XG5cdFx0aWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSA4MDApIHtcblx0XHRcdCQoJy51cC1idG4nKS5hZGRDbGFzcygndXAtYnRuLS1zaG93Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJy51cC1idG4nKS5yZW1vdmVDbGFzcygndXAtYnRuLS1zaG93Jyk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0LfQsNC/0YPRgdC60LDQtdC80LDRjyDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0aW5pdCgpIHtcblx0XHR1cEJ0bi5zZXRWaXNpYmlsaXR5KCk7XG5cblx0XHQkKHdpbmRvdykuc2Nyb2xsKCgpID0+IHtcblx0XHRcdHVwQnRuLnNldFZpc2liaWxpdHkoKTtcblx0XHR9KTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLnVwLWJ0bicsICgpID0+IHtcblx0XHRcdCQoJ2h0bWwsIGJvZHknKVxuXHRcdFx0XHQuc3RvcCgpXG5cdFx0XHRcdC5hbmltYXRlKFxuXHRcdFx0XHRcdHtzY3JvbGxUb3A6IDB9LFxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGxUb3AoKS80KTtcblx0XHR9KTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXBCdG47IiwiY29uc3Qgd2RTbGlkZXIgPSB7XG5cdC8qKlxuXHQgKiDQt9Cw0L/Rg9GB0LrQsNC10LzQsNGPINC/0YDQuCDQt9Cw0LPRgNGD0LfQutC1INGE0YPQvdC60YbQuNGPXG5cdCAqL1xuXHRpbml0KCkge1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLndkLXNsaWRlcl9fcGFnJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdCQodGhpcylcblx0XHRcdFx0LmFkZENsYXNzKCd3ZC1zbGlkZXJfX3BhZy0tYWN0aXZlJylcblx0XHRcdFx0LnNpYmxpbmdzKClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCd3ZC1zbGlkZXJfX3BhZy0tYWN0aXZlJyk7XG5cdFx0XHRcdFxuXHRcdFx0aWYgKCQodGhpcykuaW5kZXgoKSA9PT0gMSkge1xuXHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0LmNsb3Nlc3QoJy53ZC1zbGlkZXInKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnd2Qtc2xpZGVyLS10d28nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQodGhpcylcblx0XHRcdFx0XHQuY2xvc2VzdCgnLndkLXNsaWRlcicpXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCd3ZC1zbGlkZXItLXR3bycpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB3ZFNsaWRlcjsiLCJjb25zdCB5YU1hcCA9IHtcblx0cG9pbnRzOiBbXSxcblx0bWFwOiB7fSxcblx0LyoqXG5cdCAqINC+0LHRitGP0LLQu9GP0LXRgiDRgtC+0YfQutC4ICjQvdCw0LTQviDQstGL0L/QvtC70L3Rj9GC0Ywg0L/QvtGB0LvQtSDRgdC+0LfQtNCw0L3QuNGPINC60LDRgNGC0YspXG5cdCAqL1xuXHRzZXRQb2ludHMoKSB7XG5cdFx0dGhpcy5wb2ludHMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdGNvb3JkczogWzU5LjkyMDIyOTc1OTYyNzY5LCAzMC4zNzI5NTU5OTk5OTk5NzddLFxuXHRcdFx0XHR0aXRsZXM6IHtcblx0XHRcdFx0XHRoaW50Q29udGVudFx0XHQ6ICfQkdC+0LrRgSDQtNC70Y8g0L7QutC70LXQudC60LgnLFxuXHRcdFx0XHRcdGJhbGxvb25Db250ZW50XHQ6ICfQodCf0LEsINCa0YDQtdC80LXQvdGH0YPQs9GB0LrQsNGPINGD0LsuLCDQtC44Jyxcblx0XHRcdFx0fSxcblx0XHRcdFx0cGFyYW1zOiB7XG5cdFx0XHRcdFx0aWNvbkxheW91dDogeW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5XG5cdFx0XHRcdFx0XHQuY3JlYXRlQ2xhc3MoJzxkaXYgY2xhc3M9XFwneWEtbWFwX19pY29uIHlhLW1hcF9faWNvbi0tYmx1ZVxcJz48L2Rpdj4nKSxcblxuXHRcdFx0XHRcdGljb25TaGFwZToge1xuXHRcdFx0XHRcdFx0dHlwZVx0XHRcdDogJ1JlY3RhbmdsZScsXG5cdFx0XHRcdFx0XHRjb29yZGluYXRlc1x0OiBbWy03LCAtNDBdLCBbMzMsIDBdXSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0Y29vcmRzOiBbNTkuOTQ0ODQwOTM3NzE5MzEsIDMwLjM4ODU5MDE2Njg0MDE2XSxcblx0XHRcdFx0dGl0bGVzOiB7XG5cdFx0XHRcdFx0aGludENvbnRlbnRcdFx0OiAn0JPQu9Cw0LLQvdGL0Lkg0L7RhNC40YEnLFxuXHRcdFx0XHRcdGJhbGxvb25Db250ZW50XHQ6ICfQodCf0LEsINCh0YPQstC+0YDQvtCy0YHQutC40Lkg0L/RgNC+0YHQv9C10LrRgiwgNjXQsSwg0L7RhNC40YEgMTYnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwYXJhbXM6IHtcblx0XHRcdFx0XHRpY29uTGF5b3V0OiB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3Rvcnlcblx0XHRcdFx0XHRcdC5jcmVhdGVDbGFzcygnPGRpdiBjbGFzcz1cXCd5YS1tYXBfX2ljb24geWEtbWFwX19pY29uLS1yZWRcXCc+PC9kaXY+JyksXG5cblx0XHRcdFx0XHRpY29uU2hhcGU6IHtcblx0XHRcdFx0XHRcdHR5cGVcdFx0XHQ6ICdSZWN0YW5nbGUnLFxuXHRcdFx0XHRcdFx0Y29vcmRpbmF0ZXNcdDogW1stNywgLTQwXSwgWzMzLCAwXV0sXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fVxuXHRcdF07XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0LXRgiDRgtC+0YfQutGDINC90LAg0LrQsNGA0YLQtVxuXHQgKiBAcGFyYW0ge29iamV4dH0gcG9pbnQg0L7QsdGK0LXQutGCINGBINC00LDQvdC90YvQvNC4INGC0L7Rh9C60Lhcblx0ICovXG5cdHNldFBvaW50KHBvaW50KSB7XG5cdFx0dGhpcy5tYXAuZ2VvT2JqZWN0cy5hZGQobmV3IHltYXBzLlBsYWNlbWFyayhwb2ludC5jb29yZHMsIHBvaW50LnRpdGxlcywgcG9pbnQucGFyYW1zKSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDRgdC+0LfQtNCw0LXRgiDQutCw0YDRgtGDXG5cdCAqL1xuXHRzZXRNYXAoKSB7XG5cdFx0eW1hcHMucmVhZHkoKCkgPT4ge1xuXHRcdFx0dGhpcy5tYXAgPSBuZXcgeW1hcHMuTWFwKCd5YU1hcCcsIHtcblx0XHRcdFx0Y2VudGVyOiBbXG5cdFx0XHRcdFx0NTkuOTMxNTkzMjIyMzM5ODQsXG5cdFx0XHRcdFx0MzAuMzc1MTQ0NjgyNTU2MTIyXG5cdFx0XHRcdF0sXG5cdFx0XHRcdGNvbnRyb2xzOiBbXG5cdFx0XHRcdFx0J3pvb21Db250cm9sJyxcblx0XHRcdFx0XSxcblx0XHRcdFx0em9vbTogMTMsXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXRQb2ludHMoKTtcblxuXHRcdFx0dGhpcy5wb2ludHMuZm9yRWFjaChlbGVtID0+IHtcblx0XHRcdFx0dGhpcy5zZXRQb2ludChlbGVtKTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm1hcC5iZWhhdmlvcnMuZGlzYWJsZSgnc2Nyb2xsWm9vbScpO1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5zZXRNYXAoKTtcblx0fSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0geWFNYXA7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdmFyc1x0XHRcdGZyb20gJy4vdmFycyc7XG5cbmltcG9ydCBkcml2ZXJGb3JtXHRmcm9tICcuLi9ibG9ja3MvZHJpdmVyLWZvcm0vZHJpdmVyLWZvcm0nO1xuaW1wb3J0IGlucHV0XHRcdGZyb20gJy4uL2Jsb2Nrcy9pbnB1dC9pbnB1dCc7XG5pbXBvcnQgbWVzc2FnZVx0XHRmcm9tICcuLi9ibG9ja3MvbWVzc2FnZS9tZXNzYWdlJztcbmltcG9ydCBidXJnZXJcdFx0ZnJvbSAnLi4vYmxvY2tzL2J1cmdlci9idXJnZXInO1xuaW1wb3J0IHNjcm9sbEJ0blx0ZnJvbSAnLi4vYmxvY2tzL3Njcm9sbC1idG4vc2Nyb2xsLWJ0bic7XG5pbXBvcnQgd2RTbGlkZXJcdGZyb20gJy4uL2Jsb2Nrcy93ZC1zbGlkZXIvd2Qtc2xpZGVyJztcbmltcG9ydCB0YWJsZXRcdFx0ZnJvbSAnLi4vYmxvY2tzL3RhYmxldC90YWJsZXQnO1xuaW1wb3J0IHNlYXJjaFx0XHRmcm9tICcuLi9ibG9ja3Mvc2VhcmNoL3NlYXJjaCc7XG5pbXBvcnQgcGluXHRcdFx0ZnJvbSAnLi4vYmxvY2tzL3Bpbi9waW4nO1xuaW1wb3J0IG1hcFx0XHRcdGZyb20gJy4uL2Jsb2Nrcy9tYXAvbWFwJztcbmltcG9ydCBzbGlkZVBhY2tcdGZyb20gJy4uL2Jsb2Nrcy9zbGlkZS1wYWNrL3NsaWRlLXBhY2snO1xuaW1wb3J0IGRvdFN0cmlwXHRmcm9tICcuLi9ibG9ja3MvZG90LXN0cmlwL2RvdC1zdHJpcCc7XG5pbXBvcnQgcXVlc3Rpb25cdGZyb20gJy4uL2Jsb2Nrcy9xdWVzdGlvbi9xdWVzdGlvbic7XG5pbXBvcnQgdXBCdG5cdFx0ZnJvbSAnLi4vYmxvY2tzL3VwLWJ0bi91cC1idG4nO1xuaW1wb3J0IHlhTWFwXHRcdGZyb20gJy4uL2Jsb2Nrcy95YS1tYXAveWEtbWFwJztcbmltcG9ydCBnYWxsZXJ5XHRcdGZyb20gJy4uL2Jsb2Nrcy9nYWxsZXJ5L2dhbGxlcnknO1xuXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2pxdWVyeV9sYXp5bG9hZC9qcXVlcnkubGF6eWxvYWQnKTtcbnJlcXVpcmUoJ2RldmljZS5qcycpO1xuXG5jb25zdCBqYXRhID0ge1xuXHQvKipcblx0ICog0LfQsNC/0YPRgdC60LDQtdC80LDRjyDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRhNGD0L3QutGG0LjRj1xuXHQgKi9cblx0cmVhZHkoKSB7XG5cdFx0aWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJyl7XG5cdFx0XHR0aGlzLmluaXQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHRoaXMuaW5pdCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0LjQvdC40YIg0YTRg9C90LrRhtC40Y9cblx0ICovXG5cdGluaXQoKSB7XG5cdFx0dmFycy5pbml0KCk7XG5cdFx0YnVyZ2VyLmluaXQoKTtcblx0XHR1cEJ0bi5pbml0KCk7XG5cblx0XHRzd2l0Y2ggKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkge1xuXHRcdFx0Y2FzZSAnLyc6XG5cdFx0XHRcdGRyaXZlckZvcm0uaW5pdCgpO1xuXHRcdFx0XHRpbnB1dC5pbml0KCk7XG5cdFx0XHRcdG1lc3NhZ2UuaW5pdCgpO1xuXHRcdFx0XHRzY3JvbGxCdG4uaW5pdCgpO1xuXHRcdFx0XHR3ZFNsaWRlci5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvZm9yYWR2Lmh0bWwnOlxuXHRcdFx0XHRkb3RTdHJpcC5pbml0KCk7XG5cdFx0XHRcdG1hcC5pbml0KCk7XG5cdFx0XHRcdHBpbi5pbml0KCk7XG5cdFx0XHRcdHNjcm9sbEJ0bi5pbml0KCk7XG5cdFx0XHRcdHNlYXJjaC5pbml0KCk7XG5cdFx0XHRcdHNsaWRlUGFjay5pbml0KCk7XG5cdFx0XHRcdHRhYmxldC5pbml0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICcvY29udGFjdHMuaHRtbCc6XG5cdFx0XHRcdHlhTWFwLmluaXQoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy9ob3cuaHRtbCc6XG5cdFx0XHRcdHF1ZXN0aW9uLmluaXQoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJy9nYWxsZXJ5Lmh0bWwnOlxuXHRcdFx0XHRnYWxsZXJ5LmluaXQoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9LFxufTtcblxuamF0YS5yZWFkeSgpOyIsImNvbnN0IHZhcnMgPSB7XG5cdHByb2R1Y3Rpb25cdDogJ2Vudmlyb25tZW50JyA9PT0gJ3Byb2R1Y3Rpb24nLFxuXHRzZXJ2ZXJcdFx0OiAnJyxcblx0XG5cdGFwaToge1xuXHRcdGJlY29tZURyaXZlcjogJy9hcGkvdjEvYWNjb3VudHMvYmVjb21lZHJpdmVyJyxcblx0XHRnYWxsZXJ5XHRcdDogJy9hcGkvdjEvZ2FsbGVyeScsXG5cdH0sXG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLnNlcnZlciA9IHRoaXMucHJvZHVjdGlvbiA/ICdodHRwczovL2phdGEucnUnIDogJ2h0dHA6Ly9kZXYuamF0YS5ydSc7XG5cdFx0Y29uc29sZS5sb2codGhpcy5wcm9kdWN0aW9uKVxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB2YXJzOyJdfQ==
