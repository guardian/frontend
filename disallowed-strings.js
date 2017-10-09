const readerRevenueConfig = {
    message: 'Raw URLs to reader revenue sites are not allowed',
    maxOccurrences: 1,
    paths: ['*.js', '*.scala', '*.html'],
};

module.exports = [
    {
        regex: /membership\.theguardian\.com/,
        ...readerRevenueConfig
    },
    {
        regex: /contribute\.theguardian\.com/,
        ...readerRevenueConfig
    },
    {
        regex: /support\.theguardian\.com/,
        ...readerRevenueConfig
    },
    {
        regex: /subscribe\.theguardian\.com/,
        ...readerRevenueConfig
    }
];
