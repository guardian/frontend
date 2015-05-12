export default function(s) {
    if (typeof s === 'string') {
        return s.split(/\s+/).filter(function(s) { return s; }).join(' ');
    } else {
        return s;
    }
}
