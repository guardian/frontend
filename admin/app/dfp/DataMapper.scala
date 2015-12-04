package dfp

import com.google.api.ads.dfp.axis.v201508._
import common.dfp._
import dfp.ApiHelper.{isPageSkin, optJavaInt, toJodaTime, toSeq}

// These mapping functions use libraries that are only available in admin to create common DFP data models.
object DataMapper {

  def toGuAdUnit(dfpAdUnit: AdUnit): GuAdUnit = {
    val parentPathComponents: List[String] = dfpAdUnit.getParentPath.map(_.getName).toList.tail
    GuAdUnit(dfpAdUnit.getId, parentPathComponents :+ dfpAdUnit.getName)
  }

  def toGuTargeting(
    dfpTargeting: Targeting,
    placementAdUnitIds: Long => Seq[String],
    adUnit: String => GuAdUnit,
    targetingKey: Long => String,
    targetingValue: Long => String
  ): GuTargeting = {

    def toGuAdUnits(inventoryTargeting: InventoryTargeting): Seq[GuAdUnit] = {

      val directAdUnits = toSeq(inventoryTargeting.getTargetedAdUnits map (_.getAdUnitId)) map adUnit

      val adUnitsDerivedFromPlacements = {
        val adUnits = for {
          placementId <- toSeq(inventoryTargeting.getTargetedPlacementIds)
        } yield placementAdUnitIds(placementId) map adUnit
        adUnits.flatten
      }

      (directAdUnits ++ adUnitsDerivedFromPlacements).sortBy(_.path.mkString).distinct
    }

    def toCustomTargetSets(criteriaSets: CustomCriteriaSet): Seq[CustomTargetSet] = {

      def toCustomTargetSet(criteria: CustomCriteriaSet): CustomTargetSet = {

        def toCustomTarget(criterion: CustomCriteria) = CustomTarget(
          targetingKey(criterion.getKeyId),
          criterion.getOperator.getValue,
          criterion.getValueIds map targetingValue
        )

        val targets = criteria.getChildren collect {
          case criterion: CustomCriteria => criterion
        } map toCustomTarget
        CustomTargetSet(criteria.getLogicalOperator.getValue, targets)
      }

      criteriaSets.getChildren.collect {
        case criteria: CustomCriteriaSet => criteria
      }.map(toCustomTargetSet).toSeq
    }

    def geoTargets(locations: GeoTargeting => Array[Location]): Seq[GeoTarget] = {

      def toGeoTarget(dfpLocation: Location) = GeoTarget(
        dfpLocation.getId,
        optJavaInt(dfpLocation.getCanonicalParentId),
        dfpLocation.getType,
        dfpLocation.getDisplayName
      )

      Option(dfpTargeting.getGeoTargeting) flatMap { geoTargeting =>
        Option(locations(geoTargeting)) map (_.map(toGeoTarget).toSeq)
      } getOrElse Nil
    }
    val geoTargetsIncluded = geoTargets(_.getTargetedLocations)
    val geoTargetsExcluded = geoTargets(_.getExcludedLocations)

    GuTargeting(
      adUnits = Option(dfpTargeting.getInventoryTargeting) map toGuAdUnits getOrElse Nil,
      geoTargetsIncluded,
      geoTargetsExcluded,
      customTargetSets = Option(dfpTargeting.getCustomTargeting) map toCustomTargetSets getOrElse Nil
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

  def toGuCreativeTemplate(dfpCreativeTemplate: CreativeTemplate): GuCreativeTemplate = {

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

  def toGuTemplateCreative(dfpCreative: TemplateCreative): GuCreative = {

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

    GuCreative(
      id = dfpCreative.getId,
      name = dfpCreative.getName,
      lastModified = toJodaTime(dfpCreative.getLastModifiedDateTime),
      args = Option(dfpCreative.getCreativeTemplateVariableValues).map(_.map(arg)).map(_.toMap).getOrElse(Map.empty),
      templateId = Some(dfpCreative.getCreativeTemplateId),
      snippet = None
    )
  }
}
