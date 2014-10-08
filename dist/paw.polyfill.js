/*! paw.js // @version 1.0.0, @license MIT, @author dameleon <dameleon@gmail.com> */
//! Object.keys Polyfill from [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill)
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

;(function(global, undefined) {
'use strict';

var document = global.document;
var IS_SUPPORT_TOUCH_EVENT = 'ontouchstart' in document;
var IS_SUPPORT_POINTER_EVENT = !!global.PointerEvent;
var EVENTS = {
        START  : IS_SUPPORT_TOUCH_EVENT && 'touchstart'  || IS_SUPPORT_POINTER_EVENT && 'pointerdown'   || 'mousedown',
        MOVE   : IS_SUPPORT_TOUCH_EVENT && 'touchmove'   || IS_SUPPORT_POINTER_EVENT && 'pointermove'   || 'mousemove',
        END    : IS_SUPPORT_TOUCH_EVENT && 'touchend'    || IS_SUPPORT_POINTER_EVENT && 'pointerup'     || 'mouseup',
        CANCEL : IS_SUPPORT_TOUCH_EVENT && 'touchcancel' || IS_SUPPORT_POINTER_EVENT && 'pointercancel' || 'mouseleave'
};
var defaultSetting = {
        pressDuration: 500,
        doubleTapDuration: 400,
        motionThreshold: 5,
        preventClickEvent: true
};
var identifierKey = IS_SUPPORT_TOUCH_EVENT && 'identifier' || IS_SUPPORT_POINTER_EVENT && 'pointerId' || 'button';

function Paw(rootNode, option) {
    if (rootNode && !rootNode.addEventListener) {
        throw new Error('Argument Error: First argument must be Node');
    }
    var setting = this.setting = {};

    if (!option) {
        option = {};
    }
    for (var key in defaultSetting) {
        setting[key] = (option[key] !== undefined) ? option[key] : defaultSetting[key];
    }
    this.rootNode = rootNode || document;
    this.rootNode.addEventListener(EVENTS.START, this);
    this.handlers = {};
    this.timers = {};
}

Paw.IS_SUPPORT_TOUCH_EVENT = IS_SUPPORT_TOUCH_EVENT;
Paw.IS_SUPPORT_POINTER_EVENT = IS_SUPPORT_POINTER_EVENT;
Paw.EVENT_TYPES = {
        TAP: 'tap',
        DOUBLE_TAP: 'doubletap',
        PRESS: 'press',
        CLICK: 'click'
};
Paw.EVENT_INTERFACES = {
    TOUCH_EVENT   : 'touchevent',
    POINTER_EVENT : 'pointerevent',
    MOUSE_EVENT   : 'mouseevent'
};
Paw.keys = Object.keys || (_ && _.keys);

Paw.prototype = {
    constructor: Paw,
    handleEvent: _handleEvent,
    onStart: _onStart,
    onMove: _onMove,
    onEnd: _onEnd,
    onCancel: _onCancel,
    onTimeout: _onTimeout,
    setTimer: _setTimer,
    clearTimer: _clearTimer,
    bindEvents: _bindEvents,
    unbindEvents: _unbindEvents,
    dispose: _dispose
};

function _handleEvent(ev) {
    switch (ev.type) {
        case EVENTS.MOVE:
            this.onMove(ev);
            break;
        case EVENTS.START:
            this.onStart(ev);
            break;
        case EVENTS.END:
            this.onEnd(ev);
            break;
        case EVENTS.CANCEL:
            this.onCancel(ev);
            break;
    }
}

function _onStart(ev) {
    var setting = this.setting;
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var handler, touchInfo, id;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo[identifierKey];
        handler = new Paw.Touch(id, touchInfo, setting);
        handlers[id] = handler;
        this.setTimer(id);
    }
    this.bindEvents();
}

function _onMove(ev) {
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var touchInfo, handler, id;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo[identifierKey];
        handler = handlers[id];
        if (handler) {
            handler.move(touchInfo);
        }
    }
}

function _onEnd(ev) {
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var touchInfo, handler, id;


    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo[identifierKey];
        handler = handlers[id];
        if (handler) {
            handler.end(touchInfo);
            delete handlers[id];
        }
        this.clearTimer(id);
    }
    this.unbindEvents();
}

function _onCancel(ev) {
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var touchInfo, handler, id;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo[identifierKey];
        handler = handlers[id];
        if (handler) {
            handler.cancel(touchInfo);
            delete handlers[id];
        }
        this.clearTimer(id);
    }
    this.unbindEvents();
}

function _onTimeout(id) {
    var handlers = this.handlers;
    var handler = handlers[id];

    if (handler) {
        handler.timeout();
        delete handlers[id];
    }
    this.clearTimer(id);
}

function _setTimer(id) {
    var that = this;

    this.timers[id] = global.setTimeout(function() {
        that.onTimeout(id);
    }, this.setting.pressDuration);
}

function _clearTimer(id) {
    var timers = this.timers;

    global.clearTimeout(timers[id]);
    delete timers[id];
}

function _bindEvents() {
    if (this.boundEvents) {
        return;
    }
    var rootNode = this.rootNode;

    this.boundEvents = true;
    rootNode.addEventListener(EVENTS.MOVE, this);
    rootNode.addEventListener(EVENTS.END, this);
    rootNode.addEventListener(EVENTS.CANCEL, this);
}

function _unbindEvents() {
    if (!this.boundEvents || Paw.keys(this.handlers).length > 0) {
        return;
    }
    var rootNode = this.rootNode;

    this.boundEvents = false;
    rootNode.removeEventListener(EVENTS.MOVE, this);
    rootNode.removeEventListener(EVENTS.END, this);
    rootNode.removeEventListener(EVENTS.CANCEL, this);
}

function _dispose(cond) {
    var handlers = this.handlers;
    var rootNode = this.rootNode;

    for (var id in handlers) {
        delete handlers[id];
        this.clearTimer(id);
    }
    rootNode.removeEventListener(EVENTS.START);
    this.unbindEvents();
    if (cond) {
        Paw.Touch.dispose();
    }
}

//// private methods
function __getTouchInfoList(ev) {
    return IS_SUPPORT_TOUCH_EVENT && ev.changedTouches || [ev];
}

// exports
global.Paw = Paw;

})(this.self || global, void 0);

;(function(global, undefined) {
'use strict';

if (!global.Paw) {
    throw new Error('"Paw" does not exist in global');
}
var Paw = global.Paw;
var PawEvent;
var canUseCustomEvent = true;

try {
    new global.CustomEvent('testevent');
} catch(_) {
    canUseCustomEvent = false;
}

if (canUseCustomEvent) {
    PawEvent = global.CustomEvent;
} else {
    var document = global.document;

    PawEvent = function(event, params) {
        var evt = document.createEvent('Event');

        params = params || { bubbles: false, cancelable: false };
        evt.initEvent(event, params.bubbles, params.cancelable);
        if (params.detail) {
            evt.detail = params.detail;
        }
        return evt;
    };
    PawEvent.prototype = global.Event.prototype;
}

// export
Paw.Event = PawEvent;

})(this.self || global, void 0);

;(function(global, undefined) {
'use strict';

if (!global.Paw) {
    throw new Error('"Paw" does not exist in global');
}
var Paw = global.Paw;
var EVENT_TYPES = Paw.EVENT_TYPES;
var EVENT_INIT_DICT = {
        BUBBLES: true,
        CANCELABLE: true,
        DETAIL_EVENT_INTERFACE: Paw.IS_SUPPORT_TOUCH_EVENT && Paw.EVENT_INTERFACES.TOUCH_EVENT ||
                                Paw.IS_SUPPORT_POINTER_EVENT && Paw.EVENT_INTERFACES.POINTER_EVENT ||
                                Paw.EVENT_INTERFACES.MOUSE_EVENT
};
var DOCUMENT_POSITION_IDENTICAL = 0;
var DOCUMENT_POSITION_ANCESTOR = global.Node.DOCUMENT_POSITION_PRECEDING | global.Node.DOCUMENT_POSITION_CONTAINS;
var DOCUMENT_POSITION_DESCENDANT = global.Node.DOCUMENT_POSITION_FOLLOWING | global.Node.DOCUMENT_POSITION_CONTAINED_BY;
var __sqrt = global.Math.sqrt;
var __lastTapInfo = {
    target: null,
    updatedTime: null
};

function PawTouch(id, touchInfo, setting) {
    this.id = id;
    this.setting = setting;
    this.target = touchInfo.target;
    this.lastTouchInfo = touchInfo;
    this.startX = touchInfo.pageX;
    this.startY = touchInfo.pageY;
    this.disposeTimer = null;
    if (setting.preventClickEvent) {
        this.target.addEventListener(EVENT_TYPES.CLICK, this);
    }
}

PawTouch.dispose = function() {
    var info = __lastTapInfo;

    info.target = info.updatedTime = null;
};

PawTouch.prototype = {
    constructor: PawTouch,
    move: _move,
    end: _end,
    timeout: _timeout,
    cancel: _dispose,
    dispose: _dispose,
    triggerEvent: _triggerEvent,
    handleEvent: _handleEvent,
    replaceTarget: _replaceTarget,
    disposeTarget: _disposeTarget
};

function _move(touchInfo) {
    this.lastTouchInfo = touchInfo;
}

function _end(touchInfo) {
    var setting = this.setting;
    var x = touchInfo.pageX;
    var y = touchInfo.pageY;
    var dx = x - this.startX;
    var dy = y - this.startY;
    var isDoubleTap, pos;

    if (__sqrt(dx * dx + dy * dy) <= setting.motionThreshold) {
        pos = this.target.compareDocumentPosition(touchInfo.target);
        // NOTE: replace target to the current target in the case of descendants or ancestors
        if (pos === DOCUMENT_POSITION_ANCESTOR || pos === DOCUMENT_POSITION_DESCENDANT) {
            this.replaceTarget(touchInfo.target);
        }
        // NOTE: not processed in the case of sibling elements
        else if (pos !== DOCUMENT_POSITION_IDENTICAL) {
            return this.dispose();
        }
        isDoubleTap = __isDoubleTap(this.target, setting.doubleTapDuration);
        this.triggerEvent(isDoubleTap && EVENT_TYPES.DOUBLE_TAP || EVENT_TYPES.TAP, x, y);
        __updateLastTapTarget(this.target);
    }
    this.dispose();
}

function _dispose() {
    var that = this;

    if (this.setting.preventClickEvent) {
        this.disposeTimer = global.setTimeout(function() {
            that.disposeTarget();
        }, 400);
    } else {
        this.disposeTarget();
    }
}

function _timeout() {
    var touchInfo = this.lastTouchInfo;
    var x = touchInfo.pageX;
    var y = touchInfo.pageY;
    var dx = x - this.startX;
    var dy = y - this.startY;
    var pos;

    if (__sqrt(dx * dx + dy * dy) <= this.setting.motionThreshold) {
        pos = this.target.compareDocumentPosition(touchInfo.target);
        // NOTE: replace target to the current target in the case of descendants or ancestors
        if (pos === DOCUMENT_POSITION_ANCESTOR || pos === DOCUMENT_POSITION_DESCENDANT) {
            this.replaceTarget(touchInfo.target);
        }
        // NOTE: not processed in the case of sibling elements
        else if (pos !== DOCUMENT_POSITION_IDENTICAL) {
            return this.dispose();
        }
        this.triggerEvent(EVENT_TYPES.PRESS, x, y);
    }
    this.dispose();
}

function _triggerEvent(type, x, y) {
    var detail = {
        identifier: this.id,
        pageX: x,
        pageY: y
    };
    var event = new Paw.Event(
        type,
        {
            bubbles: EVENT_INIT_DICT.BUBBLES,
            cancelable: EVENT_INIT_DICT.CANCELABLE,
            detail: detail
        }
    );

    this.target.dispatchEvent(event);
}

function _handleEvent(ev) {
    ev.preventDefault();
    global.clearTimeout(this.disposeTimer);
    this.disposeTarget();
    return false;
}

function _replaceTarget(target) {
    var oldTarget = this.target;

    this.target = target;
    if (this.setting.preventClickEvent) {
        oldTarget.removeEventListener(EVENT_TYPES.CLICK, this);
        this.target.addEventListener(EVENT_TYPES.CLICK, this);
    }
}

function _disposeTarget() {
    var target = this.target;

    if (target) {
        if (this.setting.preventClickEvent) {
            target.removeEventListener(EVENT_TYPES.CLICK, this);
        }
        target = null;
    }
}

//// private methods
function __updateLastTapTarget(target) {
    var info = __lastTapInfo;

    info.target = target;
    info.updatedTime = Date.now();
}

function __isDoubleTap(target, duration) {
    var info = __lastTapInfo;

    if (info.target === target &&
        duration >= (Date.now() - info.updatedTime)) {
            return true;
    }
    return false;
}

// export
Paw.Touch = PawTouch;

})(this.self || global, void 0);
