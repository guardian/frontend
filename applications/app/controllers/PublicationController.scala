package controllers

import common.Edition.defaultEdition
import common.{Edition, ExecutionContexts, Logging}
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import implicits.{Dates, ItemResponses}
import model.{Cached, Content, Section, Tag}
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.{Action, Controller, RequestHeader}
import services.{ConfigAgent, IndexPage}
import views.support.PreviousAndNext

import scala.concurrent.Future

object PublicationController extends Controller with ExecutionContexts with ItemResponses with Dates with Logging {

  private val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

  private def requestedDate(dateString: String) = {
    dateFormatUTC
      .parseDateTime(dateString)
      .withTimeAtStartOfDay()
      .toDateTime
  }

  def publishedOn(path: String, day: String, month: String, year: String, tag: String) = Action.async { implicit request =>
    val reqDate = requestedDate(s"$year/$month/$day")

    loadPublishedContent(path, reqDate, tag).map { _.map { index =>
      val contentOnRequestedDate = index.trails.filter(_.webPublicationDate.sameDay(reqDate))

      if (contentOnRequestedDate.nonEmpty) {
        val model = index.copy(trails = contentOnRequestedDate, tzOverride = Some(DateTimeZone.UTC))
        Ok(views.html.newspaperPages(model, PreviousAndNext(None, None)))
      } else {
        NotFound
      }
    }.getOrElse(NotFound)}.map(Cached(300)(_))
  }

  private def loadPublishedContent(path: String, date: DateTime, tag: String)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val lookupKey = path + "/" + tag
    val result = getResponse(LiveContentApi.item(lookupKey, Edition(request))
      .fromDate(date)
      .toDate(date.plusDays(1).minusSeconds(1))
      .useDate("newspaper-edition")
    ).map{ item =>
      item.tag.map( tag =>
        IndexPage(Tag(tag), item.results.map(Content(_)), date)
      )
    }

    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }

  private def findByDate(path: String, date: DateTime)(implicit request: RequestHeader): Future[Option[DateTime]] = {
    val result = getResponse(
      LiveContentApi.item(s"/$path", Edition(request))
        .pageSize(1)
        .fromDate(date)
        .orderBy("oldest")
    ).map{ item =>
      item.results.headOption.map(_.webPublicationDate.withZone(DateTimeZone.UTC))
    }
    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }

  private def urlFormat(date: DateTime) = date.toString(dateFormatUTC).toLowerCase
}
