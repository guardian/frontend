define([
    'lodash/objects/merge',
    'lodash/functions/memoize',
    'common/utils/storage',
    'common/utils/config',
    'common/utils/$',
    'common/utils/fastdom-promise',
    'common/views/svgs',
    'text!common/views/experiments/participation/low-friction-initial.html',
    'text!common/views/experiments/participation/low-friction-confirming.html',
    'text!common/views/experiments/participation/low-friction-complete.html',
    'text!common/views/experiments/participation/low-friction-buttons.html',
    'common/utils/template',
    'bean'
], function (
    merge,
    memoize,
    storage,
    config,
    $,
    fastdomPromise,
    svgs,
    lowFrictionInitial,
    lowFrictionConfirming,
    lowFrictionComplete,
    lowFrictionButtons,
    template,
    bean
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

    // Tear everything down

    var tearDown = function () {
        bean.off(document, 'click', '.js-participation-low-fric--button');
        bean.off(document, 'click', '.js-participation-low-fric__confirm');
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

            templateVars.extraClasses = '';
            templateVars.itemIcon = svgs(settings.itemIconId, [inactiveClass]);

            if (state.confirming || state.complete) {
                if ((settings.prevItemsHighlight && state.selectedItem >= i) || state.selectedItem === i) {
                    templateVars.extraClasses += 'participation-low-fric--button__is-highlighted ';
                }
            } else {
                templateVars.extraClasses += 'participation-low-fric--button__is-active';
            }

            // Completion
            if (state.complete) {
                templateVars.elType = 'span';
            } else {
                templateVars.elType = 'button';
            }

            templateVars.itemId = i;

            buttonString += template(lowFrictionButtons, merge(settings.templateVars, templateVars));
        }

        return buttonString;
    };

    // Rendering

    var render = function (state) {

        var renderPromise;

        if (state.complete) {
            var completedView = template(lowFrictionComplete, merge(settings.templateVars, {
                buttons: createButtons(state)
            }));

            renderPromise = fastdomPromise.write(function(){
                els.$lowFricContainer.html(completedView);

                // Remove bindings
                tearDown();
            });
        }

        else if (state.confirming) {
            var confirmingView = template(lowFrictionConfirming, merge(settings.templateVars, {
                buttons: createButtons(state)
            }));

            renderPromise = fastdomPromise.write(function(){
                els.$lowFricContainer.html(confirmingView);
            });
        }

        else {
            var firstView = template(lowFrictionInitial, merge(settings.templateVars, {
                buttons: createButtons(state)
            }));

            renderPromise = fastdomPromise.write(function(){
                els.$lowFricContainer.html(firstView);
            });
        }

        return renderPromise;
    };

    // State Handling

    var updateState = function (state) {
        // Render with merged state
        render(merge(currentState, state));
    };

    // Binding & Events

    var itemClicked = function (event) {
        updateState({
            confirming: true,
            selectedItem: $(event.currentTarget).data().itemId
        });
    };

    var confirmClicked = function () {
        updateState({
            confirming: false,
            complete: true
        });
    };

    var bindEvents = function () {
        bean.on(document, 'click', '.js-participation-low-fric--button', itemClicked);
        bean.on(document, 'click', '.js-participation-low-fric__confirm', confirmClicked);
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

    // Initalise it.

    var init = function (options) {
        var userVote = getUserVote();

        // If we can't store the user's value, don't render
        if (userVote === 'no-storage') {
            return;
        }

        // Create instance options
        settings = merge(settings, options);

        createInitContainer().then(function() {

            els.$lowFricContainer = $('.js-participation-low-fric');

            if (userVote) {
                // Render with selected item
                updateState ({
                    complete: true,
                    selectedItem: userVote
                });
            } else {
                // Set and render initial state
                updateState({});
            }

            bindEvents(currentState);
        });

    };

    return {
        init: init
    };

});
