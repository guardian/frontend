define([
    'generic-email-variants'
], function (
    genericEmailTest
) {
    return genericEmailTest(
        {
            id: 'OpinionEmailVariants',
            start: '2017-01-12',
            end: '2017-03-09',
            author: 'David Furey',
            audience: 0.2,
            audienceOffset: 0,
            signupPage: 'info/ng-interactive/2017/jan/12/sign-up-for-the-guardian-opinion-email',
            canonicalListId: 3811,
            testIds: [
                { variantId: 'Opinion-UK-Connected', listId: 3811 },
                { variantId: 'Opinion-UK-Legacy', listId: 3814 }
            ]
        }
    );
});
