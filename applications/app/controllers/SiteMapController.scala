package controllers

import model.Cached
import play.api.mvc.{Action, Controller}

object SiteMapController extends Controller {

  def renderNewsSiteMap() = Action { implicit request =>
    Cached(60) {
      Ok(jobs.SiteMapJob.siteMaps().news).as("text/xml; charset=utf-8")
    }
  }

  def renderVideoSiteMap() = Action { implicit request =>
    Cached(60) {
      Ok(jobs.SiteMapJob.siteMaps().video).as("text/xml; charset=utf-8")
    }
  }
}
