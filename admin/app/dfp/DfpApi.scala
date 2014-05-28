package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.axis.v201403.{LineItem => DfpApiLineItem}
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.AdminConfiguration

object DfpApi extends Logging {

  private lazy val session: Option[DfpSession] = try {
    for {
      clientId <- AdminConfiguration.dfpApi.clientId
      clientSecret <- AdminConfiguration.dfpApi.clientSecret
      refreshToken <- AdminConfiguration.dfpApi.refreshToken
      appName <- AdminConfiguration.dfpApi.appName
      networkId <- AdminConfiguration.dfpApi.networkId
    } yield {
      val credential = new OfflineCredentials.Builder()
        .forApi(Api.DFP)
        .withClientSecrets(clientId, clientSecret)
        .withRefreshToken(refreshToken)
        .build().generateCredential()
      new DfpSession.Builder()
        .withOAuth2Credential(credential)
        .withApplicationName(appName)
        .withNetworkCode(networkId)
        .build()
    }
  } catch {
    case e: Exception =>
      log.error(s"Building DFP session failed: $e")
      None
  }

  private lazy val dfpServices = new DfpServices()

  private lazy val lineItemServiceOption: Option[LineItemServiceInterface] =
    session.map(dfpServices.get(_, classOf[LineItemServiceInterface]))

  private lazy val customTargetingServiceOption: Option[CustomTargetingServiceInterface] =
    session.map(dfpServices.get(_, classOf[CustomTargetingServiceInterface]))

  private val slotTargetKeyId = 174447L
  private val keywordTargetKeyId = 177687L

  def fetchCurrentLineItems(): Seq[LineItem] = lineItemServiceOption.fold(Seq[LineItem]()) { lineItemService =>
    val statementBuilder = new StatementBuilder()
      .where("status = :readyStatus OR status = :deliveringStatus")
      .orderBy("id ASC")
      .limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)

    var totalResultSetSize = 0
    var totalResults: Seq[DfpApiLineItem] = Nil

    try {
      do {
        val page = lineItemService.getLineItemsByStatement(statementBuilder.toStatement)
        val results = page.getResults
        if (results != null) {
          totalResultSetSize = page.getTotalResultSetSize
          totalResults ++= results
        }
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
      } while (statementBuilder.getOffset < totalResultSetSize)
    } catch {
      case e: Exception => log.error(s"Exception fetching current line items: $e")
    }

    val targetingKeys = Map(keywordTargetKeyId -> "k", slotTargetKeyId -> "slot")
    val targetingValues = fetchAllKeywordTargetingValues() ++ fetchAllSlotTargetingValues()

    def buildTargetSet(crits: CustomCriteriaSet): Option[TargetSet] = {
      val targets = crits.getChildren.flatMap { crit =>
        buildTarget(crit.asInstanceOf[CustomCriteria])
      }.toSeq
      if (targets.isEmpty) None
      else Some(TargetSet(crits.getLogicalOperator.getValue, targets))
    }

    def buildTarget(crit: CustomCriteria): Option[Target] = {
      val id = crit.getKeyId
      if (id == slotTargetKeyId || crit.getKeyId == keywordTargetKeyId) {
        val keyName = targetingKeys.getOrElse(id, "*** unknown ***")
        Some(Target(keyName, crit.getOperator.getValue, buildValueNames(crit.getValueIds)))
      } else {
        None
      }
    }

    def buildValueNames(valueIds: Array[Long]): Seq[String] = {
      valueIds map { id =>
        targetingValues.getOrElse(id, "*** unknown ***")
      }
    }

    val filtered = totalResults.filter { r =>
      r.getTargeting != null && r.getTargeting.getCustomTargeting != null
    }
    filtered.flatMap { r =>
      val targeting: Targeting = r.getTargeting
      val customTargeting: CustomCriteriaSet = targeting.getCustomTargeting
      val targetSets = customTargeting.getChildren.flatMap { critSet =>
        buildTargetSet(critSet.asInstanceOf[CustomCriteriaSet])
      }.toSeq
      if (targetSets.isEmpty) None
      else Some(LineItem(r.getId, targetSets))
    }
  }

  private def fetchAllTargetingValues(targetKeyId: Long): Map[Long, String] =
    customTargetingServiceOption.fold(Map[Long, String]()) { customTargetingService =>

      val statementBuilder = new StatementBuilder()
        .where("customTargetingKeyId = :targetingKeyId")
        .orderBy("id ASC")
        .limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)

      statementBuilder.withBindVariableValue("targetingKeyId", targetKeyId)

      var totalResultSetSize = 0
      statementBuilder.offset(0)

      var targetingValues: Map[Long, String] = Map()

      try {
        do {
          val page = customTargetingService.getCustomTargetingValuesByStatement(statementBuilder.toStatement)

          val results = page.getResults
          if (results != null) {
            totalResultSetSize = page.getTotalResultSetSize
            targetingValues ++= results.map(result => (result.getId.toLong, result.getName))
          }

          statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        } while (statementBuilder.getOffset < totalResultSetSize)
      } catch {
        case e: Exception => log.error(s"Exception fetching custom targeting values: $e")
      }

      targetingValues
    }

  private def fetchAllKeywordTargetingValues(): Map[Long, String] = fetchAllTargetingValues(keywordTargetKeyId)

  private def fetchAllSlotTargetingValues(): Map[Long, String] = fetchAllTargetingValues(slotTargetKeyId)
}
