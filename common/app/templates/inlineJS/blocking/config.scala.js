@(page: model.Page)(implicit request: RequestHeader)
@import common.{Edition, StringEncodings}
@import conf.Static
@import views.support.{JavaScriptPage, CamelCase}
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

window.guardian = {
    isModernBrowser : isModernBrowser,
    isEnhanced:
        window.shouldEnhance && isModernBrowser,
    css: {
        loaded: false
    },
    adBlockers: {
        active: undefined,
        onDetect: []
    },
    config: @JavaScript(templates.js.javaScriptConfig(page).body)
};

// http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
/*@@cc_on
@@if (@@_jscript_version <= 9)
    guardian.config.page.ajaxUrl = guardian.config.page.ajaxUrl.replace(/^https:/, '');
@@end
@@*/
