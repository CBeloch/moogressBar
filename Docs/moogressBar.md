Class: MoogressBar {#MoogressBar}
===============================

MoogressBar is a Progress-Bar class for MooTools.
This has been developed, because I haven't found any nice looking
Progress-Bar around to work with the great MooTools Framework

### Implements:

Options

MoogressBar Method: constructor {#MoogressBar:constructor}
---------------------------------------------------------


### Syntax:

	var myMoogressBar = new MoogressBar(options);

### Arguments:

1. options - (*options*) see below

### Options:

* bgImage - (*string*) the path to the background image (default: '/images/progressbar/blue.gif')
* percentage - (*integer*) percentage to initialize with (default: 0)
* height - (*string*) height of the bar (default: '10px' (height of the default background-image))
* parent_el - (*element*) the element where the bar should be injected (default: $('moocessBar'))
* animation - (*boolean*) set false to disable Morph animation of the bar (default: true)
* animation_settings - (*options*) you can specify the options of the Fx Class here, take a look at the Fx Documentation -> http://mootools.net/docs/core/Fx/Fx

MoogressBar Method: setPercentage {#MoogressBar:setPercentage}
-------------------------------------------------------------


### Syntax:

	myMoogressBar.setPercentage(percentage);

### Arguments:

1. percentage - (*integer*) To which status should the bar jump? if it reaches 100 it automatically fades out

