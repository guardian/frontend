define(['common', 'reqwest', 'modules/detect'], function (common, reqwest, detect) {

    var Adverts = function () {

        this.sizeMap = {
            'Top2' : {
                width : '300',
                height: '50'
            },
            'Top' : {
                width : '728',
                height: '90'
            },
            'Bottom2' : {
                width : '300',
                height: '50'
            },
            'Bottom' : {
                width : '728',
                height: '90'
            }
        },

        this.init = function(config) {

            var jsonFromOAS = {
                scripts: ['http://4sa.s3.amazonaws.com/ad-templates/expandable/v1.6/expandable-ad-template.js',
                          'http://4sa.s3.amazonaws.com/expandables/killing-them-softly/scripts/expandable-ad-unit.js?cachebuster=%%REALRAND%%'],
                props: {
                    adId: 'killing-them-softly',
                    adEnvironment: 'production',
                    clickUrl: '%%C%%?',
                    cacheBusterToken: '%%REALRAND%%',
                    collapsedAdWidth: 300,
                    collapsedAdHeight: 50,
                    expandedAdWidth: 300,
                    expandedAdHeight: 300
                }
            };

            if (true) {
                this.loadExpandable(jsonFromOAS);
                return;
            }


            if (document.readyState === 'complete') {
                this.load(config);
            } else {
                var that = this;
                window.addEventListener('load', function() {
                    that.load(config);
                });
            }
        },

        //Initalise
        this.load = function(config) {
            var slots = document.querySelectorAll('.ad-slot'),
                connection = detect.getConnectionSpeed(),
                width = window.innerWidth,
                size = (width > 728) ? 'median' : 'base',
                length = slots.length,
                i =0;

            console.log(slots);

            this.url = this.generateQuery(config, connection);
            console.log(this.url);

            for(; i < length; i++) {
                var slot = slots[i].getAttribute('data-'+size),
                    id = slots[i].id;

                this.create(slot, id);
            }
        },

        this.loadExpandable = function(adData) {
            require([adData.scripts[0]], function() {
                require([adData.scripts[1]], function() {
                    var ad = document.querySelector('#ad-slot-top-banner-ad');
                    var div = document.createElement('div')
                    div.setAttribute('ad-container-id', adData.props.adId)
                    ad.parentNode.replaceChild(div, ad);

                    var adUnit = new ExpandableAdUnit();
                    for (var prop in adData.props) {
                        adUnit[prop] = adData.props[prop];
                    }
                    adUnit.initialiseTemplate();
                });
            });
        },

        //To construct and cache request URL
        this.generateQuery = function(config, connection) {
            var requestType = (connection === 'low') ? 'adstream_nx.ads/' : 'adstream_sx.ads/';

            var url = config.oasUrl;
                url += requestType;
                url += config.oasSiteId;
                url += '/12345@';

            var keywords = config.keywords.split(','),
                length = keywords.length,
                query = '?',
                i=0;

            for(; i < length; i++) {
                query += 'k=' + encodeURIComponent(keywords[i]);
            }

            query += '&ct=' + encodeURIComponent(config.contentType.toLowerCase());
            query += '&pt=' + encodeURIComponent(config.contentType.toLowerCase());
            query += '&cat=' + encodeURIComponent(config.section.toLowerCase());

            return { host : url, query : query};
        },

        this.create = function (slot, location) {
            console.log('creating', slot)
            var frame = document.createElement('iframe'),
                dimensions = this.sizeMap[slot];

            frame.src = this.url.host + slot + this.url.query;
            frame.setAttribute('class', 'ad');
            frame.setAttribute('marginheight', '0px');
            frame.setAttribute('marginwidth', '0px');
            frame.setAttribute('frameborder', '0');
            frame.setAttribute('seamless', 'seamless');
            frame.width = dimensions.width;
            frame.height = dimensions.height;
            console.log(frame);
            common.mediator.emit('modules:adverts:created', frame, location);
        },

        // View
        this.view = {

            render: function (frame, location) {
                var el = document.getElementById(location);
                el.appendChild(frame);

                common.mediator.emit('modules:adverts:render');
            }
        };

        // Bindings
        common.mediator.on('modules:adverts:created', this.view.render);
    };

    return Adverts;
});