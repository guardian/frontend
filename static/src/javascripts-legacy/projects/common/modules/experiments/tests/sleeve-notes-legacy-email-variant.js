define([
    'generic-email-variants'
], function (
    genericEmailTest
) {
    return genericEmailTest.createTest(
        {
            id: 'SleevenotesLegacyEmailVariant',
            start: '2017-03-02',
            end: '2017-03-31',
            author: 'Leigh-Anne Mathieson',
            audience: 0, //will be 0.3
            audienceOffset: 0.7,
            signupPage: 'info/ng-interactive/2017/feb/23/sign-up-for-the-sleeve-notes-email',
            canonicalListId: 3835,
            testIds: [
                { variantId: 'Sleevenotes-Legacy', listId: 3835 },
            ]
        }
    );
});
