try {
    ((isVeryModern, document, window) => {
        var user = window.guardian.user;

        if (isVeryModern && user) {
            window.requestAnimationFrame(() => {
                document.getElementsByClassName('js-profile-info')[0].innerHTML = user.displayName;

                var $profileNavElem = document.getElementsByClassName('js-profile-nav')[0];
                $profileNavElem.classList.add('is-signed-in');

                var $signInLinkElem = $profileNavElem.getElementsByTagName('a')[0];
                if ($signInLinkElem) {
                    if (user.id) {
                        $signInLinkElem.addEventListener("click", function(e) {
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
            })
        }
    })('classList' in document.documentElement, document, window);
} catch (e) {
    @if(play.Play.isDev) {throw (e)}
}

