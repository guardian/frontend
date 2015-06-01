package feed

import common.AutoRefresh
import services.{MostReadItem, OphanApi}
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global

object MostPopularFacebookAutoRefresh extends AutoRefresh[Seq[MostReadItem]](0.seconds, 3.minutes) {
  val Hours = 3

  override protected def refresh(): Future[Seq[MostReadItem]] = OphanApi.getMostReadFacebook(Hours)
}
