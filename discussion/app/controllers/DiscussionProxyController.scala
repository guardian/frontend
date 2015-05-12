package controllers

import conf.Configuration
import play.api.libs.ws.WS
import play.api.mvc.Action

object DiscussionProxyController extends DiscussionController {
  def relay(path: String) = Action.async { implicit request =>
    import play.api.Play.current

    log.info(s"### RELAY!!")

    val headers = request.headers.toSimpleMap.toSeq
    val payload = request.body.asJson.get
    val timeout = Configuration.discussion.apiTimeout.toInt
    val apiRoot = request.isSecure match {
      case true => Configuration.discussion.secureApiRoot
      case _ => Configuration.discussion.apiRoot
    }

    log.info(s"### proxied comment call to: ${apiRoot + path}")

    WS.url(apiRoot + path)
      .withHeaders(headers: _*)
      .withMethod(request.method)
      .withRequestTimeout(timeout)
      .post(payload).map{ response =>
        Ok(response.json)
      }

  }
}
