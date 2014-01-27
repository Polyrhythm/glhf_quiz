var doc = document.querySelector('link[rel="import"]').import;
var Box = Object.create(HTMLElement.prototype);

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
  this.textContent = 'ready';
  this.appendChild(document.importNode(this._template, true));
  this.classList.add('scene');
};

Box.handleOrientationChange = function(e) {
  this._setStatus('orientation changed');
  var angles = this._normalizeAngles(e);

  var dark = (angles.gamma < -120);
  this._setSide(dark);

  var tds = this.querySelectorAll('td');

  tds[0].textContent = angles.alpha;
  tds[1].textContent = angles.beta;
  tds[2].textContent = angles.gamma;

  this._setTransform(e);
};

Box.normalizeAngles = function(e) {
  return {
    alpha: Math.floor(e.alpha),
    beta: Math.floor(e.beta),
    gamma: Math.floor(e.gamma)
  };
};

Box._setTransform = function(angles) {
  var str = 'rotate(' + Math.floor(angles.alpha) + 'deg)';
  str += ' skew(' + Math.floor(angles.gamma) + 'deg)';
  //this._status.textContent = str;
  this._status.style['-webkit-transform'] = str;
};

Box._enableOrientation = function() {
  if('DeviceOrientationEvent' in window) {
    var that = this;

    window.addEventListener('deviceorientation', function(e) { that._handleOrientationChange(e); }, true);
  } else {
    this._setStatus('no device orientation');
  }
};
//module.exports = Box;
