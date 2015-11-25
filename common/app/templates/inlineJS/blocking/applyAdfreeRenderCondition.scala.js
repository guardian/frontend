@()

(function applyAdfreeRenderCondition(commercial){
    var htmlClassToAdd = '';

    function showAdfreeView() {
        // Signed out users and users who are signed in, but whose status hasn't been confirmed, will continue seeing ads
        // See user-features.js for details of the cookie's lifecycle
        return readCookie('gu_adfree_user') === 'true';
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
