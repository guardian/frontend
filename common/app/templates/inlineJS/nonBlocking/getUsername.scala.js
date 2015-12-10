// If the browser cuts the mustard and supports `atob` as well as classList,
// then read the user name from cookies
// and show it instantly in the header to avoid jumps on the page

(function (isVeryModern) {
    function insertUserName() {
        // Short version of cookie.get(), inspired by Google Analytics' code
        function getCookieValue(a) {
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
        }

        function decodeBase64(str) {
            return decodeURIComponent(encodeURIComponent(atob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '='))));
        }

        function getUserDisplayNameFromCookie() {
            var cookieData = getCookieValue('GU_U');
            var userData = cookieData ? JSON.parse(decodeBase64(cookieData.split('.')[0])) : null;

            if (userData) {
                return userData[2];
            }
            return null;
        }

        function getUserIdFromCookie() {
            var cookieData = getCookieValue('GU_U');
            var userData = cookieData ? JSON.parse(decodeBase64(cookieData.split('.')[0])) : null;

            if (userData) {
                return userData[0];
            }
            return null;

        }

        var userDisplayName = getUserDisplayNameFromCookie();

        if (userDisplayName) {
            document.getElementsByClassName('js-profile-info')[0].innerHTML = userDisplayName;
            var $profileNavElem = document.getElementsByClassName('js-profile-nav')[0];
            $profileNavElem.classList.add('is-signed-in');
            var $signInLinkElem = $profileNavElem.getElementsByTagName('a')[0];
            if ($signInLinkElem) {
                var userId = getUserIdFromCookie();
                if (userId) {
                    $signInLinkElem.addEventListener("click", function (e) {
                        e.preventDefault();
                    });
                } else {
                    $signInLinkElem.setAttribute('href', $signInLinkElem.getAttribute('href').replace('signin', 'public/edit/'));
                }
            }
            var $register = document.getElementsByClassName('js-profile-register');
            if ($register.length) {
                $register = $register[0];
                $register.parentElement.removeChild($register);
            }
        }
    }
    insertUserName();
})(guardian.isModernBrowser && 'atob' in window && 'classList' in document.documentElement);
