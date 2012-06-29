import akka.actor.Cancellable
import akka.util.duration._
import common.{ AkkaSupport, RequestMetrics }
import com.gu.management.play.{ RequestTimer, StatusCounters }
import controllers.{ FrontTrailblockConfiguration, Front }
import play.api.GlobalSettings

object Global extends GlobalSettings with AkkaSupport with RequestTimer with StatusCounters {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs

  private var refreshSchedule: List[Cancellable] = Nil

  override def onStart(app: play.api.Application) {

    //wait for first load, otherwise we cache blank pages
    FrontTrailblockConfiguration.refreshAndWait()
    Front.refreshTrailblocksAndWait()

    refreshSchedule = play_akka.scheduler.every(60 seconds) {
      Front.refreshTrailblocks()
    } :: refreshSchedule

    refreshSchedule = play_akka.scheduler.every(120 seconds) {
      FrontTrailblockConfiguration.refresh()
    } :: refreshSchedule
  }

  override def onStop(app: play.api.Application) {
    refreshSchedule foreach { _.cancel() }

    FrontTrailblockConfiguration.shutdown()
    Front.shutdown()
  }
}