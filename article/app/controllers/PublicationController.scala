package controllers

import com.google.inject.Inject
import common.{ExecutionContexts, Logging}
import implicits.{Dates, ItemResponses}
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.{Action, Controller}
import services._
import javax.inject.Singleton

import scala.concurrent.Future

@Singleton
class PublicationController @Inject() (bookAgent: NewspaperBookTagAgent = NewspaperBookTagAgent,
                                       bookSectionAgent: NewspaperBookSectionTagAgent = NewspaperBookSectionTagAgent)
                              extends Controller
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

    val tag = if (tail.nonEmpty) {
      publication + "/" + tail
    } else {
      publication
    }

    if (bookSectionTagExists(publication, tag)) {
      Future(MovedPermanently(s"/$tag/${urlFormat(reqDate)}/all"))
    } else {
      val newPath = if (tail.nonEmpty) {
        s"$publication/${urlFormat(reqDate)}/$tail"
      } else {
        s"$publication/${urlFormat(reqDate)}"
      }
      ArticleController.renderItem(newPath)
    }

  }

  private def bookSectionTagExists(publication: String, tag: String) = {
    try {
      bookAgent.getTags(publication).exists(_.id == tag) || bookSectionAgent.getTags(publication).exists(_.id == tag)
    } catch {
      case e: Exception => false
    }
  }

  private def urlFormat(date: DateTime) = date.toString(dateFormatUTC).toLowerCase
}

object PublicationController extends PublicationController(NewspaperBookTagAgent, NewspaperBookSectionTagAgent)
