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


(function() {
    function PollingWidget(context) {
        var context = context || {
            id: 5,
            el: '#polling-widget',
            poll: null,
        };

        var that = this;

        var default_template_func = function(poll_data) {

            var index;
            var el = that.getElement();
            var question = el.querySelector('#poll-question');

            var answers = el.querySelectorAll('.poll-answer');
            var results = el.querySelectorAll('.poll-result');

            var answerText = el.querySelectorAll('.poll-answer > .poll-answer-text');
            var answerImage = el.querySelectorAll('.poll-answer > img');

            var resultsText = el.querySelectorAll('#poll-results .poll-result-text');
            var resultsCaptions = el.querySelectorAll('#poll-results .poll-result-caption');

            if (question) question.innerHTML = poll_data.question;

            if (answers.length) {
                for (index = 0; index < answers.length; index++) {
                    if (answerText.length) {
                        answerText[index].innerHTML = poll_data.answers[index].value;

                        if (answerImage.length) {
                            answerImage[index].src =  that.options.base + "assets/img/answer_" + answers[index].getAttribute('data-id') + ".png";
                        }
                    } else {
                        answers[index].innerHTML = poll_data.answers[index].value;
                    }
                }

            }

            if (results.length) {
                for (index = 0; index < results.length; index++) {
                    if (resultsText.length) {
                        resultsText[index].innerHTML = poll_data.answers[index].value;
                    } else {
                        results[index].innerHTML = poll_data.answers[index].value + "% (" + poll_data.answers[index].count + " votes)";
                    }

                    if (resultsCaptions.length) {
                        resultsCaptions[index].innerHTML = poll_data.answers[index].percent + "% (" + poll_data.answers[index].count + " votes)";
                    }
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
            poll: context.poll || null,
            dev: context.dev || false,
            base: context.base || './'
        };

        this.poll = context.poll;
        this.id = parseInt(this.options.id, 10);


        this.changeEvent = document.createEvent('Event');
        this.changeEvent.initEvent('poll-change', true, true);
        this.getElement().addEventListener('poll-change', function(e) {
            that.unbindToEvents();
            that.swap("poll-answers", "poll-results");
            setTimeout(function() {
                var graphs = that.getElement().querySelectorAll('#poll-results .graph');
                if (graphs) {
                    for (var i = 0; i < graphs.length; i++) {
                        graphs[i].style.width = that.poll.answers[i].percent + "%";
                    }
                }
            }, 300);


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
            if (that.options.dev) {
                console.log('cookie removed')
                cookieLib.removeItem('poll-vote');
            }

            if (!that.poll || (that.poll && that.options.localStorage)) {
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
        cookieLib.setItem('poll-vote', this.id);
        var that = this;
        var vote_id = answer_id || 1;
        var saved_poll = poll_data || this.poll;
        this.poll = saved_poll;
        if (this.options.localStorage) {
            console.log('made it to local save');
            localStorage.removeItem('poll' + that.id);
            localStorage.setItem('poll' + that.id, JSON.stringify(saved_poll));
        }
        if (this.options.url) {
            var xhr = new XMLHttpRequest();
            var postUrl = this.options.url + '/polls/' + that.id + '/vote/' + vote_id;
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (200 <= xhr.status && xhr.status < 300)
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
        var callback = callback || function() {};
        if (!this.options.url && this.options.localStorage) {
            var loaded;
            if(localStorage.getItem('poll'+ id)) {
                loaded = JSON.parse(localStorage.getItem('poll' + id));
            }
            else {
                loaded = this.poll
            }


            console.log(loaded);
            this.render(loaded);
            this.poll = loaded;
            callback();

        } else if (this.options.url) {
            var that = this;

            function onLoad(xhr) {
                var loaded = JSON.parse(xhr.responseText);
                loaded = loaded.response.poll;
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
                }, {
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
        if (cookieLib.hasItem('poll-vote') && parseInt(cookieLib.getItem('poll-vote'), 10) === this.id) {
            this.getElement().dispatchEvent(this.changeEvent);
        }
        var html = this.options.template(poll_data);
        this.getElement().innerHTML = html;
    }

    PollingWidget.prototype.updateSelection = function(id) {
        if (cookieLib.hasItem('poll-vote') && parseInt(cookieLib.getItem('poll-vote'), 10) === this.id) {
            console.log('already voted');
        } else {
            debugger;
            this.lookup(id).count++;
            this.recalibrate();
            this.save(this.poll, this.lookup(id).id);
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
