// get "current document" (with template) via the parent
var _doc = (document.currentScript || document._currentScript).ownerDocument;
var _template = function(){ return document.importNode(_doc.querySelector('template').content, true) };
var _questionTemplate = function(){ return document.importNode(_doc.querySelector('[ref="question"]').content, true); }
var QuizPrototype = Object.create(HTMLElement.prototype);

//TODO: Extract to GBox
QuizPrototype.createdCallback = function(){
  // Ooops...
  //
  // Read default config from HTML upon instantiation
  //
  var script = document.querySelector('script');
  if(script) {
    this._defaultConfig = JSON.parse(script.textContent);
  }
  this.removeChild(script);
};

QuizPrototype.attachedCallback = function() {
  //Render layout
  this.appendChild(_template());

  // TODO:
  //
  // Extract to GBox
  this.ui = {}

  this.ui.header = function(text){ return this.querySelector('header > label').textContent = text; }.bind(this);
  this.ui.questions = function(){ return this.querySelector('.questions'); }.bind(this);
  this.ui.questions.empty = function(){ this.ui.questions.innerHTML = ''; }.bind(this);
  this.ui.currentQuestion = function(){ return this.querySelector('section.current'); }.bind(this);

  this.ui.total = function(text) { this.querySelector('[ref="total"]').textContent = text; }.bind(this);
  this.ui.answered = function(text) { this.querySelector('[ref="answered"]').textContent = text; }.bind(this);
  this.ui.correct = function(text) { this.querySelector('[ref="correct"]').textContent = text; }.bind(this);

  this._delegateEvents();

  // Render first time, if we have default config
  if (this._defaultConfig) {
    this.onConfigSet(this._defaultConfig);
  }
};

QuizPrototype._delegateEvents = function(){
  this.addEventListener('click', function(e){
    if(e.toElement.className == 'answer') {
      this.answer(e.toElement.value);
    };

    if(e.toElement.getAttribute('ref') == 'reset') {
      this.reset();
    };

    if(e.toElement.getAttribute('ref') == 'start') {
      this.start();
    };

    e.stopPropagation();
  });
};

QuizPrototype.onConfigSet = function(quiz){
  this.ui.header(quiz.title);
  this.ui.total(quiz.questions.length);

  this.ui.questions.empty();
  quiz.questions.forEach(this.onQuestionAdded.bind(this));

  this._correctAnswers = quiz.questions.map(function(q) { return q.correctAnswer; });
  this.reset();
};

QuizPrototype.onQuestionAdded = function(question) {
  var template = _questionTemplate();
  template.querySelector('p').textContent = question.title;

  //question.querySelector('label').textContent = question.title;
  this.ui.questions().appendChild(template);
};

QuizPrototype.start = function(){
  this.reset();

  this.classList.add('started');
  this.querySelector('.questions section').classList.add('current');
};

QuizPrototype.reset = function(){
  this._answers = [];
  this._correct = 0;

  this.ui.answered(0);
  this.ui.correct(0);

  this.classList.remove('started', 'completed');

  var current = this.ui.currentQuestion();
  if(current) {
    current.classList.remove('current');
  };
};

QuizPrototype.answer = function(value) {
  var answer = (value == 'True!');

  this._answers.push(answer);

  if(this.lastAnswerIsCorrect()) {
    this._correct++;
    this.ui.correct(this._correct);
  };

  this.ui.answered(this._answers.length);

  var current = this.ui.currentQuestion()
  current.classList.add('answered');
  current.classList.remove('current');

  var next = current.nextElementSibling;
  if(next) {
    next.classList.add('current');
  } else {
    this.complete();
  }
};

QuizPrototype.lastAnswerIsCorrect = function(){
  var index = this._answers.length - 1;
  return this._answers[index] == this._correctAnswers[index];
};

QuizPrototype.complete = function(){
  this.classList.add('completed');
};

var VsQuiz = document.registerElement('vs-quiz', { prototype: QuizPrototype });
