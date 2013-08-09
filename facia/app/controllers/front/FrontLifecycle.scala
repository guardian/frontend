package controllers.front

import common.{ FrontMetrics, Jobs }
import play.api.GlobalSettings

trait FrontLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Jobs.schedule("FrontRefreshJob", "0 * * * * ?", FrontMetrics.FrontLoadTimingMetric) {
      Front.refresh()
    }
  }

  override def onStop(app: play.api.Application) {
    Jobs.deschedule("FrontRefreshJob")
    super.onStop(app)
  }
}
