// If the browser cuts the mustard and supports `atob`
// then read the user data from cookies and add it to `guardian`

try {
    ((isVeryModern, document, window) => {
        if (isVeryModern) {
            function decodeBase64(str) {
                return decodeURIComponent(encodeURIComponent(atob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '='))));
            }

            // Short version of cookie.get(), inspired by Google Analytics' code
            var cookieData = (function(a) {
                var d = [],
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
                window.guardian.user = {
                    id: userData[0],
                    displayName: userData[2],
                    accountCreatedDate: userData[6],
                    emailVerified: userData[7],
                    rawResponse: cookieData
                }
            }
        }
    })(guardian.isModernBrowser && 'atob' in window, document, window);
} catch (e) {
    @if(play.Play.isDev) {throw (e)}
}
