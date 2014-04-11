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

    WebFontConfig = {
        google: {
            families: ['Lato:100,300,400,700:latin']
        }
    };

})();

(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

(function() {
    function PollingWidget(context) {
        var that = this;

        var default_template_func = function(poll_data) {

            var index;
            var el = that.getElement();
            var question = el.querySelector('#poll-question');
            var answers = el.querySelectorAll('div.poll-answer');
            var answerText = el.querySelectorAll('.poll-answer > .text');
            var answerImage = el.querySelectorAll('.poll-answer > img');
            var results = el.querySelectorAll('.poll-result');
            var resultsText = el.querySelectorAll('#poll-results .text');
            var graphCaptions = el.querySelectorAll('#poll-results .graph-caption');

            if (question) question.innerHTML = poll_data.question;

            if (answerText.length) {
                for (index = 0; index < answerText.length; index++) {
                    answerText[index].innerHTML = poll_data.answers[index].value;
                    answerImage[index].src = "./assets/img/answer_" + answers[index].getAttribute('data-id') + ".png";
                    resultsText[index].innerHTML = poll_data.answers[index].value;
                }
            }

            if (graphCaptions.length) {
                for (index = 0; index < graphCaptions.length; index++) {
                    graphCaptions[index].innerHTML = poll_data.answers[index].percent + "% (" + poll_data.answers[index].count + " votes)";
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
            that.unbindToEvents();
            that.swap("poll-answers", "poll-results");
            that.render(that.poll);
            setTimeout(function() {
                var graphs = that.getElement().querySelectorAll('#poll-results .graph');
                if (graphs) {
                    for (var i = 0; i < graphs.length; i++) {
                        graphs[i].style.width = that.poll.answers[i].percent + "%";
                    }
                }
            }, 50);


        });


        this.bindToEvents = function() {
            var answers = that.getElement().querySelectorAll('.poll-answer');
            var answerImages = that.getElement().querySelectorAll('.poll-answer > img');

            var forEach = Array.prototype.forEach;

            if (answers) {
                forEach.call(answers, function(answer) {
                    var selection = answer.getAttribute('data-id');
                    answer.addEventListener('click', function(e) {
                        e.preventDefault();
                        that.updateSelection(selection);
                        that.getElement().dispatchEvent(that.changeEvent);
                    });
                });
            }

            if (answerImages) {
                forEach.call(answerImages, function(img) {
                    img.onmouseover = function() {
                        img.src = img.src.replace(/(\.[\w\d_-]+)$/i, '_hover$1')
                    }
                    img.onmouseout = function() {
                        img.src = img.src.substring(0, img.src.lastIndexOf('_hover')) + '.png';
                    }
                });
            }

        };


        this.unbindToEvents = function() {

            var answerImages = that.getElement().querySelectorAll('.poll-answer > img');

            var forEach = Array.prototype.forEach;

            if (answerImages) {
                forEach.call(answerImages, function(img) {
                    img.onmouseover = null;
                    img.onmouseout = null;
                });
            }

        };

        this.init = function() {
            if (cookieLib.getItem('poll-vote')) cookieLib.removeItem('poll-vote'); //for dev
            if (!that.poll) {
                that.loadPoll(that.id, that.bindToEvents);
            } else {
                that.render(that.poll);
                that.bindToEvents();
            }
        };

        this.swap = function(swp1, swp2) {
            document.getElementById(swp1).style.display = 'none';
            document.getElementById(swp2).style.display = 'block';
        }
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

        xhr.open('GET', getUrl, true);
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
            localStorage.removeItem('poll' + vote_id);
            localStorage.setItem('poll' + vote_id, JSON.stringify(saved_poll));
        }
        if (this.options.url) {
            var xhr = new XMLHttpRequest();
            var postUrl = this.options.url + '/polls/' + that.id + '/vote/' + vote_id;
            console.log(postUrl);
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
            var loaded = JSON.parse(localStorage.getItem('poll' + id));
            this.render(loaded);
            this.poll = loaded;
            callback();

        } else if (this.options.url) {
            var that = this;

            function onLoad(xhr) {
                var loaded = JSON.parse(xhr.responseText);
                that.render(loaded);
                that.poll = loaded;;
                callback();
            }
            this.fetchPoll(this.options.url, id, onLoad);


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
            this.lookup(id).count++;
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


    PollingWidget.prototype.lookup = function(id) {
        this.lookup_arr = [];

        if (!this.lookup_arr.length) {
            var answer_arr = this.poll.answers;
            for (var i = 0; i < answer_arr.length; i++) {
                this.lookup_arr[answer_arr[i].id] = answer_arr[i];
            }
        }

        return this.lookup_arr[id];
    }


    window.PollingWidget = PollingWidget;

})();
