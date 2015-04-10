package ab_headlines

import java.net.URL

import com.google.gdata.client.spreadsheet.{FeedURLFactory, SpreadsheetService}
import com.google.gdata.data.spreadsheet.{WorksheetFeed, ListFeed}
import common.AutoRefresh
import conf.Configuration

import scala.collection.JavaConverters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.blocking
import scala.concurrent.duration._

object ABTestHeadlines extends AutoRefresh[Map[String, Set[String]]](0.seconds, 15.seconds) {
  val SpreadsheetKey = Configuration.facia.spreadsheetKey

  override protected def refresh(): Future[Map[String, Set[String]]] = {
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

        (rows map { row =>
          val customElements = row.getCustomElements
          val tags = customElements.getTags.asScala.toList
          val articleId :: headlines = tags.map(customElements.getValue)
          articleId -> headlines.toSet
        }).toMap
      }
    }
  }
}
