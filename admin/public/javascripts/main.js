var tests = [],
    specUrl = '/base/admin/public/javascripts/spec',
    specRegExp = new RegExp(specUrl.replace(/\//g, '\\/') + '\/.*\\Spec\\.js'),
    spec;

for (var file in window.__karma__.files) {
    // We are only testing against discussion for now
    if (file.match(specRegExp)) {
        spec = file
                .replace(specUrl, 'spec')
                .replace('.js', '');
        tests.push(spec);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/admin/public/javascripts/',
    paths: {
        Common:       'common',
        TagSearch:    'modules/TagSearch',
        AutoComplete: 'modules/AutoComplete',
        tagEntry:     'modules/tagEntry',
        ItemSearch:   'modules/ItemSearch',
        EventEmitter: 'components/eventEmitter/EventEmitter',
        Reqwest:      'components/reqwest/reqwest',
        knockout:     'components/knockout/build/output/knockout-latest'
    }
});

require(tests, function() {
    window.__karma__.start();
});