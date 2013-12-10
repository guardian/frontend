define(['models/edition', 'knockout'], function(Edition, knockout) {

    describe('Edition Model', function() {

        var edition;

        beforeEach(function() {
            edition = new Edition;
        });

        it('should have an id property', function() {
            expect(edition.id).toBeDefined();
        });

        it('id property should be empty initially', function() {
            expect(edition.id).toEqual('');
        });

        it('should have a trailblocks property', function() {
            expect(edition.trailblocks).toBeDefined();
        });

        it('trailblocks property should be an observable', function() {
            expect(knockout.isObservable(edition.trailblocks)).toEqual(true);
        });

        it('trailblocks property should be empty initially', function() {
            expect(edition.trailblocks().length).toEqual(0);
        });

    });
});
