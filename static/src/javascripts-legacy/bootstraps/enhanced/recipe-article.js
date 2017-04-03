define([
    'lib/$',
    'lib/scroller',
    'bean',
    'lodash/functions/debounce',
    'common/modules/ui/sticky',
    'lib/detect'
], function (
    $,
    scroller,
    bean,
    debounce,
    Sticky,
    detect
) {

function init() {
    var recipe = $('.recipe__article--structured');
    var article = $('.js-recipe__content');
    var articleNoJS = $('.js-recipe__content--no-js');
    var firstRecipe = $('.js-recipe__article--structured');
    var firstRecipeHeadline = $('.js-recipe__article--structured .js-recipe__article--structured-headline h1');
    var nextWrapper = $('.js-recipe__article--next-recipe');
    var readMoreNoJS = $('.js-read-more--no-js');
    var readMoreWrapper = $('.js-read-more--wrapper');
    var nextRecipeTitle = $('.js-recipe__article--next-title');
    var nextRecipeText = $('.js-recipe__article--next-text');
    var nextRecipeKicker = $('.js-kicker');
    var nextButton = $('.js-recipe__article--next-button');
    var readMoreButton;
    var displayClass = 'recipe__image__wrapper--is-displayed';
    var stickyGutter = $('.js-recipe__gutter-wrapper');
    var stickyImages = $('.js-recipes__images-wrapper');
    var contentFooter = $('.content-footer');
    var contentFooterTop;
    var windowHeight = window.innerHeight;


    function hideNextArticle() {
        nextRecipeText[0].classList.add('visible');
        if(contentFooterTop <= windowHeight) {
            nextRecipeText[0].classList.add('is-hidden');
        }else {
            nextRecipeText[0].classList.remove('is-hidden');
        }
    }

    function setKicker() {
        var nextRecipe = getNextRecipe();
        var nextRecipeHeadline = getNextRecipeHeadline();

        if (nextRecipe && nextRecipe.length > 0) {
            nextButton.removeClass('top');
            nextRecipeTitle.html(nextRecipeHeadline.html());
            nextRecipeKicker.html('Next recipe ');
        } else {
            nextButton.addClass('top');
            nextRecipeTitle.html(firstRecipeHeadline.html());
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

    function getNextRecipeHeadline() {
        return $('.js-recipe__article--structured.inview + .js-recipe__article--structured .js-recipe__article--structured-headline h1');
    }

    function getNextRecipe() {
        return $('.js-recipe__article--structured.inview + .js-recipe__article--structured');
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
        var middleOfView = window.innerHeight / 3;

        return position.top <= middleOfView && position.bottom > middleOfView;
    }

    function resetAssets(focalRecipeInt){
        $(recipe).removeClass('inview');
        $(recipe[focalRecipeInt]).addClass('inview');

        if (focalRecipeInt > -1) {setMainImage($(recipe[focalRecipeInt]))}
        setKicker();
    }

    function scrollToNextRecipe(){
        var nextRecipe = getNextRecipe();
        var destination = nextRecipe.length > 0 ? nextRecipe : firstRecipe;
        scroller.scrollToElement(destination[0]);
    }

    bean.on(readMoreWrapper[0], 'click', function() {
        article.toggleClass('js-visible');
        readMoreButton.toggleClass('js-x-sign');
    });

    nextWrapper.each(function(elem) {
      bean.on(elem, 'click', function() {
          scrollToNextRecipe();
      });
    });

    window.addEventListener('scroll', debounce(function() {
        contentFooterTop = contentFooter[0].getBoundingClientRect().top;
        var focalRecipeInt = getIntOfFocalRecipe();
        if (focalRecipeInt > -1 && !$(recipe[focalRecipeInt]).hasClass('inview')) {
            resetAssets(focalRecipeInt);
        }
        hideNextArticle()
    }), 100);

    function initalise() {
        var focalRecipeInt = getIntOfFocalRecipe();
        nextWrapper.addClass('visible');
        resetAssets(focalRecipeInt);
        if (focalRecipeInt < 0) { nextButton.removeClass('top'); }

        if(detect.isBreakpoint({ min: 'desktop' })) {
          new Sticky(stickyGutter[0]).init();
          new Sticky(stickyImages[0]).init();
        }

        readMoreWrapper.html(readMoreNoJS.html());
        readMoreButton = $('.js-recipe__article--read-more');
        article.html(articleNoJS.html());
        articleNoJS.remove();
    }

    initalise();

  }
  return {init: init}
});
