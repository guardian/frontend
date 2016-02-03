try {
    ((document, window) => {
        var ad = document.createElement('div');
        ad.style.position = 'absolute';
        ad.style.left = '-9999px';
        ad.style.height = '10px';
        ad.innerHTML = '&nbsp;';
        ad.setAttribute('class', 'ad_unit');

        window.requestAnimationFrame(() => {
            document.body.appendChild(ad);

            window.requestAnimationFrame(() => {
                var adStyles = window.getComputedStyle(ad);
                window.guardian.adBlock = {
                    active: adStyles.getPropertyValue('display') === 'none',
                    ffAdblockPlusInstalled: adStyles.getPropertyValue('-moz-binding').match('elemhidehit') !== null
                }
            })
        });
    })(document, window);
} catch (e) {
    @if(play.Play.isDev) {throw (e)}
}
