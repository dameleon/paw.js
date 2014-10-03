;(function(global, undefined) {
'use strict';

if (!global.Paw) {
    throw new Error();
}
var Paw = global.Paw;
var EVENTS = {
        TAP: 'tap',
        DOUBLE_TAP: 'doubletap',
        PRESS: 'press',
        CLICK: 'click'
};
var EVENT_INIT_DICT = {
        BUBBLES: true,
        CANCELABLE: true
};

function PawTouch(setting, eventInfo) {
    var x = eventInfo.pageX;
    var y = eventInfo.pageY;

    this.id = eventInfo.identifier;
    this.setting = setting;
    this.target = eventInfo.target;
    this.startX = x;
    this.startY = y;
    this.lastX = x;
    this.lastY = y;
    if (setting.preventClickEvent) {
        this.target.addEventListener(EVENTS.CLICK, this);
    }
}

PawTouch.EVENTS = EVENTS;
PawTouch.lastTapInfo = {
    target: null,
    updatedTime: null
};
PawTouch.updateLastTapTarget = function(target) {
    var info = PawTouch.lastTapInfo;

    info.target = target;
    info.updatedTime = Date.now();
};
PawTouch.isDoubleTap = function(target, duration) {
    var info = PawTouch.lastTapInfo;

    if (info.target === target &&
        duration >= (Date.now() - info.updatedTime)) {
            return true;
    }
    return false;
};

PawTouch.prototype = {
    constructor: PawTouch,
    move: _move,
    end: _end,
    timeout: _timeout,
    cancel: _dispose,
    dispose: _dispose,
    triggerEvent: _triggerEvent,
    handleEvent: _handleEvent
};

function _move(eventInfo) {
    this.lastX = eventInfo.pageX;
    this.lastY = eventInfo.pageY;
}

function _end(eventInfo) {
    var setting = this.setting;
    var x = this.lastX = eventInfo.pageX;
    var y = this.lastY = eventInfo.pageY;
    var dx = x - this.startX;
    var dy = y - this.startY;
    var isDoubleTap;

    if (Math.sqrt(dx * dx + dy * dy) <= setting.motionThreshold) {
        isDoubleTap = PawTouch.isDoubleTap(this.target, setting.doubleTapDuration);
        this.triggerEvent(isDoubleTap && EVENTS.DOUBLE_TAP || EVENTS.TAP, {
            pageX: x,
            pageY: y
        });
        PawTouch.updateLastTapTarget(this.target);
    }
    this.dispose();
}

function _dispose() {
    global.clearTimeout(this.cancelTimer);
    if (!this.setting.preventClickEvent) {
        this.target = null;
    }
}

function _timeout() {
    var x = this.lastX;
    var y = this.lastY;
    var dx = x - this.startX;
    var dy = y - this.startY;

    if (Math.sqrt(dx * dx + dy * dy) <= this.setting.motionThreshold) {
        this.triggerEvent(EVENTS.PRESS, {
            pageX: x,
            pageY: y
        });
    }
}

function _triggerEvent(name, option) {
    var detail = {};
    var dict = {
        bubbles: EVENT_INIT_DICT.BUBBLES,
        cancelable: EVENT_INIT_DICT.CANCELABLE,
        detail: detail
    };
    var event;

    for (var key in option) {
        detail[key] = option[key];
    }
    event = new global.CustomEvent(name, dict);
    this.target.dispatchEvent(event);
}

function _handleEvent(ev) {
    ev.preventDefault();
    this.target.removeEventListener(EVENTS.CLICK, this);
    this.target = null;
    return false;
}

// export
Paw.Touch = PawTouch;

})(this.self || global, void 0);
