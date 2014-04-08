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
        },
        removeItem: function(sKey, sPath, sDomain) {
            if (!sKey || !this.hasItem(sKey)) {
                return false;
            }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function(sKey) {
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
    }
    window.cookieLib = cookieLib;
})();

function PollingWidget(context) {

    var that = this;

    var default_template_func = function(poll_data) {

        var el = that.getElement();
        var question = el.querySelector('#poll-question');
        var answers = el.querySelectorAll('.poll-answer');
        var results = el.querySelectorAll('.poll-result');

        if (question) question.innerHTML = poll_data.question;

        for (var selection in answers) {
            if (!isNaN(selection))
                answers[selection].innerHTML = poll_data.answers[selection].value;
        }

        for (var selection in results) {
            if (!isNaN(selection)) {
                results[selection].innerHTML = poll_data.answers[selection].value + ": " + poll_data.answers[selection].count + " which is " + poll_data.answers[selection].percent + " percent";
            }
        }

        return el.innerHTML;
    }

    this.options = {
        id: context.id || 1,
        el: context.el || '#polling-widget',
        url: context.url || '',
        template: context.template || default_template_func,
        localStorage: context.localStorage || false,
        poll: context.poll || null
    };

    this.poll = context.poll;
    this.id = this.options.id;


    this.changeEvent = new Event('poll-change');
    this.getElement().addEventListener('poll-change', function(e) {
        that.render(that.poll);
        that.bindToEvents();
    });


    this.bindToEvents = function() {
        var answer_options = that.getElement().querySelectorAll('.poll-answer');
        var forEach = Array.prototype.forEach;

        if (answer_options) {
            forEach.call(answer_options, function(answer) {
                var selection = answer.getAttribute('data-id');
                answer_options[selection] = that.getElement();
                answer.addEventListener('click', function(e) {
                    e.preventDefault();
                    that.updateSelection(selection);
                    that.getElement().dispatchEvent(that.changeEvent);
                });
            });
        }
    };

    this.init = function() {
        if(cookieLib.getItem('poll-vote')) cookieLib.removeItem('poll-vote');
        if (!that.poll) {
            that.loadPoll(that.id, that.bindToEvents);
        } else {
            that.render(that.poll);
            that.bindToEvents();
        }
    };
}


PollingWidget.prototype.getElement = function() {
    return document.getElementById(this.options.el.replace(/^#/, ''));
}

PollingWidget.prototype.fetchPoll = function(url, id, callback) {
    var xhr = new XMLHttpRequest();
    var getUrl = url + '/polls/' + id;
    xhr.onreadystatechange = readyCheck;

    function readyCheck() {
        if (xhr.readyState < 4 || xhr.status !== 200) return;
        if (xhr.readyState == 4) callback(xhr)
    }

    xhr.open('GET', url, true);
    xhr.send(null);
}

PollingWidget.prototype.save = function(poll_data, answer_id) {
    cookieLib.setItem('poll-vote', JSON.stringify(poll_data));
    var that = this;
    var saved_poll = poll_data || this.poll;
    var vote_id = answer_id || this.id;
    this.poll = saved_poll;
    this.id = vote_id;
    if (this.options.localStorage) {
        localStorage.removeItem('poll-'+vote_id);
        localStorage.setItem('poll'+vote_id, JSON.stringify(saved_poll));
    }
    if (this.options.url) {
        var xhr = new XMLHttpRequest();
        var postUrl = this.options.url + '/polls/' + that.vote_id + '/vote/' + vote_id;
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                    console.log('save successfull');
                else {
                    console.log('error saving - defaulting to load from local storage');
                    that.options.url = null;
                    that.options.localStorage = true;
                }
            }
        }

        xhr.open('POST', postUrl, true);
        xhr.send(null);
    }
}

PollingWidget.prototype.loadPoll = function(id, callback) {

    if (!this.options.url && this.options.localStorage) {
        var loaded = JSON.parse(localStorage.getItem('poll-' + id));
        this.render(loaded);
        this.poll = loaded;
        callback();

    } else if (this.options.url) {
        var that = this;
        this.fetchPoll(this.options.url, id, onLoad);

        function onLoad(xhr) {
            var loaded = JSON.parse(xhr.responseText);
            that.render(loaded);
            that.poll = loaded;;
            callback();
        }
    } else {
        var default_poll = {
            "question": "Did I want a default data model?",
            "answers": [{
                    "value": "Yes",
                    "count": 10,
                    "percent": 0
                    },
                {
                    "value": "No",
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
        this.poll.answers[id].count++;
        this.recalibrate();
        this.save(this.poll);
    } else {
        console.log('already voted');
    }

}

PollingWidget.prototype.recalibrate = function() {
    this.poll.total = 0;
    var answer_arr = this.poll.answers;
    for (var i in answer_arr)
        this.poll.total += answer_arr[i].count;
    for (var j in answer_arr)
        this.poll.answers[j].percent = Math.round((this.poll.answers[j].count / this.poll.total) * 100);
}
