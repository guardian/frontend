package controllers
import components.{TestPageComponent, TestPageState}
import model.ApplicationContext
import play.api.mvc.{Action, Controller}

class NashornController(implicit ac: ApplicationContext) extends Controller {


  def renderJs(headline: Option[String]) = {
    Action { implicit request =>
      val state = TestPageState(headline.getOrElse("My headline"), "My section")
      TestPageComponent.render(Some(state))
    }
  }

  def renderTwirl(headline: Option[String]) = {
    Action { implicit request =>
      val state = TestPageState(headline.getOrElse("My headline"), "My section")
      Ok(views.html.c(state))
    }
  }

}
