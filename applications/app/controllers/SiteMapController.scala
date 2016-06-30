package controllers

import model.Cached
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, Controller}

// This controller may return 5xx to allow fastly to serve stale when the agent has no data.
class SiteMapController extends Controller {

  def renderNewsSiteMap() = Action { implicit request =>
    jobs.SiteMapJob.siteMaps().map { sitemap =>
      Cached(60) {
        RevalidatableResult(Ok(sitemap.news).as("text/xml; charset=utf-8"), sitemap.news)
      }
    } getOrElse ServiceUnavailable
  }

  def renderVideoSiteMap() = Action { implicit request =>
    jobs.SiteMapJob.siteMaps().map { sitemap =>
      Cached(60) {
        RevalidatableResult(Ok(sitemap.video).as("text/xml; charset=utf-8"), sitemap.video)
      }
    } getOrElse ServiceUnavailable
  }
}

object SiteMapController extends SiteMapController
