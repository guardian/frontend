define([
    'common/modules/experiments/tests/generic-email-variants'
], function (
    genericEmailTest
) {
    return new genericEmailTest(
        {
            id: 'SleeveNotesLegacyEmailVariant',
            start: '2017-03-02',
            end: '2017-05-30',
            author: 'Leigh-Anne Mathieson',
            audience: 0.3,
            audienceOffset: 0.7,
            signupPage: 'info/ng-interactive/2017/mar/06/sign-up-for-the-sleeve-notes-email',
            canonicalListId: 39,
            testIds: [
                { variantId: 'SleeveNotes-Legacy', listId: 3835 }
            ]
        }
    );
});
