package controllers

import model.ApplicationContext
import play.api.mvc.{Action, Controller}
import uiComponent.TestComponent
import uiComponent.core.Renderer

class DevComponentController(renderer: Renderer)(implicit ac: ApplicationContext) extends Controller {

  def renderComponent() = Action.async { implicit request =>
    renderer.render(TestComponent)
  }

}
