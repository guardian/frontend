package controllers

import jobs.SiteMapJob
import model.Cached
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

// This controller may return 5xx to allow fastly to serve stale when the agent has no data.
class SiteMapController(siteMapJob: SiteMapJob, val controllerComponents: ControllerComponents) extends BaseController {

  def renderNewsSiteMap(): Action[AnyContent] =
    Action { implicit request =>
      siteMapJob.siteMaps().map { sitemap =>
        Cached(60) {
          RevalidatableResult(Ok(sitemap.news).as("text/xml; charset=utf-8"), sitemap.news)
        }
      } getOrElse ServiceUnavailable
    }

  def renderVideoSiteMap(): Action[AnyContent] =
    Action { implicit request =>
      siteMapJob.siteMaps().map { sitemap =>
        Cached(60) {
          RevalidatableResult(Ok(sitemap.video).as("text/xml; charset=utf-8"), sitemap.video)
        }
      } getOrElse ServiceUnavailable
    }
}
