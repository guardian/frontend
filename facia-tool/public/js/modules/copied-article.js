import EventEmitter from 'EventEmitter';

var storedValue;
class Store extends EventEmitter {
    flush() {
        storedValue = undefined;
        this.emit('change', false);
    }

    set(article) {
        var title = article.meta.snapType() === 'latest' ?
            '{ ' + article.meta.customKicker() + ' }' :
            article.meta.headline();

        if (!title && article.fields) {
            title = article.fields.headline();
        }

        storedValue = {
            article: article,
            displayName: title,
            group: article.group,
            front: (article.group || {}).front
        };
        this.emit('change', true);
    }

    peek() {
        return storedValue;
    }

    get(detachFromSource) {
        if (!storedValue) {
            return;
        }

        var returnValue = storedValue;
        if (detachFromSource) {
            storedValue = {
                article: storedValue.article,
                displayName: storedValue.displayName
            };
        }

        return returnValue;
    }
}

export default new Store();
