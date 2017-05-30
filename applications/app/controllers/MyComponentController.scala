package controllers

import model.{ApplicationContext, Cached}
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, Controller}

import scala.concurrent.duration._

class MyComponentController(implicit context: ApplicationContext) extends Controller {

  def show() = Action { implicit request =>
    Cached(7.days)(RevalidatableResult.Ok(components.MyComponent().render))
  }

}
