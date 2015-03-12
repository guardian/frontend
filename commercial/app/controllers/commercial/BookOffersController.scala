package controllers.commercial

import common.ExecutionContexts
import model.commercial.{FeedMissingConfigurationException, FeedSwitchOffException}
import model.commercial.books.BestsellersAgent._
import model.commercial.books.{BestsellersAgent, BookFinder}
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future
import scala.util.control.NonFatal
import model.commercial.books.CacheNotConfiguredException

object BookOffersController
  extends Controller
  with ExecutionContexts
  with implicits.Collections
  with implicits.Requests {

  def renderBook = MemcachedAction { implicit request =>
    specificId map { isbn =>

      BookFinder.findByIsbn(isbn) map {
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
          NoCache(jsonFormat.nilResult)
        case e: FeedMissingConfigurationException =>
          log.warn(e.getMessage)
          NoCache(jsonFormat.nilResult)
        case e: CacheNotConfiguredException =>
          log.warn(e.getMessage)
          NoCache(jsonFormat.nilResult)
        case NonFatal(e) =>
          log.error(e.getMessage)
          NoCache(jsonFormat.nilResult)
      }

    } getOrElse {
      Future.successful(NoCache(jsonFormat.nilResult))
    }
  }

  def renderBooks = Action { implicit request =>
      (BestsellersAgent.getSpecificBooks(specificIds) ++ BestsellersAgent.bestsellersTargetedAt(segment))
        .distinctBy(_.isbn).take(5) match {
        case Nil => NoCache(jsonFormat.nilResult)
        case books => Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          request.getParameter("layout") match {
            case Some("prominent") => jsonFormat.result(views.html.books.booksProminent(books, omnitureId, clickMacro))
            case _ => jsonFormat.result(views.html.books.booksStandard(books, omnitureId, clickMacro))
          }
      }
    }
  }

}
