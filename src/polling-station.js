/*******************
polling-station.js
v 0.1

By Chris Evans, developed with love at PolicyMic
*******************/

/**** Cookie Library - Thanks MDN! https://developer.mozilla.org/en-US/docs/DOM/document.cookie ***/
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

/***** Polling Station Class *****/
(function() {

    function PollingStation(optionsArg) {

        var that = this; //A necessary uglyness :(

        /**
         * scaffold: Sets up necessary defaults and configuration options as a fallback for unpassed parameters
         *
         * @type {Object}
         */
        var scaffold = {
            id: 1,
            el: '#polling-station',
            url: '',
            localStorage: false,
            dev: true,
            base: './',

            template: this.defaultTemplateFunc,

            poll: null
        };

        /**
         * options: Contains the configuration options that govern the behavior of the PollingStation
         *
         * @type {Object}
         */
        this.options = {
            id: optionsArg.id || scaffold.id,
            el: optionsArg.el || scaffold.el,
            url: optionsArg.url || scaffold.url,
            template: optionsArg.template || scaffold.template,
            localStorage: (typeof optionsArg.localStorage === 'undefined' || optionsArg.localStorage === null) ? scaffold.localStorage : optionsArg.localStorage,
            dev: (typeof optionsArg.dev === 'undefined' || optionsArg.dev === null) ? scaffold.dev : optionsArg.dev,
            poll: optionsArg.poll || scaffold.poll,
            base: optionsArg.base || scaffold.base
        };

        /**
         * poll: Field that contains the actual polling data, and is distinct from options.poll which is used to optionally insantiate this field with pre-existing data
         *
         * @type {Object}
         */
        this.poll = this.options.poll;

        /**
         * id: A necessary field that contains the corresponding id to poll data that is being saved and retrieved from and must match that of the field poll.id - otherwise behaviour will break
         *
         * @type {Integer}
         */
        this.id = parseInt(this.options.id, 10);

        /**
         * changeEvent: Event that is fired off when a selection is made on the poll - the name of this event is 'poll-change'
         *
         * @type {Event}
         */
        this.changeEvent = document.createEvent('Event');
        this.changeEvent.initEvent('poll-change', true, true);

        /**
         * readyEvent: Event that is fired when the poll has loaded succesfully, so that events can now be bound to the DOM
         *
         * @type {Event}
         */
        this.readyEvent = document.createEvent('Event');
        this.readyEvent.initEvent('poll-ready', true, true);

        /**** Internal functions ****/

        /**
         * registerEvents:
         *
         * Adds the event listner for 'poll-change' that swaps the voting screen wih the results screen
         *
         * and 'poll-ready', which prompts event binding to occur
         *
         * Includes animateGraph() which sets the width of graphs (if they exist) to the value of the percentage
         *
         * Timeout is to allow for CSS animation of width increase -- make instant for no animations
         *
         */
        this.registerEvents = function() {
            var that = this;
            that.getElement().addEventListener('poll-change', function(e) {
                that.unbindEvents();
                that.swap('poll-answers', 'poll-results');
                setTimeout(animateGraphs, 300);

                function animateGraphs() {
                    var graphs = that.getElement().querySelectorAll('#poll-results .graph');
                    if (graphs) {
                        for (var i = 0; i < graphs.length; i++) {
                            graphs[i].style.width = that.poll.answers[i].percent + "%";
                        }
                    }
                }
            });

            that.getElement().addEventListener('poll-ready', function(e) {
                that.bindEvents.call(that);
            });
        }

        /**
         * bindEvents:
         *
         * Binds the click events to the answer selection, is possible for registering a vote on a particular selection choice
         *
         * After handling the interaction for vote recording, the click event will also enact the save function as well as dispatch the 'poll-change' custom event
         *
         * If there are images being used with the selections, a mouseover effect is applied to these images
         *
         */
        this.bindEvents = function() {
            var that = this;

            var answers = that.getElement().querySelectorAll('.poll-answer');
            var answerImages = that.getElement().querySelectorAll('.poll-answer > img');

            var forEach = Array.prototype.forEach;

            if (answers) {
                forEach.call(answers, function(answer) {
                    var selection = answer.getAttribute('data-id');
                    answer.addEventListener('click', function(e) {
                        e.preventDefault();
                        that.updateSelection(selection);
                        that.getElement().dispatchEvent(that.changeEvent); // Causes view switch
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
        }

        /**
         * unbindEvents:
         *
         * Clean up that currently removes mouseover events for the images in voting selection
         */
        this.unbindEvents = function() {
            var answerImages = that.getElement().querySelectorAll('.poll-answer > img');

            var forEach = Array.prototype.forEach;

            if (answerImages) {
                forEach.call(answerImages, function(img) {
                    img.onmouseover = null;
                    img.onmouseout = null;
                });
            }
        }

        /**
         * swap: THIS SHOULD NOT BE ALTERED/USED EXTERNALLY
         *
         * Swaps out visibility of answers and displays the results screen.
         *
         * PAY ATTENTION  TO ORDER OF THE PARAMETERS!!!
         * @param  {String} answers: id of the answers div
         * @param  {String} results: id of the results div
         * @return {[type]}         [description]
         */
        this.swap = function(answers, results) {
            document.getElementById(answers).style.display = 'none';
            document.getElementById(results).style.display = 'block';
        }


        /**
         * init:
         * Used to initialize the PollingStation, causes poll data to be fetched and sets up event handling and renders the view
         *
         * @param  {Array[Function]} callbacks [Array of functions that are to be called after the page has rendered]
         *
         */
        this.init = function(callbacks) {
            var callbacks = callbacks || [];

            //Dev Mode = Clear cookies automatically
            if (that.options.dev) {
                console.log('PollingStation: Dev Mode Enabled');
                cookieLib.removeItem('poll-vote');
            }

            if (!that.poll || (that.poll && (that.options.localStorage || that.options.url))) {
                that.loadPoll(that.id, callbacks);
            } else {
                that.render(that.poll);
                callbacks.forEach(function(callback) {
                    callback();
                });
                that.registerEvents();
                that.bindEvents();
            }
        }
    };

    /**
     * getElement: Returns the DOM element that is specified in options.el - defaults to '#polling-station'
     * @return {$el} Parent container of the poll
     */
    PollingStation.prototype.getElement = function() {
        return document.getElementById(this.options.el.replace(/^#/, ''));
    }
    /**
     * defaultTemplateFunc:
     *
     * The default rendering function that populates written DOM elments according the necessary schema
     * Replace with your custom templating engine that corresponds to your templating schema
     * @param  {Object} pollData: poll object
     * @return {String} rendered HTML with data from passed in poll
     */
    PollingStation.prototype.defaultTemplateFunc = function(pollData) {
        var index;
        var el = document.getElementById(this.el.replace(/^#/, ''))
        var question = el.querySelector('#poll-question');

        var answers = el.querySelectorAll('.poll-answer');
        var results = el.querySelectorAll('.poll-result');

        var answerText = el.querySelectorAll('.poll-answer > .poll-answer-text');
        var answerImage = el.querySelectorAll('.poll-answer > img');

        var resultsText = el.querySelectorAll('#poll-results .poll-result-text');
        var resultsCaptions = el.querySelectorAll('#poll-results .poll-result-caption');

        if (question) question.innerHTML = pollData.question;

        if (answers.length) {
            for (index = 0; index < answers.length; index++) {
                if (answerText.length) {
                    answerText[index].innerHTML = pollData.answers[index].value;

                    if (answerImage.length) {
                        answerImage[index].src = this.base + "assets/img/" + pollData.answers[index].value + ".png";
                    }
                } else {
                    answers[index].innerHTML = pollData.answers[index].value;
                }
            }

        }

        if (results.length) {
            for (index = 0; index < results.length; index++) {
                if (resultsText.length) {
                    resultsText[index].innerHTML = pollData.answers[index].value;
                } else {
                    results[index].innerHTML = pollData.answers[index].value + "% (" + pollData.answers[index].count + " votes)";
                }

                if (resultsCaptions.length) {
                    resultsCaptions[index].innerHTML = pollData.answers[index].percent + "% (" + pollData.answers[index].count + " votes)";
                }
            }
        }

        return el.innerHTML;
    }

    /**
     * fetchPoll: Wrapper function that makes a GET request at an API endpoint to fetch a poll
     * Used in loadPoll()
     * Note that endpoints must be in the format of:
     *     /polls/{id}
     *
     * @param  {String}   url      : Root url of API route
     * @param  {Int}   id          : id of the poll
     * @param  {Function} callback : function executed on response after succesfull GET
     *
     */
    PollingStation.prototype.fetchPoll = function(url, id, callback) {
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

    /**
     * save: Saves poll data either to API end point or localStorage
     * Note that with URL endpoints, incrementing the count of the vote must be handled server side
     *
     * Against a URL endpoint the following format is required:
     *     /polls/{poll-id}/vote{choice-id}
     * @param  {Int} answer [    : Represents id of the selected choice
     * @param  {Object} pollData : Poll data, usually defaults to self, but can be used to override if provided
     *
     */
    PollingStation.prototype.save = function(answer, pollData) {
        cookieLib.setItem('poll-vote', this.id);
        var that = this;
        var vote = answer || 1;
        var savedPoll = pollData || this.poll;
        this.poll = savedPoll;

        if (this.options.localStorage) {
            localStorage.removeItem('poll-' + that.id);
            localStorage.setItem('poll-' + that.id, JSON.stringify(savedPoll));
        }
        if (this.options.url) {
            var xhr = new XMLHttpRequest();
            var postUrl = this.options.url + '/polls/' + that.id + '/vote/' + vote;
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

    /**
     * loadPoll: Loads a poll based on the configuration settings passed to the PollingStation
     * Priority of load goes from:
     *     URL > localStorage > default
     *
     * Important order to remember is:
     *     1) Poll must be loaded
     *     2) Page must renderd with data from the poll
     *     3) Event(Listners) are registered on DOM elements
     *     4) Events are bound on the DOM elements
     *     5) Optionally callbacks are sequentially executed
     *
     * @param  {Int id        : id of a poll
     * @param  {Array[Function]} callbacks : array of callbacks that get executed, remember to bind arguments if necessary
     *
     */
    PollingStation.prototype.loadPoll = function(id, callbacks) {
        var callbacks = callbacks || [];
        if (!this.options.url && this.options.localStorage) {
            var loaded;
            var that = this;
            if (localStorage.getItem('poll' + id)) {
                loaded = JSON.parse(localStorage.getItem('poll' + id));
            } else {
                loaded = this.poll
            }
            this.poll = loaded;
            this.render(loaded);
            that.registerEvents();
            that.getElement().dispatchEvent(that.readyEvent);
            callbacks.forEach(function(callback) {
                callback();
            });

        } else if (this.options.url) {
            var that = this;

            function onLoad(xhr) {
                var loaded = JSON.parse(xhr.responseText);
                loaded = loaded.response.poll;
                that.poll = loaded;
                that.id = loaded.id;
                that.render(loaded);
                that.registerEvents();
                that.getElement().dispatchEvent(that.readyEvent);
                callbacks.forEach(function(callback) {
                    callback();
                });
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
            this.registerEvents();
            this.bindEvents();
            callbacks.forEach(function(callback) {
                callback();
            });
        }
    };

    /**
     * render: Uses either default rendering function, or accepts any other templating function, so long as it follows the convetion
     *     tmplFunction(myObject) and returns a String
     *
     * @param  {Object} pollData: poll object used as rendering model
     *
     */
    PollingStation.prototype.render = function(pollData) {
        if (cookieLib.hasItem('poll-vote') && parseInt(cookieLib.getItem('poll-vote'), 10) === this.id) {
            this.getElement().dispatchEvent(this.changeEvent);
        }
        var html = this.options.template(pollData);
        this.getElement().innerHTML = html;
    }

    /**
     * updateSelection: Records user vote, and adjusts data percentages to correspond
     * calls save()
     *
     * @param  {Int} id : id of selected choice
     *
     */
    PollingStation.prototype.updateSelection = function(id) {
        if (cookieLib.hasItem('poll-vote') && parseInt(cookieLib.getItem('poll-vote'), 10) === this.id) {
            console.log('already voted');
        } else {
            this.lookup(id).count++;
            this.recalibrate();
            this.save(this.lookup(id).id);
        }
    }

    /**
     * recalibrate: Re-adjust percentages to account for new vote
     *
     */
    PollingStation.prototype.recalibrate = function() {
        this.poll.total = 0;
        var answer_arr = this.poll.answers;
        for (var i in answer_arr)
            this.poll.total += answer_arr[i].count;
        for (var j in answer_arr)
            this.poll.answers[j].percent = Math.round((this.poll.answers[j].count / this.poll.total) * 100);
    }

    /**
     * lookup: helper function that maps choice id to its location in the array
     * @param  {Int} id : id of choice in question
     * @return {Object}    : object representing choice data
     */
    PollingStation.prototype.lookup = function(id) {
        this.lookup_arr = [];

        if (!this.lookup_arr.length) {
            var answer_arr = this.poll.answers;
            for (var i = 0; i < answer_arr.length; i++) {
                this.lookup_arr[answer_arr[i].id] = answer_arr[i];
            }
        }

        return this.lookup_arr[id];
    }

    // Export out to global namespace
    window.PollingStation = PollingStation;

})();
