export default function (state, name, url) {
    var tokens = url.split('?');
    this.pathname = tokens[0];
    this.search = '?' + tokens[1];
}
