Class: MoogressBar
==================

MoogressBar is a Progress-Bar class for MooTools.
This has been developed, because I haven't found any nice looking
Progress-Bar around to work with the great MooTools Framework

### Implements:

Options, Events

MoogressBar Method: constructor
-------------------------------


### Syntax:

	var myMoogressBar = new MoogressBar(element,options);

### Arguments:

1. element - (*element*,*string*) The element that you add the progressbar to
1. options - (*options*) see below

### Options:

* bgImage - (*string*) the path to the background image (default: '/images/progressbar/blue.gif')
* percentage - (*integer*) percentage to initialize with (default: 0)
* height - (*string*) height of the bar (default: '10px' (height of the default background-image))
* hide - (*bool*) if set to false, the bar will not hide on 100% (default: true)
* fx - (*options*,*bool*) False if you don't want Fx, otherwise you can specify the options of the Fx Class here, take a look at the Fx Documentation -> http://mootools.net/docs/core/Fx/Fx

### Events:

* onChange - Executed on any setPercentage request
* onFinish - Fired if progress bar reaches 100% or more

MoogressBar Method: setPercentage
---------------------------------


### Syntax:

	myMoogressBar.setPercentage(percentage);

### Arguments:

1. percentage - (*integer*) To which status should the bar jump?


MoogressBar Method: getPercentage
---------------------------------


### Syntax:

	myMoogressBar.getPercentage();

### Returns:

(*integer*) The current percentage


MoogressBar Method: toElement
---------------------------------


### Syntax:

	document.id(myMoogressBar);

### Returns:

(*element*) The element that wraps the bar

