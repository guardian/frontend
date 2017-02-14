@(item: model.Page)(implicit request: RequestHeader, context: model.ApplicationContext)
@import common.{Edition, StringEncodings}
@import conf.Static
@import play.api.libs.json.Json
@import views.support.{CamelCase, JavaScriptPage, GoogleAnalyticsAccount}
@import conf.Configuration.environment

@defining(Edition(request)) { edition =>
    {
        "page": @JavaScript(StringEncodings.jsonToJS(Json.stringify(JavaScriptPage.get(item)))),
        "switches" : { @{JavaScript(conf.switches.Switches.all.filter(_.exposeClientSide).map{ switch =>
            s""""${CamelCase.fromHyphenated(switch.name)}":${switch.isSwitchedOn}"""}.mkString(","))}
        },
        "tests": { @JavaScript(mvt.ActiveTests.getJavascriptConfig) },
        "modules": { },
        "images": {
            "commercial": {
                "ab-icon": "@Static("images/commercial/ab-icon.png")",
                "abp-icon": "@Static("images/commercial/abp-icon.png")",
                "abp-whitelist-instruction-chrome": "@Static("images/commercial/ad-block-instructions-chrome.png")"
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
        "googleAnalytics": {
            "trackers": {
                "editorialTest": "@{GoogleAnalyticsAccount.editorialTest.trackerName}",
                "editorialProd": "@{GoogleAnalyticsAccount.editorialProd.trackerName}",
                "editorial": "@{GoogleAnalyticsAccount.editorialTracker(context).trackerName}"
            },
            "timingEvents": []
        },
        "libs": {
            "foresee": "@Static("javascripts/vendor/foresee/20150703/foresee-trigger.js")",
            "googletag": "@{Configuration.javascript.config("googletagJsUrl")}",
            "sonobi": "@{ if(!environment.isCode) Configuration.javascript.config("sonobiHeaderBiddingJsUrl") else "//mtrx.go.sonobi.com/morpheus.theguardian.12911_us_.js"}"
        }
    }
}
