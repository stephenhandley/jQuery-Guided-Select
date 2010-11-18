/*
* jQuery Smart Text Inputs
* Copyright 2010 Stephen Handley
* http://person.sh
* Released under the MIT and GPL licenses.
 */


// TODO: add optional autocomplete to userInput
(function($) {
  $.guidedSelect = function(container, options) { this.init(container, options); };

  $.extend($.guidedSelect.prototype, {
    settings: {
      eventSmoothingIntervalTime: 200,
      name: null,
      options: null,
      prompt: null,
      userInputPrompt: null
    },
    
    container: null,
    optionsContainer: null,
    promptContainer: null,
    userInput: null,
    hiddenInput: null,
    eventSmoothingIntervalId: null,
        
    init: function(container, options) {
      $.extend(this.settings, options);
      this.build(container);
      this.wire();
    },
    
    build: function (container) {
      this.container = $(container);
      
      var html = '<input type="hidden" name="' + this.settings.name + '"/>';
      html += '<div class="options closed">';
      html += '<div class="prompt selected">' + this.settings.prompt + '</div>';
      $.each(this.settings.options, function (i, option) {
        html += '<div class="option" data-value="' + option[1] + '"><a href="#">' + option[0] + '</a></div>';
      });
      html += '<div class="option user-input">';
      html += '<input type="text" name="other" data-prompt-blur="' + this.settings.userInputPrompt + '"/>';
      html += '</div>';
      html += '</div>';
      
      this.container.append($(html));
      
      this.optionsContainer = this.container.find('.options');
      this.promptContainer = this.container.find('.prompt'); 
      this.userInput = this.optionsContainer.find('.user-input input');
      this.hiddenInput = this.container.find('input[type=hidden]');
    },
    
    
    wire: function () {
      var self = this;
      
      this.optionsContainer.find('.option a').click(function () {
        self.clearEventSmoothing();
        var option = $(this).parent();
        
        if (self.isSelected(option)) {
          self.open();
        } else {
          self.select(option);
          self.close();
        }
        return false;
      });
      
      this.userInput.focus(function () {
        self.clearEventSmoothing();
        self.open();
      }).blur(function () {
        self.smoothEvent(self.userInputBlur);
      }).keypress(function (event) {
        if (event.keyCode == '13') { // return 
          $(this).trigger('blur');
          event.preventDefault();
        } else if (event.keyCode == '27') { // escape
          $(this).trigger('blur');
          event.preventDefault();
        }
      });
      
      this.promptContainer.click(function (event) {
        self.toggle();
      });
      
      var previousInput = this.container.prevAll('input, textarea, select');
      if (previousInput.length) {
        previousInput.first().keypress(function (event) {
          if (event.keyCode == '9') { // tab 
            self.open();
            event.preventDefault();
          }
        });
      }
    },
    
    toggle: function() {
      if (this.isOpen()) {
        this.reset();
      } else {
        this.open();
      }
    },
    
    open: function () {
      this.optionsContainer.removeClass('closed');
      return this;
    },
    
    close: function () {
      this.optionsContainer.addClass('closed');
      return this;
    },
    
    isOpen: function () {
      return !this.optionsContainer.is('.closed');
    },
    
    select: function (option) {
      var option = $(option);
      option  
        .addClass('selected')
        .siblings()
          .removeClass('selected');
      
      this.hiddenInput.val(option.attr('data-value'));
      this.close();
      
      return option;
    },
    
    isSelected: function (option) {
      return $(option).is('.selected');
    },
    
    userInputBlur: function () {
      if (this.userInput.smartInput('hasData')) {
        this.select(this.userInput.closest('.option'));
        this.hiddenInput.val(this.userInput.val());
      } else {
        this.reset();
      }
    },
    
    reset: function () {
      this.select(this.promptContainer);
      this.userInput.smartInput('reset');
      this.hiddenInput.val('');
    },
    
    smoothEvent: function (callback) {
      this.eventSmoothingIntervalId = setTimeout(jQuery.proxy(callback, this), this.settings.eventSmoothingIntervalTime);
    },
    
    clearEventSmoothing: function () {
      clearInterval(this.eventSmoothingIntervalId);
      this.eventSmoothingIntervalId = null;
    }
  });
    
  $.fn.guidedSelect = function(options) {
    this.each(function() {
      new $.guidedSelect(this, options);
    });
    return this;
  };
})(jQuery);