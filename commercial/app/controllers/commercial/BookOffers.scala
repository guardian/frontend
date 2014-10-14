package controllers.commercial

import common.ExecutionContexts
import model.commercial.books.{BestsellersAgent, Book, BookFinder}
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future

object BookOffers extends Controller with ExecutionContexts with implicits.Collections {

  object lowRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellers(books)
  }
  object lowRelevanceV2 extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellersV2(books)
  }

  object mediumRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellersMedium(books)
  }
  object mediumRelevanceV2 extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellersMediumV2(books)
  }

  object highRelevance extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellersHigh(books)
  }
  object highRelevanceV2 extends Relevance[Book] {
    override def view(books: Seq[Book])(implicit request: RequestHeader): Html =
      views.html.books.bestsellersHighV2(books)
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
        val result = optBook map { book =>
          format.result(views.html.books.bestsellersSuperHigh(book))
        } getOrElse {
          format.nilResult
        }
        Cached(componentMaxAge)(result)
      }
    } getOrElse {
      Future.successful(NoCache(format.nilResult))
    }
  }

  private def renderSingleBookV2(format: Format) = MemcachedAction { implicit request =>
    specificId map { isbn =>
      BookFinder.findByIsbn(isbn) map { optBook =>
        val result = optBook map { book =>
          format.result(views.html.books.bestsellersSuperHighV2(book))
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
  def bestsellersLowJsonV2 = renderBestsellers(lowRelevanceV2, jsonFormat)

  def bestsellersMediumHtml = renderBestsellers(mediumRelevance, htmlFormat)
  def bestsellersMediumJson = renderBestsellers(mediumRelevance, jsonFormat)
  def bestsellersMediumJsonV2 = renderBestsellers(mediumRelevanceV2, jsonFormat)

  def bestsellersHighHtml = renderBestsellers(highRelevance, htmlFormat)
  def bestsellersHighJson = renderBestsellers(highRelevance, jsonFormat)
  def bestsellersHighJsonV2 = renderBestsellers(highRelevanceV2, jsonFormat)

  def bestsellersSuperHighJson = renderSingleBook(jsonFormat)
  def bestsellersSuperHighHtml = renderSingleBook(htmlFormat)
  def bestsellersSuperHighJsonV2 = renderSingleBookV2(jsonFormat)
}
