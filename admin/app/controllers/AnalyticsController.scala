package controllers

import play.api.mvc.Controller
import common.Logging
import tools._
import tools.charts._


object AnalyticsController extends Controller with Logging with AuthLogging {
  def kpis() = AuthAction { request =>
  // thats right, we only do PROD analytics
    Ok(views.html.kpis("PROD", Seq(
      PageviewsPerUserGraph,
      ReturnUsersPercentageByDayGraph,
      DaysSeenPerUserGraph,
      ActiveUserProportionGraph,
      ActiveUsersFourDaysFromSevenOrMoreGraph
    )))
  }

  def pageviews() = AuthAction { request =>
      // thats right, we only do PROD analytics
      Ok(views.html.pageviews("PROD", Seq(
        PageviewsByCountryGeoGraph,
        PageviewsByDayGraph,
        NewPageviewsByDayGraph,
        PageviewsByBrowserTreeMapGraph,
        PageviewsByOperatingSystemTreeMapGraph
      )))
  }

  def browsers() = AuthAction { request =>
    Ok(views.html.browsers("PROD",
      Analytics.getPageviewsByOperatingSystem(),
      Analytics.getPageviewsByBrowser(),
      Analytics.getPageviewsByOperatingSystemAndBrowser()
    ))
  }

  def abtests() = AuthAction {
    request =>
      Ok(views.html.abtests("PROD",
        SwipeAvgPageViewsPerSessionGraph,
        SwipeAvgSessionDurationGraph,
        FacebookMostReadPageViewsPerSessionGraph
      ))
  }
}
