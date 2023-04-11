@()(implicit context: model.ApplicationContext)

@import play.api.Mode.Dev

// If the browser cuts the mustard and supports `atob`
// then read the user data from cookies and add it to `guardian`

try {
    ((isVeryModern, document, window) => {
        if (isVeryModern) {
            function decodeBase64(str) {
                return decodeURIComponent(atob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '=')));
            }

            // Short version of cookie.get(), inspired by Google Analytics' code
            var cookieData = (function(a) {
                var d = new window.Array(),
                    e = new window.Array();
                e = document.cookie.split(";");
                a = RegExp("^\\s*" + a + "=\\s*(.*?)\\s*$");
                for (var b = 0; b < e.length; b++) {
                    var f = e[b].match(a);
                    f && d.push(f[1]);
                }
                if (d.length > 0) {
                    return d[0];
                }
                return null;
            })('GU_U');

            var userData = cookieData ? JSON.parse(decodeBase64(cookieData.split('.')[0])) : null;

            if (userData) {
                var displayName = decodeURIComponent(userData[2]);
                window.guardian.config.user = {
                    id: userData[0],
                    displayName: displayName,
                    accountCreatedDate: userData[6],
                    emailVerified: userData[7],
                    rawResponse: cookieData
                }
            }
        }
    })(guardian.isEnhanced && 'atob' in window, document, window);
} catch (e) {
    @if(context.environment.mode == Dev) {throw (e)}
}
