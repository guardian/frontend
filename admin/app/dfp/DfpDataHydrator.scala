package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import common.dfp._
import dfp.DfpApiWrapper.DfpSessionException
import org.apache.commons.lang.exception.ExceptionUtils
import org.joda.time.{DateTime => JodaDateTime, DateTimeZone}

import scala.util.{Failure, Try}

object DfpDataHydrator {
  def apply(): DfpDataHydrator = new DfpDataHydrator()
}

// this is being replaced by DfpApi
class DfpDataHydrator extends Logging {

  private lazy val dfpServiceRegistry = DfpServiceRegistry()

  private def loadLineItems(statementBuilder: StatementBuilder): Seq[GuLineItem] = {
    dfpServiceRegistry.fold(Seq[GuLineItem]()) { serviceRegistry =>

      def loadTargetingValue(id: Long): String = {
        val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", id)
        val values =
          DfpApiWrapper.fetchCustomTargetingValues(serviceRegistry, stmtBuilder)
        values.map(_.getName).head
      }

      try {
        val dfpLineItems =
          DfpApiWrapper.fetchLineItems(serviceRegistry, statementBuilder) filterNot {
            _.getIsArchived
          }

        dfpLineItems map { dfpLineItem =>

          val sponsor = for {
            sponsorFieldId <- CustomFieldAgent.get.data.get("Sponsor")
            customFieldValues <- Option(dfpLineItem.getCustomFieldValues)
            sponsor <- customFieldValues.collect {
              case fieldValue: CustomFieldValue
                if fieldValue.getCustomFieldId == sponsorFieldId =>
                fieldValue.getValue.asInstanceOf[TextValue].getValue
            }.headOption
          } yield sponsor

          GuLineItem(
            id = dfpLineItem.getId,
            name = dfpLineItem.getName,
            startTime = toJodaTime(dfpLineItem.getStartDateTime),
            endTime = {
              if (dfpLineItem.getUnlimitedEndDateTime) None
              else Some(toJodaTime(dfpLineItem.getEndDateTime))
            },
            isPageSkin = isPageSkin(dfpLineItem),
            sponsor = sponsor,
            creativePlaceholders = buildCreativePlaceholders(dfpLineItem, loadTargetingValue),
            targeting = buildTargeting(dfpLineItem.getTargeting, loadTargetingValue),
            status = dfpLineItem.getStatus.toString,
            costType = dfpLineItem.getCostType.toString,
            lastModified = toJodaTime(dfpLineItem.getLastModifiedDateTime)
          )

        }

      } catch {
        case e: Exception =>
          log.error(ExceptionUtils.getStackTrace(e))
          Nil
      }
    }
  }

  def loadCurrentLineItems(): Seq[GuLineItem] = {
    val currentLineItems = new StatementBuilder()
      .where("status = :readyStatus OR status = :deliveringStatus")
      .orderBy("id ASC")
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)

    loadLineItems(currentLineItems)
  }

  def loadLineItemsModifiedSince(threshold:JodaDateTime): Seq[GuLineItem] = {
    val recentlyModified = new StatementBuilder()
      .where("lastModifiedDateTime > :threshold")
      .withBindVariableValue("threshold", threshold.getMillis)

    loadLineItems(recentlyModified)
  }

  def loadAdFeatures(expiredSince: JodaDateTime, expiringBefore: JodaDateTime): Seq[GuLineItem] = {
    val statement = new StatementBuilder()
      .where(
        "LineItemType = :sponsored AND " +
          "Status != :draft AND " +
          "EndDateTime > :startTime AND " +
          "EndDateTime < :endTime"
      )
      .withBindVariableValue("sponsored", LineItemType.SPONSORSHIP.toString)
      .withBindVariableValue("draft", ComputedStatus.DRAFT.toString)
      .withBindVariableValue("startTime", expiredSince.getMillis)
      .withBindVariableValue("endTime", expiringBefore.getMillis)

    loadLineItems(statement) filter { lineItem =>
      lineItem.targeting.customTargetSets exists { targetSet =>
        targetSet.targets exists (_.isAdvertisementFeatureSlot)
      }
    }
  }

  private def loadDescendantAdunits(rootName: String,
                                    stmtBuilder: StatementBuilder): Seq[GuAdUnit] = {

    def toGuAdUnit(dfpAdUnit: AdUnit): GuAdUnit = {
      val parentPathComponents: List[String] = dfpAdUnit.getParentPath.map(_.getName).toList.tail
      GuAdUnit(dfpAdUnit.getId, parentPathComponents :+ dfpAdUnit.getName)
    }

    dfpServiceRegistry.map { serviceRegistry =>
      val dfpAdUnits = DfpApiWrapper.fetchAdUnits(serviceRegistry, stmtBuilder)
      dfpAdUnits filter { adUnit =>
        Option(adUnit.getParentPath) exists { path =>
          val isRoot = path.length == 1 && adUnit.getName == rootName
          val isDescendant = path.length > 1 && path(1).getName == rootName
          isRoot || isDescendant
        }
      } map toGuAdUnit sortBy (_.id)
    } getOrElse Nil
  }

  def loadActiveAdUnits(rootName: String): Seq[GuAdUnit] = {

    val statementBuilder = new StatementBuilder()
      .where("status = :status")
      .withBindVariableValue("status", InventoryStatus._ACTIVE)

    loadDescendantAdunits(rootName, statementBuilder)
  }

  def loadSpecialAdunits(rootName: String): Seq[(String, String)] = {

    val statementBuilder = new StatementBuilder()
      .where("status = :status")
      .where("explicitlyTargeted = :targetting")
      .withBindVariableValue("status", InventoryStatus._ACTIVE)
      .withBindVariableValue("targetting", true)

    loadDescendantAdunits(rootName, statementBuilder) map { adUnit =>
      (adUnit.id, adUnit.path.mkString("/"))
    } sortBy (_._2)
  }

  def loadAdUnitsForApproval(rootName: String): Seq[GuAdUnit] =
    dfpServiceRegistry.fold(Seq[GuAdUnit]()) { serviceRegistry =>
      val statementBuilder = new StatementBuilder()

      val suggestedAdUnits = DfpApiWrapper.fetchSuggestedAdUnits(serviceRegistry, statementBuilder)

      val allUnits = suggestedAdUnits.map { adUnit =>
        val fullpath: List[String] = adUnit.getParentPath.map(_.getName).toList ::: adUnit.getPath.toList

        GuAdUnit(adUnit.getId, fullpath.tail)
      }

      allUnits.filter(au => (au.path.last == "ng" || au.path.last == "r2") && au.path.size == 4).sortBy(_.id).distinct
  }

  def approveTheseAdUnits(adUnits: Iterable[String]): Try[String] =
    dfpServiceRegistry.map { serviceRegistry =>
      val adUnitsList: String = adUnits.mkString(",")

      val statementBuilder = new StatementBuilder()
        .where(s"id in ($adUnitsList)")

      DfpApiWrapper.approveTheseAdUnits(serviceRegistry, statementBuilder)
  }.getOrElse(Failure(new DfpSessionException()))

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

  private def buildCustomTargetSets(customCriteriaSet: CustomCriteriaSet,
                                    targetingKeys: Map[Long, String],
                                    targetingValues: Map[Long, String],
                                    lookUpTargetingValue: Long => String): Seq[CustomTargetSet] = {

    def buildTargetSet(crits: CustomCriteriaSet): Option[CustomTargetSet] = {
      val targets =
        crits.getChildren.flatMap(crit => buildTarget(crit.asInstanceOf[CustomCriteria]))
      if (targets.isEmpty) {
        None
      } else {
        Some(CustomTargetSet(crits.getLogicalOperator.getValue, targets))
      }
    }

    def buildTarget(crit: CustomCriteria): Option[CustomTarget] = {
      targetingKeys.get(crit.getKeyId) map { keyName =>
        CustomTarget(keyName, crit.getOperator.getValue, buildValueNames(crit.getValueIds))
      }
    }

    def buildValueNames(valueIds: Array[Long]): Seq[String] = {

      def lookUpValue(id: Long): String = {
        log.info(s"Looking up targeting value $id ...")
        val targetValue = lookUpTargetingValue(id)
        log.info(s"Found targeting value $id=$targetValue")
        targetValue
      }

      valueIds map { id =>
        targetingValues.getOrElse(id, lookUpValue(id))
      }
    }

    customCriteriaSet.getChildren.flatMap { critSet =>
      buildTargetSet(critSet.asInstanceOf[CustomCriteriaSet])
    }.toSeq
  }

  private def buildTargeting(dfpTargeting: Targeting,
                             lookUpTargetingValue: Long => String): GuTargeting = {

    val adUnits: Seq[GuAdUnit] = {
      val maybeAdUnits = for {
        inventoryTargeting <- Option(dfpTargeting.getInventoryTargeting)
      } yield {
          val allAdUnits = AdUnitAgent.get.data

          def adUnitsFromIds(adUnitIds: Seq[String]): Seq[GuAdUnit] = for {
            adUnitId <- adUnitIds
            adUnits <- allAdUnits.get(adUnitId)
          } yield adUnits

          val directAdUnits =
            adUnitsFromIds(toSeq(inventoryTargeting.getTargetedAdUnits) map (_.getAdUnitId))

          val adUnitsDerivedFromPlacements = {
            val placementAdUnits = PlacementAgent.get.data
            val adUnits = for {
              placementId <- toSeq(inventoryTargeting.getTargetedPlacementIds)
              adUnitIds <- placementAdUnits.get(placementId)
            } yield adUnitsFromIds(adUnitIds)
            adUnits.flatten
          }

          (directAdUnits ++ adUnitsDerivedFromPlacements).sortBy(_.path.mkString).distinct
        }

      maybeAdUnits getOrElse Nil
    }

    def geoTargets(locations: GeoTargeting => Array[Location]): Seq[GeoTarget] = {
      Option(dfpTargeting.getGeoTargeting) flatMap { geoTargeting =>
        Option(locations(geoTargeting)) map { locations =>
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
    }
    val geoTargetsIncluded = geoTargets(_.getTargetedLocations)
    val geoTargetsExcluded = geoTargets(_.getExcludedLocations)

    val customTargetSets = {
      val maybeTargetSets = for (customTargeting <- Option(dfpTargeting.getCustomTargeting)) yield {
        val allCustomTargetingKeys = CustomTargetingKeyAgent.get.data
        val allCustomTargetingValues = CustomTargetingValueAgent.get.data
        buildCustomTargetSets(
          customTargeting,
          allCustomTargetingKeys,
          allCustomTargetingValues,
          lookUpTargetingValue
        )
      }
      maybeTargetSets getOrElse Nil
    }

    GuTargeting(
      adUnits,
      geoTargetsIncluded,
      geoTargetsExcluded,
      customTargetSets
    )
  }

  private def buildCreativePlaceholders(lineItem: LineItem,
                                        lookUpTargetingValue: Long => String):
  Seq[GuCreativePlaceholder] = {

    def creativeTargeting(name: String): Option[GuTargeting] = {
      for (targeting <- toSeq(lineItem.getCreativeTargetings) find (_.getName == name)) yield {
        buildTargeting(targeting.getTargeting, lookUpTargetingValue)
      }
    }

    val placeholders = for (placeholder <- lineItem.getCreativePlaceholders) yield {
      val size = placeholder.getSize
      val targeting = Option(placeholder.getTargetingName).flatMap(creativeTargeting)
      GuCreativePlaceholder(AdSize(size.getWidth, size.getHeight), targeting)
    }

    placeholders sortBy { placeholder =>
      val size = placeholder.size
      (size.width, size.height)
    }
  }

  private def toSeq[A](as: Array[A]): Seq[A] = Option(as) map (_.toSeq) getOrElse Nil

  private def toJodaTime(time: DateTime): JodaDateTime = {
    val date = time.getDate
    new JodaDateTime(date.getYear,
      date.getMonth,
      date.getDay,
      time.getHour,
      time.getMinute,
      time.getSecond,
      DateTimeZone.forID(time.getTimeZoneID))
  }

  //noinspection IfElseToOption
  private def optJavaInt(i: java.lang.Integer): Option[Int] = if (i == null) None else Some(i)
}
