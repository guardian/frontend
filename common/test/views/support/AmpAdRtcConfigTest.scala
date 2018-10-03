package views.support

import conf.switches.Switches
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.{JsNull, Json}

class AmpAdRtcConfigTest extends FlatSpec with Matchers {

  "toJsonString" should "hold Prebid server and Krux config when switches on" in {
    Switches.KruxSwitch.switchOn()
    Switches.prebidServer.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(Some(1)))
    json shouldBe Json.obj(
      "urls" -> Json.arr(
        "https://cdn.krxd.net/userdata/v2/amp/2196ddf0-947c-45ec-9b0d-0a82fb280cb8?segments_key=x&kuid_key=kuid",
        "http://localhost:8000/openrtb2/amp?tag_id=1&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)" +
          "&oh=ATTR(data-override-height)&slot=ATTR(data-slot)" +
          "&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF"
      )
    )
  }

  it should "hold no real-time config when switches off" in {
    Switches.KruxSwitch.switchOff()
    Switches.prebidServer.switchOff()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(Some(1)))
    json shouldBe JsNull
  }
}
