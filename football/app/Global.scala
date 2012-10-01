import com.gu.management.play.{ RequestTimer, StatusCounters }
import common.RequestMetrics
import play.api.GlobalSettings

object Global extends GlobalSettings with RequestTimer with StatusCounters {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs

  override def onStart(app: play.api.Application) {
    super.onStart(app)
  }

  override def onStop(app: play.api.Application) {
    super.onStop(app)
  }
}