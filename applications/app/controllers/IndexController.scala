package controllers

import common._
import conf._
import model._
import play.api.mvc._
import play.api.libs.json._
import services.{IndexPage, Concierges}


object IndexController extends Controller with Logging with Paging with JsonTrails with ExecutionContexts {

  def renderJson(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    Concierges.index(Edition(request), path) map {
      case Left(model) => if (IsFacia(request)) renderFaciaFront(model) else renderFront(model)
      case Right(notFound) => notFound
    }
  }

  def renderTrailsJson(path: String) = renderTrails(path)
  def renderTrails(path: String) = Action.async { implicit request =>
    Concierges.index(Edition(request), path) map {
      case Left(model) => renderTrailsFragment(model)
      case Right(notFound) => notFound
    }
  }

  // TODO delete after Facia release
  private def renderFront(model: IndexPage)(implicit request: RequestHeader) = {
    Cached(model.page){
      if (request.isJson)
        JsonComponent(
          "html" -> views.html.fragments.indexBody(model),
          "trails" -> model.trails.map(_.url),
          "config" -> Json.parse(views.html.fragments.javaScriptConfig(model.page, Switches.all).body)
        )
      else
        Ok(views.html.index(model))
    }
  }

  private def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader) = {
    Cached(model.page){
      if (request.isJson)
        JsonComponent(
          "html" -> views.html.fragments.indexBody(model),
          "trails" -> model.trails.map(_.url),
          "config" -> Json.parse(views.html.fragments.javaScriptConfig(model.page, Switches.all).body)
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
