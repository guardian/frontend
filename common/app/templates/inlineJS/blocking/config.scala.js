@(item: model.MetaData)(implicit request: RequestHeader)
@import common.{Edition, StringEncodings}
@import conf.Static
@import views.support.{JavaScriptPage, CamelCase}
@import play.api.libs.json.Json

window.guardian = {
    isModernBrowser: (
        window.shouldEnhance
            && "querySelector" in document
            && "addEventListener" in window
            && "localStorage" in window
            && "sessionStorage" in window
            && "bind" in Function
            && (
                ("XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest())
                    || "XDomainRequest" in window
            )
    ),
    css: {
        loaded: false
    },
    config: @defining(Edition(request)) { edition => {
        "page": @JavaScript(StringEncodings.jsonToJS(Json.stringify(JavaScriptPage(item).get))),
        "switches" : { @{JavaScript(conf.switches.Switches.all.filter(_.exposeClientSide).map{ switch =>
            s""""${CamelCase.fromHyphenated(switch.name)}":${switch.isSwitchedOn}"""}.mkString(","))}
        },
        "tests": { @JavaScript(mvt.ActiveTests.getJavascriptConfig) },
        "modules": { },
        "images": {
            "commercial": {
                "brandedComponentJobs": "@Static("images/commercial/branded-component-jobs.png")",
                "brandedComponentSoulmatesM": "@Static("images/commercial/soulmates-male.jpg")",
                "brandedComponentSoulmatesF": "@Static("images/commercial/soulmates-female.jpg")",
                "liveStreamingSurvey": "@Static("images/commercial/live-streaming-survey.png")",
                "overlayEvent1": "@Static("images/commercial/overlay-event1.png")",
                "overlayEvent2": "@Static("images/commercial/overlay-event2.png")",
                "overlayEvent3": "@Static("images/commercial/overlay-event3.png")"
            }
        },
        "stylesheets": {
            "fonts": {
                "hintingCleartype": {
                    "kerningOn": "@Static("stylesheets/webfonts-hinting-cleartype-kerning-on.css")"
                },
                "hintingOff": {
                    "kerningOn": "@Static("stylesheets/webfonts-hinting-off-kerning-on.css")"
                },
                "hintingAuto": {
                    "kerningOn": "@Static("stylesheets/webfonts-hinting-auto-kerning-on.css")"
                }
            }
        },
        "commercial": {
            "showingAdfree" : undefined
        }
    }}
};

// http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
/*@@cc_on
@@if (@@_jscript_version < 10)
    guardian.config.page.ajaxUrl = guardian.config.page.ajaxUrl.replace(/^https:/, '');
@@end
@@*/
