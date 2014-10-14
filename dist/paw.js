/*! paw.js // @version 1.0.3, @license MIT, @author dameleon <dameleon@gmail.com> */
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
        fastClick: true
};
var identifierKey = IS_SUPPORT_TOUCH_EVENT && 'identifier' || IS_SUPPORT_POINTER_EVENT && 'pointerId' || 'button';

function Paw(rootNode, option) {
    if (rootNode && !rootNode.addEventListener) {
        throw new Error('Argument Error: First argument must be Node');
    }
    var setting = this.setting = {};

    rootNode = rootNode || document;
    if (!option) {
        option = {};
    }
    for (var key in defaultSetting) {
        setting[key] = (option[key] !== undefined) ? option[key] : defaultSetting[key];
    }
    setting.view = rootNode.defaultView || rootNode.ownerDocument && rootNode.ownerDocument.defaultView || global;
    this.rootNode = rootNode;
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

    for (var id in handlers) {
        delete handlers[id];
        this.clearTimer(id);
    }
    this.rootNode.removeEventListener(EVENTS.START);
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
// for require.js
if (!('process' in global) && (typeof global.define === 'function' && global.define.amd)) {
    global.define([], function() {
        return Paw;
    });
}

})(this.self || global, void 0);

;(function(global, undefined) {
'use strict';

if (!global.Paw) {
    throw new Error('"Paw" does not exist in global');
}
var Paw = global.Paw;
var document = global.document;
var canCreateEvent = true;

// check useragent can use custom event
try {
    document.createEvent('CustomEvent');
} catch (_) {
    canCreateEvent = false;
}

if (canCreateEvent) {
    Paw.Event = function(eventType, canBubble, cancelable, detail) {
        var event = document.createEvent('CustomEvent');

        event.initEvent(eventType, canBubble, cancelable, detail);
        return event;
    };
} else {
    Paw.Event = function(eventType, canBubble, cancelable, detail) {
        var event = document.createEvent('Event');

        event.initEvent(eventType, canBubble, cancelable);
        if (detail) {
            event.detail = detail;
        }
        return event;
    };
}

Paw.MouseEvent = function(eventType, canBubble, cancelable, view,  detail, screenX, screenY, clientX, clientY,  ctrlKey, altKey, shiftKey, metaKey,  button, relatedTarget) {
        var event = document.createEvent('MouseEvent');

        event.initMouseEvent(
            eventType,
            canBubble,
            cancelable,
            view,
            detail,
            screenX,
            screenY,
            clientX,
            clientY,
            ctrlKey,
            altKey,
            shiftKey,
            metaKey,
            button,
            relatedTarget
        );
        return event;
};

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
    this.clicked = false;
    if (setting.fastClick) {
        setting.view.addEventListener(EVENT_TYPES.CLICK, this, true);
    }
}

PawTouch.dispose = function() {
    var info = __lastTapInfo;

    info.target = info.updatedTime = null;
};

PawTouch.prototype = {
    constructor       : PawTouch,
    cancel            : _dispose,
    dispose           : _dispose,
    end               : _end,
    handleEvent       : _handleEvent,
    move              : _move,
    timeout           : _timeout,
    triggerEvent      : _triggerEvent,
    triggerMouseEvent : _triggerMouseEvent,
    unbindClickEvent  : _unbindClickEvent
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
    var pos;

    if (__sqrt(dx * dx + dy * dy) <= setting.motionThreshold) {
        if (this.target !== touchInfo.target) {
            pos = this.target.compareDocumentPosition(touchInfo.target);
            // NOTE: replace target to the current target in the case of descendants or ancestors
            if (pos === DOCUMENT_POSITION_ANCESTOR || pos === DOCUMENT_POSITION_DESCENDANT) {
                this.target = touchInfo.target;
            }
            // NOTE: not processed in the case of sibling elements
            else if (pos !== DOCUMENT_POSITION_IDENTICAL) {
                return this.dispose();
            }
        }
        this.triggerEvent(EVENT_TYPES.TAP, touchInfo);
        if (setting.fastClick) {
            this.triggerMouseEvent(EVENT_TYPES.CLICK, touchInfo);
        }
        if (__isDoubleTap(this.target, setting.doubleTapDuration)) {
            this.triggerEvent(EVENT_TYPES.DOUBLE_TAP, touchInfo);
        }
        __updateLastTapTarget(this.target);
    }
    this.dispose();
}

function _dispose() {
    var that = this;

    if (this.setting.fastClick) {
        this.disposeTimer = global.setTimeout(function() {
            that.unbindClickEvent();
        }, 400);
    } else {
        this.unbindClickEvent();
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
        if (this.target !== touchInfo.target) {
            pos = this.target.compareDocumentPosition(touchInfo.target);
            // NOTE: replace target to the current target in the case of descendants or ancestors
            if (pos === DOCUMENT_POSITION_ANCESTOR || pos === DOCUMENT_POSITION_DESCENDANT) {
                this.target = touchInfo.target;
            }
            // NOTE: not processed in the case of sibling elements
            else if (pos !== DOCUMENT_POSITION_IDENTICAL) {
                return this.dispose();
            }
        }
        this.triggerEvent(EVENT_TYPES.PRESS, touchInfo);
    }
    this.dispose();
}

function _triggerEvent(type, touchInfo) {
    var detail = {
        identifier : this.id,
        pageX      : touchInfo.pageX,
        pageY      : touchInfo.pageY,
        clientX    : touchInfo.clientX,
        clientY    : touchInfo.clientY,
        screenX    : touchInfo.screenX,
        screenY    : touchInfo.screenY
    };
    var event = Paw.Event(
        type,
        EVENT_INIT_DICT.BUBBLES,
        EVENT_INIT_DICT.CANCELABLE,
        detail
    );

    this.target.dispatchEvent(event);
}

function _triggerMouseEvent(type, touchInfo) {
    var event = Paw.MouseEvent(
            type,                       // eventType,
            EVENT_INIT_DICT.BUBBLES,    // canBubble,
            EVENT_INIT_DICT.CANCELABLE, // cancelable,
            this.setting.view,          // view,
            1,                          // detail (always 1),
            touchInfo.screenX,          // screenX,
            touchInfo.screenY,          // screenY,
            touchInfo.clientX,          // clientX,
            touchInfo.clientY,          // clientY,
            false,                      // ctrlKey,
            false,                      // altKey,
            false,                      // shiftKey,
            false,                      // metaKey,
            this.id,                    // button,
            null                        // relatedTarget
    );

    this.target.dispatchEvent(event);
}

function _handleEvent(ev) {
    if (this.clicked) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        ev.stopPropagation();
        global.clearTimeout(this.disposeTimer);
        this.unbindClickEvent();
        return false;
    }
    this.clicked = true;
}

function _unbindClickEvent() {
    this.setting.view.removeEventListener(EVENT_TYPES.CLICK, this, true);
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
