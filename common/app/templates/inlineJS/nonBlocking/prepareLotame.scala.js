@import play.api.Mode.Dev

@()(implicit context: model.ApplicationContext)

try {
    (function(document, window) {
        function shouldServeLotame() {
            try {
                var geo = JSON.parse(window.localStorage.getItem("gu.geolocation")).value;
                if (geo === 'US' || geo === 'CA' || geo === 'AU' || geo === 'NZ') {
                    return false;
                }
                return true;
            }
            catch(e) {};
            return false;
        }
        if (shouldServeLotame()) {
            var script = document.createElement('script');
            script.src = "https://tags.crwdcntrl.net/c/12666/cc.js";
            document.body.appendChild(script);
        }
    })(document, window);
} catch (e) {
    @if(context.environment.mode == Dev) {throw (e)}
}


