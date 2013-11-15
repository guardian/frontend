package controllers

import common._
import play.api.mvc.{SimpleResult, RequestHeader, Action, Controller}
import model._
import scala.concurrent.Future
import conf.ContentApi


object OnwardCardController extends Controller with Logging with JsonTrails with ExecutionContexts {

  private def lookup(path: String)(implicit request: RequestHeader): Future[Option[Content]] = {
    log.info(s"Fetching trail for ${path}")
    ContentApi.item(path, Edition(request))
      .response.map { r =>
        r.content.map(Content(_))
      }
  }

  def renderCard(path: String) = Action.async { implicit request =>
    lookup(path) map { r =>
      r.map { trail =>
        val jsonResponse = () => views.html.fragments.cards.card(trail, "right", "Read next", "Story package card")
        renderFormat(jsonResponse, 60)
      }.getOrElse(NotFound)
    }
  }

  def renderTrail(path: String) = Action.async { implicit request =>
    lookup(path) map { r =>
      r.map{ trail =>
        val jsonResponse = () => views.html.fragments.trails.featured(trail,1)
        renderFormat(jsonResponse, 60)
      }.getOrElse(NotFound)
    }
  }

}