package views.support

import com.gu.commercial.display.AdTargetParam.toMap
import com.gu.commercial.display.{AdTargetParamValue, MultipleValues, SingleValue}
import common.Edition
import common.commercial.AdUnitMaker
import conf.Configuration.commercial.prebidServerHost
import conf.Configuration.environment
import conf.switches.Switches.KruxSwitch
import conf.switches.{Switch, Switches}
import model.Article
import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json._

case class AmpAd(article: Article, uri: String, edition: String) {

  val toJson: JsValue = {
    def setAmpPlatform(targeting: Map[String, AdTargetParamValue]) = targeting + ("p" -> SingleValue("amp"))

    val editionToTarget = Edition.byId(edition) getOrElse Edition.defaultEdition
    val targeting       = article.metadata.commercial.map(_.adTargeting(editionToTarget)).getOrElse(Set.empty)
    val csvTargeting = Json.toJson(setAmpPlatform(toMap(targeting)) mapValues {
      case SingleValue(v)     => v
      case MultipleValues(vs) => vs.mkString(",")
    })
    Json.obj("targeting" -> csvTargeting)
  }

  override def toString: String = toJson.toString()
}

case class AmpAdDataSlot(article: Article) {
  override def toString: String = {
    def setAmpPlatform(adUnit: String) = adUnit.stripSuffix("/ng") + "/amp"
    setAmpPlatform(AdUnitMaker.make(article.metadata.id, article.metadata.adUnitSuffix))
  }
}

object AmpAdRtcConfig {

  def toJsonString: String = {

    val urls: Seq[(String, JsValueWrapper)] = {

      def urlValue(url: String, switch: Switch): Option[String] =
        if (switch.isSwitchedOn) Some(url)
        else None

      // See https://trello.com/c/zBlwvOWI
      val kruxUrl = urlValue(
        "https://cdn.krxd.net/userdata/v2/amp/2196ddf0-947c-45ec-9b0d-0a82fb280cb8?segments_key=x&kuid_key=kuid",
        KruxSwitch
      )

      /*
       * See https://github.com/ampproject/amphtml/pull/14155
       * and https://github.com/prebid/prebid-server/blob/master/docs/endpoints/openrtb2/amp.md#query-parameters
       */
      val prebidServerUrl = {
        val url = s"$prebidServerHost/openrtb2/amp?tag_id=1&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)" +
          "&oh=ATTR(data-override-height)&slot=ATTR(data-slot)" +
          "&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT" +
          s"&adcid=ADCID&purl=HREF"
        urlValue(
          if (environment.isProd) url else s"$url&debug=1",
          Switches.prebidServer
        )
      }

      val urlValues = (kruxUrl ++ prebidServerUrl).toSeq
      if (urlValues.nonEmpty) Seq("urls" -> urlValues)
      else Nil
    }

    val rtc = {
      val rtcValues = urls
      if (rtcValues.nonEmpty) Json.obj(rtcValues: _*)
      else JsNull
    }

    rtc.toString()
  }
}
