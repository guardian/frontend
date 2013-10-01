package controllers

import play.api.mvc.Controller
import common.Logging
import tools._
import tools.charts._


object AnalyticsController extends Controller with Logging with AuthLogging {

  // We only do PROD analytics

  def kpis() = Authenticated { request =>
    Ok(views.html.kpis("PROD", Seq(
      PageviewsPerUserGraph,
      ReturnUsersPercentageByDayGraph,
      DaysSeenPerUserGraph,
      ActiveUserProportionGraph,
      ActiveUsersFourDaysFromSevenOrMoreGraph
    )))
  }

  def pageviews() = Authenticated { request =>
    Ok(views.html.pageviews("PROD", Seq(
      PageviewsByCountryGeoGraph,
      PageviewsByDayGraph,
      NewPageviewsByDayGraph,
      PageviewsByBrowserTreeMapGraph,
      PageviewsByOperatingSystemTreeMapGraph
    )))
  }

  def browsers() = Authenticated { request =>
    Ok(views.html.browsers("PROD",
      Analytics.getPageviewsByOperatingSystem(),
      Analytics.getPageviewsByBrowser(),
      Analytics.getPageviewsByOperatingSystemAndBrowser()
    ))
  }

  def abtests() = Authenticated { request =>
    Ok(views.html.abtests("PROD",
      SwipeAvgPageViewsPerSessionGraph,
      SwipeAvgSessionDurationGraph,
      FacebookMostReadPageViewsPerSessionGraph
    ))
  }
}
