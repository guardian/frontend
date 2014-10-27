module.exports = function(grunt, options) {
    return {
        options: {
            config: 'resources/jscs_conf.json'
        },
        common: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/common',
                src: [
                    '**/*.js',
                    '!modules/discussion/comment-box.js',
                    '!modules/discussion/comments.js',
                    '!modules/discussion/loader.js',
                    '!modules/identity/forms.js',
                    '!modules/identity/formstack-iframe-embed.js',
                    '!modules/identity/formstack-iframe.js',
                    '!modules/identity/formstack.js',
                    '!modules/identity/password-strength.js',
                    '!modules/identity/public-profile.js',
                    '!modules/identity/validation-email.js'
                ]
            }]
        },
        facia: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/facia',
                src: [
                    '**/*.js',
                    '!modules/ui/container-show-more.js',
                    '!modules/ui/container-toggle.js'
                ]
            }]
        },
        faciaTool: {
            files: [{
                expand: true,
                cwd: 'facia-tool/public/javascripts/',
                src: [
                    '**/*.js',
                    '!components/**',
                    '!**/*.js'
                ]
            }]
        },
        membership: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/membership',
                src: [
                    '**/*.js',
                    '!payment-form.js',
                    '!stripe-error-messages.js'
                ]
            }]
        },
        bootstraps: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/bootstraps',
                src: [
                    '**/*.js'
                ]
            }]
        }
    };
};
