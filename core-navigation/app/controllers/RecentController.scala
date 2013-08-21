package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action, Result }
import scala.concurrent._
import scala.collection.Seq
import com.gu.openplatform.contentapi.ApiError
import scala.util.Random

object RecentController extends Controller with Logging with JsonTrails with ExecutionContexts {

  def render() = Action { implicit request =>
    val promiseOfRecentStories: Future[Seq[Trail]] = lookup(Edition(request))
    Async {
       promiseOfRecentStories map { trails =>
         renderRecent(Random.shuffle(trails).head)
       }
    }
  }

  private def lookup(edition: Edition)(implicit request: RequestHeader): Future[Seq[Content]] = {
    log.info(s"Fetching recent stories for edition ${edition.id}")
    ContentApi.search(edition)
      .orderBy("newest")
      .pageSize(50)
      .response.map {response =>
          SupportedContentFilter(response.results map { new Content(_) })
      }
  }

  private def renderRecent(trail: Trail)(implicit request: RequestHeader) = {
    val jsonResponse = () => views.html.fragments.cards.card(trail, "right", "More from around the Guardian", "Story pack card | latest")
    renderFormat(jsonResponse, 60)
  }

}