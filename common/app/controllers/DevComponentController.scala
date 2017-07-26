package controllers

import model.ApplicationContext
import play.api.mvc.{Action, Controller}
import rendering.TestComponent
import rendering.core.Renderer

class DevComponentController(renderer: Renderer)(implicit ac: ApplicationContext) extends Controller {

  def renderComponent() = Action.async { implicit request =>
    renderer.render(TestComponent)
  }

}
