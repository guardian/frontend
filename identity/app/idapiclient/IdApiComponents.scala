package idapiclient

import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents

trait IdApiComponents extends IdentityConfigurationComponents {

  val apiRoot: String = identityConfiguration.id.apiRoot
  lazy val idApiClient = wire[IdApiClient]
  lazy val idDispatchAsyncHttpClient = wire[IdDispatchAsyncHttpClient]
  lazy val idApiJsonBodyParser = wire[IdApiJsonBodyParser]
}
