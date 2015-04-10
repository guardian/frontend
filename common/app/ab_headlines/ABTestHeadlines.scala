package ab_headlines

import java.net.URI

import com.google.gdata.client.spreadsheet.{FeedURLFactory, SpreadsheetService}
import com.google.gdata.data.spreadsheet.{WorksheetFeed, ListFeed}
import common.{Logging, AutoRefresh}
import conf.{Switches, Configuration}
import play.api.libs.json.Json

import scala.collection.JavaConverters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.blocking
import scala.concurrent.duration._

case class HeadlineABTest(
  testId: Int,
  headlines: Set[String]
)

object ABTestHeadlines extends AutoRefresh[Map[String, HeadlineABTest]](0.seconds, 15.seconds) with Logging {
  val SpreadsheetKey = Configuration.facia.spreadsheetKey

  private def entryFor(id: String): Option[HeadlineABTest] = if (Switches.ABTestHeadlines.isSwitchedOn) {
    get flatMap { entries =>
      entries.get(id)
    }
  } else {
    None
  }

  // headlines to AB test given the article id
  def headlines(id: String): Option[Set[String]] = entryFor(id).map(_.headlines)

  def abTestId(id: String): Option[Int] = entryFor(id).map(_.testId)

  def headlinesJsonString(id: String): Option[String] = headlines(id).filter(_.nonEmpty) map { headlines =>
    Json.stringify(Json.toJson(headlines.toList))
  }

  override protected def refresh(): Future[Map[String, HeadlineABTest]] = {
    Future {
      blocking {
        val service = new SpreadsheetService("ABTestingSpreadsheets")
        service.setProtocolVersion(SpreadsheetService.Versions.V3)

        val url = FeedURLFactory.getDefault.getWorksheetFeedUrl(SpreadsheetKey getOrElse {
          throw new RuntimeException("No spreadsheet key provided for AB testing headlines")
        }, "public", "values")

        val spreadsheet = service.getFeed(url, classOf[WorksheetFeed])

        val worksheet = spreadsheet.getEntries.asScala.head
        val listFeedUrl = worksheet.getListFeedUrl
        val listFeed = service.getFeed(listFeedUrl, classOf[ListFeed])
        val rows = listFeed.getEntries.asScala

        val data = (rows.zipWithIndex map { case (row, index) =>
          val customElements = row.getCustomElements
          val tags = customElements.getTags.asScala.toList
          val articleUrl :: headlines = tags.map(customElements.getValue)
          val articleId = new URI(articleUrl).getPath.stripPrefix("/")

          articleId -> HeadlineABTest(index + 1, headlines.toSet)
        }).toMap

        log.info(s"Setting A/B headlines data to $data")

        data
      }
    }
  }
}
