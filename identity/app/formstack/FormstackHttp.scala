package formstack

import com.gu.contentapi.client.GuardianContentApiError
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._

trait FormstackHttp {
  def GET(url: String, headers: Seq[(String, String)] = Nil)(implicit executionContext: ExecutionContext): Future[FormstackHttpResponse]
}

case class FormstackHttpResponse(body: String, status: Int, statusText: String)

class WsFormstackHttp(wsClient: WSClient) extends FormstackHttp {
  override def GET(url: String, parameters: Seq[(String, String)] = Nil)(implicit executionContext: ExecutionContext): Future[FormstackHttpResponse] = {
    wsClient.url(url)
      .withRequestTimeout(2.seconds)
      .withQueryStringParameters(parameters:_*)
      .get()
      .map(response => FormstackHttpResponse(response.body, response.status, response.statusText))
      .recover{
        case GuardianContentApiError(status, message, _) => FormstackHttpResponse("", status, message)
    }
  }
}
