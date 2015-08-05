package controllers

import common.ExecutionContexts
import conf.{LiveContentApi, AllGoodHealthcheckController}
import dispatch.{FunctionHandler, Http}
import scala.concurrent.Future
import contentapi.Response
import conf.Configuration.contentApi.previewAuth
import play.api.mvc.Action

class TrainingHttp extends contentapi.Http with ExecutionContexts {

  // Play 2.4.2 has problems passing the any certificate flag through play.ws.ssl.loose.acceptAnyCertificate
  // This is a workaround. Forum here (called 'Play 2.4 disable certification check'):
  // https://groups.google.com/forum/#!topic/play-framework/2xxg_n55wD8
  val http = Http.configure { _
    .setAllowPoolingConnections(true)
    .setMaxConnectionsPerHost(100)
    .setMaxConnections(100)
    .setConnectTimeout(1000)
    .setRequestTimeout(2000)
    .setCompressionEnforced(true)
    .setFollowRedirect(true)
    .setConnectionTTL(60000)
    .setAcceptAnyCertificate(true)
  }

  def GET(url: String, headers: Iterable[(String, String)]): Future[Response] = {

    val req = headers.foldLeft(dispatch.url(url)) {
      case (r, (name, value)) => r.setHeader(name, value)
    }
    val authReq = previewAuth.fold(req)(
      auth =>
        req.as_!(auth.user, auth.password)
    )
    def handler = new FunctionHandler(r => Response(r.getResponseBody("utf-8"), r.getStatusCode, r.getStatusText))
    http(authReq.toRequest, handler)
  }
}

object TrainingHealthCheck extends AllGoodHealthcheckController(
 9016,
 "/world/2012/sep/11/barcelona-march-catalan-independence"
) {

  lazy val init = {
    LiveContentApi._http = new TrainingHttp
    ()=>()
  }

  override def healthcheck() = {
    if (!isOk) {
      init()
    }
    super.healthcheck()
  }
}
