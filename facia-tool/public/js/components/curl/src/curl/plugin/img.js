/* plugin loads and returns an IMG once available.
*/

define(/*=='img',==*/['domReady!'], function () {
    return {
        'load': function (absId, require, loaded, config) {
			// init
			var img = document.createElement('img');
			img.style.display = "none"; // should not be visible during load
			var done = false; // state

			// wireup events
			img.onload = callback;
			img.onreadystatechange = callback;
			img.onerror = error;
			
			function callback() {
				if (done === true)
					return; // ignore dups

				if (typeof img.readyState === 'string') { // hello, IE (and Opera)
					if (img.readyState === 'complete') { // done
						done = true; // ignore dups
						success();
					}
					return;
				}
					
				done = true;

				success();
			}

			function success() {
				img.style.display = ""; // must show before calculating dimensions
				img.originalWidth = img.width;
				img.originalHeight = img.height;
				document.body.removeChild(img); // remove from DOM before returning result
				loaded(img);
			}
			
			function error() {
				loaded.error("IMG load error: " + absId);
			}
			
			document.body.appendChild(img); // requires domReady!
			img.src = absId; // set source after adding to body

			if (done === false && img.complete === true) { // IE
				callback();
			}
        }
    };
});
