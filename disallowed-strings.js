const readerRevenueConfig = {
    message: 'Raw URLs to reader revenue sites are not allowed',
    maxOccurrences: 1,
    pathspecs: ['*.js', '*.scala', '*.html'],
};

// pathspecs are git pathspecs: https://git-scm.com/docs/gitglossary#gitglossary-aiddefpathspecapathspec
// To search all files under version control, set pathspecs to an empty array.
module.exports = [
    // These are commented out because they would currently fail the build.
    // Until we refactor to eliminate the duplicates, they can serve as examples
    // in case anyone wants to add more immediately feasible rules!

    // {
    //     regex: /membership\.theguardian\.com/,
    //     ...readerRevenueConfig
    // },
    // {
    //     regex: /contribute\.theguardian\.com/,
    //     ...readerRevenueConfig
    // },
    // {
    //     regex: /support\.theguardian\.com/,
    //     ...readerRevenueConfig
    // },
    // {
    //     regex: /subscribe\.theguardian\.com/,
    //     ...readerRevenueConfig
    // }
];
