package conf

import common.GuardianConfiguration
import com.gu.email.exacttarget.ExactTargetFactory
import java.net.URI
import utils.SafeLogging

class IdentityConfiguration extends GuardianConfiguration with SafeLogging {

  import GuardianConfiguration._

  object exacttarget {
    lazy val factory = for {
      accountName <- guardianConfiguration.getStringProperty("exacttarget.accountname")
      password <- guardianConfiguration.getStringProperty("exacttarget.password")
      endpointUrl <- guardianConfiguration.getStringProperty("exacttarget.endpoint")
    } yield {
      logger.info(s"Found guardianConfiguration for ExactTarget with endpoint $endpointUrl")
      new ExactTargetFactory(accountName, password, new URI(endpointUrl))
    }
  }

}
