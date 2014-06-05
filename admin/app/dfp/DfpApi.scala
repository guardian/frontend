package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
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

  def fetchCurrentLineItems(): Seq[LineItem] = session.map { sess =>

    val lineItemStatementBuilder = new StatementBuilder()
      .where("status = :readyStatus OR status = :deliveringStatus")
      .orderBy("id ASC")
      .limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)

    val lineItems = DfpApiWrapper.fetchLineItems(sess, lineItemStatementBuilder)

    def targetingStatementBuilder(keyName: String) = new StatementBuilder()
      .where("customTargetingKeyId = :targetingKeyId")
      .withBindVariableValue("targetingKeyId", keyName)

    val keywordTargetKeyId = DfpApiWrapper.fetchCustomTargetingKeys(sess, targetingStatementBuilder("Keywords"))(0).getId

    val keywords = DfpApiWrapper.fetchCustomTargetingValues(sess, targetingStatementBuilder("Keywords")).map { v =>
      v.getId -> v.getName
    }.toMap

    val slotTargetKeyId = DfpApiWrapper.fetchCustomTargetingKeys(sess, targetingStatementBuilder("Slot"))(0).getId

    val slots = DfpApiWrapper.fetchCustomTargetingValues(sess, targetingStatementBuilder("Slot")).map { v =>
      v.getId -> v.getName
    }.toMap

    val targetingKeys = Map(keywordTargetKeyId -> "k", slotTargetKeyId -> "slot")
    val targetingValues = keywords ++ slots

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

    val filtered = lineItems.filter { r =>
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
  }.getOrElse {
    Nil
  }
}
