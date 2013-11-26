package model.commercial.soulmates

import scala.concurrent.Future
import conf.CommercialConfiguration
import play.api.libs.json.{JsArray, JsValue}
import model.commercial.JsonAdsApi

object SoulmatesApi extends JsonAdsApi[Member] {

  val adTypeName = "Soulmates"

  override protected val loadTimeout = 10000

  def parse(json: JsValue): Seq[Member] = {
    json match {
      case JsArray(members) => members map {
        member =>
          Member(
            (member \ "username").as[String],
            Gender((member \ "gender").as[String]),
            (member \ "age").as[Int],
            (member \ "profile_photo").as[String]
          )
      }
      case other => Nil
    }
  }

  def getMenMembers: Future[Seq[Member]] = loadAds {
    CommercialConfiguration.soulmatesApi.menUrl
  }

  def getWomenMembers: Future[Seq[Member]] = loadAds {
    CommercialConfiguration.soulmatesApi.womenUrl
  }

}
