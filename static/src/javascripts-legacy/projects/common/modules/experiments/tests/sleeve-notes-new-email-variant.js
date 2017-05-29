define([
    'common/modules/experiments/tests/generic-email-variants'
], function (
    genericEmailTest
) {
    return new genericEmailTest(
        {
            id: 'SleeveNotesNewEmailVariant',
            start: '2017-03-02',
            end: '2017-06-01',
            author: 'Leigh-Anne Mathieson',
            audience: 0.7,
            audienceOffset: 0,
            signupPage: 'info/ng-interactive/2017/mar/06/sign-up-for-the-sleeve-notes-email',
            canonicalListId: 39,
            testIds: [
                { variantId: 'SleeveNotes-New', listId: 3834 }
            ]
        }
    );
});
