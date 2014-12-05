package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.utils.v201411.StatementBuilder
import com.google.api.ads.dfp.axis.v201411.InventoryStatus
import com.google.api.ads.dfp.lib.client.DfpSession
import common.{AkkaAgent, Logging}
import conf.{AdminConfiguration, Configuration}
import org.joda.time.DateTime

object AdUnitAgent extends Logging {

  private val initialCache = AdUnitCache(DateTime.now, Map.empty)
  private lazy val cache = AkkaAgent[AdUnitCache](initialCache)

  def refresh(): Unit = {
    refresh(loadActiveCoreSiteAdUnits())
  }

  private def loadActiveCoreSiteAdUnits(): Map[String, GuAdUnit] = {

    val dfpSession: Option[DfpSession] = try {
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

    val dfpServiceRegistry = dfpSession map (session => new DfpServiceRegistry(session))

    dfpServiceRegistry.fold(Map[String, GuAdUnit]()) { serviceRegistry =>

      val statementBuilder = new StatementBuilder()
        .where("status = :status")
        .withBindVariableValue("status", InventoryStatus._ACTIVE)

      val dfpAdUnits = DfpApiWrapper.fetchAdUnits(serviceRegistry, statementBuilder)

      val rootName = Configuration.commercial.dfpAdUnitRoot
      val rootAndDescendantAdUnits = dfpAdUnits filter { adUnit =>
        Option(adUnit.getParentPath) exists { path =>
          (path.length == 1 && adUnit.getName == rootName) || (path.length > 1 && path(1).getName
            == rootName)
        }
      }

      rootAndDescendantAdUnits.map { adUnit =>
        val path = adUnit.getParentPath.tail.map(_.getName).toSeq :+ adUnit.getName
        (adUnit.getId, GuAdUnit(adUnit.getId, path))
      }.toMap
    }
  }

  private def refresh(freshAdUnits: Map[String, GuAdUnit]): Unit = {
    cache send { oldCache =>
      if (freshAdUnits.nonEmpty) {
        AdUnitCache(DateTime.now, freshAdUnits)
      } else {
        log.warn("Keeping old ad units as there is no fresh data")
        oldCache
      }
    }
  }

  def get: AdUnitCache = cache.get()
}

case class AdUnitCache(timestamp: DateTime, adUnits: Map[String, GuAdUnit])
