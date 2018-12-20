// @flow

// these are considered as 'news' section for outbrain purpose.
const newsSections = ['politics', 'world', 'business', 'commentisfree'];

/* 
   Returns the 'outbrain' section ('news' or 'default') according
   to the given Guardian section (could be any guardian section)
*/
const getSection = function(guardianSection: string): string {
    // Make things case insensitive
    const lcGuardianSection = guardianSection.toLowerCase();
    // Section matches regex '/news/' or is an outbrain purpose 'news section'
    return /news/.test(lcGuardianSection) ||
        newsSections.includes(lcGuardianSection)
        ? 'news'
        : 'defaults';
};

export { getSection };
