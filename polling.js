function PollingWidget(options, poll) {

    var that = this;

    var default_template_func = function(poll) {
        var el = document.getElementById(this.el.replace(/^#/, ''));
        var forEach = Array.prototype.forEach;

        console.log('in default templating');


        var question = el.querySelector('#poll-question');
        var choices = el.querySelectorAll('.poll-choice');
        var results = el.querySelectorAll('.poll-result');

        if (question) {
            question.innerHTML = poll.question;
        }

        var i = 0;

        for (var selection in choices) {
            if (!isNaN(selection)) {
                choices[selection].innerHTML = poll.choices[i].title;
            }
            i++;
        }

        var j = 0;
        for (var selection in results) {
            console.log(results);
            if (!isNaN(selection)) {
                results[selection].innerHTML = poll.choices[j].title + ": " + poll.choices[j].count + " which is " + poll.choices[j].percent
            }
            j++;
        }
        return el.innerHTML;

    }

    this.options = {
        el: options.el || '#polling-widget',
        url: options.url || '',
        template: options.template || default_template_func,
        localStorage: options.localStorage || false,
    };

    if (poll) {
        this.poll = poll;
        this.render(poll);
        this.bindPollToEvents(this.el);
    } else {
        this.poll = this.loadPoll(options);
    }

    this.changeEvent = new Event('poll-change');

    this.getElement().addEventListener('poll-change', function(e) {
        that.render(that.poll);
        that.bindPollToEvents(that.getElement());
    }, false);


}

PollingWidget.prototype.getElement = function() {
    return document.getElementById(this.options.el.replace(/^#/, ''));
}



PollingWidget.prototype.loadPoll = function(options) {
    if (options.localStorage) {
        var poll = JSON.parse(localStorage.getItem("poll"));
        this.render(poll);
        this.bindPollToEvents(this.getElement());
        return poll;
    } else if (options.url) {
        fetchPoll(options.url, callback);

        function callback(xhr) {
            var poll = JSON.parse(xhr.responseText);
            this.render(poll);
            this.bindPollToEvents(this.el);
            return poll;
        }
    } else {
        var poll = {
            "question": "Did I want a default data model?",
            "choices": [{
                    "title": "Yes",
                    "count": 10,
                    "percent": 0
                    },
                {
                    "title": "No",
                    "count": 20,
                    "percent": 0
                    }],
            "total": 0
        };
        this.render(poll);
        this.bindPollToEvents(this.el);
        return poll;
    }

}

PollingWidget.prototype.render = function(poll) {
    var html = this.options.template(poll);
    var el = document.getElementById(this.options.el.replace(/^#/, ''));
    el.innerHTML = html;
};

PollingWidget.prototype.bindPollToEvents = function(el) {
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
                that.getElement().dispatchEvent(that.changeEvent);
            });
        });
    }
};

PollingWidget.prototype.updateSelection = function(id) {
    this.poll.choices[id].count++;
    this.recalibratePoll();
    this.save(this.poll);
};

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
};

PollingWidget.prototype.save = function(poll) {
    console.log('saving poll...');
    if (this.options.localStorage) {
        console.log('... to local storage');
        localStorage.removeItem('poll');
        localStorage.setItem('poll', JSON.stringify(poll));
    } else if (this.options.url) {
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
        xhr.send(JSON.stringify(poll));

    }
};

function fetchPoll(url, callback) {

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

};

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

var c_template = Handlebars.compile(document.getElementById('poll-template').innerHTML);

var myPoll = new PollingWidget({
    localStorage: true
});
