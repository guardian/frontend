package idapiclient

import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents
import idapiclient.parser.IdApiJsonBodyParser
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext

trait IdApiComponents extends IdentityConfigurationComponents {
  implicit val executionContext: ExecutionContext
  def wsClient: WSClient
  lazy val idApiJsonBodyParser = wire[IdApiJsonBodyParser]
  lazy val httpClient = wire[HttpClient]
  lazy val idApiClient = wire[IdApiClient]
}
