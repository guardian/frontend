import qwery from 'qwery';
import sinon from 'sinonjs';
import $ from 'common/utils/$';
import TechFeedback from 'common/modules/onward/tech-feedback';

fdescribe('Tech-feedback', function () {

    it('should exist', function () {
        expect(TechFeedback).toBeDefined();
    });

    it('should be able to get no params from the empty hash', function () {

        var t = new TechFeedback();
        var values = t.getValuesFromHash("");
        expect(values).toEqual({});
    });

    it('should be able to get one param from the hash', function () {

        var t = new TechFeedback();
        var values = t.getValuesFromHash("#page=cheese");
        expect(values).toEqual({'page': 'cheese'});
    });

    it('should be able to get more than one param from the hash', function () {

        var t = new TechFeedback();
        var values = t.getValuesFromHash("#page=cheese&url=milk");
        expect(values).toEqual({'page': 'cheese', 'url': 'milk'});
    });

    it('should decide uri components', function () {

        var t = new TechFeedback();
        var values = t.getValuesFromHash("#http%3A%2F%2Fwww.theguardian.com=http%3A%2F%2Fwww.theguardian.com");
        expect(values).toEqual({'http://www.theguardian.com': 'http://www.theguardian.com'});
    });

});
