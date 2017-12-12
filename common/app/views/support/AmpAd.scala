package views.support

import com.gu.commercial.display.AdTargetParam.toMap
import com.gu.commercial.display.{AdTargetParamValue, MultipleValues, SingleValue}
import common.Edition
import common.commercial.AdUnitMaker
import common.commercial.EditionAdTargeting._
import model.Article
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
