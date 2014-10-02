;(function(global, undefined) {
'use strict';

//! Object.keys Polyfill from [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill)
Object.keys||(Object.keys=function(){var e=Object.prototype.hasOwnProperty,f=!{toString:null}.propertyIsEnumerable("toString"),c="toString toLocaleString valueOf hasOwnProperty isPrototypeOf propertyIsEnumerable constructor".split(" "),g=c.length;return function(b){if("object"!==typeof b&&"function"!==typeof b||null===b)throw new TypeError("Object.keys called on non-object");var d=[],a;for(a in b)e.call(b,a)&&d.push(a);if(f)for(a=0;a<g;a++)e.call(b,c[a])&&d.push(c[a]);return d}}());

var document = global.document;
var IS_SUPPORT_TOUCH = 'ontouchstart' in document;
var EVENTS = {
        START  : IS_SUPPORT_TOUCH && 'touchstart'  || 'mousedown',
        MOVE   : IS_SUPPORT_TOUCH && 'touchmove'   || 'mousemove',
        END    : IS_SUPPORT_TOUCH && 'touchend'    || 'mouseup',
        CANCEL : IS_SUPPORT_TOUCH && 'touchcancel' || 'mouseleave'
};
var defaultSetting = {
        cancelTimeDuration: 200,
        workingPixel: 5,
};


function PawTouch(timeoutDuration, workingPixel, touchInfo) {
    var that = this;

    this.id = touchInfo.identifier;
    this.workingPixel = workingPixel;
    this.target = touchInfo.target;
    this.startX = touchInfo.pageX;
    this.startY = touchInfo.pageY;
    this.timer = setTimeout(function() {
        that._timeout();
    }, timeoutDuration);
}


PowTouch.prototype = {
    constructor: PowTouch
    move: _move,
    end: _end,
    cancel: _cancel,
    _timeout: _timeout
};


function _move(eventInfo) {

}

function _end(eventInfo) {

}

function _cancel(eventInfo) {

}

function _timeout() {

}


function Paw(rootNode, option) {
    if (rootNode && !rootNode.addEventListener) {
        throw new Error();
    }
    var setting = this.setting = {};

    for (var key in defaultSetting) {
        setting[key] = option[key] || defaultSetting[key];
    }
    this.rootNode = rootNode || document;
    this.rootNode.addEventListener(EVENTS.START, this);
    this.handlers = {};
}

Paw.prototype = {
    constructor: Paw,
    handleEvent: _handleEvent,
    onStart: _onStart,
    onMove: _onMove,
    onEnd: _onEnd,
    onCancel: _onCancel,
    bindEvents: _bindEvents,
    unbindEvents: _unbindEvents
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
    var handler;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        handler = new PowTouch(setting, touches[i]);
        handlers[handler.id] = handler;
    }
    this.bindEvents();
}

function _onMove(ev) {
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var touchInfo, handler;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        handler = handlers[touchInfo.identifier];
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
        id = touchInfo.identifier;
        handler = handlers[id];
        if (handler) {
            handler.end(touchInfo);
        }
        handlers[id] = null;
    }
    this.unbindEvents();
}

function _onCancel(ev) {
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var touchInfo, handler, id;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo.identifier;
        handler = handlers[id];
        if (handler) {
            handler.cancel(touchInfo);
        }
        handlers[id] = null;
    }
    this.unbindEvents();
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
    if (!this.boundEvents || Object.keys(this.handlers).length > 0) {
        return;
    }
    var rootNode = this.rootNode;

    this.boundEvents = false;
    rootNode.removeEventListener(EVENTS.MOVE, this);
    rootNode.removeEventListener(EVENTS.END, this);
    rootNode.removeEventListener(EVENTS.CANCEL, this);
}

function __getTouchInfoList(ev) {
    return IS_SUPPORT_TOUCH ? ev.changedTouches || [ev];
}


})(this.self || global, void 0);
