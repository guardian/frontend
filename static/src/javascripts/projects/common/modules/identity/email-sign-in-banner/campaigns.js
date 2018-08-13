// @flow
type Campaign = {
    name: string,
    utm: string,
    upsell: string,
};

const campaigns: Campaign[] = [
    {
        name: 'Guardian Today UK',
        utm: 'GU Today main NEW H categories',
        upsell:
            'Did you know that we have more than 40 different email newsletters such as [title 1], [title 2]',
    },
    {
        name: 'Test Campaign',
        utm: 'test1212',
        upsell: 'Test copy',
    },
];

export type { Campaign };
export { campaigns };
