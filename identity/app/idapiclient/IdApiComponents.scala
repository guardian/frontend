package idapiclient

import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents
import services.ExactTargetService

trait IdApiComponents extends IdentityConfigurationComponents {
  lazy val idApiClient = wire[IdApiClient]
  lazy val idDispatchAsyncHttpClient = wire[IdDispatchAsyncHttpClient]
  lazy val idApiJsonBodyParser = wire[IdApiJsonBodyParser]
  lazy val etClient = wire[ExactTargetService]
}
