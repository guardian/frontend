@(item: model.Page)(implicit request: RequestHeader, context: model.ApplicationContext)
@import common.{Edition, StringEncodings}
@import conf.Static
@import conf.Configuration
@import play.api.libs.json.Json
@import views.support.{CamelCase, JavaScriptPage, GoogleAnalyticsAccount, FBPixel}
@import conf.Configuration.environment
@import navigation.NavMenu

@defining(Edition(request)) { edition =>
    {
        "page": @JavaScript(StringEncodings.jsonToJS(Json.stringify(JavaScriptPage.get(item, Edition(request), context.isPreview)))),
        "nav": @JavaScript(Json.stringify(Json.toJson(NavMenu(item, edition)))),
        "switches" : { @{JavaScript(conf.switches.Switches.all.filter(_.exposeClientSide).map{ switch =>
            s""""${CamelCase.fromHyphenated(switch.name)}":${switch.isSwitchedOn}"""}.mkString(","))}
        },
        "tests": { @JavaScript(experiments.ActiveExperiments.getJavascriptConfig) },
        "modules": {
            "tracking": {
                "ready": null
            }
        },
        "images": {
            "commercial": {
                "ab-icon": "@Static("images/commercial/ab-icon.png")",
                "abp-icon": "@Static("images/commercial/abp-icon.png")",
                "abp-whitelist-instruction-chrome": "@Static("images/commercial/ad-block-instructions-chrome.png")"
            },
            "acquisitions": {
                "paypal-and-credit-card": "@Static("images/acquisitions/paypal-and-credit-card.png")",
                "payment-methods": "@Static("images/acquisitions/payment-methods.png")",
                "info-logo": "@Static("images/acquisitions/info-logo.svg")",
                "ad-free": "@Static("images/acquisitions/ad-free.svg")"
            },
            "journalism": {
                "apple-podcast-logo": "@Static("images/journalism/apple-podcast-icon-48.png")"

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
            "googletag": "@{Configuration.javascript.config("googletagJsUrl")}",
            "cmp": { "fullVendorDataUrl": "@Static("data/vendor/cmp_vendorlist.json")" },
            "facebookAccountId": "@FBPixel.account"
        }
    }
}
