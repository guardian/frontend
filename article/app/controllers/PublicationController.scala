package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import implicits.{Dates, ItemResponses}
import model.ApplicationContext
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services._

import scala.concurrent.Future

class PublicationController(
    bookAgent: NewspaperBookTagAgent,
    bookSectionAgent: NewspaperBookSectionTagAgent,
    articleController: ArticleController,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with ItemResponses
    with Dates
    with GuLogging {

  private val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

  private def requestedDate(dateString: String) = {
    dateFormatUTC
      .parseDateTime(dateString)
      .withTimeAtStartOfDay()
      .toDateTime
  }

  def publishedOn(publication: String, year: String, month: String, day: String, tail: String): Action[AnyContent] =
    Action.async { implicit request =>
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
        articleController.renderItem(newPath)
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
