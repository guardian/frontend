@(page: model.Page)(implicit request: RequestHeader, context: model.ApplicationContext)
@import common.{Edition, StringEncodings}
@import conf.Static
@import play.api.libs.json.Json

var isModernBrowser =
    "querySelector" in document
    && "addEventListener" in window
    && "localStorage" in window
    && "sessionStorage" in window
    && "bind" in Function
    && (
        ("XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest())
        || "XDomainRequest" in window
    );

// nomodule check defines window.guardian if we are in a legacy browser and sets supportsModules to false
var supportsModules = !(window.guardian && window.guardian.supportsModules === false);

window.guardian = {
    isModernBrowser : isModernBrowser,
    isEnhanced:
        window.shouldEnhance && isModernBrowser,
    supportsModules: supportsModules,
    css: {
        loaded: false
    },
    polyfilled: false,
    adBlockers: {
        active: undefined,
        onDetect: []
    },
    googleAnalytics: {
        initialiseGa: undefined
    },
    config: @JavaScript(templates.js.javaScriptConfig(page).body)
};

window.guardian.config.ophan = {
    // This is duplicated from
    // https://github.com/guardian/ophan/blob/master/tracker-js/assets/coffee/ophan/transmit.coffee
    // Please do not change this without talking to the Ophan project first.
    pageViewId: new Date().getTime().toString(36) + 'xxxxxxxxxxxx'.replace(/x/g, function () {
        return Math.floor(Math.random() * 36).toString(36);
    })
};

// http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
/*@@cc_on
@@if (@@_jscript_version <= 9)
    guardian.config.page.ajaxUrl = guardian.config.page.ajaxUrl.replace(/^https:/, '');
@@end
@@*/
