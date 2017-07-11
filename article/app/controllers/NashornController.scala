package controllers
import components.{TestPageComponent, TestPageState}
import model.ApplicationContext
import play.api.mvc.{Action, Controller}

class NashornController(implicit ac: ApplicationContext) extends Controller {

  lazy val state = TestPageState("My headline", "My section")

  def renderJs(s: Option[String]) = {
    Action { implicit request =>
      TestPageComponent.render(Some(state))
    }
  }

  def renderTwirl(s: Option[String]) = {
    Action { implicit request =>
      Ok(views.html.c(state))
    }
  }

}
