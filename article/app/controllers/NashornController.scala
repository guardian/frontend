package controllers
import components.{ButtonComponent, ButtonState}
import model.ApplicationContext
import play.api.mvc.{Action, Controller}

class NashornController(implicit ac: ApplicationContext) extends Controller {

  def renderJs(s: Option[String]) = {
    Action { implicit request =>
      val state = Some(ButtonState(s.getOrElse("Click me!")))
      ButtonComponent.render(state)
    }
  }

  def renderTwirl(s: Option[String]) = {
    Action { implicit request =>
      val state = ButtonState(s.getOrElse("Click me!"))
      Ok(views.html.c(state))
    }
  }

}
