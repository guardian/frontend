package model

import common.{ CoreNavivationMetrics, Jobs }
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import feed.{MostPopularExpandableAgent, MostPopularAgent}
import play.api.mvc.WithFilters
import play.api.{ Application => PlayApp, Play, GlobalSettings }
import play.api.Play.current


trait MostPopularLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("MostPopularAgentRefreshJob")

    // fire every min
    Jobs.schedule("MostPopularAgentRefreshJob",  "0 * * * * ?", CoreNavivationMetrics.MostPopularLoadTimingMetric) {
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
    }

    if (Play.isTest) {
      MostPopularAgent.refresh()
      MostPopularAgent.await()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("MostPopularAgentRefreshJob")
    super.onStop(app)
  }
}

trait CoreNavigationLifecycle extends MostPopularLifecycle

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with CoreNavigationLifecycle with DevParametersLifecycle
