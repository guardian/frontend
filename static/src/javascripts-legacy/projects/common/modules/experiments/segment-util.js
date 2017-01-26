define([
    'lodash/functions/memoize',
    'common/modules/analytics/mvt-cookie'
], function(
    memoize,
    mvtCookie
) {
    var NOT_IN_TEST = 'notintest';

    function getId(test) {
        return test.id; // use test ids as memo cache keys
    }

    /**
     * Determine whether the user is in the test or not and return the associated
     * variant ID.
     *
     * The test population is just a subset of mvt ids. A test population must
     * begin from a specific value. Overlapping test ranges are permitted.
     *
     * @return {String} variant ID
     */
    function variantIdFor(test) {
        var smallestTestId = mvtCookie.getMvtNumValues() * test.audienceOffset;
        var largestTestId = smallestTestId + mvtCookie.getMvtNumValues() * test.audience;
        var mvtCookieId = mvtCookie.getMvtValue();

        if (mvtCookieId && mvtCookieId > smallestTestId && mvtCookieId <= largestTestId) {
            // This mvt test id is in the test range, so allocate it to a test variant.
            var variantIds = test.variants.map(getId);

            return variantIds[mvtCookieId % variantIds.length];
        } else {
            return NOT_IN_TEST;
        }
    }
    
     function variantFor(test) {
         var variantId = variantIdFor(test);
         
         return test.variants.filter(function(variant) { 
             return variant.id === variantId;
         })[0];
     }
    

    return {
        variantIdFor: memoize(variantIdFor, getId),
        
        variantFor: variantFor, 
        
        isInTest: function(test) {
            return variantIdFor(test) !== NOT_IN_TEST;
        }
    }
});
