package model.commercial.soulmates

import conf.CommercialConfiguration
import conf.Switches.SoulmatesFeedSwitch
import model.commercial.{FeedReader, FeedRequest}
import play.api.libs.json.{JsArray, JsValue}

import scala.concurrent.Future
import scala.concurrent.duration._

trait SoulmatesApi {

  protected val adTypeName: String

  protected val path: String

  protected lazy val url: Option[String] = {
    CommercialConfiguration.getProperty("soulmates.api.url") map (url => s"$url/$path")
  }

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

  def loadAds(): Future[Seq[Member]] = {
    FeedReader.readSeqFromJson(FeedRequest(adTypeName, SoulmatesFeedSwitch, url, timeout = 10.seconds))(parse)
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
