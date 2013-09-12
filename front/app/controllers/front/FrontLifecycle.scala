package controllers.front

import common.{ FrontMetrics, Jobs }
import play.api.GlobalSettings

trait FrontLifecycle extends GlobalSettings {

  def scheduleJobs() {
    // Run front refresh jobs every three seconds to avoid bursts
    Front.refreshJobs().zipWithIndex foreach {
      case (body, idx) =>
        val second = (idx * 3 % 60)
        Jobs.schedule(s"FrontRefreshJob_$idx", s"$second * * * * ?", FrontMetrics.FrontLoadTimingMetric) {
          body()
        }
    }
  }

  def descheduleJobs() {
    (0 to Front.refreshJobs().length) foreach { idx =>
      Jobs.deschedule(s"FrontRefreshJob_$idx")
    }
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()
    Front.refresh()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }
}
