package crosswords

import com.gu.contentapi.client.model.v1.ItemResponse
import common.{ExecutionContexts, Edition, AutoRefresh}
import contentapi.ContentApiClient
import org.joda.time.{DateTimeZone, DateTime}

import scala.concurrent.Future
import scala.concurrent.duration._

object TodaysCrosswordGrid extends AutoRefresh[CrosswordGrid](0.seconds, 1.minute) with ExecutionContexts {
  override protected def refresh(): Future[CrosswordGrid] = {

    val response: Future[ItemResponse] = ContentApiClient.getResponse(ContentApiClient.item("type/crossword", Edition.defaultEdition)
      .pageSize(1)
      .fromDate(DateTime.now(DateTimeZone.UTC)))

    response map { dayResponse =>
      val grid = for {
        content <- dayResponse.content
        crossword <- content.crossword } yield {
        CrosswordGrid.fromCrossword(crossword)
      }
      grid getOrElse CrosswordGrid.DefaultTreat
    } recover { case _ => CrosswordGrid.DefaultTreat }
  }
}
