var doc = document.querySelector('link[rel="import"]').import;
var Box = Object.create(HTMLElement.prototype);

var FLIP_INCLINE = 37;

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
  this.classList.add('scene');

  console.info('scene');

  this.card = this.querySelector('.card');
  this.orient();
};

Box._handleOrientationChange = function(e) {
  var angles = this._normalizeAngles(e);
  var incline = Math.abs(angles[2]);
  console.info(incline);

  this._flipIf(incline);
};

Box._flipIf = function(incline){
  if(incline > FLIP_INCLINE) {
    this._flip();
  }

  if(incline < FLIP_INCLINE ) {
    this._flipped = false;
  }
}
Box._flip = function() {
  if(this._flipped) { return; }

  this.card.classList.toggle('flipped');
  this._flipped = true;
};

Box._normalizeAngles = function(e) {
  return _.chain([e.alpha, e.beta, e.gamma])
    .map(function(angle){ return Math.floor(angle); })
    .value();
};

Box._checkFlip = function(angles) {
  console.log('checking flip', angles);
}

Box._position = function(angles) {
  var rotate = {
    rotateX: angles[1],
    rotateZ: -angles[2],
    rotateZ: angles[2]
  };

  var css = _.chain(rotate)
    .pairs()
    .map(function(pair){ return pair[0] + '(' + pair[1] + 'deg)'; })
    .value()
    .join(' ');

  console.log(css);
  //this.card.style['-webkit-transform'] = css;
};

Box.orient = function() {
  if('DeviceOrientationEvent' in window) {
    var that = this;
    that._angles = [0,0,0];

    console.info('tracking orientation');

    var handler = _.throttle(this._handleOrientationChange, 50).bind(this);
    window.addEventListener('deviceorientation', handler, true);

  } else {
    this._setStatus('no device orientation');
  }
};
//module.exports = Box;
