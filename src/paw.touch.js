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
var DOCUMENT_POSITION_IDENTICAL = 0;
var DOCUMENT_POSITION_ANCESTOR = global.Node.DOCUMENT_POSITION_PRECEDING | global.Node.DOCUMENT_POSITION_CONTAINS;
var DOCUMENT_POSITION_DESCENDANT = global.Node.DOCUMENT_POSITION_FOLLOWING | global.Node.DOCUMENT_POSITION_CONTAINED_BY;
var __sqrt = global.Math.sqrt;

function PawTouch(touchInfo, setting) {
    this.setting = setting;
    this.target = touchInfo.target;
    this.startX = this.lastX = touchInfo.pageX;
    this.startY = this.lastY = touchInfo.pageY;
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
    handleEvent: _handleEvent,
    replaceTarget: _replaceTarget
};

function _move(touchInfo) {
    this.lastX = touchInfo.pageX;
    this.lastY = touchInfo.pageY;
    this.lastTarget = touchInfo.target;
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
        // replace target to the current target in the case of descendants or ancestors
        if (pos === DOCUMENT_POSITION_ANCESTOR || pos === DOCUMENT_POSITION_DESCENDANT) {
            this.replaceTarget(touchInfo.target);
        }
        // not processed in the case of sibling elements
        else if (pos !== DOCUMENT_POSITION_IDENTICAL) {
            return this.dispose();
        }
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
    var pos;

    if (__sqrt(dx * dx + dy * dy) <= this.setting.motionThreshold) {
        pos = this.target.compareDocumentPosition(this.lastTarget);
        // replace target to the current target in the case of descendants or ancestors
        if (pos === DOCUMENT_POSITION_ANCESTOR || pos === DOCUMENT_POSITION_DESCENDANT) {
            this.replaceTarget(this.lastTarget);
        }
        // not processed in the case of sibling elements
        else if (pos !== DOCUMENT_POSITION_IDENTICAL) {
            return this.dispose();
        }
        this.triggerEvent(EVENTS.PRESS, {
            pageX: x,
            pageY: y
        });
        PawTouch.updateLastTapTarget(this.target);
    }
    this.dispose();
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

function _replaceTarget(target) {
    var oldTarget = this.target;

    this.target = target;
    if (this.setting.preventClickEvent) {
        oldTarget.removeEventListener(EVENTS.CLICK, this);
        this.target.addEventListener(EVENTS.CLICK, this);
    }
}

// export
Paw.Touch = PawTouch;

})(this.self || global, void 0);
