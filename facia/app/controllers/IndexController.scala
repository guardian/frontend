package controllers

import common._
import model._
import play.api.mvc._
import services.Index
import views.support.TemplateDeduping
import services.IndexPage


trait IndexController extends Controller with Index with Logging with Paging with ExecutionContexts {

  implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  // Needed as aliases for reverse routing
  def renderCombinerRss(leftSide: String, rightSide: String) = renderCombiner(leftSide, rightSide)

  def renderCombiner(leftSide: String, rightSide: String) = Action.async { implicit request =>
    logGoogleBot(request)
    index(Edition(request), leftSide, rightSide, extractPage(request)).map {
      case Left(page) => renderFaciaFront(page)
      case Right(other) => other
    }
  }


  private def logGoogleBot(request: Request[AnyContent]) = {
    request.headers.get("User-Agent").filter(_.contains("Googlebot")).foreach { bot =>
      log.info(s"GoogleBot => ${request.uri}")
    }
  }

  def renderJson(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    logGoogleBot(request)
    index(Edition(request), path, extractPage(request)) map {
      case Left(model) => renderFaciaFront(model)
      case Right(other) => other
    }
  }

  def renderTrailsJson(path: String) = renderTrails(path)
  def renderTrails(path: String) = Action.async { implicit request =>
    index(Edition(request), path, extractPage(request)) map {
      case Left(model) => renderTrailsFragment(model)
      case Right(notFound) => notFound
    }
  }

  private def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader) = {
    Cached(model.page) {
      if (request.isRss)
        Ok(TrailsToRss(model.page, model.trails))
          .as("text/xml; charset=utf-8")
      else if (request.isJson)
        JsonComponent(
          "html" -> views.html.fragments.indexBody(model)
        )
      else
        Ok(views.html.index(model))
    }
  }

  private def renderTrailsFragment(model: IndexPage)(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.trailblocks.headline(model.trails, numItemsVisible = model.trails.size)
    renderFormat(response, response, model.page)
  }
}

object IndexController extends IndexController
