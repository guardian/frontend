// @flow
const sections = ['politics', 'world', 'business', 'commentisfree'];

const getSection = function(section: string): string {
    const sectionLower = section.toLowerCase();
    return /news/.test(sectionLower) || sections.includes(sectionLower)
        ? 'news'
        : 'defaults';
};

export { getSection };
