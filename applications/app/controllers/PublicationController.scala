package controllers

import common.{Edition, ExecutionContexts, Logging}
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import implicits.{Dates, ItemResponses}
import model.{Content, Tag}
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.{Action, Controller, RequestHeader}
import services._

import scala.concurrent.Future

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
                  tagTail: String) = Action.async { implicit request =>

    val reqDate = requestedDate(s"$year/$month/$day")
    val tag = publication + "/" + tagTail
    val newspaperBookTagSource = "newspaper_books"
    val newspaperBookSectionTagSource = "newspaper_book_sections"

    if (tagExists(newspaperBookTagSource, tag) || tagExists(newspaperBookSectionTagSource, tag)) {
      Future(Found(s"/$tag/${urlFormat(reqDate)}/all"))
    } else {
      Future(NotFound)    // this should redirect to the article endpoint or controller
    }

  }

  private def tagExists(tagSource: String, tag: String) = {
    val guTags = (TagIndexesS3.getIndex(tagSource, "theguardian") match {
      case Right(tagPage) => tagPage.tags
      case _ => Seq.empty
    }).collect { case guTag if guTag.id == tag => guTag }

    val obsTags = (TagIndexesS3.getIndex(tagSource, "theobserver") match {
      case Right(tagPage) => tagPage.tags
      case _ => Seq.empty
    }).collect { case obsTag if obsTag.id == tag => obsTag }

    guTags.nonEmpty || obsTags.nonEmpty
  }

  private def loadPublishedContent(tag: String, date: DateTime)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = getResponse(LiveContentApi.item(tag, Edition(request))
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
