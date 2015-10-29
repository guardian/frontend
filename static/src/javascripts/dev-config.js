// This config is shared between the tests and the main loader in dev
define(function () {
    var isRequireJs = !!window.requirejs;
    var require = (isRequireJs ? window.requirejs : window.require);
    require.config({
        paths: {
            admin:        'projects/admin',
            common:       'projects/common',
            facia:        'projects/facia',
            membership:   'projects/membership',

            bean:         'components/bean/bean',
            bonzo:        'components/bonzo/bonzo',
            react:        'components/react/react',
            classnames:   'components/classnames/index',
            enhancer:     'components/enhancer/enhancer',
            EventEmitter: 'components/eventEmitter/EventEmitter',
            fastclick:    'components/fastclick/fastclick',
            fastdom:      'components/fastdom/index',
            fence:        'components/fence/fence',
            lodash:       'components/lodash',
            picturefill:  'projects/common/utils/picturefill',
            Promise:      'components/when/Promise',
            qwery:        'components/qwery/qwery',
            raven:        'components/raven-js/raven',
            reqwest:      'components/reqwest/reqwest',
            socketio:     'components/socket.io-client/socket.io',
            'facebook.js': '//connect.facebook.net/en_US/all.js',
            'foresee.js': 'vendor/foresee/20150703/foresee-trigger.js',

            svgs:         '../inline-svgs',

            // plugins
            text:         'components/requirejs-text/text',
            inlineSvg:    'projects/common/utils/inlineSvg'
        },
        shim: {
            googletag: {
                exports: 'googletag'
            }
        }
    });
});
