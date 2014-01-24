package model.commercial.soulmates

import conf.{Switches, CommercialConfiguration}
import play.api.libs.json.{JsArray, JsValue}
import model.commercial.JsonAdsApi

trait SoulmatesApi extends JsonAdsApi[Member] {

  protected val switch = Switches.SoulmatesFeedSwitch

  protected val path: String

  protected val url: Option[String] = {
    CommercialConfiguration.getProperty("soulmates.api.url") map (url => s"$url/$path")
  }

  override protected val loadTimeout = 10000

  def parse(json: JsValue): Seq[Member] = {
    json match {
      case JsArray(members) => members map {
        member =>
          Member(
            (member \ "username").as[String],
            Gender((member \ "gender").as[String]),
            (member \ "age").as[Int],
            (member \ "profile_photo").as[String],
            (member \ "location").as[String].split(',').head
          )
      }
      case other => Nil
    }
  }
}


object MaleSoulmatesApi extends SoulmatesApi {
  protected val adTypeName = "Male Soulmates"
  protected lazy val path = "popular/men"
}


object FemaleSoulmatesApi extends SoulmatesApi {
  protected val adTypeName = "Female Soulmates"
  protected lazy val path = "popular/women"
}
