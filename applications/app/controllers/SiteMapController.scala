package controllers

import model.Cached
import play.api.mvc.{Action, Controller}

// This controller may return 5xx to allow fastly to serve stale when the agent has no data.
object SiteMapController extends Controller {

  def renderNewsSiteMap() = Action { implicit request =>
    jobs.SiteMapJob.siteMaps().map { sitemap =>
      Cached(60) {
        Ok(sitemap.news).as("text/xml; charset=utf-8")
      }
    } getOrElse ServiceUnavailable
  }

  def renderVideoSiteMap() = Action { implicit request =>
    jobs.SiteMapJob.siteMaps().map { sitemap =>
      Cached(60) {
        Ok(sitemap.video).as("text/xml; charset=utf-8")
      }
    } getOrElse ServiceUnavailable
  }
}
