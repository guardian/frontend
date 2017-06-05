define([
    'common/modules/experiments/tests/generic-email-variants'
], function (
    genericEmailTest
) {
    return new genericEmailTest(
        {
            id: 'BookmarksEmailVariants2',
            start: '2017-03-31',
            end: '2017-06-19',
            author: 'David Furey',
            audience: 1,
            audienceOffset: 0,
            signupPage: 'info/ng-interactive/2017/mar/30/sign-up-for-the-bookmarks-email',
            canonicalListId: 3039,
            testIds: [
                { variantId: 'Control', listId: 3867 },
                { variantId: 'Variant', listId: 3866 }
            ]
        }
    );
});
