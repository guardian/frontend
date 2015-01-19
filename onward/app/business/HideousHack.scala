package business

import common.{ExecutionContexts, AutoRefresh}
import play.api.libs.ws.WS
import play.api.Play.current

import scala.concurrent.Future
import scala.concurrent.duration._

// Forgive me.
object HideousHack extends AutoRefresh[Stocks](0.seconds, 1.minute) with ExecutionContexts {
  override protected def refresh(): Future[Stocks] = {
    WS.url("http://www.theguardian.com/uk/business?view=desktop").get() map { response =>
      R2StocksParser.parse(response.body)
    }
  }
}
