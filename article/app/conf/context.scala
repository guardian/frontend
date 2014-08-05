package conf

import java.util.concurrent.atomic.AtomicBoolean

import play.api.mvc.{Action, Results}


object HealthCheck extends AllGoodHealthcheckController(9004, "/world/2012/sep/11/barcelona-march-catalan-independence") with Results {

  // this is for an "offline" healthcheck that the CDN hits
  private val status = new AtomicBoolean(false)
  def break() = status.set(false)

  override def healthcheck() = Action.async{ request =>
    val result = super.healthcheck()(request)
    result.foreach(r => status.set(r.header.status == 200))
    result
  }

  def isOk = status.get
}