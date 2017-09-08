package idapiclient

import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents

trait IdApiComponents extends IdentityConfigurationComponents {
  lazy val idApiClient = wire[IdApiClient]
  lazy val idDispatchAsyncHttpClient = wire[IdDispatchAsyncHttpClient]
  lazy val idApiJsonBodyParser = wire[IdApiJsonBodyParser]
}
