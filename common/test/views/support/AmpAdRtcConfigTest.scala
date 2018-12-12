package views.support

import conf.switches.Switches.{KruxSwitch, ampPrebid}
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import play.api.libs.json.{JsNull, Json}

class AmpAdRtcConfigTest extends FlatSpec with Matchers with BeforeAndAfter {

  private val kruxUrl =
    "https://cdn.krxd.net/userdata/v2/amp/2196ddf0-947c-45ec-9b0d-0a82fb280cb8?segments_key=x&kuid_key=kuid"

  private val prebidServerUrl = "http://localhost:8000"

  private val ampPrebidUrl =
    "http://localhost:8000/openrtb2/amp?tag_id=4&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)" +
      "&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)" +
      "&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF&debug=1"

  before {
    KruxSwitch.switchOff()
    ampPrebid.switchOff()
  }

  "toJsonString" should "hold Prebid server and Krux config when both switches are on" in {
    KruxSwitch.switchOn()
    ampPrebid.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, RowAdRegion, debug = true
    ))
    json shouldBe Json.obj(
      "urls" -> Json.arr(
        kruxUrl,
        ampPrebidUrl
      )
    )
  }

  it should "hold no real-time config when both switches are off" in {
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, RowAdRegion, debug = true
    ))
    json shouldBe JsNull
  }

  it should "hold Krux config when Krux switch is on" in {
    KruxSwitch.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, RowAdRegion, debug = true
    ))
    json shouldBe Json.obj(
      "urls" -> Json.arr(
        kruxUrl
      )
    )
  }

  it should "hold Prebid server config when Prebid server switch is on" in {
    ampPrebid.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, RowAdRegion, debug = true
    ))
    json shouldBe Json.obj(
      "urls" -> Json.arr(
        ampPrebidUrl
      )
    )
  }

  it should "hold debug param in Amp Prebid URL if debugging" in {
    ampPrebid.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, RowAdRegion, debug = true
    ))
    Json.stringify(json) should include("&debug=1")
  }

  it should "not hold debug param in Amp Prebid URL if not debugging" in {
    ampPrebid.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, RowAdRegion, debug = false
    ))
    Json.stringify(json) should not include "&debug=1"
  }

  it should "have correct placement ID for ROW ad region" in {
    ampPrebid.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, RowAdRegion, debug = false
    ))
    Json.stringify(json) should include ("tag_id=4")
  }

  it should "have correct placement ID for US ad region" in {
    ampPrebid.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, UsAdRegion, debug = false
    ))
    Json.stringify(json) should include ("tag_id=7")
  }

  it should "have correct placement ID for AU ad region" in {
    ampPrebid.switchOn()
    val json = Json.parse(AmpAdRtcConfig.toJsonString(
      prebidServerUrl, AuAdRegion, debug = false
    ))
    Json.stringify(json) should include ("tag_id=6")
  }
}
