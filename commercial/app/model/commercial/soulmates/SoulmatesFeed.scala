package model.commercial.soulmates

import common.ExecutionContexts
import conf.CommercialConfiguration
import conf.Switches.SoulmatesFeedSwitch
import model.commercial.{FeedReader, FeedRequest}
import play.api.libs.json.{JsArray, JsValue}

import scala.concurrent.Future
import scala.concurrent.duration._

trait SoulmatesFeed extends ExecutionContexts {

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
    val request = FeedRequest(
      feedName = adTypeName,
      switch = SoulmatesFeedSwitch,
      url = url,
      timeout = 10.seconds
    )
    FeedReader.readSeqFromJson(request)(parse)
  }

}


object MaleSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Male Soulmates"
  protected lazy val path = "popular/men"
}


object FemaleSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Female Soulmates"
  protected lazy val path = "popular/women"
}


object BrightonSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Brighton Soulmates"
  protected lazy val path = "popular/brighton"
}


object NorthwestSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Northwest Soulmates"
  protected lazy val path = "popular/northwest"
}


object ScotlandSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Scotland Soulmates"
  protected lazy val path = "popular/scotland"
}


object YoungSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Young Soulmates"
  protected lazy val path = "popular/young"
}


object MatureSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Mature Soulmates"
  protected lazy val path = "popular/mature"
}
