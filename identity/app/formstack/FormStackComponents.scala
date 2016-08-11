package formstack

import com.softwaremill.macwire._
import play.api.libs.ws.WSClient

trait FormStackComponents {
  def wsClient: WSClient

  lazy val formstackApi = wire[FormstackApi]
  lazy val wsFormstackHttp = wire[WsFormstackHttp]
}
