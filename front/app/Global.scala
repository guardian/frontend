import com.gu.management.play.{ RequestTimer, StatusCounters }
import akka.actor.Cancellable
import common.RequestMetrics
import controllers.{ FrontTrails, FrontController }
import play.api.{ Play, GlobalSettings }
import play.api.libs.concurrent.Akka
import akka.util.duration._

object Global extends GlobalSettings with RequestTimer with StatusCounters {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs

  private var refreshSchedule: Option[Cancellable] = None

  override def onStart(app: play.api.Application) = {
    refreshSchedule = Some(Akka.system(Play.current).scheduler.schedule(0 seconds, 60 seconds) {
      FrontTrails.refresh()
    })
  }

  override def onStop(app: play.api.Application) = {
    refreshSchedule.foreach(_.cancel())
  }
}