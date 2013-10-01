package controllers

import common._
import conf.ContentApi
import model._
import play.api.mvc.{ SimpleResult, RequestHeader, Controller, Action }
import scala.collection.Seq
import scala.concurrent._
import scala.util.Random

object RecentController extends Controller with Logging with JsonTrails with ExecutionContexts {

  def renderRecent() = Action.async { implicit request =>
    lookup(Edition(request)) map { trails =>
      render(Random.shuffle(trails).head)
    }
  }

  private def lookup(edition: Edition)(implicit request: RequestHeader): Future[Seq[Content]] = {
    log.info(s"Fetching recent stories for edition ${edition.id}")
    ContentApi.search(edition)
      .orderBy("newest")
      .pageSize(50)
      .response.map { response =>
        SupportedContentFilter(response.results map { Content(_) })
      }
  }

  private def render(trail: Trail)(implicit request: RequestHeader): SimpleResult = {
    val jsonResponse = () => views.html.fragments.cards.card(trail, "right", "More from around the Guardian", "Story pack card | latest")
    renderFormat(jsonResponse, 60)
  }
}