define(function () {
    var sections = ['politics', 'world', 'business', 'commentisfree'];

    function getSection(section) {
        section = section.toLowerCase();
        return /news/.test(section) || sections.indexOf(section) !== -1 ? 'news' : 'defaults';
    }

    return getSection;
});
