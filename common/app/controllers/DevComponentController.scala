package controllers

import model.ApplicationContext
import play.api.mvc.{Action, Controller}
import rendering.TestComponent
import rendering.core.Renderer

import scala.concurrent.ExecutionContext

class DevComponentController(renderer: Renderer)(implicit ac: ApplicationContext, ec: ExecutionContext) extends Controller {

  def renderComponent() = Action.async { implicit request =>
    renderer.render(TestComponent).map(Ok(_).withHeaders("Content-Type" -> "text/html"))
  }

}
