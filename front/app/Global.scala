import akka.actor.Cancellable
import akka.util.duration._
import common.{ AkkaSupport, RequestMetrics }
import com.gu.management.play.{ RequestTimer, StatusCounters }
import controllers.Front
import play.api.GlobalSettings

object Global extends GlobalSettings with AkkaSupport with RequestTimer with StatusCounters {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs

  private var refreshSchedule: Option[Cancellable] = None

  override def onStart(app: play.api.Application) {
    refreshSchedule = Some(play_akka.scheduler.every(60 seconds) {
      Front.refresh()
    })
  }

  override def onStop(app: play.api.Application) {
    refreshSchedule foreach { _.cancel() }
  }
}