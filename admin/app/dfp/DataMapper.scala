package dfp

import com.google.api.ads.dfp.axis.v201508._
import common.dfp._
import dfp.ApiHelper.{isPageSkin, optJavaInt, toJodaTime, toSeq}

// These mapping functions use libraries that are only available in admin to create common DFP data models.
object DataMapper {

  def toGeoTarget(dfpLocation: Location) = GeoTarget(
    dfpLocation.getId,
    optJavaInt(dfpLocation.getCanonicalParentId),
    dfpLocation.getType,
    dfpLocation.getDisplayName
  )

  def toGuAdUnit(dfpAdUnit: AdUnit, adUnit: String => GuAdUnit) = GuAdUnit(
    id = dfpAdUnit.getId, path = adUnit(dfpAdUnit.getParentId).path :+ dfpAdUnit.getName
  )

  def toGuAdUnits(
    inventoryTargeting: InventoryTargeting,
    placementAdUnitIds: Long => Seq[String],
    adUnit: String => GuAdUnit
  ): Seq[GuAdUnit] = {

    val directAdUnits = toSeq(inventoryTargeting.getTargetedAdUnits map (_.getAdUnitId)) map adUnit

    val adUnitsDerivedFromPlacements = {
      val adUnits = for {
        placementId <- toSeq(inventoryTargeting.getTargetedPlacementIds)
      } yield placementAdUnitIds(placementId) map adUnit
      adUnits.flatten
    }

    (directAdUnits ++ adUnitsDerivedFromPlacements).sortBy(_.path.mkString).distinct
  }

  def toCustomTarget(
    criterion: CustomCriteria,
    targetingKey: Long => String,
    targetingValue: Long => String
  ) = CustomTarget(
    targetingKey(criterion.getKeyId),
    criterion.getOperator.getValue,
    criterion.getValueIds map targetingValue
  )

  def toCustomTargetSet(
    criteria: CustomCriteriaSet,
    targetingKey: Long => String,
    targetingValue: Long => String
  ): CustomTargetSet = {
    val targets = criteria.getChildren collect {
      case criterion: CustomCriteria => criterion
    } map (toCustomTarget(_, targetingKey, targetingValue))
    CustomTargetSet(criteria.getLogicalOperator.getValue, targets)
  }

  def toCustomTargetSets(
    criteriaSets: CustomCriteriaSet,
    targetingKey: Long => String,
    targetingValue: Long => String
  ): Seq[CustomTargetSet] = {
    criteriaSets.getChildren.collect {
      case criteria: CustomCriteriaSet => criteria
    }.map(toCustomTargetSet(_, targetingKey, targetingValue)).toSeq
  }

  def toGuTargeting(
    dfpTargeting: Targeting,
    placementAdUnitIds: Long => Seq[String],
    adUnit: String => GuAdUnit,
    targetingKey: Long => String,
    targetingValue: Long => String
  ): GuTargeting = {

    def geoTargets(locations: GeoTargeting => Array[Location]): Seq[GeoTarget] = {
      Option(dfpTargeting.getGeoTargeting) flatMap { geoTargeting =>
        Option(locations(geoTargeting)) map { locations =>
          locations.map(toGeoTarget).toSeq
        }
      } getOrElse Nil
    }
    val geoTargetsIncluded = geoTargets(_.getTargetedLocations)
    val geoTargetsExcluded = geoTargets(_.getExcludedLocations)

    GuTargeting(
      adUnits = {
        Option(dfpTargeting.getInventoryTargeting) map {
          toGuAdUnits(_, placementAdUnitIds, adUnit)
        } getOrElse Nil
      },
      geoTargetsIncluded,
      geoTargetsExcluded,
      customTargetSets = {
        Option(dfpTargeting.getCustomTargeting) map (toCustomTargetSets(_, targetingKey, targetingValue)) getOrElse Nil
      }
    )
  }

  def toGuCreativePlaceholders(
    dfpLineItem: LineItem,
    placementAdUnitIds: Long => Seq[String],
    adUnit: String => GuAdUnit,
    targetingKey: Long => String,
    targetingValue: Long => String
  ): Seq[GuCreativePlaceholder] = {

    def creativeTargeting(name: String): Option[GuTargeting] = {
      for (targeting <- toSeq(dfpLineItem.getCreativeTargetings) find (_.getName == name)) yield {
        toGuTargeting(targeting.getTargeting, placementAdUnitIds, adUnit, targetingKey, targetingValue)
      }
    }

    val placeholders = for (placeholder <- dfpLineItem.getCreativePlaceholders) yield {
      val size = placeholder.getSize
      val targeting = Option(placeholder.getTargetingName).flatMap(creativeTargeting)
      GuCreativePlaceholder(AdSize(size.getWidth, size.getHeight), targeting)
    }

    placeholders sortBy { placeholder =>
      val size = placeholder.size
      (size.width, size.height)
    }
  }

  def toGuLineItem(
    dfpLineItem: LineItem,
    sponsor: Option[String],
    placementAdUnitIds: Long => Seq[String],
    adUnit: String => GuAdUnit,
    targetingKey: Long => String,
    targetingValue: Long => String
  ) = GuLineItem(
    id = dfpLineItem.getId,
    name = dfpLineItem.getName,
    startTime = toJodaTime(dfpLineItem.getStartDateTime),
    endTime = {
      if (dfpLineItem.getUnlimitedEndDateTime) None
      else Some(toJodaTime(dfpLineItem.getEndDateTime))
    },
    isPageSkin = isPageSkin(dfpLineItem),
    sponsor,
    creativePlaceholders = toGuCreativePlaceholders(
      dfpLineItem,
      placementAdUnitIds,
      adUnit,
      targetingKey,
      targetingValue
    ),
    targeting = toGuTargeting(dfpLineItem.getTargeting, placementAdUnitIds, adUnit, targetingKey, targetingValue),
    status = dfpLineItem.getStatus.toString,
    costType = dfpLineItem.getCostType.toString,
    lastModified = toJodaTime(dfpLineItem.getLastModifiedDateTime)
  )

  def toGuCreativeTemplate(dfpCreativeTemplate: CreativeTemplate) = {

    def toParameter(param: CreativeTemplateVariable) = GuCreativeTemplateParameter(
      parameterType = param.getClass.getSimpleName.stripSuffix("CreativeTemplateVariable"),
      label = param.getLabel,
      isRequired = param.getIsRequired,
      description = Option(param.getDescription)
    )

    GuCreativeTemplate(
      id = dfpCreativeTemplate.getId,
      name = dfpCreativeTemplate.getName,
      description = dfpCreativeTemplate.getDescription,
      parameters = Option(dfpCreativeTemplate.getVariables).map { params =>
        (params map toParameter).toSeq
      }.getOrElse(Nil),
      snippet = dfpCreativeTemplate.getSnippet,
      creatives = Nil
    )
  }

  def toGuCreative(dfpCreative: Creative) = GuCreative(
    id = dfpCreative.getId,
    name = dfpCreative.getName,
    lastModified = toJodaTime(dfpCreative.getLastModifiedDateTime),
    args = Map.empty,
    templateId = None,
    snippet = None
  )

  def toGuTemplateCreative(dfpCreative: TemplateCreative) = {

    def arg(variableValue: BaseCreativeTemplateVariableValue): (String, String) = {
      val exampleAssetUrl =
        "https://tpc.googlesyndication.com/pagead/imgad?id=CICAgKCT8L-fJRABGAEyCCXl5VJTW9F8"
      val argValue = variableValue match {
        case s: StringCreativeTemplateVariableValue =>
          Option(s.getValue) getOrElse ""
        case u: UrlCreativeTemplateVariableValue =>
          Option(u.getValue) getOrElse ""
        case _: AssetCreativeTemplateVariableValue =>
          exampleAssetUrl
        case other => "???"
      }
      variableValue.getUniqueName -> argValue
    }

    toGuCreative(dfpCreative).copy(
      args = Option(dfpCreative.getCreativeTemplateVariableValues).map(_.map(arg)).map(_.toMap).getOrElse(Map.empty),
      templateId = Some(dfpCreative.getCreativeTemplateId)
    )
  }

  def toGuThirdPartyCreative(dfpCreative: ThirdPartyCreative) = {
    toGuCreative(dfpCreative).copy(snippet = Some(dfpCreative.getSnippet))
  }
}
