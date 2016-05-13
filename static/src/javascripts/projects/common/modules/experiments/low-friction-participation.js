define([
    'lodash/objects/merge',
    'lodash/functions/memoize',
    'common/utils/storage',
    'common/utils/config',
    'common/utils/$',
    'common/utils/fastdom-promise',
    'common/views/svgs',
    'text!common/views/experiments/participation/low-friction-initial.html',
    'text!common/views/experiments/participation/low-friction-buttons.html',
    'common/utils/template'
], function (
    merge,
    memoize,
    storage,
    config,
    $,
    fastdomPromise,
    svgs,
    lowFrictionInitial,
    lowFrictionButtons,
    template
) {

    var currentState = {
        complete: false,
        confirming: false,
        selectedItem: null
    },
    settings = {
        prevItemsHighlight: true,
        itemCount: 5,
        itemIconId: 'star',
        templateVars: {
            title: 'Do you agree? Tell us what you think',
            description: 'Have you seen this film? Let us know how you would rate it!',
            voteTitle: 'Vote now:',
            itemClassSuffix: 'star',
            confirmButton: 'confirm',
            testMessage: 'This is a test. We\'re currently evaluating this as a potential new feature on theguardian.com'
        }
    },
    els = {
        $lowFricContainer: null
    };

    var init = function (options) {
        var userVote = getUserVote();

        // If we can't store the user's value, don't render
        if (userVote === 'no-storage') {
            return;
        }

        // Create instance options
        this.options = merge(settings, options);

        createInitContainer().then(function() {

            els.$lowFricContainer = $('.js-participation-low-fric');

            if (userVote) {
                // Render with selected item
                updateState ({
                    complete: true,
                    selectedItem: userVote
                })
            } else {
                // Set and render initial state
                updateState({});
            }
        }.bind(this));

    };

    var updateState = function (state) {
        // Render with merged state
        render(merge(currentState, state));
    };

    var render = function (state) {

        if (state.complete) {
            console.log('render completed view')
        }

        else if (state.confirming) {
            console.log('render confirming view')
        }

        else {
            var firstView = template(lowFrictionInitial, merge(settings.templateVars, {
                buttons: createButtons(state)
            }));

            els.$lowFricContainer.html(firstView);
        }

    };

    // Mark-up Building

    var createInitContainer = function () {
        return fastdomPromise.write(function () {
            // Add the container for our low friction component
            $('.js-article__body').append('<div class="js-participation-low-fric"></div>');
        });
    };

    var createButtons = function (state) {
        var buttonString = '';

        // Build our participation buttons
        for (var i = 0; i < settings.itemCount; i++) {
            var inactiveClass = 'star__item--grey',
                templateVars = {};

            templateVars.itemIcon = svgs(settings.itemIconId, [inactiveClass]);
            templateVars.highlightClass =  (state.complete && state.selectedItem === i) ? 'participation-low-fric--button__is-highlighted' : '';

            buttonString += template(lowFrictionButtons, merge(settings.templateVars, templateVars));
        }

        return buttonString;
    };

    // Getters

    var getUserVote = function () {
        if (!storage.local.isStorageAvailable()) {
            return 'no-storage';
        }

        var currentPage = config.page.pageId,
            votedPages = JSON.parse(storage.local.get('gu.lowFricParticipation'));

        // Will return result for current page if available
        return votedPages && votedPages[currentPage];

    };

    return {
        init: init
    };

});
