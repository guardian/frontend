package controllers

import common._
import model._
import views.support.{TemplateDeduping, ForceGroupsCollection, MultimediaContainer}
import play.api.mvc.{RequestHeader, Controller, Action}
import scala.concurrent.Future
import conf.LiveContentApi
import feed.MostReadAgent

object MostViewedGalleryController extends Controller with Logging with ExecutionContexts {

  def renderMostViewed() = Action.async { implicit request =>

    val edition = Edition(request)
    getMostViewedGallery(edition) map {
      case Nil => JsonNotFound()
      case galleries => renderMostViewedGallery(galleries)
    }

  }

  private def getMostViewedGallery(edition: Edition)(implicit request: RequestHeader): Future[Seq[Content]] = {

    val size = request.getQueryString("size").getOrElse("4").toInt
    val response = LiveContentApi.search(edition)
      .tag("type/gallery")
      .pageSize(50)
      .response
    response.map { response =>
      response.results.map(Gallery(_)).sortBy(content => - MostReadAgent.getViewCount(content.id).getOrElse(0)).take(size)
    }

  }

  private def renderMostViewedGallery(galleries: Seq[Content])(implicit request: RequestHeader) = Cached(900) {
    val page = Page("More galleries", "inpictures", "More Galleries", "more galleries")
    val config = Config("multimedia/gallery", None, Some("more galleries"), None, Nil, Some("multimedia/gallery"))
    val collection = Collection(galleries)
    val templateDeduping = new TemplateDeduping

    val html = views.html.fragments.containers.gallery(
      page,
      ForceGroupsCollection.firstTwoBig(collection),
      MultimediaContainer(),
      1
    )(request, templateDeduping, config)

    JsonComponent(
      "html" -> html
    )

  }

}
