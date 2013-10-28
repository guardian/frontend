define([
    'modules/facia/collection-display-toggle',
    'common',
    'bonzo',
    'bean',
    'modules/userPrefs'
], function(CollectionDisplayToggle, common, bonzo, bean, userPrefs) {

    describe('Collection Display Toggle', function() {

        var collection,
            $collection,
            collectionId = 'uk/culture/regular-stories',
            storageId = 'collection-states',
            // helper assertion method
            assertState = function($collection, state) {
                var $button = common.$g('button', $collection[0]);
                expect($collection.hasClass('collection--rolled-up'))[state === 'open' ? 'toBeFalsy' : 'toBeTruthy']();
                expect($button.text()).toBe(state === 'open' ? 'Hide' : 'Show');
                expect($button.attr('data-link-name')).toBe(state === 'open' ? 'Show' : 'Hide');
            };

        beforeEach(function(){
            collection = bonzo.create(
                '<section class="collection" data-id="' + collectionId + '">' +
                    '<h2>A collection</h2>' +
                '</section>'
            )[0];
            $collection = bonzo(collection);
        });

        afterEach(function(){
            window.localStorage.clear();
        });

        it('should be able to initialise', function() {
            var collectionDisplayToggle = new CollectionDisplayToggle(collection);
            expect(collectionDisplayToggle).toBeDefined();
        });

        it('should delete old storage key', function() {
            var oldStorageKey = 'gu.prefs.front-trailblocks';
            window.localStorage.setItem(oldStorageKey, 'foo');
            new CollectionDisplayToggle(collection);
            expect(window.localStorage.getItem(oldStorageKey)).toBeNull();
        });

        it('should add button to the beginning of the collection', function() {
            new CollectionDisplayToggle(collection).addToggle();
            expect(collection.childNodes[0].nodeName.toLowerCase()).toBe('button');
        });

        it('initial state should be open', function() {
            new CollectionDisplayToggle(collection).addToggle();
            assertState($collection, 'open');
        });

        it('should be able to close collection', function() {
            new CollectionDisplayToggle(collection).addToggle();
            // click button
            bean.fire(common.$g('button', collection)[0], 'click');
            assertState($collection, 'closed');
        });

        it('should store state as user preference', function() {
            new CollectionDisplayToggle(collection).addToggle();
            var button = common.$g('button', collection)[0];
            // click button
            bean.fire(button, 'click');
            var expectedValue = {};
            expectedValue[collectionId] = 'closed';
            expect(userPrefs.get(storageId)).toEqual(expectedValue);
            // now close collection
            bean.fire(button, 'click');
            expect(userPrefs.get(storageId)).toEqual({});
        });

        it('initial state should be based on user preference', function() {
            var prefs = {};
            prefs[collectionId] = 'closed';
            userPrefs.set(storageId, prefs);
            new CollectionDisplayToggle(collection).addToggle();
            assertState($collection, 'closed');
        });

    });

});
