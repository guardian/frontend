package dfp

import com.google.api.ads.dfp.axis.utils.v201411.StatementBuilder
import com.google.api.ads.dfp.axis.v201411._
import common.Logging
import conf.Configuration.commercial.guMerchandisingAdvertiserId
import dfp.DfpApiWrapper.DfpSessionException
import org.apache.commons.lang.exception.ExceptionUtils
import org.joda.time.{DateTime => JodaDateTime, DateTimeZone}

import scala.util.{Failure, Try}

object DfpDataHydrator {
  def apply(): DfpDataHydrator = new DfpDataHydrator()
}

class DfpDataHydrator extends Logging {

  private lazy val dfpServiceRegistry = DfpServiceRegistry()

  private def loadLineItems(statementBuilder: StatementBuilder): Seq[GuLineItem] = {
    dfpServiceRegistry.fold(Seq[GuLineItem]()) { serviceRegistry =>
      try {
        val dfpLineItems = DfpApiWrapper.fetchLineItems(serviceRegistry, statementBuilder)

        val optSponsorFieldId = CustomFieldAgent.get.data.get("Sponsor")
        val allAdUnits = AdUnitAgent.get.data
        val placementAdUnits = PlacementAgent.get.data
        val allCustomTargetingKeys = CustomTargetingKeyAgent.get.data
        val allCustomTargetingValues = CustomTargetingValueAgent.get.data

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

          val directAdUnits = Option(dfpTargeting.getInventoryTargeting.getTargetedAdUnits) map {
            adUnits =>
              adUnits.flatMap { adUnit =>
                allAdUnits get adUnit.getAdUnitId
              }.toSeq
          } getOrElse Nil

          val adUnitsDerivedFromPlacements = {
            Option(dfpTargeting.getInventoryTargeting.getTargetedPlacementIds).map {
              placementIds =>

                def adUnitsInPlacement(id: Long) = {
                  placementAdUnits get id map {
                    _ flatMap allAdUnits.get
                  } getOrElse Nil
                }

                placementIds.flatMap(adUnitsInPlacement).toSeq

            } getOrElse Nil
          }

          val adUnits =
            (directAdUnits ++ adUnitsDerivedFromPlacements).sortBy(_.path.mkString).distinct

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

          val customTargetSets = Option(dfpTargeting.getCustomTargeting) map { customTargeting =>
            buildCustomTargetSets(customTargeting,
              allCustomTargetingKeys,
              allCustomTargetingValues)
          } getOrElse Nil

          GuLineItem(
            id = dfpLineItem.getId,
            name = dfpLineItem.getName,
            startTime = toJodaTime(dfpLineItem.getStartDateTime),
            endTime = if (dfpLineItem.getUnlimitedEndDateTime) None
            else Some(toJodaTime(dfpLineItem
              .getEndDateTime)),
            isPageSkin = isPageSkin(dfpLineItem),
            sponsor = sponsor,
            targeting = GuTargeting(adUnits,
              geoTargetsIncluded,
              geoTargetsExcluded,
              customTargetSets),
            status = dfpLineItem.getStatus.toString
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

  def loadAllAdFeatures(): Seq[GuLineItem] = {
    val allSponsored = new StatementBuilder()
      .where("lineItemType = :sponsoredType")
      .orderBy("id ASC")
      .withBindVariableValue("sponsoredType", LineItemType.SPONSORSHIP.toString)

    loadLineItems(allSponsored) filter { lineItem =>
      lineItem.targeting.customTargetSets exists { targetSet =>
        targetSet.targets exists (_.isAdvertisementFeatureSlot)
      }
    }
  }

  def loadSpecialAdunits(rootName: String): Seq[(String, String)] =
    dfpServiceRegistry.fold(Seq[(String, String)]()) { serviceRegistry =>
      val statementBuilder = new StatementBuilder()
        .where("status = :status")
        .where("explicitlyTargeted = :targetting")
        .withBindVariableValue("status", InventoryStatus._ACTIVE)
        .withBindVariableValue("targetting", true)

      val dfpAdUnits = DfpApiWrapper.fetchAdUnits(serviceRegistry, statementBuilder)

      val rootAndDescendantAdUnits = dfpAdUnits filter { adUnit =>
        Option(adUnit.getParentPath) exists { path =>
          (path.length == 1 && adUnit.getName == rootName) || (path.length > 1 && path(1).getName == rootName)
        }
      }

      rootAndDescendantAdUnits.map { ad =>
        val parentPathComponents: List[String] = ad.getParentPath.map(_.getName).toList.tail
        (ad.getId, (parentPathComponents ::: ad.getName :: Nil).mkString("/"))
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


  def loadActiveUserDefinedCreativeTemplates(): Seq[GuCreativeTemplate] =
    dfpServiceRegistry.fold(Seq.empty[GuCreativeTemplate]) { serviceRegistry =>
    val templatesQuery = new StatementBuilder()
      .where("status = :active and type = :type")
      .withBindVariableValue("active", CreativeTemplateStatus.ACTIVE.getValue)
      .withBindVariableValue("type", CreativeTemplateType.USER_DEFINED.getValue)
      .orderBy("name ASC")

      val dfpCreativeTemplates = DfpApiWrapper.fetchCreativeTemplates(serviceRegistry,
        templatesQuery) filterNot { template =>
      val name = template.getName.toUpperCase
      name.startsWith("APPS - ") || name.startsWith("AS ") || name.startsWith("QC ")
    }

    // fetch merchandising creatives by advertiser and logo creatives by size
    val creativesQuery = new StatementBuilder()
      .where("advertiserId = :advertiserId or (width = :width and height = :height)")
      .withBindVariableValue("advertiserId", guMerchandisingAdvertiserId)
      .withBindVariableValue("width", "140")
      .withBindVariableValue("height", "90")

      val creatives = DfpApiWrapper.fetchTemplateCreatives(serviceRegistry, creativesQuery)

    dfpCreativeTemplates map { template =>
      val templateCreatives = creatives getOrElse(template.getId, Nil)
      GuCreativeTemplate(
        id = template.getId,
        name = template.getName,
        description = template.getDescription,
        parameters = template.getVariables map { param =>
          GuCreativeTemplateParameter(
            param.getCreativeTemplateVariableType.stripSuffix("CreativeTemplateVariable"),
            param.getLabel,
            param.getIsRequired,
            param.getDescription
          )
        },
        snippet = template.getSnippet,
        creatives = templateCreatives map { creative =>
          val args = creative.getCreativeTemplateVariableValues.foldLeft(Map.empty[String, String]) { case (soFar, arg) =>
            val argValue = arg.getBaseCreativeTemplateVariableValueType match {
              case "StringCreativeTemplateVariableValue" => Option(arg.asInstanceOf[StringCreativeTemplateVariableValue].getValue) getOrElse ""
              case "AssetCreativeTemplateVariableValue" => "https://tpc.googlesyndication.com/pagead/imgad?id=CICAgKCT8L-fJRABGAEyCCXl5VJTW9F8"
              case "UrlCreativeTemplateVariableValue" => Option(arg.asInstanceOf[UrlCreativeTemplateVariableValue].getValue) getOrElse ""
              case other => "???"
            }
            soFar + (arg.getUniqueName -> argValue)
          }
          GuCreative(creative.getId.longValue(), creative.getName, args)
        }
      )
    }
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

  private def buildCustomTargetSets(customCriteriaSet: CustomCriteriaSet,
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

  private def toJodaTime(time: DateTime): JodaDateTime = {
    val date = time.getDate
    new JodaDateTime(date.getYear,
      date.getMonth,
      date.getDay,
      time.getHour,
      time.getMinute,
      DateTimeZone.forID(time.getTimeZoneID))
  }

  private def optJavaInt(i: java.lang.Integer): Option[Int] = if (i == null) None else Some(i)
}
