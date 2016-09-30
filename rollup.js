/* eslint-disable no-console */
// This script is only used to generate leaves, things that are loaded
// asynchronously from a root module.
// Any transitive dependency of the root module
const ROOT_MODULES = [
    'boot',
    'bootstraps/standard/main',
    'bootstraps/commercial',
    'bootstraps/enhanced/main',
    'text',
    'inlineSvg'
];

// These are the files that should be generated with rollup
const MODULES_TO_CREATE = [
    'bootstraps/enhanced/facia'
];

// No matter what the dependencies analysis says, never bundle these
const EXTERNAL_MODULES = [
    'foresee.js',
    'googletag.js',
    'sonobi.js',
    'ophan/ng',
    'prebid.js',
    'discussion-frontend-react',
    'discussion-frontend-preact'
];

const JAVASCRIPTS_FOLDER = __dirname + '/static/src/javascripts/';
const TARGET_FOLDER = __dirname + '/static/target/javascripts/';

const REQUIREJS_PATHS = {
    admin:                          'projects/admin',
    common:                         'projects/common',
    facia:                          'projects/facia',
    membership:                     'projects/membership',
    commercial:                     'projects/commercial',
    stripe:                         'vendor/stripe/stripe.min',
    bean:                           'components/bean/bean',
    bonzo:                          'components/bonzo/bonzo',
    react:                          'components/react/react',
    classnames:                     'components/classnames/index',
    domReady:                       'components/domready/ready',
    EventEmitter:                   'components/eventEmitter/EventEmitter',
    fastclick:                      'components/fastclick/fastclick',
    fastdom:                        'components/fastdom/index',
    fence:                          'components/fence/fence',
    lodash:                         'components/lodash-amd',
    picturefill:                    'projects/common/utils/picturefill',
    Promise:                        'components/when/Promise',
    qwery:                          'components/qwery/qwery',
    raven:                          'components/raven-js/raven',
    reqwest:                        'components/reqwest/reqwest',
    svgs:                           '../inline-svgs',

    // video
    'videojs-ima':                  'bootstraps/enhanced/media/videojs-ima.js',
    'videojs':                      'components/video.js/video.js',
    'videojs-ima-lib':              'components/videojs-ima/videojs.ima.js',
    'videojs-ads-lib':              'components/videojs-contrib-ads/videojs.ads.js',
    'videojs-embed':                'components/videojs-embed/videojs.embed.js',
    'videojs-persistvolume':        'components/videojs-persistvolume/videojs.persistvolume.js',
    'videojs-playlist':             'components/videojs-playlist-audio/videojs.playlist.js',

    // plugins
    text:                           'components/requirejs-text/text',
    inlineSvg:                      'projects/common/utils/inlineSvg'
};

var madge = require('piuccio.madge');
var rollup = require('rollup');
var amd = require('rollup-plugin-amd');
var buble = require('rollup-plugin-buble');
var string = require('rollup-plugin-string');
var lookup = require('module-lookup-amd');
var uglify = require('uglify-js');
var write = require('write-file-promise');
var pathUtil = require('path');
var debug = require('debug');

// Madge iterate on a list of actual files to find all AMD dependencies
madge(ROOT_MODULES.map(function (module) {
    if (REQUIREJS_PATHS[module]) {
        module = REQUIREJS_PATHS[module];
    }
    return JAVASCRIPTS_FOLDER + module + '.js';
}), {
    baseDir: JAVASCRIPTS_FOLDER,
    requireConfig: {
        paths: REQUIREJS_PATHS
    },
    detectiveOptions: {
        amd: {
            skipLazyLoaded: true
        }
    }
})
.then(function (res) {
    // The result of madge is an Object whose keys are the module ids after being
    // resolved. So for example `bonzo` is returned as `components/bonzo/bonzo`
    // `remap` converts those ids back to the actual value inside `define` calls
    var excludedDependencies = remap(Object.keys(res.obj())).concat(EXTERNAL_MODULES);
    debug('dependencies')('Excluging dependencies', excludedDependencies);
    var debugDependencies = write(
        TARGET_FOLDER + 'root-dependencies.json',
        JSON.stringify(res.obj(), null, '\t')
    );

    return MODULES_TO_CREATE.reduce(function (promise, module) {
        return promise.then(bundleRollup(module, excludedDependencies));
    }, debugDependencies);
})
.catch(function (error) {
    console.error(error);
    process.exit(1);
});

function remap (deps) {
    return deps.map(function (moduleName) {
        for (var path in REQUIREJS_PATHS) {
            if (moduleName.indexOf(REQUIREJS_PATHS[path]) === 0) {
                return path + moduleName.substring(REQUIREJS_PATHS[path].length);
            }
        }
        return moduleName;
    });
}

var logBundle = debug('bundle');
var logRewire = debug('rewire:log');
var logExternal = debug('rewire:external');
function bundleRollup (module, excludedDependencies) {
    var entry = JAVASCRIPTS_FOLDER + module;
    logBundle('Bundling', entry);
    return rollup.rollup({
        entry: entry,
        plugins: [
            amd({
                rewire: function (moduleId, parent) {
                    logRewire('Rewiring AMD module', moduleId, 'inside', parent);
                    moduleId = convertFromLodashMaybe(moduleId, parent);
                    if (moduleId.charAt(0) === '.') {
                        console.error('There should not be a relative module here', moduleId);
                        return moduleId;
                    } else if (excludedDependencies.indexOf(moduleId) === -1) {
                        logExternal('Module', moduleId, 'should be excluded');
                        return moduleIdToRelativePath(moduleId, parent);
                    } else {
                        return moduleId;
                    }
                }
            }),
            string({
                include: ['**/*.html']
            }),
            buble()
        ],
        external: excludedDependencies
    })
    .then(function (bundle) {
        var bundledCode = bundle.generate({
            format: 'amd',
            // We don't have mixed ES6 / AMD files, so there's no need to maintain
            // inter-operability between different module systems.
            interop: false,
            // The bundle cannot generate the sourceMaps because of rollup-plugin-amd
            sourceMap: false
        });

        var files = {};
        files[module + '.js'] = bundledCode.code.toString();

        var uglifiedCode = uglify.minify(files, {
            fromString: true,
            inSourceMap: bundledCode.map,
            outSourceMap: false,
            compress: {
                dead_code: true,
                drop_debugger: true,
                conditionals: true,
                evaluate: true,
                booleans: true,
                loops: true,
                unused: true,
                join_vars: true,
                pure_getters: true,
                unsafe: true
            }
        });

        return Promise.all([
            write(TARGET_FOLDER + module + '.js', uglifiedCode.code),
            write(TARGET_FOLDER + module + '.js.map', uglifiedCode.map)
        ]);
    })
    .catch(function (error) {
        console.error(error);
        process.exit(2);
    });
}

function convertFromLodashMaybe (moduleId, parent) {
    // Lodash amd uses relative paths that mess up with the rest of requires
    if (moduleId.charAt(0) === '.' && parent.indexOf('lodash-amd') !== -1) {
        var log = debug('rewire:lodash');
        log('File', parent, 'requires', moduleId);
        var actualPath = resolvePath(moduleId, parent);
        log('actual path', actualPath);
        var relativeModule = relativePath(actualPath, JAVASCRIPTS_FOLDER);
        log('relative module', relativeModule);
        var lodashModuleId = remap([relativeModule])[0].replace(/\.js$/, '');
        log('lodash module ID', lodashModuleId);
        return lodashModuleId;
    } else {
        return moduleId;
    }
}

function moduleIdToRelativePath (moduleId, basePath) {
    var resolvedPath = lookup({
        partial: moduleId,
        filename: JAVASCRIPTS_FOLDER + 'base',
        config: {
            paths: REQUIREJS_PATHS
        }
    });
    var relative = relativePath(resolvedPath, basePath);
    return relative.charAt(0) === '.' ? relative : ('./' + relative);
}

function relativePath (path, parent) {
    // Return the relative path that takes you to `path` from `parent`
    return pathUtil.relative(parent[parent.length - 1] === '/' ?
        parent : pathUtil.dirname(parent),
        path
    );
}

function resolvePath (path, parent) {
    // Return the absolute path that takes you to `path` from `parent`
    return pathUtil.resolve(pathUtil.dirname(parent), path);
}
