/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
 * NOTE: this has been patched by MA to add enable/disable functionality
 *       this will need to be preserved / re-patched if we update this library
*/
!function (name, definition) {
  if (typeof define == 'function') define(definition)
  else if (typeof module != 'undefined') module.exports = definition()
  else this[name] = definition()
}('Swipe', function() {

  var Swipe = function(element, options) {

    // return immediately if element doesn't exist
    if (!element) return null;

    var _this = this;

    // retreive options
    this.options = options || {};
    this.index = this.options.startSlide || 0;
    this.speed = this.options.speed || 300;
    this.callback = this.options.callback || function() {};
    this.delay = this.options.auto || 0;
    this.isDisabled = false;

    // reference dom elements
    this.container = element;
    this.element = this.container.children[0]; // the slide pane

    // static css
    this.container.style.overflow = 'hidden';
    this.element.style.listStyle = 'none';

    // trigger slider initialization
    this.setup();

    // setup auto slideshow
    this.start();

    // add event listeners
    this.element.addEventListener('touchstart', this, false);
    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);
    this.element.addEventListener('webkitTransitionEnd', this, false);
    this.element.addEventListener('msTransitionEnd', this, false);
    this.element.addEventListener('oTransitionEnd', this, false);
    this.element.addEventListener('transitionend', this, false);
    window.addEventListener('resize', this, false);

  };

  Swipe.prototype = {

    setup: function() {

      // get and measure amt of slides
      this.slides = this.element.children;
      this.length = this.slides.length;

      // return immediately if their are less than two slides
      if (this.length < 2) return null;

      // hide slider element but keep positioning during setup
      this.container.style.visibility = 'hidden';

      // determine width of each slide
      this.width = this.container.getBoundingClientRect().width;

      // dynamic css
      this.element.style.width = (this.slides.length * this.width) + 'px';
      var index = this.slides.length;
      while (index--) {
        var el = this.slides[index];
        el.style.width = this.width + 'px';
        el.style.display = 'table-cell';
        el.style.verticalAlign = 'top';
      }

      // set start position and force translate to remove initial flickering
      this.slide(this.index, 0, true);

      // show slider element
      this.container.style.visibility = 'visible';

    },

    slide: function(index, duration, shouldNotDisable) {
      if (!shouldNotDisable) {
        shouldNotDisable = false;
      }

      if (!shouldNotDisable) {
        this.disable();
      }
      var style = this.element.style;

      // set duration speed (0 represents 1-to-1 scrolling)
      style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 'ms';

      // translate to given index position
      style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,0,0)';
      style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + -(index * this.width) + 'px)';

      // set new index to allow for expression arguments
      this.index = index;
    },

    disable: function() {
      this.isDisabled = true;
    },

    enable: function() {
      this.isDisabled = false;
    },

    getPos: function() {
      // return current index position
      return this.index;

    },

    prev: function(delay) {

      // cancel slideshow
      this.delay = delay || 0;
      clearTimeout(this.interval);

      // if not at first slide
      if (this.index) this.slide(this.index-1, this.speed);

    },

    next: function(delay) {

      // cancel slideshow
      this.delay = delay || 0;
      clearTimeout(this.interval);

      if (this.index < this.length - 1) this.slide(this.index+1, this.speed); // if not last slide
      else this.slide(0, this.speed); //if last slide return to start

    },

    start: function() {
      var _this = this;

      this.interval = (this.delay)
        ? setTimeout(function() {
          _this.next(_this.delay);
        }, this.delay)
        : 0;

    },

    handleEvent: function(e) {
      switch (e.type) {
        case 'touchstart': this.onTouchStart(e); break;
        case 'touchmove': this.onTouchMove(e); break;
        case 'touchend': this.onTouchEnd(e); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'transitionend': this.transitionEnd(e); break;
        case 'resize': this.setup(); break;
      }
    },

    transitionEnd: function(e) {
      this.enable();
      if (this.delay) this.start();

      this.callback(e, this.index, this.slides[this.index]);

    },

    onTouchStart: function(e) {
      if (this.isDisabled) {
        return false;
      }

      // cancel slideshow
      clearTimeout(this.interval);

      this.start = {

        // get touch coordinates for delta calculations in onTouchMove
        pageX: e.touches[0].pageX,
        pageY: e.touches[0].pageY,

        // set initial timestamp of touch sequence
        time: Number( new Date() )

      };

      // used for testing first onTouchMove event
      this.isScrolling = undefined;

      // reset deltaX
      this.deltaX = 0;

      // set transition time to 0 for 1-to-1 touch movement
      this.element.style.webkitTransitionDuration = 0;

    },

    onTouchMove: function(e) {
      if (this.isDisabled) {
        return false;
      }


      this.deltaX = e.touches[0].pageX - this.start.pageX;

      // determine if scrolling test has run - one time test
      if ( typeof this.isScrolling == 'undefined') {
        this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.start.pageY) );
      }

      // if user is not trying to scroll vertically
      if (!this.isScrolling) {
        // prevent native scrolling
        e.preventDefault();

        // increase resistance if first or last slide
        this.deltaX =
          this.deltaX /
            ( (!this.index && this.deltaX > 0               // if first slide and sliding left
              || this.index == this.length - 1              // or if last slide and sliding right
              && this.deltaX < 0                            // and if sliding at all
            ) ?
            ( Math.abs(this.deltaX) / this.width + 1 )      // determine resistance level
            : 1 );                                          // no resistance if false

        // translate immediately 1-to-1
        this.element.style.webkitTransform = 'translate3d(' + (this.deltaX - this.index * this.width) + 'px,0,0)';

      }

    },

    onTouchEnd: function(e) {
      if (this.isDisabled) {
        return false;
      }

      // determine if slide attempt triggers next/prev slide
      var isValidSlide =
            Number(new Date()) - this.start.time < 250      // if slide duration is less than 250ms
            && Math.abs(this.deltaX) > 20                   // and if slide amt is greater than 20px
            || Math.abs(this.deltaX) > this.width/2,        // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
          isPastBounds =
            !this.index && this.deltaX > 0                          // if first slide and slide amt is greater than 0
            || this.index == this.length - 1 && this.deltaX < 0;    // or if last slide and slide amt is less than 0

      // if not scrolling vertically
      if (!this.isScrolling) {

        // call slide function with slide end value based on isValidSlide and isPastBounds tests
        this.slide( this.index + ( isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0 ), this.speed );

      }

    }

  };

  return Swipe;
});