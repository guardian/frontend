import com.gu.management.play.{ RequestTimer, StatusCounters }
import common._
import play.api.GlobalSettings

object Global extends GlobalSettings with RequestTimer with StatusCounters {
  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs
}