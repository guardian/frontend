var a = document.createElement('a');

export default function(url) {
    if(typeof url === 'string') {
        // If necessary, add a leading slash to stop the browser resolving it against the current path
        url = url.match(/^\//) || url.match(/^https?:\/\//) ? url : '/' + url;

        a.href = url;

        // Return the abspath without a leading slash, because ContentApi ids are formed like that
        return a.pathname.replace(/^\//, '');
    }
}
