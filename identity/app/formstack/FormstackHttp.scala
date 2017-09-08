package formstack

import com.gu.contentapi.client.GuardianContentApiError
import common.ExecutionContexts
import play.api.libs.ws.WSClient

import scala.concurrent.Future
import scala.concurrent.duration._

trait FormstackHttp {
  def GET(url: String, headers: Seq[(String, String)] = Nil): Future[FormstackHttpResponse]
}

case class FormstackHttpResponse(body: String, status: Int, statusText: String)

class WsFormstackHttp(wsClient: WSClient) extends FormstackHttp with ExecutionContexts {
  override def GET(url: String, parameters: Seq[(String, String)] = Nil): Future[FormstackHttpResponse] = {
    wsClient.url(url)
      .withRequestTimeout(2.seconds)
      .withQueryString(parameters:_*)
      .get()
      .map(response => FormstackHttpResponse(response.body, response.status, response.statusText))
      .recover{
        case GuardianContentApiError(status, message, _) => FormstackHttpResponse("", status, message)
    }
  }
}
