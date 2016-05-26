package purge

import common.{ExecutionContexts, Logging}
import conf.AdminConfiguration.fastly
import conf.Configuration.environment
import implicits.Dates
import play.api.Play.current
import play.api.libs.ws.WS

object CdnPurge extends ExecutionContexts with Dates with Logging {

  private val serviceId = "2eYr6Wx3ZCUoVPShlCM61l"

  // removes from cache
  def hard(key:String): Unit = {
    // under normal circumstances we only ever want this called from PROD.
    // Don't want too much decache going on.
    if (environment.isProd) {
      val purgeRequest = WS.url(s"https://api.fastly.com/service/$serviceId/purge/$key")
        .withHeaders("Fastly-Key" -> fastly.key)
        .post("")

      purgeRequest.foreach(r => log.info(s"purge $key from Fastly with response ${r.statusText}"))
    } else {
      log.info(s"mock call to Fastly to decache $key")
    }
  }
}
