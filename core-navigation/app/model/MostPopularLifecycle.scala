package model

import common.{ CoreNavivationMetrics, Jobs }
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import feed.{MostPopularFromFacebookAgent, MostPopularExpandableAgent, MostPopularAgent}
import play.api.mvc.WithFilters
import play.api.{ Application => PlayApp, Play, GlobalSettings }
import play.api.Play.current
import common.editions.Uk
import scala.concurrent.duration._
import scala.concurrent.Await


trait MostPopularLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("MostPopularAgentRefreshJob")
    Jobs.deschedule("MostPopularFromFacebookAgentRefreshJob")

    // fire every min
    Jobs.schedule("MostPopularAgentRefreshJob",  "0 * * * * ?", CoreNavivationMetrics.MostPopularLoadTimingMetric) {
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
    }

    // fire every 15 mins
    Jobs.schedule("MostPopularFromFacebookAgentRefreshJob",  "0 2/15 * * * ?", CoreNavivationMetrics.MostPopularLoadTimingMetric) {
      MostPopularFromFacebookAgent.refresh()
    }
    // refresh facebook referral list immediately to avoid initial wait of up to 15 mins
    MostPopularFromFacebookAgent.refresh()

    if (Play.isTest) {
      Await.result(MostPopularAgent.refresh(Uk), 5.seconds)
      MostPopularFromFacebookAgent.await()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("MostPopularAgentRefreshJob")
    Jobs.deschedule("MostPopularFromFacebookAgentRefreshJob")
    super.onStop(app)
  }
}

trait CoreNavigationLifecycle extends MostPopularLifecycle

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with CoreNavigationLifecycle with DevParametersLifecycle
