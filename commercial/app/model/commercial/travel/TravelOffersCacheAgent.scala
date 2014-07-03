package model.commercial.travel

import common.{ExecutionContexts, Logging}
import play.api.libs.ws.{Response, WS}
import scala.concurrent.Future
import conf.CommercialConfiguration._
import services.S3
import conf.CommercialConfiguration

object TravelOffersCacheAgent extends Logging with ExecutionContexts {
  protected val url = CommercialConfiguration.getProperty("traveloffers.api.url") map (u => s"$u/consumerfeed")

  def refresh() = url foreach {u =>
    // Go grab the thing
    val future: Future[Response] = WS.url(u).get

    future map { response =>
      S3.putPublic(travelOffersS3Key, response.body, "application/json;charset=utf-8")
    }
  }
}
