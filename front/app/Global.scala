import common.RequestMetrics
import com.gu.management.play.{ RequestTimer, StatusCounters }
import controllers.front.{ ConfiguredEdition, Front }
import play.api.GlobalSettings

trait FrontLifecycle extends GlobalSettings {

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Front.startup()
  }

  override def onStop(app: play.api.Application) {
    Front.shutdown()
    super.onStop(app)
  }
}

object Global extends GlobalSettings with RequestTimer with StatusCounters with FrontLifecycle {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs

}