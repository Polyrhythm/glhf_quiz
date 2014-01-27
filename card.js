// get "current document" (with template) via the parent
var doc = document.querySelector('link[rel="import"]').import;
var Card = Object.create(HTMLElement.prototype);

Card.flip = function(){
  this.querySelector('.card').classList.toggle('open');
}

// This callbacks should not be exposed to developer
// and must stay in boilerplate layer
Card.createdCallback = function(){
  this._template = doc.querySelector('template').content;
  window.card = this; //for ease of debug. e.g.: "card.flip()" in console
}

Card.attachedCallback = function() {
  this.appendChild(document.importNode(this._template, true));
  this._delegateEvents();

  console.info('ready');
  //this._startOrienting();
};

// TODO: removedCallback and undelegate events are needed
Card._delegateEvents = function(){
  this.querySelector('.card').addEventListener('click', this.flip.bind(this));
}
