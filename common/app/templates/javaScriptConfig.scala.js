@(item: model.Page)(implicit request: RequestHeader)
@import common.{Edition, StringEncodings}
@import conf.Static
@import play.api.libs.json.{Json, JsString, JsNull}
@import views.support.{CamelCase, JavaScriptPage}

@defining(Edition(request)) { edition =>
    {
        "page": @JavaScript(StringEncodings.jsonToJS(Json.stringify(JavaScriptPage.get(item)))),
        "switches" : { @{JavaScript(conf.switches.Switches.all.filter(_.exposeClientSide).map{ switch =>
            s""""${CamelCase.fromHyphenated(switch.name)}":${switch.isSwitchedOn}"""}.mkString(","))}
        },
        "tests": { @JavaScript(mvt.ActiveTests.getJavascriptConfig) },
        "modules": { },
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
            "showingAdfree" : null
        },
        "ophan": {
            @*
             * This is duplicated from
             * https://github.com/guardian/ophan/blob/master/tracker-js/assets/coffee/ophan/transmit.coffee
             * Please do not change this without talking to the Ophan project first.
             *@
            "pageViewId": new Date().getTime().toString(36) + 'xxxxxxxxxxxx'.replace(/x/g, function () {
                return Math.floor(Math.random() * 36).toString(36);
            }),
            "browserId": @JavaScript(StringEncodings.jsonToJS(Json.stringify(request.cookies.get("bwid").map(cookie => JsString(cookie.value)).getOrElse(JsNull))))
        }
    }
}
