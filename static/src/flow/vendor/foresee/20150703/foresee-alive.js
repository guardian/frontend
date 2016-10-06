var $$FSR = {
    'timestamp': 'August 19, 2014 @ 4:20 PM',
    'version': '16.2.1',
    'build': '10',
    'enabled': true,
    'frames': false,
    'sessionreplay': true,
    'auto': true,
    'encode': true,
    'files': '/assets/javascripts/vendor/foresee/20150703/',
	'html_files': '/surveys/foresee/20150703/',
    // needs to be set when foresee-transport.swf is not located at 'files'
    //'swf_files': '__swf_files_'
    'id': 'fdIXz/UlLcgRJ+Qwv25S0Q==',
    'definition': 'foresee-surveydef.js',
    'swf': {
        fileName: 'foresee-transport.swf',
        scriptAccess: 'always'
    },
    'worker': 'foresee-worker.js',
    'embedded': false,
    'replay_id': 'theguardian.com',
    'attach': false,
    'renderer': 'W3C', // or "ASRECORDED"
    'layout': 'CENTERFIXED', // or "LEFTFIXED" or "LEFTSTRETCH" or "CENTERSTRETCH"
    'triggerDelay': undefined,
    'heartbeat': true,
    'pools': [{
        path: '.',
        sp: 100 // CHANGE ONLY WHEN INCLUDING SESSION REPLAY
    }],
    'sites': [{
        path: 'www.theguardian.com',
        domain: 'theguardian.com',
        files: '//assets.guim.co.uk/javascripts/vendor/foresee/20150703/',
        html_files: '//www.theguardian.com/surveys/foresee/20150703/'
    }, {
        path: 'm.code.dev-theguardian.com',
        domain: 'dev-theguardian.com',
        files: '//aws-frontend-static.s3.amazonaws.com/CODE/frontend-static/javascripts/vendor/foresee/20150703/',
        html_files: '//m.code.dev-theguardian.com/surveys/foresee/20150703/'
    }, {
        path: /\w+-?\w+\.(com|org|edu|gov|net|co\.uk)/
    }, {
        path: '.',
        domain: 'default'
    }],
    storageOption: 'cookie',
    nameBackup: window.name
};

var FSRCONFIG = {};

// -------------------------------- DO NOT MODIFY ANYTHING BETWEEN THE DASHED LINES --------------------------------
(function(a,c,f){for(var c=a.sites,b=0,g=c.length;b<g;b++){var d;"[object Array]"!==Object.prototype.toString.call(c[b].path)&&(c[b].path=[c[b].path]);for(var e=0,h=c[b].path.length;e<h;e++)if(d=f.location.href.toLowerCase().match(c[b].path[e])){a.siteid=b;a.site=a.sites[b];a.site.domain?"default"==a.site.domain&&(a.site.domain=null):a.site.domain=d[0];a.site.secure||(a.site.secure=null);a.site.name||(a.site.name=d[0]);break}if(d)break}f.cookie="fsr.a"+(a.site.cookie?"."+a.site.cookie:"")+"=suspended;path=/"+
(a.site.domain?";domain="+a.site.domain+";":";")+(a.site.secure?"secure":"")})($$FSR,window,window.document);
