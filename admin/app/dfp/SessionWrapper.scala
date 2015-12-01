package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.{AdminConfiguration, Configuration}
import dfp.Reader.read
import dfp.SessionLogger.{logAroundCreate, logAroundPerform, logAroundRead}

import scala.util.control.NonFatal

private[dfp] class SessionWrapper(dfpSession: DfpSession) {

  private val services = new ServicesWrapper(dfpSession)

  def lineItems(stmtBuilder: StatementBuilder): Seq[LineItem] = {
    logAroundRead("line items", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.lineItemService.getLineItemsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customFields(stmtBuilder: StatementBuilder): Seq[CustomField] = {
    logAroundRead("custom fields", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.customFieldsService.getCustomFieldsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customTargetingKeys(stmtBuilder: StatementBuilder): Seq[CustomTargetingKey] = {
    logAroundRead("custom targeting keys", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.customTargetingService.getCustomTargetingKeysByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customTargetingValues(stmtBuilder: StatementBuilder): Seq[CustomTargetingValue] = {
    logAroundRead("custom targeting values", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.customTargetingService.getCustomTargetingValuesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def adUnits(stmtBuilder: StatementBuilder): Seq[AdUnit] = {
    logAroundRead("ad units", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.inventoryService.getAdUnitsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def suggestedAdUnits(stmtBuilder: StatementBuilder): Seq[SuggestedAdUnit] = {
    logAroundRead("suggested ad units", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.suggestedAdUnitService.getSuggestedAdUnitsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def placements(stmtBuilder: StatementBuilder): Seq[Placement] = {
    logAroundRead("placements", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.placementService.getPlacementsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def creativeTemplates(stmtBuilder: StatementBuilder): Seq[CreativeTemplate] = {
    logAroundRead("creative templates", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.creativeTemplateService.getCreativeTemplatesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  object lineItemCreativeAssociations {

    private val licaService = services.licaService

    def get(stmtBuilder: StatementBuilder): Seq[LineItemCreativeAssociation] = {
      logAroundRead("licas", stmtBuilder) {
        read(stmtBuilder) { statement =>
          val page = licaService.getLineItemCreativeAssociationsByStatement(statement)
          (page.getResults, page.getTotalResultSetSize)
        }
      }
    }

    def create(licas: Seq[LineItemCreativeAssociation]): Seq[LineItemCreativeAssociation] = {
      logAroundCreate("licas") {
        licaService.createLineItemCreativeAssociations(licas.toArray)
      }
    }

    def deactivate(filterStatement: Statement): Int = {
      logAroundPerform("licas", "deactivating", filterStatement) {
        val action = new DeactivateLineItemCreativeAssociations()
        val result = licaService.performLineItemCreativeAssociationAction(action, filterStatement)
        result.getNumChanges
      }
    }
  }

  object creatives {

    private val creativeService = services.creativeService

    def get(stmtBuilder: StatementBuilder): Seq[Creative] = {
      logAroundRead("creatives", stmtBuilder) {
        read(stmtBuilder) { statement =>
          val page = creativeService.getCreativesByStatement(statement)
          (page.getResults, page.getTotalResultSetSize)
        }
      }
    }

    def create(creatives: Seq[Creative]): Seq[Creative] = {
      logAroundCreate("creatives") {
        creativeService.createCreatives(creatives.toArray)
      }
    }
  }
}

object SessionWrapper extends Logging {

  def apply(networkId: Option[String] = None): Option[SessionWrapper] = {
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
        .withNetworkCode(networkId.getOrElse(Configuration.commercial.dfpAccountId))
        .build()
      }
    } catch {
      case NonFatal(e) =>
        log.error(s"Building DFP session failed: ${e.getMessage}")
        None
    }

    dfpSession map (new SessionWrapper(_))
  }
}
