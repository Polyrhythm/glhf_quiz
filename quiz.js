// get "current document" (with template) via the parent
var _link = document.querySelector('link[href="quiz.html"]');
var _doc = _link.import;

// setup templating
// TODO: maybe extract to gbox?
var _template = function(){ return document.importNode(_doc.querySelector('template').content, true) };
var _questionTemplate = function(){ return document.importNode(_doc.querySelector('[ref="question"]').content, true); }

var QuizPrototype = Object.create(HTMLElement.prototype);

//TODO: Extract to GBox
QuizPrototype.createdCallback = function(){
  this._correctAnswers = [];
  this._answers = [];

  // Ooops...
  //
  // Read default config from HTML upon instantiation
  //
  var script = this.querySelector('script[type="props/json"]');
  if(script) {
    this._defaultConfig = JSON.parse(script.textContent);
    this.removeChild(script);
  }
};

QuizPrototype.attachedCallback = function() {
  //Render layout
  this.appendChild(_template());

  // TODO:
  //
  // Extract to GBox
  this.ui = {};

  this.ui.questions = function(){ return this.querySelector('.questions'); }.bind(this);
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
    if(e.target.className == 'answer') {
      this.answer(e.target.dataset.answer == 'true');
    };

    if(e.target.hasAttribute('ref')) {
      var ref = e.target.getAttribute('ref');

      if(ref == 'reset') {
        this.reset();
      };

      if(ref == 'start') {
        this.start();
      };
    }

    e.stopPropagation();
  });
};

QuizPrototype.onConfigSet = function(quiz){
  this.setTitle(quiz.title);

  this.clearQuestions();
  quiz.questions.forEach(this.addQuestion.bind(this));

  this.reset();
};

QuizPrototype.setTitle = function(title) {
  this.querySelector('header > label').textContent = title;
};

QuizPrototype.clearQuestions = function(){
  this.ui.questions().innerHTML = '';
  this.ui.total(0);
};

QuizPrototype.addQuestion = function(question) {
  var template = _questionTemplate();
  template.querySelector('p').textContent = question.title;
  this._correctAnswers.push(question.correctAnswer);

  //question.querySelector('label').textContent = question.title;
  this.ui.questions().appendChild(template);
  this.ui.total(this.ui.questions().children.length);
};

QuizPrototype.start = function(){
  this.reset();

  this.classList.add('started');
  this.querySelector('.questions section').classList.add('current');
};

QuizPrototype.reset = function(){
  this._answers = [];

  this.ui.answered(0);
  this.ui.correct(0);

  this.classList.remove('started', 'completed');

  var current = this.ui.currentQuestion();
  if(current) {
    current.classList.remove('current');
  };
};

QuizPrototype.complete = function(){
  this.classList.add('completed');
};

QuizPrototype.answer = function(answer) {
  this._answers.push(answer);

  this.ui.correct(this.correctAnswerCount());
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

QuizPrototype.correctAnswerCount = function(){
  var correctAnswers = this._correctAnswers;
  var cnt = 0;

  this._answers.forEach(function(answer, i) {
    if(correctAnswers[i] == answer) { cnt++; }
  });
  return cnt;
};

var VsQuiz = document.registerElement('vs-quiz', { prototype: QuizPrototype, extends: 'div' });
