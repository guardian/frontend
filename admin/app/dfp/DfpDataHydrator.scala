package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.AdminConfiguration

object DfpDataHydrator extends Logging {

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

  private val rootAdUnitName = "theguardian.com"

  def loadCurrentLineItems(): Seq[GuLineItem] = dfpSession.fold(Seq[GuLineItem]()) { session =>

    try {

      val currentLineItems = new StatementBuilder()
        .where("status = :readyStatus OR status = :deliveringStatus")
        .orderBy("id ASC")
        .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
        .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)

      val dfpLineItems = DfpApiWrapper.fetchLineItems(session, currentLineItems)

      val optSponsorFieldId = loadCustomFieldId("sponsor")

      val allAdUnits = loadActiveDescendantAdUnits(rootAdUnitName)

      val allCustomTargetingKeys = loadAllCustomTargetKeys()
      val allCustomTargetingValues = loadAllCustomTargetValues()

      dfpLineItems map { dfpLineItem =>

        val sponsor = for {
          sponsorFieldId <- optSponsorFieldId
          customFieldValues <- Option(dfpLineItem.getCustomFieldValues)
          sponsor <- customFieldValues.collect {
            case fieldValue: CustomFieldValue
              if fieldValue.getCustomFieldId == sponsorFieldId =>
              fieldValue.getValue.asInstanceOf[TextValue].getValue
          }.headOption
        } yield sponsor

        val dfpTargeting = dfpLineItem.getTargeting

        val adUnits = Option(dfpTargeting.getInventoryTargeting.getTargetedAdUnits) map { adUnits =>
          adUnits.flatMap { adUnit =>
            allAdUnits get adUnit.getAdUnitId
          }.toSeq
        } getOrElse Nil

        val geoTargets = Option(dfpTargeting.getGeoTargeting) flatMap { geoTargeting =>
          Option(geoTargeting.getTargetedLocations) map { locations =>
            locations.map { location =>
              GeoTarget(
                location.getId,
                optJavaInt(location.getCanonicalParentId),
                location.getType,
                location.getDisplayName
              )
            }.toSeq
          }
        } getOrElse Nil

        val customTargetSets = Option(dfpTargeting.getCustomTargeting) map { customTargeting =>
          buildCustomTargetSets(customTargeting, allCustomTargetingKeys, allCustomTargetingValues)
        } getOrElse Nil

        GuLineItem(
          dfpLineItem.getId,
          dfpLineItem.getName,
          isPageSkin(dfpLineItem),
          sponsor,
          GuTargeting(adUnits, geoTargets, customTargetSets)
        )
      }

    } catch {
      case e:Exception =>
        log.error(e.getStackTraceString)
        Nil
    }
  }

  def loadCustomFieldId(name: String): Option[Long] = dfpSession flatMap { session =>
    val statementBuilder = new StatementBuilder().where("name = :name").withBindVariableValue("name", name)
    val field = DfpApiWrapper.fetchCustomFields(session, statementBuilder).headOption
    field map (_.getId)
  }

  def loadActiveDescendantAdUnits(rootName: String): Map[String, GuAdUnit] = dfpSession.fold(Map[String, GuAdUnit]()) {
    session =>

      val statementBuilder = new StatementBuilder()
        .where("parentId is not null and status = :status")
        .withBindVariableValue("status", InventoryStatus._ACTIVE)

      val dfpAdUnits = DfpApiWrapper.fetchAdUnits(session, statementBuilder)

      val descendantAdUnits = dfpAdUnits filter { adUnit =>
        val path = adUnit.getParentPath
        path != null && path.length > 1 && path(1).getName == rootName
      }

      def pathOf(adUnit: AdUnit) = adUnit.getParentPath.tail.map(_.getName).toSeq :+ adUnit.getName

      descendantAdUnits.map { adUnit =>
        (adUnit.getId, GuAdUnit(adUnit.getId, pathOf(adUnit)))
      }.toMap
  }

  def loadAllCustomTargetKeys(): Map[Long, String] = dfpSession.fold(Map[Long, String]()) { session =>
    DfpApiWrapper.fetchCustomTargetingKeys(session, new StatementBuilder()).map { k =>
      k.getId.longValue() -> k.getName
    }.toMap
  }

  def loadAllCustomTargetValues(): Map[Long, String] = dfpSession.fold(Map[Long, String]()) { session =>
    DfpApiWrapper.fetchCustomTargetingValues(session, new StatementBuilder()).map { v =>
      v.getId.longValue() -> v.getName
    }.toMap
  }

  private def isPageSkin(dfpLineItem: LineItem) = {

    def hasA1x1Pixel(placeholders: Array[CreativePlaceholder]): Boolean = {
      val outOfPagePlaceholder: Array[CreativePlaceholder] = for {
        placeholder <- placeholders
        companion <- placeholder.getCompanions
        if companion.getSize.getHeight == 1 && companion.getSize.getWidth == 1
      } yield companion
      outOfPagePlaceholder.nonEmpty
    }

    dfpLineItem.getRoadblockingType == RoadblockingType.CREATIVE_SET &&
      hasA1x1Pixel(dfpLineItem.getCreativePlaceholders)
  }

  private def buildCustomTargetSets(customCriteriaSet:CustomCriteriaSet,
                         targetingKeys: Map[Long, String],
                         targetingValues: Map[Long, String]): Seq[CustomTargetSet] = {

    def buildTargetSet(crits: CustomCriteriaSet): Option[CustomTargetSet] = {
      val targets = crits.getChildren.flatMap(crit => buildTarget(crit.asInstanceOf[CustomCriteria]))
      if (targets.isEmpty) {
        None
      } else {
        Some(CustomTargetSet(crits.getLogicalOperator.getValue, targets))
      }
    }

    def buildTarget(crit: CustomCriteria): Option[CustomTarget] = {
      targetingKeys.get(crit.getKeyId) map {
        keyName => CustomTarget(keyName, crit.getOperator.getValue, buildValueNames(crit.getValueIds))
      }
    }

    def buildValueNames(valueIds: Array[Long]): Seq[String] = {
      valueIds map { id =>
        targetingValues.getOrElse(id, "*** unknown ***")
      }
    }

    customCriteriaSet.getChildren.flatMap { critSet =>
      buildTargetSet(critSet.asInstanceOf[CustomCriteriaSet])
    }.toSeq
  }

  private def optJavaInt(i: java.lang.Integer): Option[Int] = {
    if (i == null) None
    else Some(i)
  }
}
