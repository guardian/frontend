package controllers

import common._
import conf._
import model._
import play.api.mvc._
import play.api.libs.json._
import services.{Index, IndexPage}


trait IndexController extends Controller with Index with Logging with Paging with JsonTrails with ExecutionContexts {

  def renderCombiner(leftSide: String, rightSide: String) = Action.async{ implicit request =>
    index(Edition(request), leftSide, rightSide).map {
      case Left(page) => renderFaciaFront(page)
      case Right(other) => other
    }
  }

  def renderJson(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    index(Edition(request), path) map {
      case Left(model) => renderFaciaFront(model)
      case Right(other) => other
    }
  }

  def renderTrailsJson(path: String) = renderTrails(path)
  def renderTrails(path: String) = Action.async { implicit request =>
    index(Edition(request), path) map {
      case Left(model) => renderTrailsFragment(model)
      case Right(notFound) => notFound
    }
  }

  private def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader) = {
    Cached(model.page){
      if (request.isJson)
        JsonComponent(
          "html" -> views.html.fragments.indexBody(model),
          "trails" -> JsArray(model.trails.map(TrailToJson(_))),
          "config" -> Json.parse(views.html.fragments.javaScriptConfig(model.page).body)
        )
      else
        Ok(views.html.indexFacia(model))
    }
  }

  private def renderTrailsFragment(model: IndexPage)(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.trailblocks.headline(model.trails, numItemsVisible = model.trails.size)
    renderFormat(response, response, model.page)
  }
}

object IndexController extends IndexController
