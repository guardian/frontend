package commercial.controllers

import commercial.model.Segment
import commercial.model.merchandise.Book
import commercial.model.merchandise.books.{BestsellersAgent, BookFinder}
import common.{ImplicitControllerExecutionContext, JsonComponent, JsonNotFound, GuLogging}
import model.Cached
import play.api.libs.json.{JsNull, JsValue, Json}
import play.api.mvc._

import scala.concurrent.duration._

class BookOffersController(
    bookFinder: BookFinder,
    bestsellersAgent: BestsellersAgent,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging
    with implicits.Requests {

  private def booksSample(isbns: Seq[String], segment: Segment): Seq[Book] =
    (bestsellersAgent.getSpecificBooks(isbns) ++ bestsellersAgent.bestsellersTargetedAt(segment))
      .distinctBy(_.isbn)
      .take(4)

  private def isValidIsbn(isbn: String): Boolean = (isbn forall (_.isDigit)) && (isbn.length == 10 || isbn.length == 13)

  def getBook: Action[AnyContent] =
    Action { implicit request =>
      lazy val failedLookupResult: Result = Cached(30.seconds)(JsonNotFound())(request)
      lazy val badRequestResponse: Result = Cached(1.day)(JsonComponent.fromWritable(JsNull))(request)

      specificId match {
        case Some(isbn) if isValidIsbn(isbn) =>
          bookFinder.findByIsbn(isbn) map { book: Book =>
            Cached(1.hour)(JsonComponent.fromWritable(book))
          } getOrElse failedLookupResult
        case Some(invalidIsbn) =>
          log.error(s"Book lookup called with invalid ISBN '$invalidIsbn'. Returning empty response.")
          badRequestResponse
        case None =>
          log.error(s"Book lookup called with no ISBN. Returning empty response.")
          badRequestResponse

      }
    }

  def getBooks: Action[AnyContent] =
    Action { implicit request =>
      Cached(60.seconds) {
        JsonComponent.fromWritable(booksSample(specificIds, segment))
      }
    }
}
