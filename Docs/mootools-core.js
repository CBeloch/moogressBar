/*
---

script: Core.js

description: The core of MooTools, contains all the base functions and the Native and Hash implementations. Required by all the other scripts.

license: MIT-style license.

copyright: Copyright (c) 2006-2008 [Valerio Proietti](http://mad4milk.net/).

authors: The MooTools production team (http://mootools.net/developers/)

inspiration:
- Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
- Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)

provides: [Mootools, Native, Hash.base, Array.each, $util]

...
*/

var MooTools = {
	'version': '1.2.4',
	'build': '0d9113241a90b9cd5643b926795852a2026710d4'
};

var Native = function(options){
	options = options || {};
	var name = options.name;
	var legacy = options.legacy;
	var protect = options.protect;
	var methods = options.implement;
	var generics = options.generics;
	var initialize = options.initialize;
	var afterImplement = options.afterImplement || function(){};
	var object = initialize || legacy;
	generics = generics !== false;

	object.constructor = Native;
	object.$family = {name: 'native'};
	if (legacy && initialize) object.prototype = legacy.prototype;
	object.prototype.constructor = object;

	if (name){
		var family = name.toLowerCase();
		object.prototype.$family = {name: family};
		Native.typize(object, family);
	}

	var add = function(obj, name, method, force){
		if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
		if (generics) Native.genericize(obj, name, protect);
		afterImplement.call(obj, name, method);
		return obj;
	};

	object.alias = function(a1, a2, a3){
		if (typeof a1 == 'string'){
			var pa1 = this.prototype[a1];
			if ((a1 = pa1)) return add(this, a2, a1, a3);
		}
		for (var a in a1) this.alias(a, a1[a], a2);
		return this;
	};

	object.implement = function(a1, a2, a3){
		if (typeof a1 == 'string') return add(this, a1, a2, a3);
		for (var p in a1) add(this, p, a1[p], a2);
		return this;
	};

	if (methods) object.implement(methods);

	return object;
};

Native.genericize = function(object, property, check){
	if ((!check || !object[property]) && typeof object.prototype[property] == 'function') object[property] = function(){
		var args = Array.prototype.slice.call(arguments);
		return object.prototype[property].apply(args.shift(), args);
	};
};

Native.implement = function(objects, properties){
	for (var i = 0, l = objects.length; i < l; i++) objects[i].implement(properties);
};

Native.typize = function(object, family){
	if (!object.type) object.type = function(item){
		return ($type(item) === family);
	};
};

(function(){
	var natives = {'Array': Array, 'Date': Date, 'Function': Function, 'Number': Number, 'RegExp': RegExp, 'String': String};
	for (var n in natives) new Native({name: n, initialize: natives[n], protect: true});

	var types = {'boolean': Boolean, 'native': Native, 'object': Object};
	for (var t in types) Native.typize(types[t], t);

	var generics = {
		'Array': ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf"],
		'String': ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf"]
	};
	for (var g in generics){
		for (var i = generics[g].length; i--;) Native.genericize(natives[g], generics[g][i], true);
	}
})();

var Hash = new Native({

	name: 'Hash',

	initialize: function(object){
		if ($type(object) == 'hash') object = $unlink(object.getClean());
		for (var key in object) this[key] = object[key];
		return this;
	}

});

Hash.implement({

	forEach: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key)) fn.call(bind, this[key], key, this);
		}
	},

	getClean: function(){
		var clean = {};
		for (var key in this){
			if (this.hasOwnProperty(key)) clean[key] = this[key];
		}
		return clean;
	},

	getLength: function(){
		var length = 0;
		for (var key in this){
			if (this.hasOwnProperty(key)) length++;
		}
		return length;
	}

});

Hash.alias('forEach', 'each');

Array.implement({

	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++) fn.call(bind, this[i], i, this);
	}

});

Array.alias('forEach', 'each');

function $A(iterable){
	if (iterable.item){
		var l = iterable.length, array = new Array(l);
		while (l--) array[l] = iterable[l];
		return array;
	}
	return Array.prototype.slice.call(iterable);
};

function $arguments(i){
	return function(){
		return arguments[i];
	};
};

function $chk(obj){
	return !!(obj || obj === 0);
};

function $clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

function $defined(obj){
	return (obj != undefined);
};

function $each(iterable, fn, bind){
	var type = $type(iterable);
	((type == 'arguments' || type == 'collection' || type == 'array') ? Array : Hash).each(iterable, fn, bind);
};

function $empty(){};

function $extend(original, extended){
	for (var key in (extended || {})) original[key] = extended[key];
	return original;
};

function $H(object){
	return new Hash(object);
};

function $lambda(value){
	return ($type(value) == 'function') ? value : function(){
		return value;
	};
};

function $merge(){
	var args = Array.slice(arguments);
	args.unshift({});
	return $mixin.apply(null, args);
};

function $mixin(mix){
	for (var i = 1, l = arguments.length; i < l; i++){
		var object = arguments[i];
		if ($type(object) != 'object') continue;
		for (var key in object){
			var op = object[key], mp = mix[key];
			mix[key] = (mp && $type(op) == 'object' && $type(mp) == 'object') ? $mixin(mp, op) : $unlink(op);
		}
	}
	return mix;
};

function $pick(){
	for (var i = 0, l = arguments.length; i < l; i++){
		if (arguments[i] != undefined) return arguments[i];
	}
	return null;
};

function $random(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
};

function $splat(obj){
	var type = $type(obj);
	return (type) ? ((type != 'array' && type != 'arguments') ? [obj] : obj) : [];
};

var $time = Date.now || function(){
	return +new Date;
};

function $try(){
	for (var i = 0, l = arguments.length; i < l; i++){
		try {
			return arguments[i]();
		} catch(e){}
	}
	return null;
};

function $type(obj){
	if (obj == undefined) return false;
	if (obj.$family) return (obj.$family.name == 'number' && !isFinite(obj)) ? false : obj.$family.name;
	if (obj.nodeName){
		switch (obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof obj.length == 'number'){
		if (obj.callee) return 'arguments';
		else if (obj.item) return 'collection';
	}
	return typeof obj;
};

function $unlink(object){
	var unlinked;
	switch ($type(object)){
		case 'object':
			unlinked = {};
			for (var p in object) unlinked[p] = $unlink(object[p]);
		break;
		case 'hash':
			unlinked = new Hash(object);
		break;
		case 'array':
			unlinked = [];
			for (var i = 0, l = object.length; i < l; i++) unlinked[i] = $unlink(object[i]);
		break;
		default: return object;
	}
	return unlinked;
};


/*
---

script: Browser.js

description: The Browser Core. Contains Browser initialization, Window and Document, and the Browser Hash.

license: MIT-style license.

requires: 
- /Native
- /$util

provides: [Browser, Window, Document, $exec]

...
*/

var Browser = $merge({

	Engine: {name: 'unknown', version: 0},

	Platform: {name: (window.orientation != undefined) ? 'ipod' : (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()},

	Features: {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)},

	Plugins: {},

	Engines: {

		presto: function(){
			return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925));
		},

		trident: function(){
			return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? ((document.querySelectorAll) ? 6 : 5) : 4);
		},

		webkit: function(){
			return (navigator.taintEnabled) ? false : ((Browser.Features.xpath) ? ((Browser.Features.query) ? 525 : 420) : 419);
		},

		gecko: function(){
			return (!document.getBoxObjectFor && window.mozInnerScreenX == null) ? false : ((document.getElementsByClassName) ? 19 : 18);
		}

	}

}, Browser || {});

Browser.Platform[Browser.Platform.name] = true;

Browser.detect = function(){

	for (var engine in this.Engines){
		var version = this.Engines[engine]();
		if (version){
			this.Engine = {name: engine, version: version};
			this.Engine[engine] = this.Engine[engine + version] = true;
			break;
		}
	}

	return {name: engine, version: version};

};

Browser.detect();

Browser.Request = function(){
	return $try(function(){
		return new XMLHttpRequest();
	}, function(){
		return new ActiveXObject('MSXML2.XMLHTTP');
	}, function(){
		return new ActiveXObject('Microsoft.XMLHTTP');
	});
};

Browser.Features.xhr = !!(Browser.Request());

Browser.Plugins.Flash = (function(){
	var version = ($try(function(){
		return navigator.plugins['Shockwave Flash'].description;
	}, function(){
		return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
	}) || '0 r0').match(/\d+/g);
	return {version: parseInt(version[0] || 0 + '.' + version[1], 10) || 0, build: parseInt(version[2], 10) || 0};
})();

function $exec(text){
	if (!text) return text;
	if (window.execScript){
		window.execScript(text);
	} else {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script[(Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerText' : 'text'] = text;
		document.head.appendChild(script);
		document.head.removeChild(script);
	}
	return text;
};

Native.UID = 1;

var $uid = (Browser.Engine.trident) ? function(item){
	return (item.uid || (item.uid = [Native.UID++]))[0];
} : function(item){
	return item.uid || (item.uid = Native.UID++);
};

var Window = new Native({

	name: 'Window',

	legacy: (Browser.Engine.trident) ? null: window.Window,

	initialize: function(win){
		$uid(win);
		if (!win.Element){
			win.Element = $empty;
			if (Browser.Engine.webkit) win.document.createElement("iframe"); //fixes safari 2
			win.Element.prototype = (Browser.Engine.webkit) ? window["[[DOMElement.prototype]]"] : {};
		}
		win.document.window = win;
		return $extend(win, Window.Prototype);
	},

	afterImplement: function(property, value){
		window[property] = Window.Prototype[property] = value;
	}

});

Window.Prototype = {$family: {name: 'window'}};

new Window(window);

var Document = new Native({

	name: 'Document',

	legacy: (Browser.Engine.trident) ? null: window.Document,

	initialize: function(doc){
		$uid(doc);
		doc.head = doc.getElementsByTagName('head')[0];
		doc.html = doc.getElementsByTagName('html')[0];
		if (Browser.Engine.trident && Browser.Engine.version <= 4) $try(function(){
			doc.execCommand("BackgroundImageCache", false, true);
		});
		if (Browser.Engine.trident) doc.window.attachEvent('onunload', function(){
			doc.window.detachEvent('onunload', arguments.callee);
			doc.head = doc.html = doc.window = null;
		});
		return $extend(doc, Document.Prototype);
	},

	afterImplement: function(property, value){
		document[property] = Document.Prototype[property] = value;
	}

});

Document.Prototype = {$family: {name: 'document'}};

new Document(document);


/*
---

script: Array.js

description: Contains Array Prototypes like each, contains, and erase.

license: MIT-style license.

requires:
- /$util
- /Array.each

provides: [Array]

...
*/

Array.implement({

	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	clean: function(){
		return this.filter($defined);
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++) results[i] = fn.call(bind, this[i], i, this);
		return results;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in object){
				if (object[key](this[i])){
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	extend: function(array){
		for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
		return this;
	},
	
	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function(){
		return (this.length) ? this[$random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--; i){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = $type(this[i]);
			if (!type) continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments') ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},

	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array){
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	}

});


/*
---

script: Function.js

description: Contains Function Prototypes like create, bind, pass, and delay.

license: MIT-style license.

requires:
- /Native
- /$util

provides: [Function]

...
*/

Function.implement({

	extend: function(properties){
		for (var property in properties) this[property] = properties[property];
		return this;
	},

	create: function(options){
		var self = this;
		options = options || {};
		return function(event){
			var args = options.arguments;
			args = (args != undefined) ? $splat(args) : Array.slice(arguments, (options.event) ? 1 : 0);
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply(options.bind || null, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) return $try(returns);
			return returns();
		};
	},

	run: function(args, bind){
		return this.apply(bind, $splat(args));
	},

	pass: function(args, bind){
		return this.create({bind: bind, arguments: args});
	},

	bind: function(bind, args){
		return this.create({bind: bind, arguments: args});
	},

	bindWithEvent: function(bind, args){
		return this.create({bind: bind, arguments: args, event: true});
	},

	attempt: function(args, bind){
		return this.create({bind: bind, arguments: args, attempt: true})();
	},

	delay: function(delay, bind, args){
		return this.create({bind: bind, arguments: args, delay: delay})();
	},

	periodical: function(periodical, bind, args){
		return this.create({bind: bind, arguments: args, periodical: periodical})();
	}

});


/*
---

script: Number.js

description: Contains Number Prototypes like limit, round, times, and ceil.

license: MIT-style license.

requires:
- /Native
- /$util

provides: [Number]

...
*/

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	}

});

Number.alias('times', 'each');

(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat($A(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);


/*
---

script: String.js

description: Contains String Prototypes like camelCase, capitalize, test, and toInt.

license: MIT-style license.

requires:
- /Native

provides: [String]

...
*/

String.implement({

	test: function(regex, params){
		return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	stripScripts: function(option){
		var scripts = '';
		var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
			scripts += arguments[1] + '\n';
			return '';
		});
		if (option === true) $exec(scripts);
		else if ($type(option) == 'function') option(scripts, text);
		return text;
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != undefined) ? object[name] : '';
		});
	}

});


/*
---

script: Hash.js

description: Contains Hash Prototypes. Provides a means for overcoming the JavaScript practical impossibility of extending native Objects.

license: MIT-style license.

requires:
- /Hash.base

provides: [Hash]

...
*/

Hash.implement({

	has: Object.prototype.hasOwnProperty,

	keyOf: function(value){
		for (var key in this){
			if (this.hasOwnProperty(key) && this[key] === value) return key;
		}
		return null;
	},

	hasValue: function(value){
		return (Hash.keyOf(this, value) !== null);
	},

	extend: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.set(this, key, value);
		}, this);
		return this;
	},

	combine: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.include(this, key, value);
		}, this);
		return this;
	},

	erase: function(key){
		if (this.hasOwnProperty(key)) delete this[key];
		return this;
	},

	get: function(key){
		return (this.hasOwnProperty(key)) ? this[key] : null;
	},

	set: function(key, value){
		if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
		return this;
	},

	empty: function(){
		Hash.each(this, function(value, key){
			delete this[key];
		}, this);
		return this;
	},

	include: function(key, value){
		if (this[key] == undefined) this[key] = value;
		return this;
	},

	map: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			results.set(key, fn.call(bind, value, key, this));
		}, this);
		return results;
	},

	filter: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			if (fn.call(bind, value, key, this)) results.set(key, value);
		}, this);
		return results;
	},

	every: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && !fn.call(bind, this[key], key)) return false;
		}
		return true;
	},

	some: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && fn.call(bind, this[key], key)) return true;
		}
		return false;
	},

	getKeys: function(){
		var keys = [];
		Hash.each(this, function(value, key){
			keys.push(key);
		});
		return keys;
	},

	getValues: function(){
		var values = [];
		Hash.each(this, function(value){
			values.push(value);
		});
		return values;
	},

	toQueryString: function(base){
		var queryString = [];
		Hash.each(this, function(value, key){
			if (base) key = base + '[' + key + ']';
			var result;
			switch ($type(value)){
				case 'object': result = Hash.toQueryString(value, key); break;
				case 'array':
					var qs = {};
					value.each(function(val, i){
						qs[i] = val;
					});
					result = Hash.toQueryString(qs, key);
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != undefined) queryString.push(result);
		});

		return queryString.join('&');
	}

});

Hash.alias({keyOf: 'indexOf', hasValue: 'contains'});


/*
---

script: Class.js

description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

license: MIT-style license.

requires:
- /$util
- /Native
- /Array
- /String
- /Function
- /Number
- /Hash

provides: [Class]

...
*/

function Class(params){
	
	if (params instanceof Function) params = {initialize: params};
	
	var newClass = function(){
		Object.reset(this);
		if (newClass._prototyping) return this;
		this._current = $empty;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		delete this._current; delete this.caller;
		return value;
	}.extend(this);
	
	newClass.implement(params);
	
	newClass.constructor = Class;
	newClass.prototype.constructor = newClass;

	return newClass;

};

Function.prototype.protect = function(){
	this._protected = true;
	return this;
};

Object.reset = function(object, key){
		
	if (key == null){
		for (var p in object) Object.reset(object, p);
		return object;
	}
	
	delete object[key];
	
	switch ($type(object[key])){
		case 'object':
			var F = function(){};
			F.prototype = object[key];
			var i = new F;
			object[key] = Object.reset(i);
		break;
		case 'array': object[key] = $unlink(object[key]); break;
	}
	
	return object;
	
};

new Native({name: 'Class', initialize: Class}).extend({

	instantiate: function(F){
		F._prototyping = true;
		var proto = new F;
		delete F._prototyping;
		return proto;
	},
	
	wrap: function(self, key, method){
		if (method._origin) method = method._origin;
		
		return function(){
			if (method._protected && this._current == null) throw new Error('The method "' + key + '" cannot be called.');
			var caller = this.caller, current = this._current;
			this.caller = current; this._current = arguments.callee;
			var result = method.apply(this, arguments);
			this._current = current; this.caller = caller;
			return result;
		}.extend({_owner: self, _origin: method, _name: key});

	}
	
});

Class.implement({
	
	implement: function(key, value){
		
		if ($type(key) == 'object'){
			for (var p in key) this.implement(p, key[p]);
			return this;
		}
		
		var mutator = Class.Mutators[key];
		
		if (mutator){
			value = mutator.call(this, value);
			if (value == null) return this;
		}
		
		var proto = this.prototype;

		switch ($type(value)){
			
			case 'function':
				if (value._hidden) return this;
				proto[key] = Class.wrap(this, key, value);
			break;
			
			case 'object':
				var previous = proto[key];
				if ($type(previous) == 'object') $mixin(previous, value);
				else proto[key] = $unlink(value);
			break;
			
			case 'array':
				proto[key] = $unlink(value);
			break;
			
			default: proto[key] = value;

		}
		
		return this;

	}
	
});

Class.Mutators = {
	
	Extends: function(parent){

		this.parent = parent;
		this.prototype = Class.instantiate(parent);

		this.implement('parent', function(){
			var name = this.caller._name, previous = this.caller._owner.parent.prototype[name];
			if (!previous) throw new Error('The method "' + name + '" has no parent.');
			return previous.apply(this, arguments);
		}.protect());

	},

	Implements: function(items){
		$splat(items).each(function(item){
			if (item instanceof Function) item = Class.instantiate(item);
			this.implement(item);
		}, this);

	}
	
};


/*
---

script: Class.Extras.js

description: Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

license: MIT-style license.

requires:
- /Class

provides: [Chain, Events, Options]

...
*/

var Chain = new Class({

	$chain: [],

	chain: function(){
		this.$chain.extend(Array.flatten(arguments));
		return this;
	},

	callChain: function(){
		return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
	},

	clearChain: function(){
		this.$chain.empty();
		return this;
	}

});

var Events = new Class({

	$events: {},

	addEvent: function(type, fn, internal){
		type = Events.removeOn(type);
		if (fn != $empty){
			this.$events[type] = this.$events[type] || [];
			this.$events[type].include(fn);
			if (internal) fn.internal = true;
		}
		return this;
	},

	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},

	fireEvent: function(type, args, delay){
		type = Events.removeOn(type);
		if (!this.$events || !this.$events[type]) return this;
		this.$events[type].each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	removeEvent: function(type, fn){
		type = Events.removeOn(type);
		if (!this.$events[type]) return this;
		if (!fn.internal) this.$events[type].erase(fn);
		return this;
	},

	removeEvents: function(events){
		var type;
		if ($type(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = Events.removeOn(events);
		for (type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--; i) this.removeEvent(type, fns[i]);
		}
		return this;
	}

});

Events.removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

var Options = new Class({

	setOptions: function(){
		this.options = $merge.run([this.options].extend(arguments));
		if (!this.addEvent) return this;
		for (var option in this.options){
			if ($type(this.options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, this.options[option]);
			delete this.options[option];
		}
		return this;
	}

});


/*
---

script: Element.js

description: One of the most important items in MooTools. Contains the dollar function, the dollars function, and an handful of cross-browser, time-saver methods to let you easily work with HTML Elements.

license: MIT-style license.

requires:
- /Window
- /Document
- /Array
- /String
- /Function
- /Number
- /Hash

provides: [Element, Elements, $, $$, Iframe]

...
*/

var Element = new Native({

	name: 'Element',

	legacy: window.Element,

	initialize: function(tag, props){
		var konstructor = Element.Constructors.get(tag);
		if (konstructor) return konstructor(props);
		if (typeof tag == 'string') return document.newElement(tag, props);
		return document.id(tag).set(props);
	},

	afterImplement: function(key, value){
		Element.Prototype[key] = value;
		if (Array[key]) return;
		Elements.implement(key, function(){
			var items = [], elements = true;
			for (var i = 0, j = this.length; i < j; i++){
				var returns = this[i][key].apply(this[i], arguments);
				items.push(returns);
				if (elements) elements = ($type(returns) == 'element');
			}
			return (elements) ? new Elements(items) : items;
		});
	}

});

Element.Prototype = {$family: {name: 'element'}};

Element.Constructors = new Hash;

var IFrame = new Native({

	name: 'IFrame',

	generics: false,

	initialize: function(){
		var params = Array.link(arguments, {properties: Object.type, iframe: $defined});
		var props = params.properties || {};
		var iframe = document.id(params.iframe);
		var onload = props.onload || $empty;
		delete props.onload;
		props.id = props.name = $pick(props.id, props.name, iframe ? (iframe.id || iframe.name) : 'IFrame_' + $time());
		iframe = new Element(iframe || 'iframe', props);
		var onFrameLoad = function(){
			var host = $try(function(){
				return iframe.contentWindow.location.host;
			});
			if (!host || host == window.location.host){
				var win = new Window(iframe.contentWindow);
				new Document(iframe.contentWindow.document);
				$extend(win.Element.prototype, Element.Prototype);
			}
			onload.call(iframe.contentWindow, iframe.contentWindow.document);
		};
		var contentWindow = $try(function(){
			return iframe.contentWindow;
		});
		((contentWindow && contentWindow.document.body) || window.frames[props.id]) ? onFrameLoad() : iframe.addListener('load', onFrameLoad);
		return iframe;
	}

});

var Elements = new Native({

	initialize: function(elements, options){
		options = $extend({ddup: true, cash: true}, options);
		elements = elements || [];
		if (options.ddup || options.cash){
			var uniques = {}, returned = [];
			for (var i = 0, l = elements.length; i < l; i++){
				var el = document.id(elements[i], !options.cash);
				if (options.ddup){
					if (uniques[el.uid]) continue;
					uniques[el.uid] = true;
				}
				if (el) returned.push(el);
			}
			elements = returned;
		}
		return (options.cash) ? $extend(elements, this) : elements;
	}

});

Elements.implement({

	filter: function(filter, bind){
		if (!filter) return this;
		return new Elements(Array.filter(this, (typeof filter == 'string') ? function(item){
			return item.match(filter);
		} : filter, bind));
	}

});

Document.implement({

	newElement: function(tag, props){
		if (Browser.Engine.trident && props){
			['name', 'type', 'checked'].each(function(attribute){
				if (!props[attribute]) return;
				tag += ' ' + attribute + '="' + props[attribute] + '"';
				if (attribute != 'checked') delete props[attribute];
			});
			tag = '<' + tag + '>';
		}
		return document.id(this.createElement(tag)).set(props);
	},

	newTextNode: function(text){
		return this.createTextNode(text);
	},

	getDocument: function(){
		return this;
	},

	getWindow: function(){
		return this.window;
	},
	
	id: (function(){
		
		var types = {

			string: function(id, nocash, doc){
				id = doc.getElementById(id);
				return (id) ? types.element(id, nocash) : null;
			},
			
			element: function(el, nocash){
				$uid(el);
				if (!nocash && !el.$family && !(/^object|embed$/i).test(el.tagName)){
					var proto = Element.Prototype;
					for (var p in proto) el[p] = proto[p];
				};
				return el;
			},
			
			object: function(obj, nocash, doc){
				if (obj.toElement) return types.element(obj.toElement(doc), nocash);
				return null;
			}
			
		};

		types.textnode = types.whitespace = types.window = types.document = $arguments(0);
		
		return function(el, nocash, doc){
			if (el && el.$family && el.uid) return el;
			var type = $type(el);
			return (types[type]) ? types[type](el, nocash, doc || document) : null;
		};

	})()

});

if (window.$ == null) Window.implement({
	$: function(el, nc){
		return document.id(el, nc, this.document);
	}
});

Window.implement({

	$$: function(selector){
		if (arguments.length == 1 && typeof selector == 'string') return this.document.getElements(selector);
		var elements = [];
		var args = Array.flatten(arguments);
		for (var i = 0, l = args.length; i < l; i++){
			var item = args[i];
			switch ($type(item)){
				case 'element': elements.push(item); break;
				case 'string': elements.extend(this.document.getElements(item, true));
			}
		}
		return new Elements(elements);
	},

	getDocument: function(){
		return this.document;
	},

	getWindow: function(){
		return this;
	}

});

Native.implement([Element, Document], {

	getElement: function(selector, nocash){
		return document.id(this.getElements(selector, true)[0] || null, nocash);
	},

	getElements: function(tags, nocash){
		tags = tags.split(',');
		var elements = [];
		var ddup = (tags.length > 1);
		tags.each(function(tag){
			var partial = this.getElementsByTagName(tag.trim());
			(ddup) ? elements.extend(partial) : elements = partial;
		}, this);
		return new Elements(elements, {ddup: ddup, cash: !nocash});
	}

});

(function(){

var collected = {}, storage = {};
var props = {input: 'checked', option: 'selected', textarea: (Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerHTML' : 'value'};

var get = function(uid){
	return (storage[uid] || (storage[uid] = {}));
};

var clean = function(item, retain){
	if (!item) return;
	var uid = item.uid;
	if (Browser.Engine.trident){
		if (item.clearAttributes){
			var clone = retain && item.cloneNode(false);
			item.clearAttributes();
			if (clone) item.mergeAttributes(clone);
		} else if (item.removeEvents){
			item.removeEvents();
		}
		if ((/object/i).test(item.tagName)){
			for (var p in item){
				if (typeof item[p] == 'function') item[p] = $empty;
			}
			Element.dispose(item);
		}
	}	
	if (!uid) return;
	collected[uid] = storage[uid] = null;
};

var purge = function(){
	Hash.each(collected, clean);
	if (Browser.Engine.trident) $A(document.getElementsByTagName('object')).each(clean);
	if (window.CollectGarbage) CollectGarbage();
	collected = storage = null;
};

var walk = function(element, walk, start, match, all, nocash){
	var el = element[start || walk];
	var elements = [];
	while (el){
		if (el.nodeType == 1 && (!match || Element.match(el, match))){
			if (!all) return document.id(el, nocash);
			elements.push(el);
		}
		el = el[walk];
	}
	return (all) ? new Elements(elements, {ddup: false, cash: !nocash}) : null;
};

var attributes = {
	'html': 'innerHTML',
	'class': 'className',
	'for': 'htmlFor',
	'defaultValue': 'defaultValue',
	'text': (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version < 420)) ? 'innerText' : 'textContent'
};
var bools = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readonly', 'multiple', 'selected', 'noresize', 'defer'];
var camels = ['value', 'type', 'defaultValue', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly', 'rowSpan', 'tabIndex', 'useMap'];

bools = bools.associate(bools);

Hash.extend(attributes, bools);
Hash.extend(attributes, camels.associate(camels.map(String.toLowerCase)));

var inserters = {

	before: function(context, element){
		if (element.parentNode) element.parentNode.insertBefore(context, element);
	},

	after: function(context, element){
		if (!element.parentNode) return;
		var next = element.nextSibling;
		(next) ? element.parentNode.insertBefore(context, next) : element.parentNode.appendChild(context);
	},

	bottom: function(context, element){
		element.appendChild(context);
	},

	top: function(context, element){
		var first = element.firstChild;
		(first) ? element.insertBefore(context, first) : element.appendChild(context);
	}

};

inserters.inside = inserters.bottom;

Hash.each(inserters, function(inserter, where){

	where = where.capitalize();

	Element.implement('inject' + where, function(el){
		inserter(this, document.id(el, true));
		return this;
	});

	Element.implement('grab' + where, function(el){
		inserter(document.id(el, true), this);
		return this;
	});

});

Element.implement({

	set: function(prop, value){
		switch ($type(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				var property = Element.Properties.get(prop);
				(property && property.set) ? property.set.apply(this, Array.slice(arguments, 1)) : this.setProperty(prop, value);
		}
		return this;
	},

	get: function(prop){
		var property = Element.Properties.get(prop);
		return (property && property.get) ? property.get.apply(this, Array.slice(arguments, 1)) : this.getProperty(prop);
	},

	erase: function(prop){
		var property = Element.Properties.get(prop);
		(property && property.erase) ? property.erase.apply(this) : this.removeProperty(prop);
		return this;
	},

	setProperty: function(attribute, value){
		var key = attributes[attribute];
		if (value == undefined) return this.removeProperty(attribute);
		if (key && bools[attribute]) value = !!value;
		(key) ? this[key] = value : this.setAttribute(attribute, '' + value);
		return this;
	},

	setProperties: function(attributes){
		for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
		return this;
	},

	getProperty: function(attribute){
		var key = attributes[attribute];
		var value = (key) ? this[key] : this.getAttribute(attribute, 2);
		return (bools[attribute]) ? !!value : (key) ? value : value || null;
	},

	getProperties: function(){
		var args = $A(arguments);
		return args.map(this.getProperty, this).associate(args);
	},

	removeProperty: function(attribute){
		var key = attributes[attribute];
		(key) ? this[key] = (key && bools[attribute]) ? false : '' : this.removeAttribute(attribute);
		return this;
	},

	removeProperties: function(){
		Array.each(arguments, this.removeProperty, this);
		return this;
	},

	hasClass: function(className){
		return this.className.contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		return this;
	},

	toggleClass: function(className){
		return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	},

	adopt: function(){
		Array.flatten(arguments).each(function(element){
			element = document.id(element, true);
			if (element) this.appendChild(element);
		}, this);
		return this;
	},

	appendText: function(text, where){
		return this.grab(this.getDocument().newTextNode(text), where);
	},

	grab: function(el, where){
		inserters[where || 'bottom'](document.id(el, true), this);
		return this;
	},

	inject: function(el, where){
		inserters[where || 'bottom'](this, document.id(el, true));
		return this;
	},

	replaces: function(el){
		el = document.id(el, true);
		el.parentNode.replaceChild(this, el);
		return this;
	},

	wraps: function(el, where){
		el = document.id(el, true);
		return this.replaces(el).grab(el, where);
	},

	getPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, false, nocash);
	},

	getAllPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, true, nocash);
	},

	getNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, false, nocash);
	},

	getAllNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, true, nocash);
	},

	getFirst: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, false, nocash);
	},

	getLast: function(match, nocash){
		return walk(this, 'previousSibling', 'lastChild', match, false, nocash);
	},

	getParent: function(match, nocash){
		return walk(this, 'parentNode', null, match, false, nocash);
	},

	getParents: function(match, nocash){
		return walk(this, 'parentNode', null, match, true, nocash);
	},
	
	getSiblings: function(match, nocash){
		return this.getParent().getChildren(match, nocash).erase(this);
	},

	getChildren: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, true, nocash);
	},

	getWindow: function(){
		return this.ownerDocument.window;
	},

	getDocument: function(){
		return this.ownerDocument;
	},

	getElementById: function(id, nocash){
		var el = this.ownerDocument.getElementById(id);
		if (!el) return null;
		for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
			if (!parent) return null;
		}
		return document.id(el, nocash);
	},

	getSelected: function(){
		return new Elements($A(this.options).filter(function(option){
			return option.selected;
		}));
	},

	getComputedStyle: function(property){
		if (this.currentStyle) return this.currentStyle[property.camelCase()];
		var computed = this.getDocument().defaultView.getComputedStyle(this, null);
		return (computed) ? computed.getPropertyValue([property.hyphenate()]) : null;
	},

	toQueryString: function(){
		var queryString = [];
		this.getElements('input, select, textarea', true).each(function(el){
			if (!el.name || el.disabled || el.type == 'submit' || el.type == 'reset' || el.type == 'file') return;
			var value = (el.tagName.toLowerCase() == 'select') ? Element.getSelected(el).map(function(opt){
				return opt.value;
			}) : ((el.type == 'radio' || el.type == 'checkbox') && !el.checked) ? null : el.value;
			$splat(value).each(function(val){
				if (typeof val != 'undefined') queryString.push(el.name + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	},

	clone: function(contents, keepid){
		contents = contents !== false;
		var clone = this.cloneNode(contents);
		var clean = function(node, element){
			if (!keepid) node.removeAttribute('id');
			if (Browser.Engine.trident){
				node.clearAttributes();
				node.mergeAttributes(element);
				node.removeAttribute('uid');
				if (node.options){
					var no = node.options, eo = element.options;
					for (var j = no.length; j--;) no[j].selected = eo[j].selected;
				}
			}
			var prop = props[element.tagName.toLowerCase()];
			if (prop && element[prop]) node[prop] = element[prop];
		};

		if (contents){
			var ce = clone.getElementsByTagName('*'), te = this.getElementsByTagName('*');
			for (var i = ce.length; i--;) clean(ce[i], te[i]);
		}

		clean(clone, this);
		return document.id(clone);
	},

	destroy: function(){
		Element.empty(this);
		Element.dispose(this);
		clean(this, true);
		return null;
	},

	empty: function(){
		$A(this.childNodes).each(function(node){
			Element.destroy(node);
		});
		return this;
	},

	dispose: function(){
		return (this.parentNode) ? this.parentNode.removeChild(this) : this;
	},

	hasChild: function(el){
		el = document.id(el, true);
		if (!el) return false;
		if (Browser.Engine.webkit && Browser.Engine.version < 420) return $A(this.getElementsByTagName(el.tagName)).contains(el);
		return (this.contains) ? (this != el && this.contains(el)) : !!(this.compareDocumentPosition(el) & 16);
	},

	match: function(tag){
		return (!tag || (tag == this) || (Element.get(this, 'tag') == tag));
	}

});

Native.implement([Element, Window, Document], {

	addListener: function(type, fn){
		if (type == 'unload'){
			var old = fn, self = this;
			fn = function(){
				self.removeListener('unload', fn);
				old();
			};
		} else {
			collected[this.uid] = this;
		}
		if (this.addEventListener) this.addEventListener(type, fn, false);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, false);
		else this.detachEvent('on' + type, fn);
		return this;
	},

	retrieve: function(property, dflt){
		var storage = get(this.uid), prop = storage[property];
		if (dflt != undefined && prop == undefined) prop = storage[property] = dflt;
		return $pick(prop);
	},

	store: function(property, value){
		var storage = get(this.uid);
		storage[property] = value;
		return this;
	},

	eliminate: function(property){
		var storage = get(this.uid);
		delete storage[property];
		return this;
	}

});

window.addListener('unload', purge);

})();

Element.Properties = new Hash;

Element.Properties.style = {

	set: function(style){
		this.style.cssText = style;
	},

	get: function(){
		return this.style.cssText;
	},

	erase: function(){
		this.style.cssText = '';
	}

};

Element.Properties.tag = {

	get: function(){
		return this.tagName.toLowerCase();
	}

};

Element.Properties.html = (function(){
	var wrapper = document.createElement('div');

	var translations = {
		table: [1, '<table>', '</table>'],
		select: [1, '<select>', '</select>'],
		tbody: [2, '<table><tbody>', '</tbody></table>'],
		tr: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.thead = translations.tfoot = translations.tbody;

	var html = {
		set: function(){
			var html = Array.flatten(arguments).join('');
			var wrap = Browser.Engine.trident && translations[this.get('tag')];
			if (wrap){
				var first = wrapper;
				first.innerHTML = wrap[1] + html + wrap[2];
				for (var i = wrap[0]; i--;) first = first.firstChild;
				this.empty().adopt(first.childNodes);
			} else {
				this.innerHTML = html;
			}
		}
	};

	html.erase = html.set;

	return html;
})();

if (Browser.Engine.webkit && Browser.Engine.version < 420) Element.Properties.text = {
	get: function(){
		if (this.innerText) return this.innerText;
		var temp = this.ownerDocument.newElement('div', {html: this.innerHTML}).inject(this.ownerDocument.body);
		var text = temp.innerText;
		temp.destroy();
		return text;
	}
};


/*
---

script: Element.Style.js

description: Contains methods for interacting with the styles of Elements in a fashionable way.

license: MIT-style license.

requires:
- /Element

provides: [Element.Style]

...
*/

Element.Properties.styles = {set: function(styles){
	this.setStyles(styles);
}};

Element.Properties.opacity = {

	set: function(opacity, novisibility){
		if (!novisibility){
			if (opacity == 0){
				if (this.style.visibility != 'hidden') this.style.visibility = 'hidden';
			} else {
				if (this.style.visibility != 'visible') this.style.visibility = 'visible';
			}
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (Browser.Engine.trident) this.style.filter = (opacity == 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
		this.style.opacity = opacity;
		this.store('opacity', opacity);
	},

	get: function(){
		return this.retrieve('opacity', 1);
	}

};

Element.implement({

	setOpacity: function(value){
		return this.set('opacity', value, true);
	},

	getOpacity: function(){
		return this.get('opacity');
	},

	setStyle: function(property, value){
		switch (property){
			case 'opacity': return this.set('opacity', parseFloat(value));
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		if ($type(value) != 'string'){
			var map = (Element.Styles.get(property) || '@').split(' ');
			value = $splat(value).map(function(val, i){
				if (!map[i]) return '';
				return ($type(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
			}).join(' ');
		} else if (value == String(Number(value))){
			value = Math.round(value);
		}
		this.style[property] = value;
		return this;
	},

	getStyle: function(property){
		switch (property){
			case 'opacity': return this.get('opacity');
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		var result = this.style[property];
		if (!$chk(result)){
			result = [];
			for (var style in Element.ShortStyles){
				if (property != style) continue;
				for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
				return result.join(' ');
			}
			result = this.getComputedStyle(property);
		}
		if (result){
			result = String(result);
			var color = result.match(/rgba?\([\d\s,]+\)/);
			if (color) result = result.replace(color[0], color[0].rgbToHex());
		}
		if (Browser.Engine.presto || (Browser.Engine.trident && !$chk(parseInt(result, 10)))){
			if (property.test(/^(height|width)$/)){
				var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
				values.each(function(value){
					size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
				}, this);
				return this['offset' + property.capitalize()] - size + 'px';
			}
			if ((Browser.Engine.presto) && String(result).test('px')) return result;
			if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
		}
		return result;
	},

	setStyles: function(styles){
		for (var style in styles) this.setStyle(style, styles[style]);
		return this;
	},

	getStyles: function(){
		var result = {};
		Array.flatten(arguments).each(function(key){
			result[key] = this.getStyle(key);
		}, this);
		return result;
	}

});

Element.Styles = new Hash({
	left: '@px', top: '@px', bottom: '@px', right: '@px',
	width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
	backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
	fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
	margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
	borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
	zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
});

Element.ShortStyles = {margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	var Short = Element.ShortStyles;
	var All = Element.Styles;
	['margin', 'padding'].each(function(style){
		var sd = style + direction;
		Short[style][sd] = All[sd] = '@px';
	});
	var bd = 'border' + direction;
	Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
	var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
	Short[bd] = {};
	Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
	Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
	Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});


/*
---

script: Fx.js

description: Contains the basic animation logic to be extended by all other Fx Classes.

license: MIT-style license.

requires:
- /Chain
- /Events
- /Options

provides: [Fx]

...
*/

var Fx = new Class({

	Implements: [Chain, Events, Options],

	options: {
		/*
		onStart: $empty,
		onCancel: $empty,
		onComplete: $empty,
		*/
		fps: 50,
		unit: false,
		duration: 500,
		link: 'ignore'
	},

	initialize: function(options){
		this.subject = this.subject || this;
		this.setOptions(options);
		this.options.duration = Fx.Durations[this.options.duration] || this.options.duration.toInt();
		var wait = this.options.wait;
		if (wait === false) this.options.link = 'cancel';
	},

	getTransition: function(){
		return function(p){
			return -(Math.cos(Math.PI * p) - 1) / 2;
		};
	},

	step: function(){
		var time = $time();
		if (time < this.time + this.options.duration){
			var delta = this.transition((time - this.time) / this.options.duration);
			this.set(this.compute(this.from, this.to, delta));
		} else {
			this.set(this.compute(this.from, this.to, 1));
			this.complete();
		}
	},

	set: function(now){
		return now;
	},

	compute: function(from, to, delta){
		return Fx.compute(from, to, delta);
	},

	check: function(){
		if (!this.timer) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	start: function(from, to){
		if (!this.check(from, to)) return this;
		this.from = from;
		this.to = to;
		this.time = 0;
		this.transition = this.getTransition();
		this.startTimer();
		this.onStart();
		return this;
	},

	complete: function(){
		if (this.stopTimer()) this.onComplete();
		return this;
	},

	cancel: function(){
		if (this.stopTimer()) this.onCancel();
		return this;
	},

	onStart: function(){
		this.fireEvent('start', this.subject);
	},

	onComplete: function(){
		this.fireEvent('complete', this.subject);
		if (!this.callChain()) this.fireEvent('chainComplete', this.subject);
	},

	onCancel: function(){
		this.fireEvent('cancel', this.subject).clearChain();
	},

	pause: function(){
		this.stopTimer();
		return this;
	},

	resume: function(){
		this.startTimer();
		return this;
	},

	stopTimer: function(){
		if (!this.timer) return false;
		this.time = $time() - this.time;
		this.timer = $clear(this.timer);
		return true;
	},

	startTimer: function(){
		if (this.timer) return false;
		this.time = $time() - this.time;
		this.timer = this.step.periodical(Math.round(1000 / this.options.fps), this);
		return true;
	}

});

Fx.compute = function(from, to, delta){
	return (to - from) * delta + from;
};

Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};


/*
---

script: Fx.CSS.js

description: Contains the CSS animation logic. Used by Fx.Tween, Fx.Morph, Fx.Elements.

license: MIT-style license.

requires:
- /Fx
- /Element.Style

provides: [Fx.CSS]

...
*/

Fx.CSS = new Class({

	Extends: Fx,

	//prepares the base from/to object

	prepare: function(element, property, values){
		values = $splat(values);
		var values1 = values[1];
		if (!$chk(values1)){
			values[1] = values[0];
			values[0] = element.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},

	//parses a value into an array

	parse: function(value){
		value = $lambda(value)();
		value = (typeof value == 'string') ? value.split(' ') : $splat(value);
		return value.map(function(val){
			val = String(val);
			var found = false;
			Fx.CSS.Parsers.each(function(parser, key){
				if (found) return;
				var parsed = parser.parse(val);
				if ($chk(parsed)) found = {value: parsed, parser: parser};
			});
			found = found || {value: val, parser: Fx.CSS.Parsers.String};
			return found;
		});
	},

	//computes by a from and to prepared objects, using their parsers.

	compute: function(from, to, delta){
		var computed = [];
		(Math.min(from.length, to.length)).times(function(i){
			computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
		});
		computed.$family = {name: 'fx:css:value'};
		return computed;
	},

	//serves the value as settable

	serve: function(value, unit){
		if ($type(value) != 'fx:css:value') value = this.parse(value);
		var returned = [];
		value.each(function(bit){
			returned = returned.concat(bit.parser.serve(bit.value, unit));
		});
		return returned;
	},

	//renders the change to an element

	render: function(element, property, value, unit){
		element.setStyle(property, this.serve(value, unit));
	},

	//searches inside the page css to find the values for a selector

	search: function(selector){
		if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
		var to = {};
		Array.each(document.styleSheets, function(sheet, j){
			var href = sheet.href;
			if (href && href.contains('://') && !href.contains(document.domain)) return;
			var rules = sheet.rules || sheet.cssRules;
			Array.each(rules, function(rule, i){
				if (!rule.style) return;
				var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
					return m.toLowerCase();
				}) : null;
				if (!selectorText || !selectorText.test('^' + selector + '$')) return;
				Element.Styles.each(function(value, style){
					if (!rule.style[style] || Element.ShortStyles[style]) return;
					value = String(rule.style[style]);
					to[style] = (value.test(/^rgb/)) ? value.rgbToHex() : value;
				});
			});
		});
		return Fx.CSS.Cache[selector] = to;
	}

});

Fx.CSS.Cache = {};

Fx.CSS.Parsers = new Hash({

	Color: {
		parse: function(value){
			if (value.match(/^#[0-9a-f]{3,6}$/i)) return value.hexToRgb(true);
			return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value[1], value[2], value[3]] : false;
		},
		compute: function(from, to, delta){
			return from.map(function(value, i){
				return Math.round(Fx.compute(from[i], to[i], delta));
			});
		},
		serve: function(value){
			return value.map(Number);
		}
	},

	Number: {
		parse: parseFloat,
		compute: Fx.compute,
		serve: function(value, unit){
			return (unit) ? value + unit : value;
		}
	},

	String: {
		parse: $lambda(false),
		compute: $arguments(1),
		serve: $arguments(0)
	}

});


/*
---

script: Fx.Tween.js

description: Formerly Fx.Style, effect to transition any CSS property for an element.

license: MIT-style license.

requires: 
- /Fx.CSS

provides: [Fx.Tween, Element.fade, Element.highlight]

...
*/

Fx.Tween = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(property, now){
		if (arguments.length == 1){
			now = property;
			property = this.property || this.options.property;
		}
		this.render(this.element, property, now, this.options.unit);
		return this;
	},

	start: function(property, from, to){
		if (!this.check(property, from, to)) return this;
		var args = Array.flatten(arguments);
		this.property = this.options.property || args.shift();
		var parsed = this.prepare(this.element, this.property, args);
		return this.parent(parsed.from, parsed.to);
	}

});

Element.Properties.tween = {

	set: function(options){
		var tween = this.retrieve('tween');
		if (tween) tween.cancel();
		return this.eliminate('tween').store('tween:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('tween')){
			if (options || !this.retrieve('tween:options')) this.set('tween', options);
			this.store('tween', new Fx.Tween(this, this.retrieve('tween:options')));
		}
		return this.retrieve('tween');
	}

};

Element.implement({

	tween: function(property, from, to){
		this.get('tween').start(arguments);
		return this;
	},

	fade: function(how){
		var fade = this.get('tween'), o = 'opacity', toggle;
		how = $pick(how, 'toggle');
		switch (how){
			case 'in': fade.start(o, 1); break;
			case 'out': fade.start(o, 0); break;
			case 'show': fade.set(o, 1); break;
			case 'hide': fade.set(o, 0); break;
			case 'toggle':
				var flag = this.retrieve('fade:flag', this.get('opacity') == 1);
				fade.start(o, (flag) ? 0 : 1);
				this.store('fade:flag', !flag);
				toggle = true;
			break;
			default: fade.start(o, arguments);
		}
		if (!toggle) this.eliminate('fade:flag');
		return this;
	},

	highlight: function(start, end){
		if (!end){
			end = this.retrieve('highlight:original', this.getStyle('background-color'));
			end = (end == 'transparent') ? '#fff' : end;
		}
		var tween = this.get('tween');
		tween.start('background-color', start || '#ffff88', end).chain(function(){
			this.setStyle('background-color', this.retrieve('highlight:original'));
			tween.callChain();
		}.bind(this));
		return this;
	}

});


/*
---

script: Fx.Morph.js

description: Formerly Fx.Styles, effect to transition any number of CSS properties for an element using an object of rules, or CSS based selector rules.

license: MIT-style license.

requires:
- /Fx.CSS

provides: [Fx.Morph]

...
*/

Fx.Morph = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(now){
		if (typeof now == 'string') now = this.search(now);
		for (var p in now) this.render(this.element, p, now[p], this.options.unit);
		return this;
	},

	compute: function(from, to, delta){
		var now = {};
		for (var p in from) now[p] = this.parent(from[p], to[p], delta);
		return now;
	},

	start: function(properties){
		if (!this.check(properties)) return this;
		if (typeof properties == 'string') properties = this.search(properties);
		var from = {}, to = {};
		for (var p in properties){
			var parsed = this.prepare(this.element, p, properties[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		return this.parent(from, to);
	}

});

Element.Properties.morph = {

	set: function(options){
		var morph = this.retrieve('morph');
		if (morph) morph.cancel();
		return this.eliminate('morph').store('morph:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('morph')){
			if (options || !this.retrieve('morph:options')) this.set('morph', options);
			this.store('morph', new Fx.Morph(this, this.retrieve('morph:options')));
		}
		return this.retrieve('morph');
	}

};

Element.implement({

	morph: function(props){
		this.get('morph').start(props);
		return this;
	}

});


/*
---

script: Fx.Transitions.js

description: Contains a set of advanced transitions to be used with any of the Fx Classes.

license: MIT-style license.

credits:
- Easing Equations by Robert Penner, <http://www.robertpenner.com/easing/>, modified and optimized to be used with MooTools.

requires:
- /Fx

provides: [Fx.Transitions]

...
*/

Fx.implement({

	getTransition: function(){
		var trans = this.options.transition || Fx.Transitions.Sine.easeInOut;
		if (typeof trans == 'string'){
			var data = trans.split(':');
			trans = Fx.Transitions;
			trans = trans[data[0]] || trans[data[0].capitalize()];
			if (data[1]) trans = trans['ease' + data[1].capitalize() + (data[2] ? data[2].capitalize() : '')];
		}
		return trans;
	}

});

Fx.Transition = function(transition, params){
	params = $splat(params);
	return $extend(transition, {
		easeIn: function(pos){
			return transition(pos, params);
		},
		easeOut: function(pos){
			return 1 - transition(1 - pos, params);
		},
		easeInOut: function(pos){
			return (pos <= 0.5) ? transition(2 * pos, params) / 2 : (2 - transition(2 * (1 - pos), params)) / 2;
		}
	});
};

Fx.Transitions = new Hash({

	linear: $arguments(0)

});

Fx.Transitions.extend = function(transitions){
	for (var transition in transitions) Fx.Transitions[transition] = new Fx.Transition(transitions[transition]);
};

Fx.Transitions.extend({

	Pow: function(p, x){
		return Math.pow(p, x[0] || 6);
	},

	Expo: function(p){
		return Math.pow(2, 8 * (p - 1));
	},

	Circ: function(p){
		return 1 - Math.sin(Math.acos(p));
	},

	Sine: function(p){
		return 1 - Math.sin((1 - p) * Math.PI / 2);
	},

	Back: function(p, x){
		x = x[0] || 1.618;
		return Math.pow(p, 2) * ((x + 1) * p - x);
	},

	Bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	Elastic: function(p, x){
		return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
	}

});

['Quad', 'Cubic', 'Quart', 'Quint'].each(function(transition, i){
	Fx.Transitions[transition] = new Fx.Transition(function(p){
		return Math.pow(p, [i + 2]);
	});
});
