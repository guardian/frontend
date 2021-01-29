const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);
    const scrollTestIdx = copyTests.findIndex(i => i.path.match(/scroll.spec.js$/));
    const [scrollTest] = copyTests.splice(scrollTestIdx, 1);

    const stickyTopBannerIdx = copyTests.findIndex(i => i.path.match(/sticky-top-banner.spec.js$/));
    const [stickyTopBannerTest] = copyTests.splice(stickyTopBannerIdx, 1);

    //const randomOtherTest = copyTests[Math.floor(Math.random() * copyTests.length)];
    return [stickyTopBannerTest, scrollTest];
  }
}

module.exports = CustomSequencer;
