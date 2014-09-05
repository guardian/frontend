package controllers

import common._
import model.{Audio, Cached}
import play.api.mvc.{RequestHeader, Controller, Action}
import scala.concurrent.Future
import conf.LiveContentApi
import feed.MostReadAgent
import views.support.TemplateDeduping

object MostViewedAudioController extends Controller with Logging with ExecutionContexts {

  private implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  def renderMostViewed() = Action.async { implicit request =>

    val edition = Edition(request)
    getMostViewedAudio(edition) map {
      case Nil => JsonNotFound()
      case audios => renderMostViewedAudio(audios)
    }

  }

  private def getMostViewedAudio(edition: Edition)(implicit request: RequestHeader): Future[Seq[Audio]] = {

    val size = request.getQueryString("size").getOrElse("4").toInt
    val response = LiveContentApi.search(edition)
      .tag("type/audio")
      .pageSize(50)
      .response
    response.map { response =>
      response.results.map(Audio(_)).sortBy(content => - MostReadAgent.getViewCount(content.id).getOrElse(0)).take(size)
    }

  }

  private def renderMostViewedAudio(audios: Seq[Audio])(implicit request: RequestHeader) = Cached(900) {

    val html = views.html.fragments.mostViewedAudio(audios)
    JsonComponent(
      "html" -> html
    )

  }

}
