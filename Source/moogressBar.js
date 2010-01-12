/*
---

script: moogressBar.js
version: 0.2
description: with moogressBar you can easily create a progress bar powered by mooTools
license: MIT-style
authors:
- Christopher Beloch

requires: 
  core:1.2.4: '*'

provides: [Moogressbar]

...
*/

var MoogressBar = new Class({

	Implements: [Options, Events],
	
	options: {
		bgImage: 'blue.gif',  // What is the background-image?
		percentage: 0,  // Start at which percentage?
		height: 10,  // Height of the bar
		fx: { // The effects for the scroll, set to null or false if you don't want this effect
			unit: '%',
			duration: 'normal',
			property: 'width'
		} /*,
		onChange: $empty,
		onFinish: $empty
		*/
	},
	
	initialize: function(parent,options){
		this.setOptions(options);
		this.parent = document.id(parent)
			.setStyle('z-index','999');
		
		// Set the current percentage
		this.current = this.options.percentage;
		
		// Preload important Images
		//var bgImageAsset = new Asset.image(this.options.bgImage);
		
		// Draw bar
		this.theBar = new Element('div', {
			'styles': {
				display: 'block',
				width: this.options.percentage + '%',
				height: this.options.height,
				'background-image': 'url(' + this.options.bgImage + ')',/*
				// Border Radius deactivated, because Firefox is causing drawing problems
				'border-radius': '5px',
				'-webkit-border-radius': '5px',
				'-moz-border-radius': '5px'*/
			}
		}).inject(parent);
		
		// Will it be Animated?
		if(this.options.fx)
			this.fx = new Fx.Tween(this.theBar, this.options.fx);
	},
	
	// function to modify the percentage status
	setPercentage: function(percentage){
		
		if(this.fx){
			// Fire the events when the fx is complete
			this.fx.addEvent('complete',function(){
				if(percentage >= 100){
					this.fireEvent('finish');
				}
				this.fireEvent('change',percentage);
			}.bind(this));
		}else{
			// Fire the events immediately when there's no fx
			this.fireEvent('change',percentage);
			if(percentage >= 100){
				this.fireEvent('finish');
			}
		}

		// Change the percentage bar
		if(this.fx) {
			this.fx.cancel().start(this.current,percentage);
		} else {
			this.theBar.setStyle('width', percentage + '%');
		}

		// Change the current percentage
		this.current = percentage;
	},
	
	getPercentage: function(){
		return this.current;
	},
	
	toElement: function(){
		return this.parent;
	}

});