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
        if (this.target !== touchInfo.target) {
            pos = this.target.compareDocumentPosition(touchInfo.target);
            // NOTE: replace target to the current target in the case of descendants or ancestors
            if (pos === DOCUMENT_POSITION_ANCESTOR || pos === DOCUMENT_POSITION_DESCENDANT) {
                this.replaceTarget(touchInfo.target);
            }
            // NOTE: not processed in the case of sibling elements
            else if (pos !== DOCUMENT_POSITION_IDENTICAL) {
                return this.dispose();
            }
        }
        this.triggerEvent(EVENT_TYPES.TAP, x, y);
        if (__isDoubleTap(this.target, setting.doubleTapDuration)) {
            this.triggerEvent(EVENT_TYPES.DOUBLE_TAP, x, y);
        }
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
        if (this.target !== touchInfo.target) {
            pos = this.target.compareDocumentPosition(touchInfo.target);
            // NOTE: replace target to the current target in the case of descendants or ancestors
            if (pos === DOCUMENT_POSITION_ANCESTOR || pos === DOCUMENT_POSITION_DESCENDANT) {
                this.replaceTarget(touchInfo.target);
            }
            // NOTE: not processed in the case of sibling elements
            else if (pos !== DOCUMENT_POSITION_IDENTICAL) {
                return this.dispose();
            }
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
        this.arget = null;
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
