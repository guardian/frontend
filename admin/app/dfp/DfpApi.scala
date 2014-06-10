package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.AdminConfiguration

object DfpApi extends Logging {

  private lazy val dfpSession: Option[DfpSession] = try {
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

  def fetchCurrentLineItems(): Seq[LineItem] = dfpSession.map { session =>

    val currentLineItems = new StatementBuilder()
      .where("status = :readyStatus OR status = :deliveringStatus")
      .orderBy("id ASC")
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)

    val lineItems = DfpApiWrapper.fetchLineItems(session, currentLineItems)

    val customTargetingKeys = new StatementBuilder()
      .where("displayName = :keywordTargetName OR displayName = :slotTargetName")
      .withBindVariableValue("keywordTargetName", "Keywords")
      .withBindVariableValue("slotTargetName", "Slot")

    val targetingKeys = DfpApiWrapper.fetchCustomTargetingKeys(session, customTargetingKeys).map { k =>
      k.getId -> k.getName
    }.toMap

    val customTargetingValues = new StatementBuilder()
        .where("customTargetingKeyId = :keywordTargetId OR customTargetingKeyId = :slotTargetId")
        .withBindVariableValue("keywordTargetId", targetingKeys.head._1)
        .withBindVariableValue("slotTargetId", targetingKeys.last._1)

    val targetingValues = DfpApiWrapper.fetchCustomTargetingValues(session, customTargetingValues).map { v =>
      v.getId -> v.getName
    }.toMap

    def buildTargetSet(crits: CustomCriteriaSet): Option[TargetSet] = {
      val targets = crits.getChildren.flatMap { crit =>
        buildTarget(crit.asInstanceOf[CustomCriteria])
      }.toSeq
      if (targets.isEmpty) {
        None
      }
      else {
        Some(TargetSet(crits.getLogicalOperator.getValue, targets))
      }
    }

    def buildTarget(crit: CustomCriteria): Option[Target] = {
      targetingKeys.get(crit.getKeyId) map {
        keyName => Target(keyName, crit.getOperator.getValue, buildValueNames(crit.getValueIds))
      }
    }

    def buildValueNames(valueIds: Array[Long]): Seq[String] = {
      valueIds map { id =>
        targetingValues.getOrElse(id, "*** unknown ***")
      }
    }

    val filtered = lineItems.filter { r =>
      r.getTargeting != null && r.getTargeting.getCustomTargeting != null
    }
    filtered.flatMap { r =>
      val targeting: Targeting = r.getTargeting
      val customTargeting: CustomCriteriaSet = targeting.getCustomTargeting
      val targetSets = customTargeting.getChildren.flatMap { critSet =>
        buildTargetSet(critSet.asInstanceOf[CustomCriteriaSet])
      }.toSeq
      if (targetSets.isEmpty) {
        None
      }
      else {
        Some(LineItem(r.getId, targetSets))
      }
    }
  }.getOrElse {
    Nil
  }
}
