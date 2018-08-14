// @flow
type Campaign = {
    name: string,
    utm: string,
};

const campaigns: Campaign[] = [
    {
        name: 'Guardian Today UK',
        utm: 'GU Today main NEW H categories',
    },
    {
        name: 'Test Campaign',
        utm: 'test1212',
    },
];

export type { Campaign };
export { campaigns };
