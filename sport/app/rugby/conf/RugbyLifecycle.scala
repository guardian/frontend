package rugby.conf

import common.{AkkaAsync, ExecutionContexts, Jobs}
import play.api.GlobalSettings
import rugby.jobs.RugbyStatsJob

import scala.concurrent.duration.FiniteDuration
import scala.concurrent.duration._

trait RugbyLifecycle extends GlobalSettings with ExecutionContexts {

  protected val initializationTimeout: FiniteDuration = 3.seconds

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Jobs.deschedule("MatchDayLiveScores")
    Jobs.schedule("MatchDayLiveScores", "0 * * * * ?") {
      RugbyStatsJob.run()
    }

    //todo break up live and results
    Jobs.deschedule("LiveAndResultEventScores")
    Jobs.schedule("LiveAndResultEventScores", "0 * * * * ?") {
      RugbyStatsJob.fetchScoreEvents
    }

    AkkaAsync {
      RugbyStatsJob.run()
    }

    //delay to allow previous jobs to complete
    AkkaAsync.after(initializationTimeout) {
      RugbyStatsJob.fetchScoreEvents
    }
  }
}
