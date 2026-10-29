package controllers

import ab.PuzzlesHubV1Experiment
import jobs.SiteMapJob
import model.{Cached, NoCache}
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services.PuzzlesSiteMap

// This controller may return 5xx to allow fastly to serve stale when the agent has no data.
class SiteMapController(siteMapJob: SiteMapJob, val controllerComponents: ControllerComponents) extends BaseController {

  def renderPuzzlesSiteMap(): Action[AnyContent] =
    Action { implicit request =>
      // Follow the page rollout until sitemap publication moves to International Edition availability.
      if (!PuzzlesHubV1Experiment.isEnabled) NoCache(NotFound)
      else {
        val sitemap = PuzzlesSiteMap.xml
        Cached(60) {
          RevalidatableResult(Ok(sitemap).as("text/xml; charset=utf-8"), sitemap)
        }
      }
    }

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
