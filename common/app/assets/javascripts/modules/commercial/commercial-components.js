define([
    'common',
    'domwrite',
    'qwery',
    'bonzo',
    'ajax',

    'modules/userPrefs',
    'modules/detect',
    'modules/adverts/document-write',
    'modules/commercial/eventbrite-events'
],
function (
    common,
    domwrite,
    qwery,
    bonzo,
    ajax,

    userPrefs,
    detect,
    documentWrite,

    eventbriteEvents
) {

    var currConfig,
        currContext,
        slots,
        contexts = {},
        keywords,
        keywordsParams;

    var template = '<div class="commercial">' +
                   '     <div class="commercial__head">' +
                   '         <h3 class="commercial__title">{title}</h3>' +
                   '     </div>' +
                   '     <div class="commercial__body">' +
                   '         {body}' +
                   '     </div>' +
                   '     <div class="commercial__foot">' +
                   '         {footer}' +
                   '     </div>' +
                   '</div>';

    function init(config, context) {
        var id = context.id;

        if(id) {

            contexts[id] = context;
            currConfig  = config;
            currContext = context;
            slots = [];
            keywords = currConfig.page.keywords.split(',');
            keywordsParams = documentWrite.getKeywords(currConfig.page);
        }
    }

    function loadComponents() {
        //loadTravel();
        loadMasterclasses();
    }


    function loadTravel() {
        var requestUrl = "/commercial/travel/offers?" + keywordsParams,
            $commercialSlot = bonzo(currContext.querySelector('.js-mpu-ad-slot'));

        if ($commercialSlot) {
            ajax({
                url: requestUrl,
                type: 'html',
                method: 'get',
                crossOrigin: true,
                success: function(response) {
                    $commercialSlot.append(response);
                }
            });
        }
    }

    function loadMasterclasses() {
        var relevantEvents = eventbriteEvents.events.filter(function(ev) {
            var tags = ev.event.tags.replace(/,\ /g,',').split(',');
            return ev.event.status === 'Live';
        });

        var rnd = Math.floor((Math.random()*relevantEvents.length)+1),
            displayEvent = relevantEvents[rnd].event,
            ticket = displayEvent.tickets[0].ticket;

        //console.log(displayEvent);
        render('.js-mpu-ad-slot', {
            title:  'guardian<span>masterclasses</span>',
            body:   '<h3>' + displayEvent.title + '</h3>' +
                    '<p>' + ticket.display_price + ticket.currency + '</p>',
            footer: '<a href="' + displayEvent.url + '" class="submit-input">Find out more</a>'
        });
    }

    function render(targetSelector, data) {
        var output = template.replace('{title}',  data.title || '')
                             .replace('{body}',   data.body || '')
                             .replace('{footer}', data.footer || '');

        bonzo(currContext.querySelector(targetSelector)).append(output);
    }

    return {
        init: init,
        loadComponents: loadComponents
    };

});
