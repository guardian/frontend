package commercial.model.merchandise.soulmates

import java.lang.System._

import commercial.model.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.Logging
import commercial.model.merchandise.Member
import play.api.libs.json.{JsValue, Json}
import commercial.model.readsSeq

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.control.NonFatal

trait SoulmatesFeed extends Logging {

  def adTypeName: String

  def path: String

  def parse(json: JsValue): Seq[Member] = json.as[Seq[Member]](readsSeq[Member])

  def parsedMembers(feedMetaData: FeedMetaData, feedContent: => Option[String])(implicit executionContext: ExecutionContext): Future[ParsedFeed[Member]] = {
    feedMetaData.parseSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        feedContent map { body =>
          val parsed = parse(Json.parse(body))
          Future(ParsedFeed(parsed, Duration(currentTimeMillis - start, MILLISECONDS)))
        } getOrElse {
          Future.failed(MissingFeedException(feedMetaData.name))
        }
      } else {
        Future.failed(SwitchOffException(feedMetaData.parseSwitch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}


object MaleSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Male Soulmates"
  lazy val path = "popular/men"
}

object NewMenSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "New Variant Male Soulmates"
  lazy val path = "popular/men?is_new=1"
}

object FemaleSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Female Soulmates"
  lazy val path = "popular/women"
}

object NewWomenSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "New Variant Female Soulmates"
  lazy val path = "popular/women?is_new=1"
}

object BrightonSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Brighton Soulmates"
  lazy val path = "popular/brighton"
}

object NorthwestSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Northwest Soulmates"
  lazy val path = "popular/northwest"
}

object NewNorthwestSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "New Variant Northwest Soulmates"
  lazy val path = "popular/northwest?is_new=1"
}

object ScotlandSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Scotland Soulmates"
  lazy val path = "popular/scotland"
}

object YoungSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Young Soulmates"
  lazy val path = "popular/young"
}

object MatureSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Mature Soulmates"
  lazy val path = "popular/mature"
}

object WestMidlandsSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "West Midlands Soulmates"
  lazy val path = "popular/westmidlands"
}

object EastMidlandsSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "East Midlands Soulmates"
  lazy val path = "popular/eastmidlands"
}

object YorkshireSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Yorkshire Soulmates"
  lazy val path = "popular/yorkshire"
}

object NortheastSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Northeast Soulmates"
  lazy val path = "popular/northeast"
}

object EastSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "East Soulmates"
  lazy val path = "popular/eastengland"
}

object SouthSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "South Soulmates"
  lazy val path = "popular/south"
}

object SouthwestSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Southwest Soulmates"
  lazy val path = "popular/southwest"
}

object WalesSoulmatesFeed extends SoulmatesFeed {

  val adTypeName = "Wales Soulmates"
  lazy val path = "popular/wales"
}
