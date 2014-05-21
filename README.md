
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
#Table of Contents 

- [polling-station.js](#polling-stationjs)
	- [Description](#description)
	- [Version](#version)
	- [Installation](#installation)
		- [Building and Testing](#building-and-testing)
	- [Usage](#usage)
		- [Set up the data for the poll](#set-up-the-data-for-the-poll)
		- [HTML hooks and template rendering](#html-hooks-and-template-rendering)
			- [Static HTML](#static-html)
				- [Basic:](#basic)
				- [Advanced:](#advanced)
			- [Templating function](#templating-function)
		- [Instantiate  and start the polling widget](#instantiate--and-start-the-polling-widget)
	- [Embed Script:](#embed-script)
	- [TODO:](#todo)
	- [Suggestions/Feedback](#suggestionsfeedback)
	- [Copyright](#copyright)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


polling-station.js
=====

##Description

A standalone library that creates scaffolding for interactive polls and questionnaires.
Has support for saving and fetching from HTML5 localstorage as well as remote API endpoints

Written in 100% vanilla JavaScript

Developed with ♡ at PolicyMic



## Version

0.1

## Installation

Include the library in your polling page as followed:

```html
<script src="polling-station.min.js"></script>
```

### Building and Testing

Run `grunt build` to produce minified versions of the scripts into the *dist/* folder

Run `grunt mocha` to run unit tests using Mocha BDD assertions and Phantom-JS (npm install will provide these dependencies)

Run `grunt server` to enable browser-sync and livereload of testing development (css + js) on localhost:8080

## Usage

### Set up the data for the poll

The poll-data object must be set with the following schema:

Property | Subpropertes | Description
:----| :----| :-----
**_question_** | | The prompt of the poll; the question being asked
**_answers_** | *id*, *value*, *count*, *percent* | An array of objects that represent the options avaliable for selection <br> <ul><li>*id*: Represents the ID of the particular vote option</li><li>*value*: The description of the selection</li><li>*count*: Number of votes on this current selection<li>*percent*: A numeric value between 0-100 that represents the ratio of this selection to the poll total</ul>
**total** |  | The total amount of votes made for all selections in the poll

### HTML hooks and template rendering

At the very least, a parent element is required to exist on the page. By default, vanilla-poll will look for an element with the id **#polling-widget**, otherwise it will search for the CSS selector id passed in with the `el` context attribute upon instantiation

From this there are two ways to proceed:

#### Static HTML

The following HTML schema is needed when writting static HTML elements to the page:

##### Basic:

*   Element with CSS id **#poll-question** to display poll question
*   Container elements with CSS id **#poll-answers** and **#poll-results**
    as respective parents (this can be a `<div` or `<ul>`, etc)
*   Individual elements with CSS group **.poll-answer** and **.poll-result** 
    nested under their parent container element, along with a data attribute **data-id** which corresponds to the *ID* field of their respective *answer* property

##### Advanced:
*   For image scaffolding, make sure that an empy `<img/` tag is situated within your **.poll-answer** groups.
*   **.poll-answer-text** will fetch the answer selection option and display it within this element
*   For dynamic and animated graphs, be sure to construct your **#poll-resuls** element as followed:
```html
    <div id="poll-results">
            <ul>
                <li class="poll-result" data-id="1">
                    <div class="poll-result-text"></div>
                    <div class="bar">
                        <div class="graph"></div>
                        <div class="poll-result-caption"></div>
                    </div>
                </li>
                <li class="poll-result" data-id="2">
                    <div class="poll-result-text"></div>
                    <div class="bar">
                        <div class="graph"></div>
                        <div class="poll-result-caption"></div>
                    </div>
                </li>
            </ul>
        </div>
```

Note that there is not much flexibility in rendering the DOM, the default templating function will overwrite anything that does not conform to this standard.

To tweak this behaviour, simply modify `defaultTemplateFunc` within the **PollingStation.prototype** declaration


#### Templating function

The polling widget will also accept a custom templating function that can be passed into the `template` context attribute. The template exists as nested underneath the parent `el` element and must follow the same schema as above. However there is more flexibility, as you can include additional HTML elements as well as more freedom with positioning and arrangement of elements

Here is an example using a Handlebars template:

```javascript
var myCustomTemplateFunc = Handlebars.compile(document.getElementById('poll-template').innerHTML);
var myPoll = new PollingStation({
    url: "http://myapirooturl.com/api",
    template: myCustomTemplateFunc
});

myPoll.init();
```

Note that in the embed script, a mini templating engine is used to dynamically construct the DOM, see the source code for more information.

### Instantiate  and start the polling widget

The polling widget object is created with a *context* argument that provides instructions for how you want to set up the poll. Here is an example

```javascript
    var myPollingStation = new PollingStation({
        el: '#idOfWidgetDiv', // this defaults to #polling-widget
        url: 'http://myapirooturl.com/api', // this defaults to ''
    });
```

You can also pass in a local poll-data object as well through the `poll` parameter, to use as a starting point of you have no url endpoint or data in localstorage. Make sure to set the `localStorage` flag  to persist this data:

```javascript
var local_poll_data = {
        "id": 1,
        "question": "Is this poll loaded remotely?",
        "answers": [{
            "id": 1,
            "value": "Yes",
            "count": 10,
            "percent": 33
        }, {
            "id": 2,
            "value": "No",
            "count": 20,
            "percent": 66
        }],
        "total": 0
    }

var myPollingStation = new PollingStation({
    poll: local_poll_data,
    localStorage: true
});
```


Then, once instantiated, start polling with:
```javascript
    myPollingStation.init();
```
Which will render the poll into the DOM and set up the event binding


## Embed Script:

This entire package can also be run as a single, embeddable script tag that allows for portability ease-of-use.

For reference, the script tag appears as follows:
```html
<script data-base="../" data-url="http://remote-end-point" data-localStorage="true" 
data-css="assets/css/yes-no.css" data-lib="src/polling-station.js" 
src="../src/polling-station-embed.js" data-poll-id="5" id="polling-station-script"></script>
```

And as a result consists of the following fields:

Attribute | Required ? | Description
:----| :----| :-----
**_data-base_** | **Yes** | The path of the base folder, in which every other folder and resource is located. This can be local to the script itself, or at a remote URL path
**_data-url_** | No | Represents the API end point host URL if doing remote persistent polling
**_data-localStorage_** | No | Set if you wish to have localStorage fetching on the poll
**_data-css_** | No(But recommended) | The path to an external CSS styling sheet _relative to the base path you provided_
**_data-lib_** | **Yes** | The path to the polling-station.js library _relative to the base path you provided_
**_data-poll-id_** | No | The ID of the poll to fetch and save to if you are using localStorage or remote API persistence
**_id_** | **Yes** | Identifer of the `<script>` tag, must be called *#polling-station-script*
**_src_** | **Yes** | The path to the polling-station embed script, _relative to the base path you provided_


Note that when using the embeddable script, you may wish to assign callbacks to happen for event binding that occurs after the poll has been rendered and instantiated. In that case, see the source code for how to pass in callbacks to the `init()` call -- in the example we use this functionality to allow for event binding on the image hovers

Also of note is the fact that CSS styles are completely customizable and up to the user. Many of the effects in the demoes are a result of tweaking CSS to fit specific needs (mainly that of a Yes-No poll). You will have to implement custom solutions for various other polls.

## TODO:

*   Context argument description
*   Elaborate behaviours/bugs


## Suggestions/Feedback

Always welcome! Feel free to give a shout to [@luckycevans](http://twitter.com/luckycevans)


## Copyright

The MIT License (MIT)

Copyright (c) 2014 Christopher Michael Evans

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.