@()(implicit context: model.ApplicationContext)

@import play.api.Mode.Dev

try {
    const stylesheet = document.getElementById('fonts');
    if (document.fonts) {
        stylesheet.disabled = true;
        const loadFonts = Array.from(document.fonts).map(font => font.load());

        Promise.all(loadFonts).then(() => {
            document.getElementById('fonts').disabled = false;
        });
    } else {
        const ua = navigator.userAgent;
        const windowsNT = /Windows NT (\d\.\d+)/.exec(ua);

        if (windowsNT) {
            const version = parseFloat(windowsNT[1], 10);

            // For Windows XP-7
            if (/Chrome/.exec(ua) && version >= 5.1 && version < 6.0) {
                // Chrome on windows XP wants auto-hinting
                stylesheet.innerHTML = stylesheet.innerHTML.replace(/hinting-off/g, 'hinting-auto')
            }
        }
    }
} catch (e) {
    @if(context.environment.mode == Dev){throw(e)}
}
