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
                    '!modules/article/spacefinder.js',
                    '!modules/discussion/activity-stream.js',
                    '!modules/discussion/api.js',
                    '!modules/discussion/comment-box.js',
                    '!modules/discussion/comment-count.js',
                    '!modules/discussion/comments.js',
                    '!modules/discussion/loader.js',
                    '!modules/discussion/recommend-comments.js',
                    '!modules/discussion/top-comments.js',
                    '!modules/gallery/lightbox.js',
                    '!modules/identity/account-profile.js',
                    '!modules/identity/api.js',
                    '!modules/identity/autosignin.js',
                    '!modules/identity/facebook-authorizer.js',
                    '!modules/identity/forms.js',
                    '!modules/identity/formstack-iframe-embed.js',
                    '!modules/identity/formstack-iframe.js',
                    '!modules/identity/formstack.js',
                    '!modules/identity/password-strength.js',
                    '!modules/identity/public-profile.js',
                    '!modules/identity/validation-email.js',
                    '!modules/sport/football/football.js',
                    '!modules/sport/football/match-info.js',
                    '!modules/sport/football/match-list-live.js'
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
