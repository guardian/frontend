@(item: model.MetaData)(implicit request: RequestHeader)
@import common.{Edition, InternationalEditionVariant, StringEncodings}
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
                "brandedComponentSoulmatesF": "@Static("images/commercial/soulmates-female.jpg")"
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
        }
    }}
};
