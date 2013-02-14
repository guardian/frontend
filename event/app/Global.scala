import com.gu.management.play.{ RequestTimer, StatusCounters }
import common.RequestMetrics
//import model.ContentListAgent
import play.api.{ Application => PlayApp, GlobalSettings }

trait EventLifecycle extends GlobalSettings {

  //  override def onStart(app: play.api.Application) {
  //    super.onStart(app)
  //    ContentListAgent.startup()
  //  }
  //
  //  override def onStop(app: play.api.Application) {
  //    ContentListAgent.shutdown()
  //    super.onStop(app)
  //  }
}

object Global extends GlobalSettings with EventLifecycle with RequestTimer with StatusCounters {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs
}