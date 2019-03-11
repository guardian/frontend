const fetchFonts = (window, document) => {
    const head = document.querySelector('head');
    const useFont = font => {
        if (font.css) {
            const style = document.createElement('style');
            style.innerHTML = font.css;
            head.appendChild(style);
        }
    };

    const loadFonts = () => {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://theguardian.com/font-loader';
        // add iframe and wait for message
        iframe.style.display = 'none';
        window.addEventListener('message', e => {
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

    if (document.readyState === 'loading') {
        // Loading hasn't finished yet
        document.addEventListener('DOMContentLoaded', loadFonts);
    } else {
        // DOMContentLoaded has already fired
        loadFonts();
    }
};

export default fetchFonts;
