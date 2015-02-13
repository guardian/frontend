package controllers.commercial

import model.commercial.books.{BestsellersAgent, BookFinder}
import model.{Cached, NoCache}
import play.api.mvc._

object BookOffers extends Controller with implicits.Collections with implicits.Requests {

  def renderBook = Action { implicit request =>
    specificId map { isbn =>
      val result = BookFinder.findByIsbn(isbn) map { book =>
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          jsonFormat.result(views.html.books.book(book, omnitureId, clickMacro))
        } getOrElse {
          jsonFormat.nilResult
        }
      Cached(componentMaxAge)(result)
    } getOrElse {
      NoCache(jsonFormat.nilResult)
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
