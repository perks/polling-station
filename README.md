<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# Table of Contents
*generated with [DocToc](http://doctoc.herokuapp.com/)*

- [vanilla-poll.js](#vanilla-polljs)
	- [Description](#description)
	- [Version](#version)
	- [Installation](#installation)
	- [Usage](#usage)
		- [Set up the data for the poll](#set-up-the-data-for-the-poll)
		- [HTML hooks and template rendering](#html-hooks-and-template-rendering)
			- [Static HTML](#static-html)
			- [Templating function](#templating-function)
		- [Instantiate  and start the polling widget](#instantiate--and-start-the-polling-widget)
	- [TODO:](#todo)
	- [Suggestions/Feedback](#suggestionsfeedback)
	- [Copyright](#copyright)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


vanilla-poll.js
=====

##Description

A standalone library for creating the scaffolding for interactive polls and questionaires.
Has support for saving and fetching from HTML5 localstorage as well as remote API endpoints

Written in 100% plain-jane vanilla JavaScript



## Version

0.1

## Installation

Include the library in your polling page as followed:

```html
<script src="vanilla-poll.js"></script>
```

## Usage

### Set up the data for the poll

The poll-data object must be set with the following schema:

Property | Subpropertes | Description
:----| :----| :-----
**_question_** | | The prompt of the poll; the question being asked
**_choices_** | *title*, *count*, *percent* | An array of objects that represent the options avaliable for selection <br> <ul><li>*title*: The description of the selection</li><li>*count*: Number of votes on this current selection<li>*percent*: A numeric value between 0-100 that represents the ratio of this selection to the poll total</ul>
**total** |  | The total amount of votes made for all selections in the poll

### HTML hooks and template rendering

At the very least, a parent element is required to exist on the page. By default, vanilla-poll will look for an element with the id **#polling-widget**, otherwise it will search for the CSS selector id passed in with the `el` context attribute upon instantiation

From this there are two ways to proceed:

#### Static HTML

The following HTML schema is needed when writting static HTML elements to the page:

*   Element with CSS id **#polling-question** to display poll question
*   Container elements with CSS id **#poll-choices** and **#poll-results**
    as respective parents (this can be a `<div` or `<ul>`, etc)
*   Individual elements with CSS group **.poll-choice** and **.poll-result** respectively
    nested under their parent container element, along with a data attribute **data-id** which corresponds to the index # of the poll-data object

Note that there is not much flexibility in rendering the DOM, the default templating function will overwrite anything that does not conform to this standard.

To tweak this behaviour, simply modify `default_template_func` within the **PollingWidget** function declaration


#### Templating function

The polling widget will also accept a custom templating function that can be passed into the `template` context attribute. The template exists as nested underneath the parent `el` element and must follow the same schema as above. However there is more flexibility, as you can include additional HTML elements as well as more freedom with positioning and arrangement of elements

Here is an example using a Handlebars template:

```javascript
var myCustomTemplateFunc = Handlebars.compile(document.getElementById('poll-template').innerHTML);
var myPoll = new PollingWidget({
    url: "data.json",
    template: myCustomTemplateFunc
});

myPoll.init();
```



### Instantiate  and start the polling widget

The polling widget object is created with a *context* argument that provides instructions for how you want to set up the poll. Here is an example

```javascript
    var myPollingWidget = new PollingWidget({
        el: #idOfWidgetDiv, // this defaults to #polling-widget
        url: 'api/endpoint', // this defaults to ''
    });
```

Then, once instantiated, start polling with:
```javascript
    myPollingWidget.init();
```
Which will render the poll into the DOM and set up the event binding


## TODO:

*   Context argument description
*   Various behaviours
*   Source documentation + function descriptions



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








