define([
    'lib/$',
    'lib/scroller',
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
    var firstRecipe = $('.js-recipe__article--structured .js-recipe__article--structured-headline h1');
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

    function setMainImage(focalRecipe){
        var focalRecipeIndex = focalRecipe.attr('data-recipe-index');
        var displayedImage = $('.' + displayClass);
        var relatedImage = $('.' + focalRecipeIndex);
        if (relatedImage.get(0) !== displayedImage.get(0)) {
            displayedImage.removeClass(displayClass);
            relatedImage.addClass(displayClass);
        }
    }

    function getNextRecipe() {
        return $('.js-recipe__article--structured.inview + .js-recipe__article--structured .js-recipe__article--structured-headline h1');
    }

    function getIntOfFocalRecipe() {
        var focalRecipeInt;
        for (var i = 0; i < recipe.length; i++) {
            if (isFocalRecipe(i)) { focalRecipeInt = i; break; }
        }
        return focalRecipeInt >= 0 ? focalRecipeInt : -1
    }

    function isFocalRecipe(i) {
        var position = recipe[i].getBoundingClientRect();
        var middleOfView = window.innerHeight / 2;

        return position.top <= middleOfView && position.bottom > middleOfView;
    }

    function resetAssets(focalRecipeInt){
        $(recipe).removeClass('inview');
        $(recipe[focalRecipeInt]).addClass('inview');

        if (focalRecipeInt > -1) {setMainImage($(recipe[focalRecipeInt]))}
        setKicker();
    }

    bean.on(readMoreButton[0], 'click', function() {

        $('.recipe__content').toggleClass('js-visible');

        if (readMoreButtonText.text() === 'Read more') {
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
        var focalRecipeInt = getIntOfFocalRecipe();
        if (focalRecipeInt > -1 && !$(recipe[focalRecipeInt]).hasClass('inview')) {
            resetAssets(focalRecipeInt);

        }
    }), 100);

    function initalise() {
        var focalRecipeInt = getIntOfFocalRecipe();
        nextWrapper.addClass('visible');
        nextRecipeText.addClass('visible');
        resetAssets(focalRecipeInt);
        if (focalRecipeInt < 0) { nextButton.removeClass('top'); }
    }

    initalise();

  }
  return {init: init}
});
