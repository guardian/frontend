// @flow
const sections = ['politics', 'world', 'business', 'commentisfree'];

const getSection = function(section: string): string {
    const sectionLower = section.toLowerCase();
    return /news/.test(sectionLower) || sections.indexOf(sectionLower) !== -1
        ? 'news'
        : 'defaults';
};

export default getSection;
