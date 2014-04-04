 function PollingWidget(poll, template_func) {

     var that = this;

     if (typeof poll == 'string' || poll instanceof String) {
         loadPoll(poll, function(xhr) {
             that.poll = JSON.parse(xhr.responseText);
             var el = that.renderChoices(template_func);
             that.bindPollToChoices(el);
         });
     } else if (typeof poll == 'object' || poll instanceof Object) {
         this.poll = poll;
         this.bindPollToChoices(el);
     } else {
         console.log("Poll argument not recognized; functionality may break");
         this.poll = poll;
         this.bindPollToChoices(el);
     }
 }

 PollingWidget.prototype.renderChoices = function(template_func) {
     var html = template_func(this.poll);
     document.getElementById('polling-widget').innerHTML = html;
     return document.getElementById('poll-choices');
 }

 PollingWidget.prototype.bindPollToChoices = function(el) {
     this.choices = el.querySelectorAll('.poll-choice');
     var forEach = Array.prototype.forEach;
     var that = this;

     if (this.choices) {
         forEach.call(that.choices, function(el) {
             var selection = el.getAttribute('data-id');
             that.choices[selection] = el;
             el.addEventListener('click', function(e) {
                 e.preventDefault();
                 that.recalibratePoll();
             });
         });
     }
 };

PollingWidget.prototype.recalibratePoll = function() {
    this.poll.total = 0;
    var choice_arr = this.poll.choices;
    for(var i in choice_arr) {
        this.poll.total += choice_arr[i].count;

    }

    console.log(this.poll.total);

    for(var j in choice_arr) {
        var percent = Math.round((this.poll.choices[j].count/this.poll.total)*100);
        this.poll.choices[j].percent = percent
    }
};

 function loadPoll(url, callback) {
     console.log('loading');

     xhr = new XMLHttpRequest();

     xhr.onreadystatechange = callbackCheck;

     function callbackCheck() {
         if (xhr.readyState < 4) {
             return;
         }

         if (xhr.status !== 200) {
             return;
         }

         if (xhr.readyState == 4) {
             console.log('calling back');
             callback(xhr);
         }
     }

     xhr.open('GET', url, true);
     xhr.send(null);

 }


 var poll = {
     "question": "Did I want a fake data model?",
     "choices": [{
         "title": "Yes",
         "count": 10,
         "percent": 0
        }, {
         "title": "No",
         "count": 20,
         "percent": 0
        }],
     "total": 0
 };

 var template = Handlebars.compile(document.getElementById('choice-template').innerHTML);
 var myPoll = new PollingWidget('data.json', template);
