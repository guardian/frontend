package idapiclient

import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext

trait IdApiComponents extends IdentityConfigurationComponents {
  implicit val executionContext: ExecutionContext
  def wsClient: WSClient
  lazy val idApiClient = wire[IdApiClient]
  lazy val idApiJsonBodyParser = wire[IdApiJsonBodyParser]
}
