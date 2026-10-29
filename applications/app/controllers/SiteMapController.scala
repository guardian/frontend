package controllers

import jobs.SiteMapJob
import model.Cached
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import services.FilterSiteMap

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

  def renderFilterSiteMapIndex(): Action[AnyContent] =
    Action { implicit request =>
      siteMapJob.filterSiteMapIndex().map(cachedFilterSitemap) getOrElse ServiceUnavailable
    }

  def renderFilterSiteMap(region: String): Action[AnyContent] =
    Action { implicit request =>
      FilterSiteMap.regionFor(region) match {
        case None               => NotFound
        case Some(filterRegion) =>
          siteMapJob.filterSiteMap(filterRegion).map(cachedFilterSitemap) getOrElse ServiceUnavailable
      }
    }

  private def cachedFilterSitemap(sitemap: xml.NodeSeq)(implicit request: RequestHeader): Result =
    Cached(60) {
      RevalidatableResult(Ok(sitemap).as("text/xml; charset=utf-8"), sitemap)
    }
}
