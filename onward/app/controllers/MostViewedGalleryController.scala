package controllers

import common._
import model._
import views.support.{TemplateDeduping, ForceGroupsCollection, MultimediaContainer}
import play.api.mvc.{RequestHeader, Controller, Action}
import feed.MostViewedGalleryAgent

object MostViewedGalleryController extends Controller with Logging with ExecutionContexts {

  def renderMostViewed() = Action.async { implicit request =>

    getMostViewedGallery map {
      case Nil => JsonNotFound()
      case galleries => renderMostViewedGallery(galleries)
    }

  }

  private def getMostViewedGallery()(implicit request: RequestHeader): Seq[Content] = {

    val size = request.getQueryString("size").getOrElse("6").toInt
    MostViewedGalleryAgent.mostViewedGalleries().take(size)

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
