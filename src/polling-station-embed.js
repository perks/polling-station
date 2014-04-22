/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = /^loaded|^i|^c/.test(doc.readyState)

  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? fn() : fns.push(fn)
  }

});

(function() {
    var default_template = '<div id="polling-widget" class="polling-widget"> \
            <div class="poll-prompt">What do you think?</div> \
            <div id="poll-question"></div> \
            <div id="poll-answers"> \
                <div class="poll-answer" data-id="1"> \
                    <img/> \
                    <span class="poll-answer-text"></span> \
                </div> \
                <div class="poll-answer" data-id="2"> \
                    <img src="" alt=""> \
                    <span class="poll-answer-text"></span> \
                </div> \
            </div> \
            <div id="poll-results"> \
                <ul> \
                    <li class="poll-result" data-id="1"> \
                        <div class="poll-result-text"></div> \
                        <div class="bar"> \
                            <div class="graph"></div> \
                            <div class="poll-result-caption"></div> \
                        </div> \
                    </li> \
                    <li class="poll-result" data-id="2"> \
                        <div class="poll-result-text"></div> \
                         <div class="bar"> \
                            <div class="graph"></div> \
                            <div class="poll-result-caption"></div> \
                        </div> \
                    </li> \
                </ul> \
            </div> \
            <div class="poll-bottom"></div> \
        </div>';

    var hookNode = document.getElementById('polling-station-script'),
        hookParent = hookNode.parentNode,
        head = document.head || document.getElementsByTagName('head')[0],
        hasOwn = Object.prototype.hasOwnProperty,
        url,
        localStorage,
        css;


    function trim(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    function camelize(s) {
        return s.replace(/-(.)/g, function(m, m1) {
            return m1.toUpperCase();
        });
    }

    function template(text, data) {
        var i;
        for (i in data) {
            if (hasOwn.call(data, i)) {
                text = text.replace(RegExp('{{#' + i + '}}', 'g'), data[i]);
            }
        }
        return text;
    }

    function getOption(opt) {
        var value;
        if (hookNode.dataset) {
            value = hookNode.dataset[camelize(opt)];
        } else {
            value = hookNode.getAttribute('data-' + opt);
        }

        return value;
    }

    function loadCSS(href) {
        var link_tag = document.createElement('link');
        link_tag.setAttribute("type", "text/css");
        link_tag.setAttribute("rel", "stylesheet");
        link_tag.setAttribute("href", href);
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(link_tag);
    }

    function loadScript(src, onLoad) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", src);

        if (script_tag.readyState) {
            script_tag.onreadystatechange = function() {
                console.log('x')
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    onLoad();
                }
            };
        } else {
            script_tag.onload = onLoad;
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    }


    var widget = document.createElement('div');
    widget.id = 'polling-station';
    widget.innerHTML = default_template;

    hookNode.parentNode.insertBefore(widget, hookNode);

    function init() {

        var url = getOption('url') || '';
        var base = getOption('base') || './';
        var localStorage = getOption('localStorage') || false;
        var css = getOption('css') || '';
        var lib = base + getOption('lib') || base + '/dist/polling-station-min.js';
        var poll_id = parseInt(getOption('poll-id'), 10) || 1;

        if (css) loadCSS(css);

        loadScript(lib, main.bind(null, url, localStorage, poll_id));
    }

    function main(url, localStorage, poll_id) {

        domready(function() {


            var myPoll = new PollingWidget({
                localStorage: localStorage,
                url: url,
                id: poll_id
            });

            myPoll.init();

        });

    }

    init();
})();
