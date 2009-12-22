moogressBar
===========

With moogressBar you can create an easy progress bar for your website.

![Screenshot](http://moogressbar.cbeloch.de/images/moogressBar.png)

How to use
----------

Include the moogressBar.js in your project.
Add an Element to your code where the progress bar should be placed ( default: $('moogressBar') ).
Check the moogressBar.md in the Docs directory to customize the default settings.

Use Code like this:

	#JS
	var myMoogressBar = new MoogressBar();
	myMoogressBar.setPercentage(20);

This will set the percentage to 20 percent.
It hides if you set it to 100%, this will be configurable in future versions.