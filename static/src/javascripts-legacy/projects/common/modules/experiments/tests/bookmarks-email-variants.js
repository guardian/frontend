define([
    'common/modules/experiments/tests/generic-email-variants'
], function (
    genericEmailTest
) {
    return new genericEmailTest(
        {
            id: 'BookmarksEmailVariants',
            start: '2017-03-14',
            end: '2017-03-31',
            author: 'David Furey',
            audience: 0,
            audienceOffset: 0,
            canonicalListId: 3039,
            testIds: [
                { variantId: 'Control', listId: 3867 },
                { variantId: 'Variant', listId: 3866 }
            ]
        }
    );
});
