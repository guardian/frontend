(function(global) {
	var sup = global.writeCaptureSupport  = global.writeCaptureSupport || {};
	// scriptEval & globalEval copied almost verbatim from jQuery 1.3.2
	var scriptEval = (function() {
		var script = document.createElement("script");
		var id = "script" + (new Date).getTime();
		var root = document.documentElement;
		
		script.type = "text/javascript";
		try {
			script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
		} catch(e){}

		root.insertBefore( script, root.firstChild );

		// Make sure that the execution of code works by injecting a script
		// tag with appendChild/createTextNode
		// (IE doesn't support this, fails, and uses .text instead)
		if ( window[ id ] ) {
			delete window[ id ];
			return true;
		}
		return false;
	})();
	
	function attrPattern(name) {
		return new RegExp(name+'=(?:(["\'])([\\s\\S]*?)\\1|([^\\s>]+))','i');
	}
	
	function matchAttr(name) {
		var regex = attrPattern(name);
		return function(tag) {
			var match = regex.exec(tag) || [];
			return match[2] || match[3];
		};
	}
	
	var TYPE_ATTR = matchAttr('type'),
		LANG_ATTR = matchAttr('language');	
	
	function isJs(scriptTag) {
		var type = TYPE_ATTR(scriptTag) || '',
			lang = LANG_ATTR(scriptTag) || '';
		return (!type && !lang) || // no type or lang assumes JS
			type.toLowerCase().indexOf('javascript') !== -1 || 
			lang.toLowerCase().indexOf('javascript') !== -1
	}

	function globalEval(data) {
	if ( data && /\S/.test(data) ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.getElementsByTagName("head")[0] || document.documentElement,
				script = document.createElement("script");

			script.type = "text/javascript";
			if ( scriptEval )
				script.appendChild( document.createTextNode( data ) );
			else
				script.text = data;

			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstChild );
			head.removeChild( script );
		}    
    }
	global.writeCaptureSupport = {
		_original: global.writeCaptureSupport,
		noConflict: function() {
			global.writeCaptureSupport = this._original;
			return this;
		},
		// the code in this function is based on code from jQuery 1.3.2
		ajax: function(options) {
			if(options.dataType === 'script') {
				loadXDomain(options.url,options.success,options.error);
				return;
			}
			
			var xhr = newXhr(), requestDone = false, checkTimer;
			
			xhr.open("GET", options.url, options.async);
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			xhr.setRequestHeader("Accept","text/javascript, application/javascript, */*");
			
			function checkXhr(){
				if ( !requestDone && xhr && (xhr.readyState == 4) ) {
					requestDone = true;

					if (checkTimer) {
						clearInterval(checkTimer);
						checkTimer = null;
					}

					var suc = false;
					try {
						// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
						suc = !xhr.status && location.protocol == "file:" ||
							( xhr.status >= 200 && xhr.status < 300 ) || 
							xhr.status == 304 || xhr.status == 1223;
					} catch(e){}

					if ( suc ) {
						options.success(xhr.responseText);
					} else {
						options.error(xhr,"error","xhr.status="+ xhr.status);
					}


					// Stop memory leaks
					if ( options.async )
						xhr = null;
				}
			}

			if ( options.async ) {
				// poll for changes
				checkTimer = setInterval(checkXhr, 20);
			}			
			
			try {
				xhr.send();
			} catch(e) {
				options.error(xhr, null, e);
			}			
			
			if(!options.async) {
				checkXhr();
			}
		},
		$: $,
		replaceWith: function(selector,content) {
			var i, len, el = $(selector),
				parent = el.parentNode || el.ownerDocument,
				work = document.createElement('div'),
				scripts = [],
				clearHTML = content.replace(/<script([\s\S]*?)>([\S\s]*?)<\/script>/gi,function(all,attrs,code) {
					if(isJs(attrs)) {
						scripts.push(code);
						return "";						
					} else {
						return all;
					}
				});
			work.innerHTML = clearHTML;
			while (work.firstChild) {
				parent.insertBefore(work.removeChild(work.firstChild),el);
			}
			parent.removeChild(el);
			for(i = 0, len = scripts.length; i < len; i++) {
				globalEval(scripts[i]);
			}
		}
	};
	
	function isElement(o) {
		return o && o.nodeType == 1;
	}
	
	function $(s) {
		if(isElement(s)) return s;
		
		// trim the selector
		s = s && s.replace(/^\s*/,'').replace(/\s*$/,'');
		
		if(!/^#[a-zA-Z0-9_:\.\-]+$/.test(s)) 
			throw "nolib-support only allows id based selectors. selector=" + s;
		
    	return document.getElementById(s.substring(1));
	}
	
	var newXhr = global.ActiveXObject ? function() {
		return new ActiveXObject("Microsoft.XMLHTTP");
	} : function () {
		return new XMLHttpRequest();
	};
	
	// the code in this function is copied and slightly modified from jQuery 1.3.2
	function loadXDomain(url,success) {
		// TODO what about scripts that fail to load? bad url, etc.?
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.src = url;

		var done = false;

		// Attach handlers for all browsers
		script.onload = script.onreadystatechange = function(){
			if ( !done && (!this.readyState ||
					this.readyState == "loaded" || this.readyState == "complete") ) {
				done = true;
				success();

				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
				head.removeChild( script );
			}
		};		
		
		head.appendChild(script);
	}

})(this);
