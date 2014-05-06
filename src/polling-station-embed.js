/*!
 * domready (c) Dustin Diaz 2014 - License MIT
 */
! function(name, definition) {

    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()

}('domready', function() {

    var fns = [],
        listener, doc = document,
        domContentLoaded = 'DOMContentLoaded',
        loaded = /^loaded|^i|^c/.test(doc.readyState)

        if (!loaded)
            doc.addEventListener(domContentLoaded, listener = function() {
                doc.removeEventListener(domContentLoaded, listener)
                loaded = 1
                while (listener = fns.shift()) listener()
            })

        return function(fn) {
            loaded ? fn() : fns.push(fn)
        }

});

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function() {
    var cache = {};

    this.tmpl = function tmpl(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :

        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            str
            .replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'") + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    };
})();

(function() {

    /**
     * Embed by making an AJAX call to grab a template
     * If successfull, template is used to automatically build up the DOM
     *
     *
     */
    var xhr = new XMLHttpRequest();
    var b = document.getElementById('polling-station-script').getAttribute('data-base') || './';
    xhr.open('GET', b + 'assets/templates/yes-no.tmpl', true);

    xhr.onload = function() {
        var that = this;
        if (xhr.status >= 200 && xhr.status < 400) {
            // Success loading
            var tmplData = xhr.responseText;
            start(tmplData);
        } else {
            console.log("Server reached, error loading template though");
        }
    };

    xhr.onerror = function() {
        console.log("Error fetching template");
    };

    xhr.send();

    /**
     * start: Entry point for embed scaffolding
     *
     * @param  {String} tmplData: Raw string data of a template, gets converted into a DOM element later
     *
     */
    function start(tmplData) {
        var hookNode = document.getElementById('polling-station-script'),
            hookParent = hookNode.parentNode,
            head = document.head || document.getElementsByTagName('head')[0],
            hasOwn = Object.prototype.hasOwnProperty,
            url,
            localStorage,
            css;

        function camelize(s) {
            return s.replace(/-(.)/g, function(m, m1) {
                return m1.toUpperCase();
            });
        }

        /**
         * getOption: Loads data attributes off of the embedded script tag
         * @param  {String} opt: String containing the attribute of the data tag, ommiting 'data-'
         * @return {Value} value: Value of the attribute
         */
        function getOption(opt) {
            var value;
            if (hookNode.dataset) {
                value = hookNode.dataset[camelize(opt)];
            } else {
                value = hookNode.getAttribute('data-' + opt);
            }

            return value;
        };

        /**
         * loadCSS: Loads external css and attaches it to the page
         * @param  {String} href : URL containing css stylesheet
         */
        function loadCSS(href) {
            var link_tag = document.createElement('link');
            link_tag.setAttribute("type", "text/css");
            link_tag.setAttribute("rel", "stylesheet");
            link_tag.setAttribute("href", href);
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(link_tag);
        };

        /**
         * loadScript: Loads external scripts asynchronously, then fire a callback after when done
         * @param  {String} src    : URL containing external script (in this case polling-station.js)
         * @param  {Function} onLoad : Callback function
         */
        function loadScript(src, onLoad) {
            var script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", src);

            if (script_tag.readyState) {
                script_tag.onreadystatechange = function() {
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        onLoad();
                    }
                };
            } else {
                script_tag.onload = onLoad;
            }
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        };

        /**
         * [init description]
         * @return {[type]} [description]
         */
        function init() {

            var url = getOption('url') || '';
            var base = getOption('base') || './';
            var localStorage = getOption('localStorage') || false;
            var css = base + getOption('css') || base + 'assets/css/default.css';
            var lib = base + getOption('lib') || base + 'dist/polling-station-min.js';
            var poll_id = parseInt(getOption('poll-id'), 10) || 1;

            if (css) loadCSS(css);

            //arguments need to be binded for delayed invocatio
            loadScript(lib, main.bind(null, url, localStorage, poll_id, base));
        };

        function main(url, localStorage, poll_id, base) {

            // domready(function() {

                var render_tmpl = tmpl("yesno_tmpl");

                var myPoll = new PollingStation({
                    localStorage: localStorage,
                    url: url,
                    id: poll_id,
                    base: base,
                    dev: true,
                    template: render_tmpl.bind(this)
                });


                var image_scaffold = function(base) {
                    var imgs = (document.getElementById('poll-answers').querySelectorAll('img'));
                    for (var index = 0; index < imgs.length; index++) {
                        //Prepend our base url to the image tags
                        imgs[index].src = base + "assets/img/" + imgs[index].src.substr(imgs[index].src.lastIndexOf("/")+1);
                    }
                };

                myPoll.init([image_scaffold.bind(null, base)]);

            // });

        };

        var tmplScript = document.createElement('script');
        tmplScript.type = 'text/html';
        tmplScript.id = 'yesno_tmpl';
        tmplScript.innerHTML = tmplData;
        document.body.appendChild(tmplScript);

        var widget = document.createElement('div');
        widget.id = 'polling-station';

        hookNode.parentNode.insertBefore(widget, hookNode);

        init();

    }
})();
