package feed

import akka.actor.ActorSystem
import app.LifecycleComponent
import common.AutoRefresh
import play.api.inject.ApplicationLifecycle
import services.{MostReadItem, OphanApi}
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._

case class MostReadSocial(twitter: Seq[MostReadItem], facebook: Seq[MostReadItem])

class MostPopularSocialAutoRefresh(ophanApi: OphanApi) extends AutoRefresh[MostReadSocial](0.seconds, 3.minutes) {
  val Hours = 3

  override protected def refresh()(implicit executionContext: ExecutionContext): Future[MostReadSocial] = {
    for {
      facebookMostRead <- ophanApi.getMostReadFacebook(Hours)
      twitterMostRead <- ophanApi.getMostReadTwitter(Hours)
    } yield MostReadSocial(twitterMostRead, facebookMostRead)
  }
}

class MostPopularFacebookAutoRefreshLifecycle(
    appLifeCycle: ApplicationLifecycle,
    mostPopularSocialAutoRefresh: MostPopularSocialAutoRefresh,
)(implicit ec: ExecutionContext, actorSystem: ActorSystem)
    extends LifecycleComponent {

  appLifeCycle.addStopHook { () =>
    Future {
      mostPopularSocialAutoRefresh.stop()
    }
  }

  override def start(): Unit = {
    mostPopularSocialAutoRefresh.start()
  }
}
