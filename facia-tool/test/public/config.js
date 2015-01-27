System.amdDefine('test-config', [
    'jquery',
    'jquery-mockjax'
], function (
    $,
    mockjax
) {
    System.config({
        map: {
            'spec': '../../test/public/spec',
            'mock': '../../test/public/mocks',
            'test': '../../test/public',
            'views': '../../../app/views'
        }
    });

    $.mockjaxSettings.logging = false;
    $.mockjaxSettings.responseTime = 50;

    System.amdDefine('config', function() {
        return {
            env: 'test',
            priority: 'test',
            editions: ['uk','us','au'],
            navSections: ['news', 'uk-news', 'us-news', 'au-news'],
            email: '',
            avatarUrl: '',
            lowFrequency: 60,
            highFrequency: 2,
            standardFrequency: 5
        };
    });

    System.amdDefine('fixed-containers', function () {
        return [
            {'name':'fixed/test'}
        ];
    });

    System.amdDefine('dynamic-containers', function () {
        return [
            {'name':'dynamic/test'}
        ];
    });

});
