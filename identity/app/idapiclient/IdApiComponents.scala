package idapiclient

import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents

import scala.concurrent.ExecutionContext

trait IdApiComponents extends IdentityConfigurationComponents {
  implicit val executionContext: ExecutionContext
  lazy val idApiClient = wire[IdApiClient]
  lazy val idDispatchAsyncHttpClient = wire[IdDispatchAsyncHttpClient]
  lazy val idApiJsonBodyParser = wire[IdApiJsonBodyParser]
}
