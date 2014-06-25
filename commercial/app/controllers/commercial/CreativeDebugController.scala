package controllers.commercial

import model.commercial.jobs.{Job, JobsAgent}
import model.{NoCache, Cached}
import play.api.mvc._
import conf.Configuration


object CreativeDebugController extends Controller {
  def allComponents = Action{
    if(Configuration.environment.stage == "dev") {Ok(views.html.debugger.allcreatives())}
    NotFound
  }
}

