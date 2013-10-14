define(['modules/facia/collection-display-toggle', 'helpers/fixtures', 'common', 'bonzo', 'bean', 'modules/userPrefs'], function(CollectionDisplayToggle, fixtures, common, bonzo, bean, userPrefs) {

    describe('Collection Display Toggle', function() {

        var collectionDisplayToggle,
            collection,
            $collection,
            fixtureId = 'collection-display-toggle',
            collectionId = 'uk/culture/regular-stories',
            storageId = 'collection-states',
            assertState = function($collection, state) {
                var $button = common.$g('button', $collection[0]);
                expect($collection.attr('data-toggle-state')).toBe(state === 'open' ? 'displayed' : 'hidden');
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
            collectionDisplayToggle = new CollectionDisplayToggle(collection);
            fixtures.render({
                id: fixtureId,
                fixtures: [collection]
            });
            window.localStorage.clear();
        });

        afterEach(function(){
            fixtures.clean(fixtureId);
        });

        it('should be able to initialise', function() {
            expect(collectionDisplayToggle).toBeDefined();
        });

        it('should add button to the beginning of the collection', function() {
            collectionDisplayToggle.addToggle();
            expect(collection.childNodes[0].nodeName.toLowerCase()).toBe('button');
        });

        it('initial state should be open', function() {
            collectionDisplayToggle.addToggle();
            var $button = common.$g('button', collection);
            assertState($collection, 'open');
        });

        it('should be able to close collection', function() {
            collectionDisplayToggle.addToggle();
            // click button
            bean.fire(common.$g('button', collection)[0], 'click');
            assertState($collection, 'closed');
        });

        it('should store state as user preference', function() {
            collectionDisplayToggle.addToggle();
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
            collectionDisplayToggle.addToggle();
            assertState($collection, 'closed');
        });

    });

});
