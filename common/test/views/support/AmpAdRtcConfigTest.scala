package views.support

import conf.switches.Switches
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import play.api.libs.json.{JsNull, Json}

class AmpAdRtcConfigTest extends FlatSpec with Matchers with BeforeAndAfter {

  private val kruxUrl =
    "https://cdn.krxd.net/userdata/v2/amp/2196ddf0-947c-45ec-9b0d-0a82fb280cb8?segments_key=x&kuid_key=kuid"

  private val prebidServerUrl =
    "http://localhost:8000/openrtb2/amp?tag_id=1&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)" +
      "&oh=ATTR(data-override-height)&slot=ATTR(data-slot)" +
      "&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF"

  before {
    Switches.KruxSwitch.switchOff()
    Switches.prebidServer.switchOff()
  }

  "toJsonString" should "hold Prebid server and Krux config when both switches are on" in {
    Switches.KruxSwitch.switchOn()
    Switches.prebidServer.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString)
    json shouldBe Json.obj(
      "urls" -> Json.arr(
        kruxUrl,
        prebidServerUrl
      )
    )
  }

  it should "hold no real-time config when both switches are off" in {
    val json = Json.parse(AmpAdRtcConfig.toJsonString)
    json shouldBe JsNull
  }

  it should "hold Krux config when Krux switch is on" in {
    Switches.KruxSwitch.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString)
    json shouldBe Json.obj(
      "urls" -> Json.arr(
        kruxUrl
      )
    )
  }

  it should "hold Prebid server config when Prebid server switch is on" in {
    Switches.prebidServer.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString)
    json shouldBe Json.obj(
      "urls" -> Json.arr(
        prebidServerUrl
      )
    )
  }
}
