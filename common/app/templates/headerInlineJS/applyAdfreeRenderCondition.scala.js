@()

(function applyAdfreeRenderCondition(commercial){
    var htmlClassToAdd = '';

    function showAdfreeView() {
        if (userLoggedOut()) {
            return false;
        } else {
            var adfreeUser = readCookie('gu_adfree_user');
            // If the user doesn't have the cookie yet, we keep displaying ads until we know their status
            console.log(adfreeUser, typeof adfreeUser);
            return adfreeUser === 'true';
        }
    }

    function userLoggedOut() {
        return readCookie('GU_U') === null;
    }

    function readCookie(name) {
        var cookies, i, cookieString, cookieParts;

        cookies = document.cookie.split(';');
        for (i = 0; i < cookies.length; i++) {
            cookieString = cookies[i];
            cookieParts = cookieString.split('=');
            if (cookieParts[0].trim() === name) {
                return cookieParts[1].trim();
            }
        }
        return null;
    }

    if (showAdfreeView()){
        commercial.showingAdfree = true;
        htmlClassToAdd = 'is-adfree';
    } else {
        commercial.showingAdfree = false;
        htmlClassToAdd = '';
    }

    return htmlClassToAdd;

}(window.guardian.config.commercial))
