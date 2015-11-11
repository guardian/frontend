package controllers

import common.{Edition, ExecutionContexts, Logging}
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import implicits.{Dates, ItemResponses}
import model.{Cached, Content, Tag}
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.{Action, Controller, RequestHeader}
import scala.concurrent.Future
import services._

object PublicationController extends Controller with ExecutionContexts with ItemResponses with Dates with Logging {

  private val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

  private def requestedDate(dateString: String) = {
    dateFormatUTC
      .parseDateTime(dateString)
      .withTimeAtStartOfDay()
      .toDateTime
  }

  def publishedOn(publication: String,
                  day: String,
                  month: String,
                  year: String,
                  tagHead: String,
                  tagTail: String = "") = Action.async { implicit request =>

    val reqDate = requestedDate(s"$year/$month/$day")
    val tag = if (tagTail.nonEmpty) {
      tagHead + "/" + tagTail
    } else {
      tagHead
    }

    if (isBookOrBookSection(tag)) {
      loadPublishedContent(publication, reqDate, tag).map { _.map { index =>
        val contentOnRequestedDate = index.trails.filter(_.webPublicationDate.sameDay(reqDate))

        if (contentOnRequestedDate.nonEmpty) {
          // if we want to unwrap CAPI results here - the next two lines are a start!
          //val model = index.copy(trails = contentOnRequestedDate, tzOverride = Some(DateTimeZone.UTC))
          //Ok(views.html.newspaperPages(model, PreviousAndNext(None, None)))
          Found(s"/$publication/$tag/${urlFormat(reqDate)}/all")
        } else {
          NotFound
        }
      }.getOrElse(NotFound)}.map(Cached(1)(_))
    } else {
      Future(NotFound)    // this should redirect to the article endpoint or controller
    }

  }

  private def isBookOrBookSection(tag: String) = {
    val isBook = NewspaperBookIndexAutoRefresh.get.map{book =>
      book.pages.filter(_.id == tag)
    }.nonEmpty

    val isBookSection = NewspaperBookSectionIndexAutoRefresh.get.map{bookSection =>
      bookSection.pages.filter(_.id == tag)
    }.nonEmpty

    isBook || isBookSection

  }

  private def loadPublishedContent(publication: String, date: DateTime, tag: String)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val lookupKey = publication + "/" + tag
    val result = getResponse(LiveContentApi.item(lookupKey, Edition(request))
      .fromDate(date)
      .toDate(date.plusDays(1).minusSeconds(1))
      .useDate("newspaper-edition")
    ).map { item =>
      item.tag.map( tag =>
        IndexPage(Tag(tag), item.results.map(Content(_)), date)
      )
    }

    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }

  private def urlFormat(date: DateTime) = date.toString(dateFormatUTC).toLowerCase
}
