package formstack

import com.google.inject.Singleton
import com.gu.contentapi.client.GuardianContentApiError
import common.ExecutionContexts
import play.api.Play.current
import play.api.libs.ws.WS

import scala.concurrent.Future

trait FormstackHttp {
  def GET(url: String, headers: Seq[(String, String)] = Nil): Future[FormstackHttpResponse]
}

case class FormstackHttpResponse(body: String, status: Int, statusText: String)

@Singleton
class WsFormstackHttp extends FormstackHttp with ExecutionContexts {
  override def GET(url: String, parameters: Seq[(String, String)] = Nil): Future[FormstackHttpResponse] = {
    WS.url(url)
      .withRequestTimeout(2000)
      .withQueryString(parameters:_*)
      .get()
      .map(response => FormstackHttpResponse(response.body, response.status, response.statusText))
      .recover{
        case GuardianContentApiError(status, message, _) => FormstackHttpResponse("", status, message)
    }
  }
}
