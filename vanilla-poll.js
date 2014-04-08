//Thanks MDN! https://developer.mozilla.org/en-US/docs/DOM/document.cookie
(function() {
    var cookieLib = {
        getItem: function(sKey) {
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                return false;
            }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                        break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                        break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        }
    }
    window.cookieLib = cookieLib;
})();

function PollingWidget(context) {

    var that = this;

    var default_template_func = function(poll_data) {

        var el = that.getElement();
        var question = el.querySelector('#poll-question');
        var choices = el.querySelectorAll('.poll-choice');
        var results = el.querySelectorAll('.poll-result');

        if (question) question.innerHTML = poll_data.question;

        for (var selection in choices) {
            if (!isNaN(selection))
                choices[selection].innerHTML = poll_data.choices[selection].title;
        }

        for (var selection in results) {
            if (!isNaN(selection)) {
                results[selection].innerHTML = poll_data.choices[selection].title + ": " + poll_data.choices[selection].count + " which is " + poll_data.choices[selection].percent + " percent";
            }
        }

        return el.innerHTML;
    }

    this.options = {
        el: context.el || '#polling-widget',
        url: context.url || '',
        template: context.template || default_template_func,
        localStorage: context.localStorage || false,
        poll: context.poll || null
    };

    this.poll = context.poll;


    this.changeEvent = new Event('poll-change');
    this.getElement().addEventListener('poll-change', function(e) {
        that.render(that.poll);
        that.bindToEvents();
    });


    this.bindToEvents = function() {
        var choice_options = that.getElement().querySelectorAll('.poll-choice');
        var forEach = Array.prototype.forEach;

        if (choice_options) {
            forEach.call(choice_options, function(choice) {
                var selection = choice.getAttribute('data-id');
                choice_options[selection] = that.getElement();
                choice.addEventListener('click', function(e) {
                    e.preventDefault();
                    that.updateSelection(selection);
                    that.getElement().dispatchEvent(that.changeEvent);
                });
            });
        }
    };

    this.init = function() {
        cookieLib.setItem('poll-vote', 'true');
        if (!that.poll) {
            that.loadPoll(that.bindToEvents);
        } else {
            that.render(that.poll);
            that.bindToEvents();
        }
    };
}


PollingWidget.prototype.getElement = function() {
    return document.getElementById(this.options.el.replace(/^#/, ''));
}

PollingWidget.prototype.fetchPoll = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = readyCheck;

    function readyCheck() {
        if (xhr.readyState < 4 || xhr.status !== 200) return;
        if (xhr.readyState == 4) callback(xhr)
    }

    xhr.open('GET', url, true);
    xhr.send(null);
}

PollingWidget.prototype.save = function(poll_data) {
    var that = this;
    var saved_poll = poll_data || this.poll;
    this.poll = saved_poll;
    if (this.options.localStorage) {
        localStorage.removeItem('poll');
        localStorage.setItem('poll', JSON.stringify(saved_poll));
    }
    if (this.options.url) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                    console.log('save successfull');
                else {
                    console.log('error saving - defaulting to load from local storage');
                    that.options.url = '';
                    that.options.localStorage = true;
                }
            }
        }

        xhr.open('POST', this.url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(poll_data));
    }
}

PollingWidget.prototype.loadPoll = function(callback) {

    if (!this.options.url && this.options.localStorage) {
        var loaded = JSON.parse(localStorage.getItem('poll'));
        this.render(loaded);
        this.poll = loaded;
        callback();

    } else if (this.options.url) {
        var that = this;
        this.fetchPoll(this.options.url, onLoad);

        function onLoad(xhr) {
            var loaded = JSON.parse(xhr.responseText);
            that.render(loaded);
            that.poll = loaded;;
            callback();
        }
    } else {
        var default_poll = {
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
        this.render(default_poll);
        this.poll = default_poll;
        callback();
    }
};

PollingWidget.prototype.render = function(poll_data) {
    var html = this.options.template(poll_data);
    this.getElement().innerHTML = html;
}

PollingWidget.prototype.updateSelection = function(id) {
    if (!cookieLib.getItem('poll-vote')) {
        this.poll.choices[id].count++;
        this.recalibrate();
        this.save(this.poll);
    } else {
        console.log('already voted');
    }

}

PollingWidget.prototype.recalibrate = function() {
    this.poll.total = 0;
    var choice_arr = this.poll.choices;
    for (var i in choice_arr)
        this.poll.total += choice_arr[i].count;
    for (var j in choice_arr)
        this.poll.choices[j].percent = Math.round((this.poll.choices[j].count / this.poll.total) * 100);
}
