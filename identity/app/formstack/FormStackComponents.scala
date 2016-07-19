package formstack

import com.softwaremill.macwire._

trait FormStackComponents {
  lazy val formstackApi = wire[FormstackApi]
  lazy val wsFormstackHttp = wire[WsFormstackHttp]
}
