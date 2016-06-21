define([
    'bean',
    'lodash/objects/merge',
    'lodash/functions/memoize',
    'common/utils/storage',
    'common/utils/config',
    'common/utils/$',
    'common/utils/fastdom-promise',
    'common/views/svg',
    'inlineSvg!svgs/icon/star',
    'text!common/views/experiments/participation/low-friction-wrapper.html',
    'text!common/views/experiments/participation/low-friction-contents.html',
    'text!common/views/experiments/participation/low-friction-buttons.html',
    'common/utils/template',
    'common/utils/mediator'
], function (
    bean,
    merge,
    memoize,
    storage,
    config,
    $,
    fastdomPromise,
    svg,
    star,
    lowFrictionWrapper,
    lowFrictionContents,
    lowFrictionButtons,
    template,
    mediator
) {

    var currentState = {
        initialRender: true,
        complete: false,
        confirming: false,
        selectedItem: null
    };

    var settings = {
        prevItemsHighlight: true, // Add the highlight class the items before the selected one
        itemCount: 5, // Amount of items
        itemIconUnicode: [], // Add a list of unicode icons
        inactiveIconClass: 'inline-icon__inactive', // The inactive class added to the icon
        itemIcon: star, // SVG icon
        buttonTextArray: [], // An array of strings to use as the button text, if array is empty will use current iteration value+1
        templateVars: { // Variables that will be passed through to all views
            title: 'Do you agree? Rate this film now',
            description: 'Let us know what you think!',
            itemClassSuffix: 'star',
            confirmButton: 'Rate it!',
            testMessage: 'This is a test. We\'re currently evaluating this as a potential new feature on theguardian.com'
        }
    };

    var els = {
        $articleBody: $('.js-article__body'),
        $lowFricContainer: null,
        $lowFricContents: null
    };

    var prefs = 'gu.lowFricParticipation';

    // Tear everything down

    function tearDown () {
        bean.off(document, 'click.particpation-low-fric');
    }

    // Mark-up Building

    function createButtons (state) {
        var buttonString = '';

        // Build our participation buttons
        for (var i = 0; i < settings.itemCount; i++) {
            var thisUniIcon = settings.itemIconUnicode[i] || settings.itemIconUnicode[0]; // Use icon at current iteration or default to first
            var templateVars = {
                buttonText: 'Choose' +  (settings.buttonTextArray.length > 0 && settings.buttonTextArray[i]) || i + 1,
                shouldBeActive: !state.confirming && !state.complete,
                shouldBeHighlighted: (state.confirming || state.complete) &&
                    ((settings.prevItemsHighlight && state.selectedItem >= i) || state.selectedItem === i),
                itemIcon: thisUniIcon || svg(settings.itemIcon, [settings.inactiveIconClass]),
                itemId: i,
                state: state
            };

            buttonString += template(lowFrictionButtons, merge(settings.templateVars, templateVars));
        }

        return buttonString;
    }

    // Rendering

    function render (state) {

        var view = template(lowFrictionContents, merge(settings.templateVars, {
                buttons: createButtons(state),
                confirming: state.confirming,
                complete: state.complete
            }));

        if (state.complete) {
            tearDown();
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

                if (state.confirming) {
                    // Move focus to the confirm button
                    $('.js-participation-low-fric__confirm').focus();
                }
            });
        }

    }

    // State Handling

    function updateState (state) {
        // Render with merged state
        render(merge(currentState, state));
    }

    // Getters

    function getUserVote () {
        if (!storage.local.isStorageAvailable()) {
            return 'no-storage';
        }

        var currentPage = config.page.pageId,
            votedPages = JSON.parse(storage.local.get(prefs));

        // Will return result for current page if available
        return votedPages && votedPages[currentPage];

    }

    // Setters

    function setUserVote () {
        var currentPage = config.page.pageId,
            votedPages = JSON.parse(storage.local.get(prefs));

        // If the prefs object doesn't exist, lets create one
        if (!votedPages) {
            votedPages = {};
        }

        votedPages[currentPage] = currentState.selectedItem;

        storage.local.set(prefs, JSON.stringify(votedPages));
    }

    // Binding & Events

    function itemClicked (event) {
        updateState({
            confirming: true,
            selectedItem: $(event.currentTarget).data().itemId,
            initialRender: false
        });
    }

    function confirmClicked () {
        updateState({
            confirming: false,
            complete: true
        });

        setUserVote();

        mediator.emit('modules:participation:clicked');
    }

    function itemHovered (e) {
        var itemLength;
        var $lowFricButtons;

        fastdomPromise.read(function() {
            itemLength = e.currentTarget.getAttribute('data-item-id');
            $lowFricButtons = $('.js-participation-low-fric--button');
        }).then(updateIcons);

        function updateIcons () {
            fastdomPromise.write(function() {
                $lowFricButtons.removeClass('participation-low-fric--button__is-highlighted');

                if (itemLength > -1) {
                    for(var i = itemLength; i >= 0; i--) {

                        $($lowFricButtons[i]).addClass('participation-low-fric--button__is-highlighted');
                    }
                }
            });
        }
    }

    function blockUnHovered () {
        if (!currentState.confirming && !currentState.complete) {
            fastdomPromise.write(function() {
                $('.js-participation-low-fric--button').removeClass('participation-low-fric--button__is-highlighted');
            });
        }
    }

    function bindEvents () {
        bean.on(document, 'click.particpation-low-fric', '.js-participation-low-fric--button', itemClicked);
        bean.on(document, 'click.particpation-low-fric', '.js-participation-low-fric__confirm', confirmClicked);
        bean.on(document, 'mouseover.particpation-low-fric', '.js-participation-low-fric--button', itemHovered);
        bean.on(document, 'mouseleave.particpation-low-fric', '.js-participation-low-friction__contents', blockUnHovered);
    }

    // Initalise it.

    function init (options) {
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

            bindEvents(currentState);
        }

    }

    return {
        init: init
    };

});
