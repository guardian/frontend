export const urlify = (str: string): string => {
    const reOutsideTags = '(?![^<]*>|[^<>]*</)';
    const reUrl = '\\b((https?://|www.)\\S+)\\b';
    const regexp = new RegExp(reUrl + reOutsideTags, 'g');

    return str.replace(regexp, (match, url, protocol) => {
        const fullUrl = protocol === 'www.' ? `http://${url}` : url;
        return `<a href="${fullUrl}">${url}</a>`;
    });
};
