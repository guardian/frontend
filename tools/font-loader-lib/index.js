(function(window, document) {
    const head = document.querySelector('head');
    const useFont = function(font) {
        if (font.css) {
            const style = document.createElement('style');
            style.innerHTML = font.css;
            head.appendChild(style);
        }
    };

    const loadFonts = function() {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://theguardian.com/font-loader';
        iframe.classList = 'guardianFontLoader';
        // add iframe and wait for message
        iframe.style.display = 'none';
        window.addEventListener('message', function(e) {
            if (
                e &&
                e.data &&
                e.data.name &&
                e.data.name === 'guardianFonts' &&
                e.data.fonts &&
                e.source === iframe.contentWindow
            ) {
                e.data.fonts.forEach(useFont);
            }
        });
        document.body.appendChild(iframe);
    };
    loadFonts();
})(window, document);
