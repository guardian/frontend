package controllers.commercial

import play.api.mvc._
import model.{NoCache, Cached}
import common.{ExecutionContexts, JsonComponent}
import model.commercial.books.{Book, BookFinder, BestsellersAgent}


object BookOffers extends Controller with ExecutionContexts with implicits.Collections {

  def bestsellers(format: String, specificIds:List[String]) = Action {
    implicit request =>
      val books: Seq[Book] = BestsellersAgent.getSpecificBooks(specificIds) ++ BestsellersAgent.adsTargetedAt(segment)
      books.distinctBy( _.isbn ).take(5) match {
        case Nil => NoCache(NotFound)
        case books if format == "json" =>
          Cached(60)(JsonComponent(views.html.books.bestsellers(books)))
        case books if format == "html" =>
          Cached(60)(Ok(views.html.books.bestsellers(books)))
      }
  }
  
  def bestsellersHigh(format: String) = Action {
    implicit request =>
      BestsellersAgent.adsTargetedAt(segment) match {
        case Nil => NoCache(NotFound)
        case books if format == "json" =>
          Cached(60)(JsonComponent(views.html.books.bestsellersHigh(books)))
        case books if format == "html" =>
          Cached(60)(Ok(views.html.books.bestsellersHigh(books)))
      }
  }

  def singleBook(pageId: String, format: String) = Action.async {
    implicit request =>
      BookFinder.findByPageId(pageId) map {
        case Some(book) if format == "json" =>
          Cached(60)(JsonComponent(views.html.books.singleBook(book)))
        case Some(book) if format == "html" =>
          Cached(60)(Ok(views.html.books.singleBook(book)))
        case _ => NoCache(NotFound)
      }
  }
}
