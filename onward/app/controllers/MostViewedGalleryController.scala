package controllers

import common._
import model._
import views.support.{TemplateDeduping, ForceGroupsCollection, MultimediaContainer}
import play.api.mvc.{RequestHeader, Controller, Action}
import feed.MostViewedGalleryAgent

object MostViewedGalleryController extends Controller with Logging with ExecutionContexts {

  private val page = Page("More galleries", "inpictures", "More Galleries", "more galleries")
  private val config = Config("multimedia/gallery", None, Some("more galleries"), None, Nil, Some("multimedia/gallery"))

  def renderMostViewed() = Action { implicit request =>
    getMostViewedGallery match {
      case Nil => Cached(60) { JsonNotFound() }
      case galleries => Cached(900) { renderMostViewedGallery(galleries) }
    }
  }
  def renderMostViewedHtml() = renderMostViewed()

  private def getMostViewedGallery()(implicit request: RequestHeader): Seq[Content] = {
    val size = request.getQueryString("size").getOrElse("6").toInt
    MostViewedGalleryAgent.mostViewedGalleries().take(size)
  }

  private def renderMostViewedGallery(galleries: Seq[Content])(implicit request: RequestHeader) = {
    val collection = Collection(galleries)
    val templateDeduping = new TemplateDeduping

    val html = views.html.fragments.containers.gallery(
      page,
      ForceGroupsCollection.firstTwoBig(collection),
      MultimediaContainer(),
      1
    )(request, templateDeduping, config)

    val htmlResponse = () => views.html.mostViewedGalleries(page, html)
    val jsonResponse = () => html

    renderFormat(htmlResponse, jsonResponse, 900)
  }
}
