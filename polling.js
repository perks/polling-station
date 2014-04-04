 function PollingWidget(poll, c_template, r_template, local_flag) {

     var that = this;
     this.changeEvent = new Event('poll-change');
     this.url = "";
     this.use_local = local_flag || 0;

     this.el = document.getElementById('polling-widget');

     this.el.addEventListener('poll-change', function(e) {
         that.renderResults(r_template);
     }, false);

     if (typeof poll == 'string' || poll instanceof String) {
         this.url = poll;
         loadPoll(poll, function(xhr) {
             that.poll = JSON.parse(xhr.responseText);
             that.bindPollToChoices(that.renderChoices(c_template));
         });
     } else if (local_flag) {
        console.log('local loading');
         this.poll = JSON.parse(localStorage.getItem("poll"));
         this.bindPollToChoices(this.renderChoices(c_template));
     } else if (typeof poll == 'object' || poll instanceof Object) {
         this.poll = poll;
         this.bindPollToChoices(this.renderChoices(c_template));
     } else {
         console.log("Poll argument not recognized; functionality may break");
         this.poll = poll;
         this.bindPollToChoices(this.renderChoices(c_template));
     }

     console.log(this.poll.choices[0].count);
 }

 PollingWidget.prototype.render = function(template_func) {
     var html = template_func(this.poll);
     this.el.innerHTML = html;
 }

 PollingWidget.prototype.renderChoices = function(template_func) {
     this.render(template_func);
     return document.getElementById('poll-choices');
 }

 PollingWidget.prototype.renderResults = function(template_func) {
     this.render(template_func);
     return document.getElementById('poll-results');
 }

 PollingWidget.prototype.bindPollToChoices = function(el) {
     this.choices = el.querySelectorAll('.poll-choice');
     var forEach = Array.prototype.forEach;
     var that = this;

     if (this.choices) {
         forEach.call(that.choices, function(choice) {
             var selection = choice.getAttribute('data-id');
             that.choices[selection] = el;
             choice.addEventListener('click', function(e) {
                 e.preventDefault();
                 that.updateSelection(selection);
                 that.el.dispatchEvent(that.changeEvent);
             });
         });
     }
 }

 PollingWidget.prototype.updateSelection = function(id) {
     console.log(this.poll.choices[id].count);
     this.poll.choices[id].count++;
     console.log(this.poll.choices[id].count);
     this.recalibratePoll();
     this.save(this.poll);
 }

 PollingWidget.prototype.recalibratePoll = function() {
     this.poll.total = 0;
     var choice_arr = this.poll.choices;
     for (var i in choice_arr) {
         this.poll.total += choice_arr[i].count;

     }
     for (var j in choice_arr) {
         var percent = Math.round((this.poll.choices[j].count / this.poll.total) * 100);
         this.poll.choices[j].percent = percent
     }
 }

 PollingWidget.prototype.save = function() {
     console.log('saving poll...');
     if (this.use_local) {
         console.log('... to local storage');
         localStorage.removeItem('poll');
         localStorage.setItem('poll', JSON.stringify(this.poll));
     } else if (this.url) {
         console.log('... to url end point');

         xhr = new XMLHttpRequest();

         xhr.onreadystatechange = function() {
             if (xhr.readyState == 4 && xhr.status == 200)
                 console.log('save successfull!');
             else
                 console.log('error saving to url endpoint');
         }

         xhr.open('POST', this.url, true);
         xhr.setRequestHeader("Content-Type", "application/json");
         xhr.send(JSON.stringify(this.poll));

     }
 }

 function loadPoll(url, callback) {
     console.log('loading poll...');

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

 var c_template = Handlebars.compile(document.getElementById('choices-template').innerHTML);
 var r_template = Handlebars.compile(document.getElementById('results-template').innerHTML);
 var myPoll = new PollingWidget(null, c_template, r_template, 1);
