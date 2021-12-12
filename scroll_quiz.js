// ==UserScript==
// @name        Scroll a Quiz
// @namespace   https://github.com/justinshewell/canvas
// @description This program allows the user to quickly scroll to quiz items that need review
// @include     https://*.instructure.com/courses/*/gradebook/speed_grader*
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';

  const pageRegex = new RegExp('^/courses/[0-9]+/gradebook/speed_grader');
  if (!pageRegex.test(window.location.pathname)) {
    return;
  }

  var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
          [].filter.call(mutation.addedNodes, function (node) {
              return node.nodeName == 'IFRAME';
          }).forEach(function (node) {
              node.addEventListener('load', function (e) {
                  console.log('loaded: ' + node.src);
                  addScrollButtons();
              });
          });
      });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function addScrollButtons() {
      $.widget('ui.dialog', $.extend({}, $.ui.dialog.prototype, {
          _title: function(title) {
              var $title = this.options.title || '&nbsp;'
              if( ('titleIsHtml' in this.options) && this.options.titleIsHtml == true )
                  title.html($title);
              else title.text($title);
          }
      }));
      $('#justin-buttons').remove();
      $('body').append('<div id="justin-buttons" data-qnum="-1"><small>Click the title bar above to drag this box anywhere on the screen.<br><br>These buttons scroll to questions that are marked incorrect or ungraded that are not multiple-choice, true/false, or matching questions, allowing you to easily review questions for grading without having to scroll yourself.</small><p style="text-align: center; margin-top: 20px;"><button id="justin-first" disabled>&lt;&lt; First</button> &nbsp; &nbsp; <button id="justin-previous" disabled>&lt; Previous</button> &nbsp; &nbsp; <button id="justin-next">Next &gt;</button> &nbsp; &nbsp; <button id="justin-last">Last &gt;&gt;</button></p></div>');
      $('#justin-buttons').dialog({
          height: 240,
          width: 450,
          title: 'Scroll Quiz Questions',
          titleIsHtml: true,
          resizable: true,
          draggable: true,
          dialogClass: 'alertDialog',
          modal: false,
          show: {
              effect: 'shake',
              duration: 1000
          }
      });
      $('#justin-first').on('click', function() {
          var iframe = $('#speedgrader_iframe');
          var curQuestion = 0;
          var top = $(iframe).contents().find('.question:not(.matching_question, .multiple_choice_question, .true_false_question, .correct)').first().offset().top;
          $(iframe).contents().children().animate({scrollTop: top}, 500);
          $('#justin-next, #justin-last').prop('disabled', false);
          $('#justin-previous, #justin-first').prop('disabled', true);
          $('#justin-buttons').attr('data-qnum', curQuestion);
      });
      $('#justin-next').on('click', function() {
          var iframe = $('#speedgrader_iframe');
          var curQuestion = $('#justin-buttons').attr('data-qnum');
          console.log(curQuestion);
          var els = $(iframe).contents().find('.question:not(.matching_question, .multiple_choice_question, .true_false_question, .correct)');
          console.log(els);
          curQuestion++;
          if(curQuestion >= els.length) return false;
          if(curQuestion > 0) $('#justin-first, #justin-previous').prop('disabled', false);
          if(curQuestion == els.length - 1) $('#justin-next, #justin-last').prop('disabled', true);
          var top = $(els[curQuestion]).offset().top;
          console.log(top);
          $(iframe).contents().children().animate({scrollTop: top}, 500);
          $('#justin-buttons').attr('data-qnum', curQuestion);
      });
      $('#justin-previous').on('click', function() {
          var iframe = $('#speedgrader_iframe');
          var curQuestion = $('#justin-buttons').attr('data-qnum');
          var els = $(iframe).contents().find('.question:not(.matching_question, .multiple_choice_question, .true_false_question, .correct)');
          curQuestion--;
          if(curQuestion < 0) return false;
          if(curQuestion == 0) $('#justin-first, #justin-previous').prop('disabled', true);
          if(curQuestion < els.length - 1) $('#justin-next, #justin-last').prop('disabled', false);
          var top = $(els[curQuestion]).offset().top;
          $(iframe).contents().children().animate({scrollTop: top}, 500);
          $('#justin-buttons').attr('data-qnum', curQuestion);
      });
      $('#justin-last').on('click', function() {
          var iframe = $('#speedgrader_iframe');
          var els = $(iframe).contents().find('.question:not(.matching_question, .multiple_choice_question, .true_false_question, .correct)');
          var curQuestion = $('#justin-buttons').attr('data-qnum');
          curQuestion = els.length - 1;
          var top = $(els[curQuestion]).offset().top;
          $(iframe).contents().children().animate({scrollTop: top}, 500);
          $('#justin-buttons').attr('data-qnum', curQuestion);
          $('#justin-next, #justin-last').prop('disabled', true);
          $('#justin-previous, #justin-first').prop('disabled', false);
      });
  }
})();
