@(page: model.Page)
@import implicits.Strings.string2encodings

var gaRandomParticipation = Math.floor(Math.random() * 100) < @GoogleAnalyticsAccount.samplePercent;
var gaParticipation = gaRandomParticipation ? 'in' : 'out';

try {
    @*
    Once a person is in the test group we want them to stay in.
    We are more interested in "users" than in raw page views.
    *@
    if (window.localStorage) {
        var gaStorageKey = 'gu.ga.participation';
        gaParticipation = window.localStorage.getItem(gaStorageKey) || gaParticipation;
        window.localStorage.setItem(gaStorageKey, gaParticipation);
    }
} catch (ex) {
    @* if for some reason we cannot read/write to localStorage don't be in the test *@
    gaParticipation = 'out';
}

if (gaParticipation === 'in') {

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', '@GoogleAnalyticsAccount.account', 'auto');
    ga('send', {
        hitType: 'pageview',
        title: '@Html(page.metadata.webTitle.javascriptEscaped)'
    });

}
