package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403.{LineItem => DfpApiLineItem, _}
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.AdminConfiguration
import implicits.Collections

object DfpApi extends Logging with Collections{

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

  def getAllCurrentDfpLineItems = dfpSession.fold(Seq[DfpApiLineItem]()) { session =>
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
        if companion.getSize.getHeight == 1 && companion.getSize.getWidth == 1
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

    val idsForAdUnitsWithPageSkins: Seq[String] = onlyWithPageSkins(lineItems).flatMap { item =>
      item.getTargeting.getInventoryTargeting.getTargetedAdUnits.toList.map(item => item.getAdUnitId)
    }.distinct

    val adUnits: Seq[AdUnit] = getAdUnitsForTheseIds(idsForAdUnitsWithPageSkins)

    // we don't serve pageskins to anything other than fronts.
    val validAdUnits: Seq[AdUnit] = adUnits.filter(_.getName == "front")

    validAdUnits.map(unit => {
      def removeDfpCustomerIdentifierFromPath(i: AdUnit) = i.getParentPath.tail

      val adUnitPathElements = removeDfpCustomerIdentifierFromPath(unit).map(_.getName) :+ unit.getName
      adUnitPathElements.mkString("/")
    })
  }

  def getAdUnitsForTheseIds(adUnitIds: Seq[String]): Seq[AdUnit] = dfpSession.fold(Seq[AdUnit]()) { session =>
    val adUnitTargetingQuery: StatementBuilder = new StatementBuilder()
      .where("id IN " + adUnitIds.toStringWithRoundBrackets)

    DfpApiWrapper.fetchAdUnitTargetingObjects(session, adUnitTargetingQuery)
  }

  def hydrateWithUsefulValues(lineItems: Seq[DfpApiLineItem]): Seq[LineItem] = dfpSession.fold(Seq[LineItem]()) { session =>
    val namesOfRelevantTargetingKeys: List[String] = List("Keywords", "Slot", "Series")
    val getRelevantTargetingKeyObjects = new StatementBuilder()
      .where("displayName IN " + namesOfRelevantTargetingKeys.toStringWithRoundBrackets)

    val relevantTargetingKeys = DfpApiWrapper.fetchCustomTargetingKeys(session, getRelevantTargetingKeyObjects).map { k =>
      k.getId.longValue() -> k.getName
    }.toMap

    val idsOfRelevantTargetingKeys: Seq[String] = relevantTargetingKeys.map(_._1.toString).toSeq

    val getAllRelevantCustomTargetingValues = new StatementBuilder()
      .where("customTargetingKeyId IN " + idsOfRelevantTargetingKeys.toStringWithRoundBrackets)

    val relevantTargetingValues = DfpApiWrapper.fetchCustomTargetingValues(session, getAllRelevantCustomTargetingValues).map { v =>
      v.getId.longValue() -> v.getName
    }.toMap

    val sponsorFieldId: Option[Long] = {
      val sponsorField = DfpApiWrapper.fetchCustomFields(session,
        new StatementBuilder().where("name = :name").withBindVariableValue("name", "Sponsor")).headOption
      sponsorField map (_.getId)
    }

    for {
      lineItem <- lineItems
      targeting <- Option(lineItem.getTargeting)
      customTargeting <- Option(targeting.getCustomTargeting)
      currTargetSets = targetSets(lineItem, relevantTargetingKeys, relevantTargetingValues)
      if currTargetSets.nonEmpty
    } yield {
      LineItem(lineItem.getId, sponsor(lineItem, sponsorFieldId), currTargetSets)
    }
  }

  private def sponsor(lineItem: DfpApiLineItem, optSponsorFieldId: Option[Long]) = {
    for {
      sponsorFieldId <- optSponsorFieldId
      customFieldValues <- Option(lineItem.getCustomFieldValues)
      sponsor <- customFieldValues.collect {
        case fieldValue: CustomFieldValue
          if fieldValue.getCustomFieldId == sponsorFieldId =>
          fieldValue.getValue.asInstanceOf[TextValue].getValue
      }.headOption
    } yield {
      sponsor
    }
  }

  private def targetSets(lineItem: DfpApiLineItem,
                            targetingKeys: Map[Long, String],
                            targetingValues: Map[Long, String]): Seq[TargetSet] = {

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

    lineItem.getTargeting.getCustomTargeting.getChildren.flatMap { critSet =>
      buildTargetSet(critSet.asInstanceOf[CustomCriteriaSet])
    }.toSeq
  }

  private def sponsorshipTags(lineItems: Seq[LineItem])(tags: LineItem => Seq[String]): Seq[Sponsorship] = {
    val sponsorships = for {
      lineItem <- lineItems
      currTags = tags(lineItem)
      if currTags.nonEmpty
    } yield {
      Sponsorship(currTags, lineItem.sponsor)
    }
    sponsorships.distinct
  }

  def filterOutSponsoredTagsFrom(lineItems: Seq[LineItem]): Seq[Sponsorship] = {
    sponsorshipTags(lineItems)(_.sponsoredTags)
  }

  def filterOutAdvertisementFeatureTagsFrom(lineItems: Seq[LineItem]): Seq[Sponsorship] = {
    sponsorshipTags(lineItems)(_.advertisementFeatureTags)
  }
}
