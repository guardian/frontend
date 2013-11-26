package model.commercial.soulmates

import scala.concurrent.Future
import conf.CommercialConfiguration
import play.api.libs.json.{JsArray, JsValue}
import model.commercial.JsonAdsApi

object SoulmatesApi extends JsonAdsApi[Member] {

  protected val adTypeName = "Soulmates"

  private lazy val apiUrl: Option[String] = CommercialConfiguration.getProperty("soulmates.api.url")
  private lazy val menUrl = apiUrl map (url => s"$url/popular/men")
  private lazy val womenUrl = apiUrl map (url => s"$url/popular/women")

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

  def getMenMembers: Future[Seq[Member]] = loadAds(menUrl)

  def getWomenMembers: Future[Seq[Member]] = loadAds(womenUrl)
}
