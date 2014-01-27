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

  console.info('scene');

  this.card = this.querySelector('.card');
  this.orient();
};

Box._handleOrientationChange = function(e) {
  var angles = this._normalizeAngles(e);
  var attack = angles[1];
  var incline = Math.floor(angles[2] / (1 + attack / 10));
  console.info(incline);

  this._flipIf(incline);
};

Box._flipIf = function(incline){
  var sign = incline < 0 ? -1 : 1;
  var angle = Math.abs(incline);

  if(angle > FLIP_INCLINE) {
    this._flip(sign);
  }

  if(angle <= FLIP_INCLINE ) {
    this._flipped = false;
  }
}

Box._flip = function(sign) {
  if(this._flipped) { return; }

  this.card.classList.toggle('flipped');

  this._flipped = true;
  console.info('flipped');
};

Box._normalizeAngles = function(e) {
  return _.chain([e.alpha, e.beta, e.gamma])
    .map(function(angle){
      var sign = (angle >= 0) ? 1 : -1;
      return (Math.abs(angle) > THRESHOLD) ? angle - sign * THRESHOLD : 0; })
    .map(function(angle){
      return Math.floor(angle);
    })
    .value();
};

Box.orient = function() {
  if('DeviceOrientationEvent' in window) {
    var that = this;
    that._angles = [0,0,0];

    var handler = _.throttle(this._handleOrientationChange, 50).bind(this);
    window.addEventListener('deviceorientation', handler, true);

  } else {
    this._setStatus('no device orientation');
  }
};
//module.exports = Box;
