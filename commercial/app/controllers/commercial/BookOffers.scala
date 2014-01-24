package controllers.commercial

import play.api.mvc._
import model.Cached
import common.JsonComponent
import model.commercial.books.BestsellersAgent

object BookOffers extends Controller {

  def bestsellers(format: String) = Action {
    implicit request =>
      (BestsellersAgent.adsTargetedAt(segment), format) match {
        case (Nil, _) => NotFound
        case (books, "json") =>
          Cached(60)(JsonComponent(views.html.books.bestsellers(books)))
        case (books, "html") =>
          Cached(60)(Ok(views.html.books.bestsellers(books)))
      }
  }
}
