package idapiclient

import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents
import idapiclient.parser.IdApiJsonBodyParser
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext

trait IdApiComponents extends IdentityConfigurationComponents {
  implicit val executionContext: ExecutionContext
  def wsClient: WSClient
  lazy val idApiJsonBodyParser: IdApiJsonBodyParser = wire[IdApiJsonBodyParser]
  lazy val httpClient: HttpClient = wire[HttpClient]
  lazy val idApiClient: IdApiClient = wire[IdApiClient]
}
