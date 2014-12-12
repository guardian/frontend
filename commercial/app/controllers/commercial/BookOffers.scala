package controllers.commercial

import common.ExecutionContexts
import model.commercial.books.{BestsellersAgent, Book, BookFinder}
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future

object BookOffers extends Controller with ExecutionContexts with implicits.Collections with implicits.Requests {

  object lowRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.books.bestsellers(books, omnitureId, clickMacro)
    }
  }

  object mediumRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.books.bestsellersMedium(books, omnitureId, clickMacro)
    }
  }

  object highRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.books.bestsellersHigh(books, omnitureId, clickMacro)
    }
  }

  private def renderBestsellers(relevance: Relevance[Book], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        (BestsellersAgent.getSpecificBooks(specificIds) ++ BestsellersAgent.bestsellersTargetedAt(segment))
          .distinctBy(_.isbn).take(5) match {
          case Nil => NoCache(format.nilResult)
          case books => Cached(componentMaxAge) {
            format.result(relevance.view(books))
          }
        }
      }
    }

  private def renderSingleBook(format: Format) = MemcachedAction { implicit request =>
    specificId map { isbn =>
      BookFinder.findByIsbn(isbn) map { optBook =>
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        val result = optBook map { book =>
          format.result(views.html.books.bestsellersSuperHigh(book, omnitureId, clickMacro))
        } getOrElse {
          format.nilResult
        }
        Cached(componentMaxAge)(result)
      }
    } getOrElse {
      Future.successful(NoCache(format.nilResult))
    }
  }

  def bestsellersLowHtml = renderBestsellers(lowRelevance, htmlFormat)
  def bestsellersLowJson = renderBestsellers(lowRelevance, jsonFormat)

  def bestsellersMediumHtml = renderBestsellers(mediumRelevance, htmlFormat)
  def bestsellersMediumJson = renderBestsellers(mediumRelevance, jsonFormat)

  def bestsellersHighHtml = renderBestsellers(highRelevance, htmlFormat)
  def bestsellersHighJson = renderBestsellers(highRelevance, jsonFormat)

  def bestsellersSuperHighJson = renderSingleBook(jsonFormat)
  def bestsellersSuperHighHtml = renderSingleBook(htmlFormat)
}
