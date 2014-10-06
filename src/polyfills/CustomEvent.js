//! CustomEvent Polyfill from [MDN](https://developer.mozilla.org/ja/docs/Web/API/CustomEvent#Polyfill)
if (!window.CustomEvent) {
  (function () {
    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
     }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
  })();
}
