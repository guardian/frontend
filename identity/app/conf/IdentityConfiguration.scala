package conf

import common.GuardianConfiguration
import com.gu.email.exacttarget.ExactTargetFactory
import java.net.URI
import utils.SafeLogging
import com.exacttarget.fuelsdk.{ETClient, ETConfiguration}

class IdentityConfiguration extends GuardianConfiguration with SafeLogging {

  import GuardianConfiguration._

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

  // Userhelp - 'Guardian Admin' ET Account integrated with subscriptions.dev@guardian.co.uk AppCentre
  object exactTargetUserhelp {
    lazy val factory = for {
      clientId <- configuration.getStringProperty("exacttargetuserhelp.clientId")
      clientSecret <- configuration.getStringProperty("exacttargetuserhelp.clientSecret")
    } yield {
      logger.info(s"Found configuration for ExactTarget Userhelp Admin")
      val etConf = new ETConfiguration()
      etConf.set("clientId", clientId)
      etConf.set("clientSecret", clientSecret)
      new ETClient(etConf)
    }
  }
}
