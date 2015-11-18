package controllers

import common.{ExecutionContexts, Logging}
import implicits.{Dates, ItemResponses}
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.{Action, Controller}
import services._

import scala.concurrent.Future

object PublicationController extends Controller
                              with ExecutionContexts
                              with ItemResponses
                              with NewspaperBooksAndSectionsAutoRefresh
                              with Dates
                              with Logging {

  private val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

  private def requestedDate(dateString: String) = {
    dateFormatUTC
      .parseDateTime(dateString)
      .withTimeAtStartOfDay()
      .toDateTime
  }

  def publishedOn(publication: String,
                  year: String,
                  month: String,
                  day: String,
                  tail: String) = Action.async { implicit request =>

    val reqDate = requestedDate(s"$year/$month/$day")
    val tag = publication + "/" + tail

    if (tagExists(publication, tag)) {
      Future(MovedPermanently(s"/$tag/${urlFormat(reqDate)}/all"))
    } else {
      ArticleController.renderItem(s"$publication/$year/$month/$day/$tail")
    }
  }

  private def tagExists(publication: String, tag: String) = {
    Seq(NewspaperBookTagAgent.getTags(publication), NewspaperBookSectionTagAgent.getTags(publication))
      .flatMap { _.collect {
          case pubTag if pubTag.id == tag => pubTag
        }
      }.nonEmpty
  }

  private def urlFormat(date: DateTime) = date.toString(dateFormatUTC).toLowerCase
}
