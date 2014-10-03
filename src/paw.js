;(function(global, undefined) {
'use strict';

var document = global.document;
var IS_SUPPORT_TOUCH = 'ontouchstart' in document;
var EVENTS = {
        START  : IS_SUPPORT_TOUCH && 'touchstart'  || 'mousedown',
        MOVE   : IS_SUPPORT_TOUCH && 'touchmove'   || 'mousemove',
        END    : IS_SUPPORT_TOUCH && 'touchend'    || 'mouseup',
        CANCEL : IS_SUPPORT_TOUCH && 'touchcancel' || 'mouseleave'
};
var defaultSetting = {
        pressDuration: 500,
        doubleTapDuration: 400,
        motionThreshold: 5,
        preventClickEvent: true
};

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
}

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
    var handler, id;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        handler = new Paw.Touch(setting, touches[i]);
        id = handler.id;
        handlers[id] = handler;
        this.setTimer(id);
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
            handlers[id] = null;
        }
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
            handlers[id] = null;
        }
    }
    this.unbindEvents();
}

function _onTimeout(id) {
    var handlers = this.handlers;
    var handler = handlers[id];

    if (handler) {
        handler.timeout();
        handlers[id] = null;
    }
}

function _setTimer(id) {
    var that = this;

    global.setTimeout(function() {
        that.onTimeout(id);
    }, this.setting.pressDuration);
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

function __getTouchInfoList(ev) {
    return IS_SUPPORT_TOUCH && ev.changedTouches || [ev];
}


// exports
global.Paw = Paw;

})(this.self || global, void 0);
