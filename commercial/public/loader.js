require([], function() {

    var guCommercial = {

        className: 'commercial',

        breakpoints: [300, 400, 500, 600],

        getUserSegments: function() {
            var repeatVisitor = JSON.parse(localStorage.getItem("gu.history")).value.length <= 1 ? 'new' : 'repeat';
            return 'seg=' + repeatVisitor;
        },

        getSection: function() {
            return 's=' + guardian.config.page.section;
        },

        getKeywords: function() {
            var keywords = guardian.config.page.keywords
            return keywords.split(',').map(function(keyword){
                return 'k=' + encodeURIComponent(keyword.replace(/\s/g, "-").toLowerCase());
            }).join('&');
        },

        components: function() {

            // TODO: fix these hardcoded URLs
            return {
                masterclasses: 'http://api.nextgen.guardianapps.co.uk/commercial/masterclasses.json?' + this.getUserSegments() + '&' + this.getSection(),
                travel:        'http://api.nextgen.guardianapps.co.uk/commercial/travel/offers.json?' + this.getUserSegments() + '&' + this.getSection() + '&' + this.getKeywords(),
                jobs:          'http://api.nextgen.guardianapps.co.uk/commercial/jobs.json?' + this.getUserSegments() + '&' + this.getSection() + '&' + this.getKeywords(),
                soulmates:     'http://api.nextgen.guardianapps.co.uk/commercial/soulmates/mixed.json?' + this.getUserSegments() + '&' + this.getSection()
            };
        },

        applyBreakpointClassnames: function() {
            var self = this;
            /*$nodes = $('.'+this.className);

             $nodes.each(function(i, el) {
             var width = el.offsetWidth;
             el.className = el.className.replace(/(commercial--w\d{1,3})\s?/g, '');
             self.breakpoints.forEach(function(breakpointWidth) {
             if (width >= breakpointWidth) {
             $(el).addClass(self.className+'--w' + breakpointWidth);
             }
             });

             el.setAttribute('data-width', width);
             });*/
        },

        debounce: function(fn, delay) {
            var timer = null;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        },

        load: function(endpoint, targetSelector) {
            var self = this;
            //console.log('loading... ', endpoint, targetSelector)

            var xhr = new XMLHttpRequest();
            xhr.addEventListener("load", function () {
                var ad = JSON.parse(xhr.response).html;
                //console.log('***', targetSelector, ad);
                targetSelector.innerHTML = ad;
                //self.applyBreakpointClassnames(); - TODO need to unjquery this
            }, false);
            xhr.open('GET', endpoint, true);
            xhr.send();
        },

        loadComponents: function() {


            var self = this,
                components = this.components();

            //console.log(document.querySelectorAll('[data-gu-component]'));
            //console.log(Array.prototype.slice.call(document.querySelectorAll('[data-gu-component]')));

            Array.prototype.slice.call(document.querySelectorAll('[data-gu-component]')).forEach(function (el) {
                var componentType = el.getAttribute('data-gu-component'),
                    endpoint      = components[componentType];

                //
                console.log(componentType, endpoint, el, self);

                self.load(endpoint, el);
            })

        },

        init: function() {
            var self = this;
            this.loadComponents();
        }
    };

    guCommercial.init();
});