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
if (!('process' in global) && (typeof define === 'function' && define.amd)) {
    define([], function() {
        return Paw;
    });
}

})(this.self || global, void 0);
