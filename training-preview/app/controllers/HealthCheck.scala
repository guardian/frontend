package controllers

import common.ExecutionContexts
import conf.{AllGoodCachedHealthCheck, CachedHealthCheckLifeCycle}
import dispatch.{FunctionHandler, Http}
import scala.concurrent.Future
import contentapi.{ContentApiClient, Response}
import conf.Configuration.contentApi.previewAuth

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
    def handler = new FunctionHandler(r => Response(r.getResponseBodyAsBytes, r.getStatusCode, r.getStatusText))
    http(authReq.toRequest, handler)
  }
}

object HealthCheck extends AllGoodCachedHealthCheck(
 9016,
 "/info/developer-blog/2016/apr/14/training-preview-healthcheck"
) {
  init()

  def init(): Unit = ContentApiClient.setHttp(new TrainingHttp)
}
