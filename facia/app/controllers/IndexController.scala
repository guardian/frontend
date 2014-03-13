package controllers

import common._
import model._
import play.api.mvc._
import services.{Index, IndexPage}
import views.support.TemplateDeduping


trait IndexController extends Controller with Index with Logging with Paging with ExecutionContexts {

  implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  def renderCombiner(leftSide: String, rightSide: String) = DogpileAction { implicit request =>
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

  def render(path: String) = DogpileAction { implicit request =>
    logGoogleBot(request)
    index(Edition(request), path, extractPage(request)) map {
      case Left(model) => renderFaciaFront(model)
      case Right(other) => other
    }
  }

  def renderTrailsJson(path: String) = renderTrails(path)
  def renderTrails(path: String) = DogpileAction { implicit request =>
    index(Edition(request), path, extractPage(request)) map {
      case Left(model) => renderTrailsFragment(model)
      case Right(notFound) => notFound
    }
  }

  private def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader) = {
    Cached(model.page){
      if (request.isJson)
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
