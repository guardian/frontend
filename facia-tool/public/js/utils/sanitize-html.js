var rx = new RegExp(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi),
    el = document.createElement('div');

export default function(s) {
    if (typeof s === 'string') {
        el.innerHTML = s;
        return el.innerHTML.replace(rx, '');
    } else {
        return s;
    }
}
