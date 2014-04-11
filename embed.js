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
                    <span class="text"></span> \
                </div> \
                <div class="poll-answer" data-id="2"> \
                    <img src="" alt=""> \
                    <span class="text"></span> \
                </div> \
            </div> \
            <div id="poll-results"> \
                <ul> \
                    <li> \
                        <div class="text"></div> \
                        <div class="bar"> \
                            <div class="graph" data-id="1"></div> \
                            <div class="graph-caption" data-id="1"></div> \
                        </div> \
                    </li> \
                    <li> \
                        <div class="text"></div> \
                         <div class="bar"> \
                            <div class="graph" data-id="2"></div> \
                            <div class="graph-caption" data-id="2"></div> \
                        </div> \
                    </li> \
                </ul> \
            </div> \
            <div class="poll-bottom"></div> \
        </div>';

    var hookNode = document.getElementById('polling-widget-script'),
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
    widget.id = 'vanilla-poll';
    widget.innerHTML = default_template;

    hookNode.parentNode.insertBefore(widget, hookNode);

    function init() {

        url = getOption('url') || '';
        localStorage = getOption('localStorage') || false;
        css = getOption('css') || '';

        if (css) loadCSS(css);

        loadScript('./vanilla-poll.js', main.bind(null, url, localStorage));
    }

    function main(url, localStorage) {

        domready(function() {


            var myPoll = new PollingWidget({
                localStorage: localStorage,
                url: url
            });

            myPoll.init();

        });

    }

    init();
})();
