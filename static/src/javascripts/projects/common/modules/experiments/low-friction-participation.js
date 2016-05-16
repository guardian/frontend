define([
    'lodash/objects/merge',
    'lodash/functions/memoize',
    'common/utils/storage',
    'common/utils/config',
    'common/utils/$',
    'common/utils/fastdom-promise',
    'common/views/svgs',
    'text!common/views/experiments/participation/low-friction-wrapper.html',
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
    lowFrictionWrapper,
    lowFrictionInitial,
    lowFrictionConfirming,
    lowFrictionComplete,
    lowFrictionButtons,
    template,
    bean
) {

    var currentState = {
        initialRender: true,
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
            confirmButton: 'Confirm',
            testMessage: 'This is a test. We\'re currently evaluating this as a potential new feature on theguardian.com'
        }
    },
    els = {
        $articleBody: $('.js-article__body'),
        $lowFricContainer: null,
        $lowFricContents: null
    },
    prefs = 'gu.lowFricParticipation';

    // Tear everything down

    var tearDown = function () {
        bean.off(document, 'click.particpation-low-fric');
    };

    // Mark-up Building

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

        var view;

        if (state.complete) {

            view = template(lowFrictionComplete, merge(settings.templateVars, {
                buttons: createButtons(state),
                voteTitle: 'You gave this ' + (state.selectedItem + 1) + ' stars'
            }));

            // Remove bindings
            tearDown();

        }  else if (state.confirming) {

            view = template(lowFrictionConfirming, merge(settings.templateVars, {
                buttons: createButtons(state)
            }));

        } else {

            view = template(lowFrictionInitial, merge(settings.templateVars, {
                buttons: createButtons(state)
            }));

        }


        if (state.initialRender) {
            var fullView = template(lowFrictionWrapper, merge(settings.templateVars, {
                contents: view
            }));

            fastdomPromise.write(function() {
                els.$articleBody.append(fullView);
                els.$lowFricContents = $('.js-participation-low-friction__contents');
            });

        } else {
            fastdomPromise.write(function() {
                els.$lowFricContents.html(view);
            });
        }

    };

    // State Handling

    var updateState = function (state) {
        // Render with merged state
        render(merge(currentState, state));
    };

    // Getters

    var getUserVote = function () {
        if (!storage.local.isStorageAvailable()) {
            return 'no-storage';
        }

        var currentPage = config.page.pageId,
            votedPages = JSON.parse(storage.local.get(prefs));

        // Will return result for current page if available
        return votedPages && votedPages[currentPage];

    };

    // Setters

    var setUserVote = function () {
        var currentPage = config.page.pageId,
            votedPages = JSON.parse(storage.local.get(prefs));

        // If the prefs object doesn't exist, lets create one
        if (!votedPages) {
            votedPages = {};
        }

        votedPages[currentPage] = currentState.selectedItem;

        storage.local.set(prefs, JSON.stringify(votedPages));
    };

    // Binding & Events

    var itemClicked = function (event) {
        updateState({
            confirming: true,
            selectedItem: $(event.currentTarget).data().itemId,
            initialRender: false
        });
    };

    var confirmClicked = function () {
        updateState({
            confirming: false,
            complete: true
        });

        setUserVote();
    };

    var bindEvents = function () {
        bean.on(document, 'click.particpation-low-fric', '.js-participation-low-fric--button', itemClicked);
        bean.on(document, 'click.particpation-low-fric', '.js-participation-low-fric__confirm', confirmClicked);
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

    };

    return {
        init: init
    };

});
