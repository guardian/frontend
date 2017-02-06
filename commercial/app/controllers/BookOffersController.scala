package commercial.controllers

import commercial.model.Segment
import commercial.model.feeds.{FeedMissingConfigurationException, FeedSwitchOffException}
import commercial.model.merchandise.books.{BestsellersAgent, BookFinder, CacheNotConfiguredException}
import common.{ExecutionContexts, JsonComponent, Logging}
import commercial.model.merchandise.Book
import model.{Cached, NoCache}
import play.api.libs.json.Json
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

  def renderBook = Action.async { implicit request =>
    specificId map { isbn =>
      bookFinder.findByIsbn(isbn) map {
        _ map { book =>
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          Cached(componentMaxAge) {
            jsonFormat.result(views.html.books.book(book, omnitureId, clickMacro))
          }
        } getOrElse {
          Cached(componentMaxAge)(jsonFormat.nilResult)
        }
      } recover {
        case e: FeedSwitchOffException =>
          log.warn(e.getMessage)
          NoCache(jsonFormat.nilResult.result)
        case e: FeedMissingConfigurationException =>
          log.warn(e.getMessage)
          NoCache(jsonFormat.nilResult.result)
        case e: CacheNotConfiguredException =>
          log.warn(e.getMessage)
          NoCache(jsonFormat.nilResult.result)
        case NonFatal(e) =>
          log.error(e.getMessage)
          NoCache(jsonFormat.nilResult.result)
      }
    } getOrElse {
      Future.successful(NoCache(jsonFormat.nilResult.result))
    }
  }

  private def booksSample(isbns: Seq[String], segment: Segment): Future[Seq[Book]] =
    bestsellersAgent.getSpecificBooks(isbns) map { specificBooks =>
      (specificBooks ++ bestsellersAgent.bestsellersTargetedAt(segment)).distinctBy(_.isbn).take(4)
    }

  def renderBooks = Action.async { implicit request =>

    def result(books: Seq[Book]): Result = books match {
      case Nil => Cached(componentNilMaxAge){ jsonFormat.nilResult }
      case someBooks =>
        Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          request.getParameter("layout") match {
            case Some("prominent") =>
              jsonFormat.result(
                views.html.books.booksStandard(someBooks.take(3), omnitureId, clickMacro, isProminent = true)
              )
            case _ =>
              jsonFormat.result(views.html.books.booksStandard(someBooks, omnitureId, clickMacro))
          }
        }
    }

    booksSample(specificIds, segment) map result
  }

  def getBook = Action.async { implicit request =>
    specificId map { isbn =>
      bookFinder.findByIsbn(isbn) map {
        _ map { book =>
          val json = Json.toJson(book)
          Cached(60.seconds){
            JsonComponent(json)
          }
        } getOrElse {
          Cached(componentMaxAge)(jsonFormat.nilResult)
        }
      } recover {
        case e: FeedSwitchOffException =>
          log.warn(e.getMessage)
          NoCache(jsonFormat.nilResult.result)
        case e: FeedMissingConfigurationException =>
          log.warn(e.getMessage)
          NoCache(jsonFormat.nilResult.result)
        case e: CacheNotConfiguredException =>
          log.warn(e.getMessage)
          NoCache(jsonFormat.nilResult.result)
        case NonFatal(e) =>
          log.error(e.getMessage)
          NoCache(jsonFormat.nilResult.result)
      }
    } getOrElse {
      Future.successful(NoCache(jsonFormat.nilResult.result))
    }
  }

  def getBooks = Action.async { implicit request =>
    booksSample(specificIds, segment) map { books =>
      val json = Json.toJson(books)
      Cached(60.seconds){
        JsonComponent(json)
      }
    }
  }
}
