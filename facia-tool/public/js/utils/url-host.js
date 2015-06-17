/*eslint-disable consistent-return*/
export default function(url) {
    if (typeof url !== 'string') { return; }
    var a;
    a = document.createElement('a');
    a.href = url;
    return a.hostname;
}
