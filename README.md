# Paw.js

Paw.jsはタッチ操作のためのカスタムイベントを生成するJavaScriptライブラリです。

"シンプル", "小さく", "速く" をコンセプトに設計しています。


## Custom events

<dl>
    <dt>`tap` event</dt>
    <dd>`tap`イベントは、要素に触ってから指定された動きの制限範囲(デフォルト: 5px)を超えずに離れた場合に発火します</dd>
    <dt>`doubletap` event</dt>
    <dd>`doubletap`イベントは、同じ要素に対して指定時間内(デフォルト: 400ms)に2度`tap`イベントが発火された場合に、`tap`イベントに続いて発火します</dd>
    <dt>`press` event</dt>
    <dd>`press`イベントは、要素に触ってから指定された動きの制限範囲(デフォルト: 5px)を超えずに指が離れないまま指定時間(デフォルト: 500ms)を経過した際に発火します</dd>
</dl>


## 使い方

### 簡単な使い方

```
// initialize
new Paw();

// handling event
var element = document.getElementById('someElement');

element.addEventListener('tap', function() {
    alert('tap!');    
});

// with jQuery
$('#someElement').on('tap', function() {
    alert('tap!');    
});
```

### 引数 & オプション

```
function Paw(rootNode, option) {...}
```

- rootNode
    - type: Document|Node
    - default: window.document
    - optional
- option
    - type: Object
    - optional
- option.pressDuration
    - type: Number
    - default: `500`
    - optional
- option.doubleTapDuration
    - type: Number
    - default: `400`
    - optional
- option.motionThreshold
    - type: Number
    - default: `5`
    - optional
- option.fastClick
    - type: Boolean
    - default: `true`
    - optional


### 使用例

#### Paw.jsのイベント処理を行う要素を指定する

##### html

```
<html>
<head>...</head>
<body>
    <div id="toucharea">
        <button id="toucharea-btn">btn</button>
    </div>
    <div>
        <button id="normal-btn">btn</button>
    </div>
</body>
</html>
```

##### javascript
```
var toucharea = document.getElementById('toucharea');

// 第1引数に要素を指定すると、その要素を親とし以下の子孫に対してPaw.jsのイベントが発火する
new Paw(toucharea);

// "#toucharea-btn"要素は`tap`イベントを受け取ることができる
document.getElementById('toucharea-btn').addEventListener('tap', function() {
    alert('tap!'); 
});

// "#normal-btn"要素は`tap`イベントを受け取ることができない
document.getElementById('normal-btn').addEventListener('tap', function() {
    // never call 
});
```

#### use options

```
new Paw(null, {
        // `press`イベントが発火するまでの時間をミリセコンド単位で指定
        pressDuration     : 500,
        // `doubletap`イベントと判定される`tap`イベントの間隔時間をミリセコンド単位で指定
        doubleTapDuration : 400,
        // 指の動きの許容範囲をピクセル値で指定
        motionThreshold   : 5,
        // `tap`イベントと同時に`click`イベントを発火するための指定
        fastClick         : true
});
```

**注意**

- `fastClick`オプションを指定した場合、windowオブジェクトに対して`click`イベントを`useCapure: true`としてハンドラを設定した時に(例: `window.addEventListener('click', function() {...}, true)`)、イベントハンドラが1度のクリックで2度呼ばれる場合があります。
- `fastClick`オプションを指定した場合、clickイベント発火時にそのイベントと同一のスクリーン座標に対して再びclickイベントを発火した時、そのイベントはキャンセルされる可能性があります。


## 対応表

| UserAgent                   | status         |
|-----------------------------|----------------|
| Android 2.x(Stock Browser)  | with Polyfills |
| Android 3.x(Stock Browser)  | with Polyfills |
| Android 4.x~(Stock Browser) | ready          |
| Android 4.x(Chrome Browser) | ready          |
| iOS 6~(Mobile Safari)       | ready          |
| Opera Mobile 14~            | ready          |
| Firefox OS                  | ready          |
| Internet Explorer 9.x~      | ready          |
| Google Chrome               | ready          |
| Mozilla Firefox             | ready          |
| Safari                      | ready          |
| Opera 15.x~                 | ready          |


## Author

[twitter@dameleon](https://twitter.com/damele0n)


## License

Paw.js is licensed under MIT licensed.  
See [LICENSE](https://github.com/dameleon/paw.js/blob/master/LICENSE) for more information.

--------------------------------------------------------------------------------

for japaninglish

# Paw.js

the Paw.js generate a useful customized events for touch operation  
and the concept of it is "Simplest", 'Tiniest', "Fastest".

## Custom events

<dl>
    <dt>`tap` event</dt>
    <dd>the `tap` event trigger when away while not exceeding the threshold value (default: 5px) by touching the element</dd>
    <dt>`doubletap` event</dt>
    <dd>the `doubletap` event trigger when the `tap` event is triggered twice within a specified period of time (default: 400ms) for the same element</dd>
    <dt>`press` event</dt>
    <dd>the `press` event trigger when the specified time has elapsed (default: 500ms) without exceeding the threshold value (default: 5px) by touching the element</dd>
</dl>

## How to use

### simply use

```
// initialize
new Paw();

// handling event
var element = document.getElementById('someElement');

element.addEventListener('tap', function() {
    alert('tap!');    
});

// with jQuery
$('#someElement').on('tap', function() {
    alert('tap!');    
});
```

### arguments & options

```
function Paw(rootNode, option) {...}
```

- rootNode
    - type: Document|Node
    - default: window.document
    - optional
- option
    - type: Object
    - optional
- option.pressDuration
    - type: Number
    - default: `500`
    - optional
- option.doubleTapDuration
    - type: Number
    - default: `400`
    - optional
- option.motionThreshold
    - type: Number
    - default: `5`
    - optional
- option.fastClick
    - type: Boolean
    - default: `true`
    - optional


### Examples

#### assign the element to handling the Paw.js events

##### html

```
<html>
<head>...</head>
<body>
    <div id="toucharea">
        <button id="toucharea-btn">btn</button>
    </div>
    <div>
        <button id="normal-btn">btn</button>
    </div>
</body>
</html>
```

##### javascript
```
var toucharea = document.getElementById('toucharea');

// assign the parent element of the range to handle the Paw.js events
new Paw(toucharea);

// the toucharea-btn can get the `tap` event
document.getElementById('toucharea-btn').addEventListener('tap', function() {
    alert('tap!'); 
});

// the normal-btn cannot get the `tap` event
document.getElementById('normal-btn').addEventListener('tap', function() {
    // never call 
});
```

#### use options

```
new Paw(null, {
        // a milliseconds time to fire the `press` event 
        pressDuration     : 500,
        // a milliseconds time interval for determining tap the `doubletap` event
        doubleTapDuration : 400,
        // a pixel range that allows the movement of the finger
        motionThreshold   : 5,
        // trigger the `click` event at the same time as the `tap` event
        fastClick         : true
});
```

**Notice.**

- when you have enabled the `fastClick`, if you register an event handler in the state have enabled the `useCapture` option to the `window` object(e.g. `window.addEventListener('click', function() {...}, true)`) will receive twice the `click` event in a single tap.
- when you have enabled the `fastClick`, the click event is fired, there is a possibility that the event is canceled when you fire the click event again for the same screen coordinates.


## Compatibility table

| UserAgent                   | status         |
|-----------------------------|----------------|
| Android 2.x(Stock Browser)  | with Polyfills |
| Android 3.x(Stock Browser)  | with Polyfills |
| Android 4.x~(Stock Browser) | ready          |
| Android 4.x(Chrome Browser) | ready          |
| iOS 6~(Mobile Safari)       | ready          |
| Opera Mobile 14~            | ready          |
| Firefox OS                  | ready          |
| Internet Explorer 9.x~      | ready          |
| Google Chrome               | ready          |
| Mozilla Firefox             | ready          |
| Safari                      | ready          |
| Opera 15.x~                 | ready          |


## Author

[twitter@dameleon](https://twitter.com/damele0n)


## License

Paw.js is licensed under MIT licensed.  
See [LICENSE](https://github.com/dameleon/paw.js/blob/master/LICENSE) for more information.
