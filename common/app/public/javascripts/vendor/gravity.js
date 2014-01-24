(function(){
    window.gravityInsightsParams = {
        'type': 'content',
        'action': '',
        'site_guid': '14b492cf6727dd1ab3a6efc7556b91bc'
    };
    var adServerReq,bUrl,doUseGravityUserGuid,includeJs,jq,type,ug,wlPrefix,wlUrl,_ref,_ref1,_ref2;bUrl="https:"===document.location.protocol?"https://b-ssl.grvcdn.com/moth-min.js":"http://b.grvcdn.com/moth-min.js";ug=(doUseGravityUserGuid=!0===gravityInsightsParams.useGravityUserGuid?1:0)?"":gravityInsightsParams.user_guid||(null!=(_ref=/grvinsights=([^;]+)/.exec(document.cookie))?_ref[1]:void 0)||"";wlUrl=(wlPrefix="","");
    includeJs=function(a){var b;b=document.createElement("script");b.async=!0;b.src=a;a=document.getElementsByTagName("script")[0];return a.parentNode.insertBefore(b,a)};bUrl&&includeJs(bUrl);wlUrl&&(window.gravityInsightsParams.sidebar&&(window.gravityInsightsParams.wlStartTime=(new Date).getTime()),includeJs(wlUrl));})();