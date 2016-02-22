try {
    ((document, window) => {
        var ad = document.createElement('div');
        ad.style.position = 'absolute';
        ad.style.left = '0';
        ad.style.top = '0';
        ad.style.height = '10px';
        ad.style.zIndex = '-1';
        ad.innerHTML = '&nbsp;';
        ad.setAttribute('class', 'ad_unit');

        // avoid a forced sync layout, and open door to more accurate detection
        // e.g. detecting network behaviour
        window.requestAnimationFrame(() => {
            document.body.appendChild(ad);

            // avoid a forced layout, and be sure the element has been added to the DOM
            window.requestAnimationFrame(() => {
                var adStyles = window.getComputedStyle(ad);
                window.guardian.adBlockers.generic = adStyles.getPropertyValue('display') === 'none';

                // Only tells us if FF ABP is installed - not whether it is active
                var adMozBinding = adStyles.getPropertyValue('-moz-binding');
                window.guardian.adBlockers.ffAdblockPlus = !!adMozBinding && adMozBinding.match('elemhidehit') !== null;

                try {
                    window.guardian.adBlockers.onDetect(window.guardian.adBlockers);
                } catch(e) {}
            })
        });
    })(document, window);
} catch (e) {
    @if(play.Play.isDev) {throw (e)}
}
