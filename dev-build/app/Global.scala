import common.{ AkkaSupport, RequestMetrics }
import com.gu.management.play.{ RequestTimer, StatusCounters }
import controllers.front.{ ConfiguredEdition, Front }
import feed.{ MostPopularAgent, Competitions }
import model.TeamMap
import play.api.GlobalSettings

object Global extends GlobalSettings with RequestTimer with StatusCounters
    with MostPopularLifecycle
    with FrontLifecycle
    with StoryLifecycle {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs

}
