define(['common', 'reqwest', 'modules/detect'], function (common, reqwest, detect) {

    var Adverts = function () {

        this.sizeMap = {
            'Top2' : {
                width : '300',
                height: '50'
            },
            'Bottom2' : {
                width : '300',
                height: '50'
            }
        },

        //Initalise
        this.init = function(config) {
            var slots = document.querySelectorAll('.ad-slot'),
                connection = detect.getConnectionSpeed(),
                width = window.innerWidth,
                size = (width > 728) ? 'median' : 'base',
                length = slots.length,
                i =0;

            this.url = this.generateQuery(config, connection);

            for(; i < length; i++) {
                var slot = slots[i].getAttribute('data-'+size),
                    id = slots[i].id;

                this.create(slot, id);
            }
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