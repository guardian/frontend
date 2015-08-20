package rugby.conf

import common.{AkkaAsync, ExecutionContexts, Jobs}
import play.api.GlobalSettings
import rugby.jobs.RugbyStatsJob

trait RugbyLifecycle extends GlobalSettings with ExecutionContexts {

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Jobs.deschedule("MatchDayLiveScores")
    Jobs.schedule("MatchDayLiveScores", "0 * * * * ?") {
      RugbyStatsJob.run()
    }

    AkkaAsync {
      RugbyStatsJob.run()
    }
  }
}
