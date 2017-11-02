// @flow

const formatAmount = (amount: ?number, glyph: string): string =>
    amount ? glyph + (amount / 100).toFixed(2) : 'FREE';

const formatDate = (timestamp: string): string => {
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    return new Date(timestamp).toLocaleDateString('en-GB', options);
};

export { formatAmount, formatDate };
