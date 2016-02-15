try {
    ((document, window) => {
        window.guardian.adBlockers = {};
        var ad = document.createElement('div');
        ad.style.position = 'absolute';
        ad.style.left = '-9999px';
        ad.style.height = '10px';
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
                window.guardian.adBlockers.ffAdblockPlus = adStyles.getPropertyValue('-moz-binding').match('elemhidehit') !== null;
                try {
                    window.guardian.adBlockers.onDetect();
                } catch(e) {};
            })
        });
    })(document, window);
} catch (e) {
    @if(play.Play.isDev) {throw (e)}
}
