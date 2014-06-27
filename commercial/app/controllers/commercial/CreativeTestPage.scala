package controllers.commercial

import model.{NoCache, Cached}
import play.api.mvc._
import conf.Configuration


object CreativeTestPage extends Controller {
  def allComponents = Action{
    if(Configuration.environment.stage == "dev") {
      Ok(views.html.debugger.allCreatives())
    } else {
      NotFound
    }
  }
}

