import Promise from 'Promise';

const originalSetTimeout = window.setTimeout;

export default function (ms) {
    return new Promise(function (resolve) {
        jasmine.clock().tick(ms);
        originalSetTimeout(resolve, 10);
    });
}
