@()(implicit context: model.ApplicationContext)

@import play.api.Mode.Dev

try {
    ((isVeryModern, document, window) => {
        var user = window.guardian.config.user;

        if (isVeryModern && user) {
            window.requestAnimationFrame(() => {
                var $profileInfoElem = document.getElementsByClassName('js-profile-info')[0];
                var $profileNavElem = document.getElementsByClassName('js-profile-nav')[0];

                if (!$profileInfoElem && !$profileNavElem) {
                    return;
                }

                $profileInfoElem.innerHTML = user.displayName;
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
    @if(context.environment.mode == Dev) {throw (e)}
}

