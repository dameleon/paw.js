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
            this.id,                    // detail,
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
    if (this.target !== ev.target) {
        return;
    } else if (this.clicked) {
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
