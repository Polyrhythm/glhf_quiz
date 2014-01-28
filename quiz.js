// get "current document" (with template) via the parent
var doc = document.querySelector('link[rel="import"]').import;
var Quiz = Object.create(HTMLElement.prototype);

Quiz.currentQuestion = 0;
Quiz.numCorrect = 0;

Quiz.nextQuestion = function() {
  // still answers to display
  if (this.currentQuestion + 1 < this.data.length) {
    Quiz.currentQuestion += 1;
    this.querySelector('.question').innerHTML = this.data[this.currentQuestion].question;
    this.updateStats();
  } else {
    this.displayResults();
  }
};

Quiz.displayResults = function() {
  this.querySelector('.quiz-container').className = 'result-container';
  this.querySelector('.result-container').innerHTML = 'YOU GOT ' +
    this.numCorrect + ' OUT OF ' + (this.currentQuestion + 1) + '!';
};

Quiz.updateStats = function() {
  this.querySelector('.score').innerHTML = this.numCorrect + '/' + this.currentQuestion;
};

// This callbacks should not be exposed to developer
// and must stay in boilerplate layer
Quiz.createdCallback = function() {
  this._template = doc.querySelector('template').content;
  window.quiz = this; // debug
};

Quiz.attachedCallback = function() {
  this.appendChild(document.importNode(this._template, true));
  this._init();
  this._delegateEvents();

  console.info('ready');
};

// display the initial question
Quiz._init = function() {
  this.querySelector('.question').innerHTML = this.data[this.currentQuestion].question;
};

// TODO: removedCallback and undelegate events are needed
Quiz._delegateEvents = function() {
  var buttons = this.querySelectorAll('button');
  function answerEvent(e) {
    e.preventDefault();
    // correct
    if (e.target.getAttribute('data-value') === this.data[this.currentQuestion].answer) {
      this.numCorrect += 1;
    } else {
      // incorrect
    }
    return this.nextQuestion();
  }

  // have to manually attach listener to each button element
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', answerEvent.bind(this));
  }
};

Quiz.data = [
  {
    question: 'The more mass Earth gains, the higher you can jump off the ground.',
    answer: 'false'
  },
  {
    question: 'Internet Explorer is known for having the most progressive web standards.',
    answer: 'false'
  },
  {
    question: 'Cats drink milk by creating an upward-rising liquid column by use of their tongues.',
    answer: 'true'
  }
];
