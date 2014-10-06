//!Document.prototype.createTouchList by w3c spec createTouchList (https://developer.mozilla.org/ja/docs/Web/API/DocumentTouch.createTouch)
if (!Document.prototype.createTouchList) {
    (function(global) {
        function TouchList(touches) {
            this.length = 0;
            if (!touches) {
                return this;
            }
            // list type argument
            else if (touches.length) {
                var touch;

                for (var i = 0, iz = touches.length; i < iz; i++) {
                    touch = touches[i];
                    this[i] = touch;
                }
                this.length = iz;
            }
            else {
                this[0] = touches;
                this.length = 1;
            }
        }
        TouchList.prototype = {
            constructor: TouchList,
            identifiedTouch: function(id) {
                var that = this;

                for (var key in that) if (!global.isNaN(global.parseInt(key)) && that.hasOwnProperty(key))  {
                    if (that[key].identifier == id) {
                        return that[key];
                    }
                }
                return undefined;
            },
            item: function(index) {
                return this[index];
            }
        };

        Document.prototype.createTouchList = function(touches) {
            return new TouchList(touches);
        };
    })(window);
}
