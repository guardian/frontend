package controllers.commercial

import common.{JsonNotFound, ExecutionContexts, JsonComponent}
import model.commercial.books.{Book, BookFinder, BestsellersAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import play.api.templates.Html
import scala.concurrent.Future

object BookOffers extends Controller with ExecutionContexts with implicits.Collections {

  object lowRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellers(books)
  }

  object mediumRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellersMedium(books)
  }

  object highRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellersHigh(books)
  }

  private def renderBestsellers(relevance: Relevance[Book], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        (BestsellersAgent.getSpecificBooks(specificIds) ++ BestsellersAgent.adsTargetedAt(segment))
          .distinctBy(_.isbn).take(5) match {
          case Nil => NoCache(format.nilResult)
          case books => Cached(componentMaxAge) {
            format.result(relevance.view(books))
          }
        }
      }
    }

  def bestsellersLowJson = renderBestsellers(lowRelevance, jsonFormat)
  def bestsellersLowHtml = renderBestsellers(lowRelevance, htmlFormat)

  def bestsellersMediumJson = renderBestsellers(mediumRelevance, jsonFormat)
  def bestsellersMediumHtml = renderBestsellers(mediumRelevance, htmlFormat)

  def bestsellersHighJson = renderBestsellers(highRelevance, jsonFormat)
  def bestsellersHighHtml = renderBestsellers(highRelevance, htmlFormat)

  def singleBookJson(pageId: String) = MemcachedAction { implicit request =>
    BookFinder.findByPageId(pageId) map {
      case Some(book) => Cached(componentMaxAge) {
        JsonComponent(views.html.books.singleBook(book))
      }
      case None => NoCache(JsonNotFound.apply())
    }
  }

  def singleBookHtml(pageId: String) = MemcachedAction { implicit request =>
    BookFinder.findByPageId(pageId) map {
      case Some(book) => Cached(componentMaxAge) {
        Ok(views.html.books.singleBook(book))
      }
      case None => NoCache(NotFound)
    }
  }
}
