define([
    'common',
    'bonzo',
    'ajax',
    'helpers/fixtures',
    'modules/experiments/inline-link-card'
], function(
    common,
    bonzo,
    ajax,
    fixtures,
    InlineLinkCard
) {

    describe("Inline Link Card", function() {
        var pageconfig,
            linkToCardify,
            linkContext,
            href,
            conf = {
                id: 'test-card',
                fixtures: [
                    '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laborum expedita?</p>' +
                    '<p>MPs, academics and campaign groups rounded on the government after <a href="/technology/2013/jun/07/uk-gathering-secret-intelligence-nsa-prism" title="" data-link-name="in body link">the Guardian disclosed</a> that GCHQ, the UK\'s electronic eavesdropping and security headquarters, had been supplied with information from the top secret system.</p>' +
                    '<p>MPs, academics and campaign groups rounded on the government after <a href="/technology/2013/jun/07/uk-gathering-secret-intelligence-nsa-prism" title="" data-link-name="in body link">the Guardian disclosed</a> that GCHQ, the UK\'s electronic eavesdropping and security headquarters, had been supplied with information from the top secret system.</p>'
                  ]
            };

        beforeEach(function() {
            fixtures.render(conf);

            pageconfig = {
                data: {
                    title: 'UK gathering secret intelligence via covert NSA operation',
                    image: 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/6/7/1370610648841/Documents-show-GCHQ-has-h-005.jpg',
                    published_time: 'a timestamp'
                }
            };

            linkToCardify = document.querySelectorAll('#test-card p a[href]')[0];
            linkContext = linkToCardify.parentNode;
            href = linkToCardify.getAttribute('href');

        });

        afterEach(function() {
            fixtures.clean('test-card');
        });

        it('Should turn a link into a card and prepend its parent with markup', function() {
            new InlineLinkCard(linkToCardify, linkContext).prependCard(href, pageconfig.data);

            expect(document.querySelectorAll('.card-wrapper').length).toBe(1);
            expect(document.querySelectorAll('.card').length).toBe(1);
        });

        xit('Should have a title if specified', function() {
            var cardTitle = 'Card title';

            new InlineLinkCard(linkToCardify, linkContext).prependCard(href, pageconfig.data, cardTitle);

            expect(document.querySelectorAll('.card__title').length).toBe(1);
            expect(document.querySelector('.card__title').innerHTML).toContain(cardTitle);
        });

        it('Should not have a title if not specified', function() {
            new InlineLinkCard(linkToCardify, linkContext).prependCard(href, pageconfig.data);

            expect(document.querySelectorAll('.card__title').length).toBe(0);
        });

        it('Should include the card before the first paragraph containing a link', function() {
            new InlineLinkCard(linkToCardify, linkContext).prependCard(href, pageconfig.data);

            expect(document.querySelectorAll('#test-card .card-wrapper:nth-child(2)').length).toBe(1);
        });

        it('Should include passed data into placeholders', function() {
            new InlineLinkCard(linkToCardify, linkContext).prependCard(href, pageconfig.data);

            expect(document.querySelector('.card__body a').getAttribute('href')).toBe(href);
            expect(document.querySelector('.card__media').src).toBe(pageconfig.data.image);
            expect(document.querySelector('.card__headline').innerHTML).toContain(pageconfig.data.title);
            expect(document.querySelector('.card .dateline').innerHTML).toContain(pageconfig.data.published_time);
        });

        it('Should not insert a thumbnail if image does not exist', function() {
            pageconfig.data.image = false;

            new InlineLinkCard(linkToCardify, linkContext).prependCard(href, pageconfig.data);

            expect(document.querySelectorAll('.card-wrapper').length).toBe(1);
            expect(document.querySelectorAll('.card').length).toBe(1);
            expect(document.querySelectorAll('.card__media').length).toBe(0);
        });

        it('Should be adapted to Wikipedia articles', function() {
            var cardTitle = 'Wikipedia';

            pageconfig.data.description = 'An example sentence from a wikipedia article';

            new InlineLinkCard(linkToCardify, linkContext).prependCard(href, pageconfig.data, cardTitle);

            expect(document.querySelectorAll('.card__headline').length).toBe(0);
            expect(document.querySelector('.card__description').innerHTML).toContain(pageconfig.data.description);
        });

    });
});
