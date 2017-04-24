package conf

import common.GuardianConfiguration
import com.gu.email.exacttarget.ExactTargetFactory
import java.net.URI
import utils.SafeLogging

class IdentityConfiguration(conf: GuardianConfiguration) extends IdConfig with SafeLogging {

  import GuardianConfiguration._

  val accountDeletionApiKey: String = conf.id.accountDeletionApiKey
  val accountDeletionApiRoot: String = conf.id.accountDeletionApiRoot
  val apiClientToken: String = conf.id.apiClientToken
  val apiRoot: String = conf.id.apiRoot
  val domain: String = conf.id.domain
  val oauthUrl: String = conf.id.oauthUrl
  val url: String = conf.id.url

  object exacttarget {
    lazy val factory = for {
      accountName <- configuration.getStringProperty("exacttarget.accountname")
      password <- configuration.getStringProperty("exacttarget.password")
      endpointUrl <- configuration.getStringProperty("exacttarget.endpoint")
    } yield {
      logger.info(s"Found configuration for ExactTarget with endpoint $endpointUrl")
      new ExactTargetFactory(accountName, password, new URI(endpointUrl))
    }
  }

}

trait IdConfig {
  val apiRoot: String
  val apiClientToken: String
  val accountDeletionApiRoot: String
  val accountDeletionApiKey: String
  val url: String
  val oauthUrl: String
  val domain: String
}