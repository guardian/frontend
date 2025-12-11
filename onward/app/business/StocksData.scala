package business

import common.{AutoRefresh, GuLogging}
import conf.Configuration
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.language.postfixOps

class StocksData(wsClient: WSClient) extends AutoRefresh[Stocks](0 seconds, 1 minute) with GuLogging {
  override protected def refresh()(implicit executionContext: ExecutionContext): Future[Stocks] = {
    // Decommissioned, see marker: 7dde429f00b1
    try {
      wsClient.url(Configuration.business.stocksEndpoint).get() map { response =>
        Json.fromJson[Indices](response.json) match {
          case JsSuccess(rawStocksData, _) => Stocks.fromFingerpost(rawStocksData)
          case error @ JsError(_)          =>
            log.error(s"Could not read raw stocks data ${Json.stringify(JsError.toJson(error))}")
            throw new RuntimeException("Could not read raw stocks data")
        }
      }
    } catch {
      case e: RuntimeException =>
        log.error(e.getMessage)
        Future.failed(e)
    }
  }
}
