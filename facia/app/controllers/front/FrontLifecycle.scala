package controllers.front

import common.{AkkaAsync, Jobs}
import play.api.GlobalSettings
import scala.concurrent.duration._

trait FrontLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)

    Jobs.deschedule("FrontRefreshJob")
    Jobs.schedule("FrontRefreshJob", "0 * * * * ?") {

      // stagger refresh jobs to avoid dogpiling the api
      Front.refreshJobs().zipWithIndex.foreach{ case (job, index) =>
        val sec = (index * 2) % 60
        AkkaAsync.after(sec.seconds){
          job()
        }
      }
    }

    Front.refresh()
  }

  override def onStop(app: play.api.Application) {
    Jobs.deschedule("FrontRefreshJob")
    super.onStop(app)
  }
}
