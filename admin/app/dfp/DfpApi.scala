package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.axis.v201403.{LineItem => DfpApiLineItem}
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

  def getAllCurrentDfpLineItems() = dfpSession.fold(Seq[DfpApiLineItem]()) {session =>
    val currentLineItems = new StatementBuilder()
      .where("status = :readyStatus OR status = :deliveringStatus")
      .orderBy("id ASC")
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)

    DfpApiWrapper.fetchLineItems(session, currentLineItems)
  }

  private def onlyWithPageSkins(lineItems: Seq[DfpApiLineItem]) = {
    def hasA1x1Pixel(placeholders: Array[CreativePlaceholder]): Boolean = {
      val outOfPagePlaceholder: Array[CreativePlaceholder] = for {
        placeholder <- placeholders
        companion <- placeholder.getCompanions
        if (companion.getSize().getHeight() == 1 && companion.getSize().getWidth() == 1)
      } yield companion
      outOfPagePlaceholder.nonEmpty
    }

    lineItems.filter(
      item => item.getRoadblockingType == RoadblockingType.CREATIVE_SET &&
        hasA1x1Pixel(item.getCreativePlaceholders) &&
        item.getTargeting.getInventoryTargeting.getTargetedAdUnits.size > 0
    )
  }

  def fetchAdUnitsThatAreTargettedByPageSkins(lineItems: Seq[DfpApiLineItem]): Seq[String] = dfpSession.fold(Seq[String]()) { session =>

    val allAdUnitIds: Seq[String] = onlyWithPageSkins(lineItems).flatMap { item =>
      item.getTargeting.getInventoryTargeting.getTargetedAdUnits.toList.map(item => item.getAdUnitId)
    }.distinct

    val adUnits: Seq[AdUnit] = getAdUnitsForTheseIds(allAdUnitIds)

    // we don't serve pageskins to anything other than fronts.
    val validAdUnits: Seq[AdUnit] = adUnits.filter(_.getName == "front")

    validAdUnits.map(unit => {
      def removeCustomerIdentifierFromPath(i: AdUnit) = i.getParentPath.tail

      val adUnitPathElements = removeCustomerIdentifierFromPath(unit).map(_.getName) :+ unit.getName
      adUnitPathElements.mkString("/")
    })
  }

  def getAdUnitsForTheseIds(adUnitIds: Seq[String]): Seq[AdUnit] = dfpSession.fold(Seq[AdUnit]()) { session =>
    val statement: String = "id IN ('" + adUnitIds.mkString("', '") + "')"
    val adUnitTargetingQuery: StatementBuilder = new StatementBuilder()
      .where(statement)

    DfpApiWrapper.fetchAdUnitTargetingObjects(session, adUnitTargetingQuery)
  }

  def wrapIntoDomainLineItem(lineItems: Seq[DfpApiLineItem]): Seq[LineItem] = dfpSession.fold(Seq[LineItem]()) { session =>
    val customTargetingKeys = new StatementBuilder()
      .where("displayName = :keywordTargetName OR displayName = :slotTargetName")
      .withBindVariableValue("keywordTargetName", "Keywords")
      .withBindVariableValue("slotTargetName", "Slot")

    val targetingKeys = DfpApiWrapper.fetchCustomTargetingKeys(session, customTargetingKeys).map { k =>
      k.getId.longValue() -> k.getName
    }.toMap

    val targetingKeysStatement = "('" + targetingKeys.map(_._1).mkString("', '") + "')"
    val customTargetingValues = new StatementBuilder()
      .where("customTargetingKeyId IN " + targetingKeysStatement )

    val targetingValues = DfpApiWrapper.fetchCustomTargetingValues(session, customTargetingValues).map { v =>
      v.getId.longValue() -> v.getName
    }.toMap

    lineItems.filter { lineItem =>
      lineItem.getTargeting != null && lineItem.getTargeting.getCustomTargeting != null
    } flatMap (lineItem => addTargetSets(lineItem, targetingKeys, targetingValues))
  }

  private def addTargetSets(lineItem: DfpApiLineItem,
                            targetingKeys: Map[Long, String],
                            targetingValues: Map[Long, String]): Option[LineItem] = {

    def buildTargetSet(crits: CustomCriteriaSet): Option[TargetSet] = {
      val targets = crits.getChildren.flatMap { crit =>
        buildTarget(crit.asInstanceOf[CustomCriteria])
      }.toSeq
      if (targets.isEmpty) {
        None
      } else {
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

    val targetSets = lineItem.getTargeting.getCustomTargeting.getChildren.flatMap { critSet =>
      buildTargetSet(critSet.asInstanceOf[CustomCriteriaSet])
    }.toSeq
    if (targetSets.isEmpty) {
      None
    } else {
      Some(LineItem(lineItem.getId, targetSets))
    }
  }

  def fetchSponsoredKeywords(lineItems: Seq[LineItem]): Seq[String] = {
    lineItems flatMap (_.sponsoredKeywords)
  }

  def fetchAdvertisementFeatureKeywords(lineItems: Seq[LineItem]): Seq[String] = {
    lineItems flatMap (_.advertisementFeatureKeywords)
  }
}
