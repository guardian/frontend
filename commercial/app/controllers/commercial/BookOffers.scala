package controllers.commercial

import common.{ExecutionContexts, JsonComponent}
import model.commercial.books.{BookFinder, BestsellersAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

object BookOffers extends Controller with ExecutionContexts {

  def bestsellers(format: String) = MemcachedAction { implicit request =>
    Future.successful {
      BestsellersAgent.adsTargetedAt(segment) match {
        case Nil => NoCache(NotFound)
        case books if format == "json" =>
          Cached(componentMaxAge)(JsonComponent(views.html.books.bestsellers(books)))
        case books if format == "html" =>
          Cached(componentMaxAge)(Ok(views.html.books.bestsellers(books)))
      }
    }
  }

  def bestsellersHigh(format: String) = MemcachedAction { implicit request =>
    Future.successful {
      BestsellersAgent.adsTargetedAt(segment) match {
        case Nil => NoCache(NotFound)
        case books if format == "json" =>
          Cached(componentMaxAge)(JsonComponent(views.html.books.bestsellersHigh(books)))
        case books if format == "html" =>
          Cached(componentMaxAge)(Ok(views.html.books.bestsellersHigh(books)))
      }
    }
  }

  def singleBook(pageId: String, format: String) = MemcachedAction {
    implicit request =>
      BookFinder.findByPageId(pageId) map {
        case Some(book) if format == "json" =>
          Cached(componentMaxAge)(JsonComponent(views.html.books.singleBook(book)))
        case Some(book) if format == "html" =>
          Cached(componentMaxAge)(Ok(views.html.books.singleBook(book)))
        case _ => NoCache(NotFound)
      }
  }
}
