import common.RequestMetrics
import com.gu.management.play.{ RequestTimer, StatusCounters }
import controllers.FrontRefresher
import play.api.{ Play, GlobalSettings }
import Play.current

object Global extends GlobalSettings with RequestTimer with StatusCounters {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs

  override def onStart(app: play.api.Application) {
    //There is a deadlock problem when running in dev/test mode.
    //dev machines are quick enough that it hardly ever happens, but our teamcity agents are really slow
    //and this causes many broken tests
    //https://groups.google.com/forum/?fromgroups=#!topic/play-framework/yO8GsBLzGGY
    if (!Play.isTest) FrontRefresher.start()

    super.onStart(app)
  }

  override def onStop(app: play.api.Application) {
    if (!Play.isTest) FrontRefresher.stop()

    super.onStop(app)
  }
}