package commercial.controllers

import commercial.model.Segment
import commercial.model.feeds.{FeedMissingConfigurationException, FeedSwitchOffException}
import commercial.model.merchandise.Book
import commercial.model.merchandise.books.{BestsellersAgent, BookFinder, CacheNotConfiguredException}
import common.{ExecutionContexts, JsonComponent, Logging}
import model.{Cached, NoCache}
import play.api.libs.json.{JsNull, Json}
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

  def getBook = Action.async { implicit request =>
    specificId map { isbn =>
      bookFinder.findByIsbn(isbn) map {
        _ map { book =>
          Cached(10.minutes){
            JsonComponent(Json.toJson(book))
          }
        } getOrElse {
          Cached(componentMaxAge)(JsonComponent(JsNull))
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
