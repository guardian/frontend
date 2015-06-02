package feed

import common.AutoRefresh
import play.api.{Application, GlobalSettings}
import services.{MostReadItem, OphanApi}
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global

object MostPopularFacebookAutoRefresh extends AutoRefresh[Seq[MostReadItem]](0.seconds, 3.minutes) {
  val Hours = 3

  override protected def refresh(): Future[Seq[MostReadItem]] = OphanApi.getMostReadFacebook(Hours)
}

trait MostPopularFacebookAutoRefreshLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    MostPopularFacebookAutoRefresh.start()
  }

  override def onStop(app: Application): Unit = {
    MostPopularFacebookAutoRefresh.stop()
    super.onStop(app)
  }
}