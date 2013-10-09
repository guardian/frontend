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
      case Left(page) => if (IsFacia(request)) renderFaciaFront(page) else renderFront(page)
      case Right(other) => other
    }
  }

  def renderJson(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    index(Edition(request), path) map {
      case Left(model) => if (IsFacia(request)) renderFaciaFront(model) else renderFront(model)
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

object IndexController extends IndexController
