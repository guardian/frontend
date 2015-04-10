package ab_headlines

import java.net.URL

import com.google.gdata.client.spreadsheet.SpreadsheetService
import com.google.gdata.data.spreadsheet.{ListFeed, SpreadsheetFeed}
import common.AutoRefresh

import scala.collection.JavaConverters._

import scala.concurrent.Future
import scala.concurrent.blocking
import scala.concurrent.duration._

object ABTestHeadlines extends AutoRefresh[Map[String, Set[String]]](0.seconds, 15.seconds) {
  val SpreadsheetFeedURL = new URL("https://spreadsheets.google.com/feeds/spreadsheets/private/full")

  val SpreadsheetKey = "vxvvv"

  override protected def refresh(): Future[Map[String, Set[String]]] = {
    Future {
      blocking {
        val service = new SpreadsheetService("ABTestingSpreadsheets")
        service.setProtocolVersion(SpreadsheetService.Versions.V3)

        val feed = service.getFeed(SpreadsheetFeedURL, classOf[SpreadsheetFeed])

        val spreadsheets = feed.getEntries.asScala

        (spreadsheets.find(_.getKey == SpreadsheetKey) map { spreadsheet =>
          val worksheet = spreadsheet.getDefaultWorksheet
          val listFeedUrl = worksheet.getListFeedUrl
          val listFeed = service.getFeed(listFeedUrl, classOf[ListFeed])
          val rows = listFeed.getEntries.asScala

          (rows map { row =>
            val customElements = row.getCustomElements
            val tags = customElements.getTags.asScala.toList
            val articleId = row.getTitle.getPlainText
            articleId -> tags.map(customElements.getValue).toSet
          }).toMap
        }) getOrElse {
          throw new RuntimeException(s"Couldn't find spreadsheet with key $SpreadsheetKey")
        }
      }
    }
  }
}
