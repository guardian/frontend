package model.commercial.soulmates

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.switches.Switches.SoulmatesFeedSwitch
import model.commercial.{FeedMissingConfigurationException, FeedReader, FeedRequest}
import play.api.libs.json.{JsArray, JsValue}

import scala.concurrent.Future
import scala.concurrent.duration._

trait SoulmatesFeed extends ExecutionContexts with Logging {

  protected val adTypeName: String

  protected val path: String

  protected lazy val maybeUrl: Option[String] = {
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
    maybeUrl map { url =>
      val request = FeedRequest(
        feedName = adTypeName,
        switch = SoulmatesFeedSwitch,
        url = url,
        timeout = 10.seconds
      )
      FeedReader.readSeqFromJson(request)(parse)
    } getOrElse {
      log.warn(s"Missing URL for $adTypeName feed")
      Future.failed(FeedMissingConfigurationException(adTypeName))
    }
  }

}


object MaleSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Male Soulmates"
  protected lazy val path = "popular/men"
}

object NewMenSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "New Variant Male Soulmates"
  protected lazy val path = "popular/men?is_new=1"
}

object FemaleSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Female Soulmates"
  protected lazy val path = "popular/women"
}

object NewWomenSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "New Variant Female Soulmates"
  protected lazy val path = "popular/women?is_new=1"
}

object BrightonSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Brighton Soulmates"
  protected lazy val path = "popular/brighton"
}

object NorthwestSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Northwest Soulmates"
  protected lazy val path = "popular/northwest"
}

object NewNorthwestSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "New Variant Northwest Soulmates"
  protected lazy val path = "popular/northwest?is_new=1"
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

object WestMidlandsSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "West Midlands Soulmates"
  protected lazy val path = "popular/westmidlands"
}

object EastMidlandsSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "East Midlands Soulmates"
  protected lazy val path = "popular/eastmidlands"
}

object YorkshireSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Yorkshire Soulmates"
  protected lazy val path = "popular/yorkshire"
}

object NortheastSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Northeast Soulmates"
  protected lazy val path = "popular/northeast"
}

object EastSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "East Soulmates"
  protected lazy val path = "popular/eastengland"
}

object SouthSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "South Soulmates"
  protected lazy val path = "popular/south"
}

object SouthwestSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Southwest Soulmates"
  protected lazy val path = "popular/southwest"
}

object WalesSoulmatesFeed extends SoulmatesFeed {
  protected val adTypeName = "Wales Soulmates"
  protected lazy val path = "popular/wales"
}
