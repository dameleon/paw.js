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

    PawEvent = function(eventType, params) {
        var event = document.createEvent('Event');

        params = params || { bubbles: false, cancelable: false };
        event.initEvent(eventType, params.bubbles, params.cancelable);
        if (params.detail) {
            event.detail = params.detail;
        }
        return event;
    };
    PawEvent.prototype = global.Event.prototype;
}

// export
Paw.Event = PawEvent;

})(this.self || global, void 0);
