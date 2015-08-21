import Promise from 'Promise';
import ko from 'knockout';
import persistence from 'models/config/persistence';
import Front from 'models/config/front';
import Collection from 'models/config/collection';
import * as ajax from 'modules/authed-ajax';
import * as vars from 'modules/vars';

describe('Persistence', function () {
    beforeEach(function () {
        var events = {
            before: function () {},
            after: function () {}
        };
        spyOn(events, 'before');
        spyOn(events, 'after');
        this.events = events;

        spyOn(ajax, 'request').and.callFake(function () {
            return new Promise(resolve => setTimeout(resolve, 10));
        });
        persistence.on('update:before', events.before);
        persistence.on('update:after', events.after);
        vars.setModel({
            frontsList: ko.observableArray()
        });
    });

    it('creates a front', function (done) {
        var front = new Front({
            id: 'fruit/front',
            webTitle: 'fruit loops',
            title: 'cereal',
            isHidden: false,
            priority: 'food'
        });
        var collection = new Collection({
            displayName: 'red loop',
            groups: ['one', 'two'],
            showSections: true,
            apiQuery: 'food?colour=read'
        });
        collection.parents.push(front);
        front.collections.items.push(collection);

        var request = persistence.collection.save(collection);
        var call = ajax.request.calls.argsFor(0)[0], data = JSON.parse(call.data);
        expect(call.type).toBe('POST');
        expect(call.url).toBe('/config/fronts');
        expect(data).toEqual({
            id: 'fruit/front',
            webTitle: 'fruit loops',
            title: 'cereal',
            // falsy values are removed
            // isHidden: false,
            priority: 'food',
            initialCollection: {
                displayName: 'red loop',
                groups: ['one', 'two'],
                showSections: true,
                apiQuery: 'food?colour=read'
            }
        });
        expect(this.events.before).toHaveBeenCalled();
        expect(this.events.after).not.toHaveBeenCalled();
        request.then(() => {
            expect(this.events.after).toHaveBeenCalled();

            front.dispose();
            collection.dispose();
        })
        .then(done)
        .catch(done.fail);
    });

    it('updates a front', function (done) {
        var front = new Front({
            id: 'animal/front',
            webTitle: 'animal',
            title: 'wild animals',
            isHidden: false,
            priority: 'nature'
        });
        var one = new Collection({
            displayName: 'monkeys',
            groups: ['bonobo', 'chimp'],
            uneditable: true,
            id: 'monkeys-collection'
        });
        var two = new Collection({
            displayName: 'birds',
            groups: ['parrot'],
            id: 'birds-collection'
        });
        front.collections.items.push(one, two);

        var request = persistence.front.update(front);
        var call = ajax.request.calls.argsFor(0)[0], data = JSON.parse(call.data);
        expect(call.type).toBe('POST');
        expect(call.url).toBe('/config/fronts/animal/front');
        expect(data).toEqual({
            id: 'animal/front',
            webTitle: 'animal',
            title: 'wild animals',
            // falsy values are removed
            // isHidden: false,
            priority: 'nature',
            collections: ['monkeys-collection', 'birds-collection']
        });
        expect(this.events.before).toHaveBeenCalled();
        expect(this.events.after).not.toHaveBeenCalled();
        request.then(() => {
            expect(this.events.after).toHaveBeenCalled();

            one.dispose();
            two.dispose();
            front.dispose();
        })
        .then(done)
        .catch(done.fail);
    });

    it('creates a collection', function (done) {
        var front = new Front({
            id: 'fruit/front',
            webTitle: 'fruit loops',
            title: 'cereal',
            isHidden: false,
            priority: 'food'
        });
        var collection = new Collection({
            displayName: 'green apple',
            groups: [],
            uneditable: true
        });
        collection.parents.push(front);

        var request = persistence.collection.save(collection);
        var call = ajax.request.calls.argsFor(0)[0], data = JSON.parse(call.data);
        expect(call.type).toBe('POST');
        expect(call.url).toBe('/config/collections');
        expect(data).toEqual({
            frontIds: ['fruit/front'],
            collection: {
                displayName: 'green apple',
                uneditable: true,
                groups: []
            }
        });
        expect(this.events.before).toHaveBeenCalled();
        expect(this.events.after).not.toHaveBeenCalled();
        request.then(() => {
            expect(this.events.after).toHaveBeenCalled();

            front.dispose();
            collection.dispose();
        })
        .then(done)
        .catch(done.fail);
    });

    it('updates a collection', function (done) {
        var one = new Front({
            id: 'fruit/front',
            webTitle: 'fruit loops',
            title: 'cereal',
            isHidden: false,
            priority: 'food'
        });
        var two = new Front({
            id: 'animal/front',
            webTitle: 'animal',
            title: 'wild animals',
            isHidden: false,
            priority: 'nature'
        });
        var collection = new Collection({
            id: 'apple-collection',
            displayName: 'green apple',
            groups: [],
            uneditable: true
        });
        collection.parents.push(one, two);

        var request = persistence.collection.save(collection);
        var call = ajax.request.calls.argsFor(0)[0], data = JSON.parse(call.data);
        expect(call.type).toBe('POST');
        expect(call.url).toBe('/config/collections/apple-collection');
        expect(data).toEqual({
            frontIds: ['fruit/front', 'animal/front'],
            collection: {
                id: 'apple-collection',
                displayName: 'green apple',
                uneditable: true,
                groups: []
            }
        });
        expect(this.events.before).toHaveBeenCalled();
        expect(this.events.after).not.toHaveBeenCalled();
        request.then(() => {
            expect(this.events.after).toHaveBeenCalled();

            one.dispose();
            two.dispose();
            collection.dispose();
        })
        .then(done)
        .catch(done.fail);
    });
});
