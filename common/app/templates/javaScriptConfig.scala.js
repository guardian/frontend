@(item: model.Page)(implicit request: RequestHeader)
@import common.{Edition, StringEncodings}
@import conf.Static
@import play.api.libs.json.Json
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
            "showingAdfree" : null,
            "membershipAssets": "@Static("images/commercial/membership/")"
        }
    }
}
