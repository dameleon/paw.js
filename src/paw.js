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
        cancelTimeDuration: 200,
        cancelPixelDistance: 5,
};

function PowTouch(rootNode, ev) {
    this.target = ev.target;
    this.touchesIdList = this._getTouchIdList(ev);
    this.rootNode = rootNode;
    rootNode.addEventListener(EVENTS.MOVE, this);
    rootNode.addEventListener(EVENTS.END, this);
    rootNode.addEventListener(EVENTS.CANCEL, this);
}

PowTouch.prototype = {
    constructor: PowTouch,
    handleEvent: function() {
        switch (ev.type) {
            case EVENTS.MOVE:
                this.onMove(ev);
                break;
            case EVENTS.END:
                this.onEnd(ev);
                break;
            case EVENTS.CANCEL:
                this.onCancel(ev);
                break;
        }
    },
    _getTouchIdList: function(ev) {
        var res = [];
        var touches = ev.changedTouches;
        var len = touches.length;

        if (len === 1) {
            res[res.length] = touches[0].id;
        } else {
            for (var i = 0; i < length; i++) {
                res[res.length] = touches[i].id;
            }
        }
        return res;
    },
    onMove: function(ev) {
        var touchesIdList = this.touchesIdList;
        var touches = ev.changedTouches;
        var touch;

        for (var i = 0, iz = touches.length; i < iz; i++) {
            touch = touches[i];
            if (touchesIdList.indexOf(touch.id) > -1) {

            }
        }

    },
    onEnd: function(ev) {

    },
    onCancel: function(ev) {

    },
    dispose: function() {
        var rootNode = this.rootNode;

        rootNode.removeEventListener(EVENTS.MOVE, this);
        rootNode.removeEventListener(EVENTS.END, this);
        rootNode.removeEventListener(EVENTS.CANCEL, this);
        this.rootNode = null;
        this.idList = null;
        this.target = null;
    }
};

function __getTouchIds(ev) {

}

function Paw(rootNode, option) {
    if (rootNode && !rootNode.addEventListener) {
        throw new Error();
    }
    this.setting = __extend({}, defaultSetting, option || {});
    this.rootNode = rootNode || document;
    this.rootNode.addEventListener(EVENTS.START, this);
}

Paw.prototype = {
    constructor: Paw,
    handleEvent: _handleEvent,
    onStart: _onStart,
    onMove: _onMove,
    onEnd: _onEnd,
    onCancel: _onCancel
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

}

function _onMove(ev) {

}

function _onEnd(ev) {

}

function _onCancel(ev) {

}




function __getEvent(ev, key) {

}

function __extend() {
    if (arguments.length < 2) {
        return arguments[0];
    }
    var deepTargetRe = /(object|array)/;
    var args = [].slice.call(arguments);
    var res = args.shift();
    var i = 0, arg;

    while ((arg = args[i])) {
        var j = 0;

        switch (typeof arg) {
            case 'array':
                for (var jz = arg.length; j < jz; j++) {
                    _extend(j, res, arg);
                }
                break;
            case 'object':
                var donorKeys = Object.keys(arg);

                for (var key; key = donorKeys[j]; j++) {
                    _extend(key, res, arg);
                }
                break;
        }
        i++;
    }

    return res;

    function _extend(key, target, donor) {
        var val = donor[key];
        var targetVal = target[key];
        var donorValType = (val && typeof val) || '';
        var targetValType = (targetVal && typeof targetVal) || '';

        if (deepTargetRe.test(donorValType)) {
            if (targetValType !== donorValType) {
                target[key] = (donorValType === 'object') ? {} : [];
            }
            __extend(target[key], val);
        } else {
            target[key] = val;
        }
    }
}

})(this.self || global, void 0);
