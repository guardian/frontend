package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.v201508._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.{AdminConfiguration, Configuration}

case class DfpServiceRegistry(session: DfpSession) {

  private val dfpServices = new DfpServices()

  lazy val lineItemService =
    dfpServices.get(session, classOf[LineItemServiceInterface])

  lazy val customFieldService =
    dfpServices.get(session, classOf[CustomFieldServiceInterface])

  lazy val customTargetingService =
    dfpServices.get(session, classOf[CustomTargetingServiceInterface])

  lazy val inventoryService =
    dfpServices.get(session, classOf[InventoryServiceInterface])

  lazy val suggestedAdUnitService =
    dfpServices.get(session, classOf[SuggestedAdUnitServiceInterface])

  lazy val placementService =
    dfpServices.get(session, classOf[PlacementServiceInterface])

  lazy val creativeTemplateService =
    dfpServices.get(session, classOf[CreativeTemplateServiceInterface])

  lazy val creativeService =
    dfpServices.get(session, classOf[CreativeServiceInterface])

}

object DfpServiceRegistry extends Logging {

  def apply(): Option[DfpServiceRegistry] = {

    val dfpSession = try {
      for {
        clientId <- AdminConfiguration.dfpApi.clientId
        clientSecret <- AdminConfiguration.dfpApi.clientSecret
        refreshToken <- AdminConfiguration.dfpApi.refreshToken
        appName <- AdminConfiguration.dfpApi.appName
      } yield {
        val credential = new OfflineCredentials.Builder()
          .forApi(Api.DFP)
          .withClientSecrets(clientId, clientSecret)
          .withRefreshToken(refreshToken)
          .build().generateCredential()
        new DfpSession.Builder()
          .withOAuth2Credential(credential)
          .withApplicationName(appName)
          .withNetworkCode(Configuration.commercial.dfpAccountId)
          .build()
      }
    } catch {
      case e: Exception =>
        log.error(s"Building DFP session failed: $e")
        None
    }

    dfpSession map (session => new DfpServiceRegistry(session))
  }

}
