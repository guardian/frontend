package feed

import common.{LifecycleComponent, AutoRefresh}
import play.api.inject.ApplicationLifecycle
import play.api.{Application, GlobalSettings}
import services.{MostReadItem, OphanApi}
import scala.concurrent.{ExecutionContext, Future}
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

class MostPopularFacebookAutoRefreshLifecycle(appLifeCycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future {
    MostPopularSocialAutoRefresh.stop()
  }}

  override def start(): Unit = {
    MostPopularSocialAutoRefresh.start()
  }
}
