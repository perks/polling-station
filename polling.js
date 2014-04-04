 function PollingWidget(poll) {

     var that = this;

     if (typeof poll == 'string' || poll instanceof String) {
         loadPoll(poll, function(xhr) {
             this.poll = JSON.parse(xhr.responseText);
         });
     } else if {
         typeof poll == 'object' || poll instanceof Object) {
         this.poll = poll;
     } else {
         console.log("Poll argument not recognized; functionality may break");
         this.poll = poll;
     }

 }

 PollingWidget.prototype.bindPoll = function(el) {
     var choices = el.querySelectAll('div.poll-result');
     var forEach = Array.prototype.forEach;

     if (choices) {
         forEach.call(choices, function(el) {
             var selection = el.getAttribute('data-id');
             that.choices[selection] = el;
             el.addEventListener('click', function(e) {
                 e.preventDefault();
                 console.log('I got clicked on id: ' + selection);
             });
         });
     }

 };


 function loadPoll(url, callback) {

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

 var template = Handlebars.compile(document.getElementById('choice-template').innerHTML());
 var myPoll = new PollingWidget('data.json');
 var el = template(myPoll.poll);
