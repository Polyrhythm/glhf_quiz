var doc = document.querySelector('link[rel="import"]').import;
var Box = Object.create(HTMLElement.prototype);

var FLIP_INCLINE = 8;
var THRESHOLD = 5;

Box.createdCallback = function(){
  this._template = doc.querySelector('template').content;

  //debug with window.box
  window.box = this;

  this.refs = _.chain(this._refs)
    .indexBy(function(ref){
      console.log(ref);
    });

  if('function' === typeof(this.steady)) {
    this.steady.call(this);
  }
}

Box.attachedCallback = function() {
  this.appendChild(document.importNode(this._template, true));

  console.info('ready');

  this.card = this.querySelector('.card');
  this._startOrienting();
};

Box._startOrienting = function() {
  if('DeviceOrientationEvent' in window) {
    var that = this;
    that._angles = [0,0,0];

    var handler = _.throttle(this._handleOrientationChange, 50).bind(this);
    window.addEventListener('deviceorientation', handler, true);
  } else {
    this._setStatus('no device orientation');
  }
};

Box._handleOrientationChange = function(e) {
  var angles = this._normalizeAngles(e);
  //var vector = toVector(angles);
};

Box._normalizeAngles = function(e) {
  return _.chain([e.alpha, e.beta, e.gamma])
    .map(function(angle){
      return toRadians(angle);
    })
    .value();
};

//module.exports = Box;
// Non-relevant stuff

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

function toVector(angles) {
  var a = angles[0];
  var b = angles[1];
  var g = angles[2];

  var x = - Math.cos(a) * Math.sin(g) - Math.sin(a) * Math.sin(b) * Math.cos(g);
  var y = - Math.sin(a) * Math.sin(g) + Math.cos(a) * Math.sin(b) * Math.cos(g);
  var z = - Math.cos(b) * Math.cos(g);

  return _.map([x, y, z], function(n) { return +n.toFixed(2); });
}
