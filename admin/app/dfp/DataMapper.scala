package dfp

import com.google.api.ads.admanager.axis.v202108._
import common.dfp._
import dfp.ApiHelper.{isPageSkin, optJavaInt, toJodaTime, toSeq}

// These mapping functions use libraries that are only available in admin to create common DFP data models.
class DataMapper(
    adUnitService: AdUnitService,
    placementService: dfp.PlacementService,
    customTargetingService: dfp.CustomTargetingService,
    customFieldService: dfp.CustomFieldService,
) {

  def toGuAdUnit(dfpAdUnit: AdUnit): GuAdUnit = {
    val ancestors = toSeq(dfpAdUnit.getParentPath)
    val ancestorNames = if (ancestors.isEmpty) Nil else ancestors.tail.map(_.getName)
    GuAdUnit(dfpAdUnit.getId, ancestorNames :+ dfpAdUnit.getName, dfpAdUnit.getStatus.getValue)
  }

  private def toGuTargeting(session: SessionWrapper)(dfpTargeting: Targeting): GuTargeting = {

    def toIncludedGuAdUnits(inventoryTargeting: InventoryTargeting): Seq[GuAdUnit] = {

      //noinspection MapFlatten
      val directAdUnits =
        toSeq(inventoryTargeting.getTargetedAdUnits).map(_.getAdUnitId).map(adUnitService.activeAdUnit).flatten

      //noinspection MapFlatten
      val adUnitsDerivedFromPlacements = {
        toSeq(inventoryTargeting.getTargetedPlacementIds).map(placementService.placementAdUnitIds(session)).flatten
      }

      (directAdUnits ++ adUnitsDerivedFromPlacements).sortBy(_.path.mkString).distinct
    }

    def toExcludedGuAdUnits(inventoryTargeting: InventoryTargeting): Seq[GuAdUnit] = {
      toSeq(inventoryTargeting.getExcludedAdUnits).map(_.getAdUnitId).flatMap(adUnitService.activeAdUnit)
    }

    def toCustomTargetSets(criteriaSets: CustomCriteriaSet): Seq[CustomTargetSet] = {

      def toCustomTargetSet(criteria: CustomCriteriaSet): CustomTargetSet = {

        def toCustomTarget(criterion: CustomCriteria) =
          CustomTarget(
            customTargetingService.targetingKey(session)(criterion.getKeyId),
            criterion.getOperator.getValue,
            criterion.getValueIds map (valueId =>
              customTargetingService.targetingValue(session)(criterion.getKeyId, valueId),
            ),
          )

        val targets = criteria.getChildren collect {
          case criterion: CustomCriteria => criterion
        } map toCustomTarget
        CustomTargetSet(criteria.getLogicalOperator.getValue, targets)
      }

      criteriaSets.getChildren
        .collect {
          case criteria: CustomCriteriaSet => criteria
        }
        .map(toCustomTargetSet)
        .toSeq
    }

    def geoTargets(locations: GeoTargeting => Array[Location]): Seq[GeoTarget] = {

      def toGeoTarget(dfpLocation: Location) =
        GeoTarget(
          dfpLocation.getId,
          optJavaInt(dfpLocation.getCanonicalParentId),
          dfpLocation.getType,
          dfpLocation.getDisplayName,
        )

      Option(dfpTargeting.getGeoTargeting) flatMap { geoTargeting =>
        Option(locations(geoTargeting)) map (_.map(toGeoTarget).toSeq)
      } getOrElse Nil
    }
    val geoTargetsIncluded = geoTargets(_.getTargetedLocations)
    val geoTargetsExcluded = geoTargets(_.getExcludedLocations)

    GuTargeting(
      adUnitsIncluded = Option(dfpTargeting.getInventoryTargeting) map toIncludedGuAdUnits getOrElse Nil,
      adUnitsExcluded = Option(dfpTargeting.getInventoryTargeting) map toExcludedGuAdUnits getOrElse Nil,
      geoTargetsIncluded,
      geoTargetsExcluded,
      customTargetSets = Option(dfpTargeting.getCustomTargeting) map toCustomTargetSets getOrElse Nil,
    )
  }

  private def toGuCreativePlaceholders(session: SessionWrapper)(dfpLineItem: LineItem): Seq[GuCreativePlaceholder] = {

    def creativeTargeting(name: String): Option[GuTargeting] = {
      for (targeting <- toSeq(dfpLineItem.getCreativeTargetings) find (_.getName == name)) yield {
        toGuTargeting(session)(targeting.getTargeting)
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

  def toGuLineItem(session: SessionWrapper)(dfpLineItem: LineItem): GuLineItem =
    GuLineItem(
      id = dfpLineItem.getId,
      orderId = dfpLineItem.getOrderId,
      name = dfpLineItem.getName,
      lineItemType = GuLineItemType.fromDFPLineItemType(dfpLineItem.getLineItemType.getValue),
      startTime = toJodaTime(dfpLineItem.getStartDateTime),
      endTime = {
        if (dfpLineItem.getUnlimitedEndDateTime) None
        else Some(toJodaTime(dfpLineItem.getEndDateTime))
      },
      isPageSkin = isPageSkin(dfpLineItem),
      sponsor = customFieldService.sponsor(dfpLineItem),
      creativePlaceholders = toGuCreativePlaceholders(session)(
        dfpLineItem,
      ),
      targeting = toGuTargeting(session)(dfpLineItem.getTargeting),
      status = dfpLineItem.getStatus.toString,
      costType = dfpLineItem.getCostType.toString,
      lastModified = toJodaTime(dfpLineItem.getLastModifiedDateTime),
    )

  def toGuCreativeTemplate(dfpCreativeTemplate: CreativeTemplate): GuCreativeTemplate = {

    def toParameter(param: CreativeTemplateVariable) =
      GuCreativeTemplateParameter(
        parameterType = param.getClass.getSimpleName.stripSuffix("CreativeTemplateVariable"),
        label = param.getLabel,
        isRequired = param.getIsRequired,
        description = Option(param.getDescription),
      )

    GuCreativeTemplate(
      id = dfpCreativeTemplate.getId,
      name = dfpCreativeTemplate.getName,
      description = dfpCreativeTemplate.getDescription,
      parameters = Option(dfpCreativeTemplate.getVariables)
        .map { params =>
          (params map toParameter).toSeq
        }
        .getOrElse(Nil),
      snippet = dfpCreativeTemplate.getSnippet,
      creatives = Nil,
      isNative = dfpCreativeTemplate.getIsNativeEligible,
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
      snippet = None,
      previewUrl = Some(dfpCreative.getPreviewUrl),
    )
  }

  def toGuOrder(dfpOrder: Order): GuOrder = {
    GuOrder(
      id = dfpOrder.getId,
      name = dfpOrder.getName,
      advertiserId = dfpOrder.getAdvertiserId,
    )
  }
  def toGuAdvertiser(dfpCompany: Company): GuAdvertiser = {

    GuAdvertiser(
      id = dfpCompany.getId,
      name = dfpCompany.getName,
    )
  }
}

object DataMapper {
  def toGuCustomFieldOption(option: CustomFieldOption): GuCustomFieldOption =
    GuCustomFieldOption(option.getId, option.getDisplayName)

  def toGuCustomField(dfpCustomField: CustomField): GuCustomField = {
    val options: List[GuCustomFieldOption] = {
      dfpCustomField match {
        case dropdown: DropDownCustomField => dropdown.getOptions.toList
        case _                             => Nil
      }
    } map toGuCustomFieldOption

    GuCustomField(
      dfpCustomField.getId,
      dfpCustomField.getName,
      dfpCustomField.getDescription,
      dfpCustomField.getIsActive,
      dfpCustomField.getEntityType.getValue,
      dfpCustomField.getDataType.getValue,
      dfpCustomField.getVisibility.getValue,
      options,
    )
  }
}
