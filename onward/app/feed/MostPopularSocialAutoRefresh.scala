package feed

import common.AutoRefresh
import play.api.{Application, GlobalSettings}
import services.{MostReadItem, OphanApi}
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global

case class MostReadSocial(twitter: Seq[MostReadItem], facebook: Seq[MostReadItem])

object MostPopularSocialAutoRefresh extends AutoRefresh[MostReadSocial](0.seconds, 3.minutes) {
  val Hours = 3

  override protected def refresh(): Future[MostReadSocial] = {
    for {
      facebookMostRead <- OphanApi.getMostReadFacebook(Hours)
      twitterMostRead <- OphanApi.getMostReadTwitter(Hours)
    } yield MostReadSocial(twitterMostRead, facebookMostRead)
  }
}

trait MostPopularFacebookAutoRefreshLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    MostPopularSocialAutoRefresh.start()
  }

  override def onStop(app: Application): Unit = {
    MostPopularSocialAutoRefresh.stop()
    super.onStop(app)
  }
}