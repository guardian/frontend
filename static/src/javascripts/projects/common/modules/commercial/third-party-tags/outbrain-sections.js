define(function () {
    var sections = ['politics', 'world', 'business', 'commentisfree'];

    function getSection(section) {
        section = section.toLowerCase();
        return /news/.test(section) || sections.indexOf(section) !== -1 ? 1 : 2;
    }

    return getSection;
});
