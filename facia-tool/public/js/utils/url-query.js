export default function(url) {
    if (typeof url !== 'string') { return ''; }

    var a = document.createElement('a');
    a.href = url;
    return a.search.slice(1);
}
