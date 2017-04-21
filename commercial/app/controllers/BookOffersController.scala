package commercial.controllers

import commercial.model.Segment
import commercial.model.merchandise.Book
import commercial.model.merchandise.books.{BestsellersAgent, BookFinder}
import common.{ExecutionContexts, JsonComponent, JsonNotFound, Logging}
import model.Cached
import play.api.libs.json.{JsNull, JsValue, Json}
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

class BookOffersController(bookFinder: BookFinder, bestsellersAgent: BestsellersAgent)
  extends Controller
  with ExecutionContexts
  with Logging
  with implicits.Collections
  with implicits.Requests {

  private def booksSample(isbns: Seq[String], segment: Segment): Future[Seq[Book]] =
    bestsellersAgent.getSpecificBooks(isbns) map { specificBooks =>
      (specificBooks ++ bestsellersAgent.bestsellersTargetedAt(segment)).distinctBy(_.isbn).take(4)
    }

  private def isValidIsbn(isbn: String): Boolean = (isbn forall (_.isDigit)) && (isbn.length == 10 || isbn.length == 13)

  def getBook = Action.async { implicit request =>

    lazy val failedLookupResponse: Result = Cached(30.seconds)(JsonNotFound())(request)
    lazy val badRequestResponse: Future[Result] = Future.successful(Cached(1.day)(JsonComponent(JsNull))(request))

    specificId match {
      case Some(isbn) if isValidIsbn(isbn) =>
        bookFinder.findByIsbn(isbn) map {
          _ map { book: Book =>
            Cached(1.hour){ JsonComponent(Json.toJson(book)) }
          } getOrElse failedLookupResponse
        } recover {
          case NonFatal(e) =>
            log.error("Book lookup failed.", e)
            failedLookupResponse
        }
      case Some(invalidIsbn) =>
        log.error(s"Book lookup called with invalid ISBN '$invalidIsbn'. Returning empty response.")
        badRequestResponse
      case None =>
        log.error(s"Book lookup called with no ISBN. Returning empty response.");
        badRequestResponse
    }
  }

  def getBooks = Action.async { implicit request =>
    booksSample(specificIds, segment) map { books =>
      val json: JsValue = Json.toJson(books)
      Cached(60.seconds){
        JsonComponent(json)
      }
    }
  }
}
