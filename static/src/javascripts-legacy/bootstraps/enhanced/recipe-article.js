define([
    'common/utils/$',
    'common/utils/scroller',
    'bean',
    'lodash/functions/debounce'
], function (
    $,
    scroller,
    bean,
    debounce
) {

function init() {
    var recipe = $('.recipe__article--structured');
    var firstRecipe = $('.js-recipe__article--structured .js-recipe__article--structured-headline h1')
    var nextWrapper = $('.js-recipe__article--next-recipe');
    var nextRecipeTitle = $('.js-recipe__article--next-title');
    var nextRecipeText = $('.js-recipe__article--next-text');
    var nextRecipeKicker = $('.js-kicker');
    var nextButton = $('.js-recipe__article--next-button');
    var readMoreButton = $('.js-recipe__article--read-more');
    var readMoreButtonText = $('.read-more__text');
    var displayClass = 'recipe__image__wrapper--is-displayed';

    function setKicker() {
        var nextRecipe = getNextRecipe();

        if (nextRecipe && nextRecipe.length > 0) {
            nextButton.removeClass('top');
            nextRecipeTitle.html(nextRecipe.html());
            nextRecipeKicker.html('Next recipe ');
        } else {
            nextButton.addClass('top');
            nextRecipeTitle.html(firstRecipe.html());
            nextRecipeKicker.html('First recipe ');
        }
    }

    function setMainImage(recipeInView){
        var visibleRecipe = recipeInView.dataset['recipeIndex'];
        var displayedImage = $('.' + displayClass);
        var relatedImage = $('.' + visibleRecipe);
        if (relatedImage.get(0) !== displayedImage.get(0)) {
            displayedImage.removeClass(displayClass);
            relatedImage.addClass(displayClass);
        }
    }

    function getNextRecipe() {
        return $('.js-recipe__article--structured.inview + .js-recipe__article--structured .js-recipe__article--structured-headline h1');
    }

    function getIntOfRecipeInView() {
        var inView;
        for (var i = 0; i < recipe.length; i++) {
            if (isInView(i)) { inView = i; break; }
        }
        return inView >= 0 ? inView : -1
    }

    function isInView(i) {
        var position = recipe[i].getBoundingClientRect();
        var middleOfView = window.innerHeight / 2;

        return position.top <= middleOfView && position.bottom > middleOfView;
    }

    function resetAssets(recipeInView){
        $(recipe).removeClass('inview');
        $(recipe[recipeInView]).addClass('inview');

        if (recipeInView > -1) {setMainImage(recipe[recipeInView])}
        setKicker();
    }

    bean.on(readMoreButton[0], 'click', function() {

        $('.recipe__content').toggleClass('js-visible');

        if (readMoreButtonText.text() == 'Read more') {
            readMoreButtonText.text('Hide')
            setKicker();
            nextButton.removeClass('top');
        } else {
            readMoreButtonText.text('Read more')
            scroller.scrollToElement(firstRecipe[0]);
        }

        readMoreButton.toggleClass('js-x-sign');
    });

    bean.on(nextButton[0], 'click', function() {
        var nextRecipe = getNextRecipe();
        var destination = nextRecipe.length > 0 ? nextRecipe : firstRecipe;
        scroller.scrollToElement(destination[0]);
    });

    window.addEventListener('scroll', debounce(function() {
        var recipeInView = getIntOfRecipeInView();
        if (recipeInView > -1 && !$(recipe[recipeInView]).hasClass('inview')) {
            resetAssets(recipeInView);

        }
    }), 100);

    function initalise() {
        var recipeInView = getIntOfRecipeInView();
        nextWrapper.addClass('visible');
        nextRecipeText.addClass('visible');
        resetAssets(recipeInView);
        if (recipeInView < 0) { nextButton.removeClass('top'); }
    }

    initalise();

  }
  return {init: init}
});
