define(['common', 'modules/router'], function(common, Router) {

    describe("Router", function() {

        beforeEach(function() {
            r = new Router();
        });

        it("should have no routes", function() {
            expect(r.getRoutes().length).toEqual(0);
        });

        it("should have one route", function() {
            r.get("/", function() { });
            expect(r.getRoutes().length).toEqual(1);
        });

        it("should have two routes", function() {
            r.get("/football", function() {});
            r.get("/", function() { });
            expect(r.getRoutes().length).toEqual(2);
        });

        it("should parse / and add endmarker", function() {
            r.get("/", function() { });
            expect(r.getRoutes()[0].regex.regexp).toEqual(new RegExp('/$'));
        });

        it("should parse basic route and leave untouched", function() {
            r.get("/section", function() { });
            expect(r.getRoutes()[0].regex.regexp).toEqual(new RegExp('/section$'));
        });

        it("should parse basic named identifier in position 0", function() {
            r.get("/:section", function(){});
            expect(r.getRoutes()[0].regex.groups["section"]).toEqual(0);
            expect(r.getRoutes()[0].regex.regexp).toEqual(new RegExp('/([^/.\\\\]+)$'));
        });

    });
});
