define([
    'mock-collection',
    'test/fixtures/dates'
], function (
    mockCollection,
    dates
) {
    mockCollection.set({
        latest: {
            lastUpdated: dates.yesterday.toISOString(),
            live: [{
                id: 'internal/one',
                frontPublicationDate: dates.yesterday.getTime()
            }],
            updatedBy: 'Test'
        },
        sport: {
            lastUpdated: dates.justNow.toISOString(),
            live: [],
            updatedBy: 'You'
        }
    });
});
