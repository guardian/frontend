// @flow

export const connatix: ThirdPartyTag = {
    shouldRun: true, // TODO: add switch
    url: '//cdn.connatix.com/min/connatix.renderer.infeed.min.js',
    attrs: [
        {
            name: 'data-connatix-token',
            value: '4b6c17d3-68f9-4019-a202-42d8480f08f3',
        },
    ],
    async: true,
};
