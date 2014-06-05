package controllers.commercial

import common.{JsonNotFound, ExecutionContexts, JsonComponent}
import model.commercial.books.{Book, BookFinder, BestsellersAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import play.api.templates.Html
import scala.concurrent.Future

object BookOffers extends Controller with ExecutionContexts with implicits.Collections {

  private def renderBestsellers(relevance: Relevance, format: Format) =
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

  def bestsellersLowJson = renderBestsellers(LowRelevance, JsonFormat)

  def bestsellersLowHtml = renderBestsellers(LowRelevance, HtmlFormat)

  def bestsellersMediumJson = renderBestsellers(MediumRelevance, JsonFormat)

  def bestsellersMediumHtml = renderBestsellers(MediumRelevance, HtmlFormat)

  def bestsellersHighJson = renderBestsellers(HighRelevance, JsonFormat)

  def bestsellersHighHtml = renderBestsellers(HighRelevance, HtmlFormat)

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


sealed trait Relevance {
  def view(books: Seq[Book])(implicit request: RequestHeader): Html
}

object LowRelevance extends Relevance {
  override def view(books: Seq[Book])(implicit request: RequestHeader): Html = views.html.books.bestsellers(books)
}

object MediumRelevance extends Relevance {
  override def view(books: Seq[Book])(implicit request: RequestHeader): Html = views.html.books.bestsellersMedium(books)
}

object HighRelevance extends Relevance {
  override def view(books: Seq[Book])(implicit request: RequestHeader): Html = views.html.books.bestsellersHigh(books)
}


sealed trait Format {

  def nilResult(implicit request: RequestHeader): SimpleResult

  def result(view: Html)(implicit request: RequestHeader): SimpleResult
}

object HtmlFormat extends Format {

  override def nilResult(implicit request: RequestHeader): SimpleResult = Results.NotFound

  override def result(view: Html)(implicit request: RequestHeader): SimpleResult = Results.Ok(view)
}

object JsonFormat extends Format {

  override def nilResult(implicit request: RequestHeader): SimpleResult = JsonNotFound.apply()

  override def result(view: Html)(implicit request: RequestHeader): SimpleResult = JsonComponent(view)
}
