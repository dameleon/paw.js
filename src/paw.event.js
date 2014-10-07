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
