package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.{AdminConfiguration, Configuration}
import dfp.Loader.load

import scala.collection.JavaConversions._
import scala.util.control.NonFatal

private[dfp] class SessionWrapper(dfpSession: DfpSession) extends Logging {

  private val services = new ServicesWrapper(dfpSession)

  private def logAround[T](loadingType: String, stmtBuilder: StatementBuilder)
                  (doLoad: => Seq[T]): Seq[T] = {

    def logApiException(e: ApiException, baseMessage: String): Unit = {
      e.getErrors foreach { err =>
        val reasonMsg = err match {
          case freqCapErr: FrequencyCapError => s", with the reason '${freqCapErr.getReason}'"
          case notNullErr: NotNullError => s", with the reason '${notNullErr.getReason}'"
          case _ => ""
        }
        val path = err.getFieldPath
        val trigger = err.getTrigger
        val msg = s"'${err.getErrorString}'$reasonMsg"
        log.error(
          s"$baseMessage failed: API exception in field '$path', " +
          s"caused by an invalid value '$trigger', " +
          s"with the error message $msg"
        )
      }
    }

    val qry = stmtBuilder.buildQuery()
    val params = stmtBuilder.getBindVariableMap.map { case (k, rawValue) =>
      k -> (
        rawValue match {
          case t: TextValue => s""""${t.getValue}""""
          case n: NumberValue => n.getValue
          case b: BooleanValue => b.getValue
          case other => other.toString
        }
        )
    }.toMap
    val baseMessage = s"""Loading $loadingType with statement "$qry" and params $params"""
    try {
      log.info(s"$baseMessage ...")
      val start = System.currentTimeMillis()
      val loaded = doLoad
      val duration = System.currentTimeMillis() - start
      log.info(s"Successfully loaded ${loaded.size} $loadingType in $duration ms")
      loaded
    } catch {
      case e: ApiException =>
        logApiException(e, baseMessage)
        Nil
      case NonFatal(e) =>
        log.error(s"$baseMessage failed: ${e.getMessage}")
        Nil
    }
  }

  def lineItems(stmtBuilder: StatementBuilder): Seq[LineItem] = {
    logAround("line items", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.lineItemService.getLineItemsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def lineItemCreativeAssociations(stmtBuilder: StatementBuilder): Seq[LineItemCreativeAssociation] = {
    logAround("licas", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.licaService.getLineItemCreativeAssociationsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customFields(stmtBuilder: StatementBuilder): Seq[CustomField] = {
    logAround("custom fields", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.customFieldsService.getCustomFieldsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customTargetingKeys(stmtBuilder: StatementBuilder): Seq[CustomTargetingKey] = {
    logAround("custom targeting keys", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.customTargetingService.getCustomTargetingKeysByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customTargetingValues(stmtBuilder: StatementBuilder): Seq[CustomTargetingValue] = {
    logAround("custom targeting values", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.customTargetingService.getCustomTargetingValuesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def adUnits(stmtBuilder: StatementBuilder): Seq[AdUnit] = {
    logAround("ad units", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.inventoryService.getAdUnitsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def suggestedAdUnits(stmtBuilder: StatementBuilder): Seq[SuggestedAdUnit] = {
    logAround("suggested ad units", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.suggestedAdUnitService.getSuggestedAdUnitsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def placements(stmtBuilder: StatementBuilder): Seq[Placement] = {
    logAround("placements", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.placementService.getPlacementsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def creativeTemplates(stmtBuilder: StatementBuilder): Seq[CreativeTemplate] = {
    logAround("creative templates", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.creativeTemplateService.getCreativeTemplatesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def creatives(stmtBuilder: StatementBuilder): Seq[Creative] = {
    logAround("creatives", stmtBuilder) {
      load(stmtBuilder) { statement =>
        val page = services.creativeService.getCreativesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }
}

object SessionWrapper extends Logging {

  def apply(): Option[SessionWrapper] = {
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
      case NonFatal(e) =>
        log.error(s"Building DFP session failed: ${e.getMessage}")
        None
    }

    dfpSession map (new SessionWrapper(_))
  }
}
