package controllers.admin

import common.dfp.{GuCreativeTemplate, GuCustomField, GuLineItem}
import common.{ImplicitControllerExecutionContext, JsonComponent, Logging}
import conf.Configuration
import dfp.{AdvertiserAgent, CreativeTemplateAgent, CustomFieldAgent, DfpApi, DfpDataExtractor, OrderAgent}
import model._
import services.ophan.SurgingContentAgent
import play.api.libs.json.{JsString, Json}
import play.api.mvc._
import tools._

import scala.concurrent.duration._
import scala.util.Try

case class CommercialPage() extends StandalonePage {
  override val metadata = MetaData.make(
    id = "commercial-templates",
    section = Some(SectionId.fromId("admin")),
    webTitle = "Commercial Templates",
    javascriptConfigOverrides = Map(
      "keywordIds" -> JsString("live-better"),
      "adUnit" -> JsString("/59666047/theguardian.com/global-development/ng")))
}

class CommercialController(val controllerComponents: ControllerComponents,
                           createTemplateAgent: CreativeTemplateAgent,
                           advertiserAgent: AdvertiserAgent,
                           orderAgent: OrderAgent,
                           customFieldAgent: CustomFieldAgent,
                           dfpApi: DfpApi)(implicit context: ApplicationContext)
   extends BaseController with Logging with ImplicitControllerExecutionContext {

  def renderCommercialMenu(): Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.commercial.commercialMenu()))
  }

  def renderFluidAds: Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.commercial.fluidAds()))
  }

  def renderSpecialAdUnits: Action[AnyContent] = Action { implicit request =>
    val specialAdUnits = dfpApi.readSpecialAdUnits(Configuration.commercial.dfpAdUnitGuRoot)
    Ok(views.html.commercial.specialAdUnits(specialAdUnits))
  }

  def renderPageskins: Action[AnyContent] = Action { implicit request =>
    val pageskinnedAdUnits = Store.getDfpPageSkinnedAdUnits()

    NoCache(Ok(views.html.commercial.pageskins(pageskinnedAdUnits)))
  }

  def renderSurgingContent: Action[AnyContent] = Action { implicit request =>
    val surging = SurgingContentAgent.getSurging
    NoCache(Ok(views.html.commercial.surgingpages(surging)))
  }

  def renderInlineMerchandisingTargetedTags: Action[AnyContent] = Action { implicit request =>
    val report = Store.getDfpInlineMerchandisingTargetedTagsReport()
    NoCache(Ok(views.html.commercial.inlineMerchandisingTargetedTags(report)))
  }

  def renderHighMerchandisingTargetedTags: Action[AnyContent] = Action { implicit request =>
    val report = Store.getDfpHighMerchandisingTargetedTagsReport()
    NoCache(Ok(views.html.commercial.highMerchandisingTargetedTags(report)))
  }

  def renderCreativeTemplates: Action[AnyContent] = Action { implicit request =>
    val emptyTemplates = createTemplateAgent.get
    val creatives = Store.getDfpTemplateCreatives
    val templates = emptyTemplates.foldLeft(Seq.empty[GuCreativeTemplate]) { (soFar, template) =>
      soFar :+ template.copy(creatives = creatives.filter(_.templateId.get == template.id).sortBy(_.name))
    }.sortBy(_.name)
    NoCache(Ok(views.html.commercial.templates(templates)))
  }

  def renderCustomFields: Action[AnyContent] = Action { implicit request =>

    val fields: Seq[GuCustomField] = customFieldAgent.get.data.values.toSeq
    NoCache(Ok(views.html.commercial.customFields(fields)))

  }

  def renderAdTests: Action[AnyContent] = Action { implicit request =>
    val report = Store.getDfpLineItemsReport()

    val lineItemsByAdTest = report.lineItems
      .filter(_.targeting.hasAdTestTargetting)
      .groupBy(_.targeting.adTestValue.get)

    val (hasNumericTestValue, hasStringTestValue) =
      lineItemsByAdTest partition { case (testValue, _) =>
        def isNumber(s: String) = s forall Character.isDigit

        isNumber(testValue)
      }

    val sortedGroups = {
      hasNumericTestValue.toSeq.sortBy { case (testValue, _) => testValue.toInt } ++
        hasStringTestValue.toSeq.sortBy { case (testValue, _) => testValue }
    }

    NoCache(Ok(views.html.commercial.adTests(report.timestamp, sortedGroups)))
  }

  def renderCommercialRadiator(): Action[AnyContent] = Action.async { implicit request =>
    for (adResponseConfidenceGraph <- CloudWatch.eventualAdResponseConfidenceGraph()) yield {
      Ok(views.html.commercial.commercialRadiator(adResponseConfidenceGraph))
    }
  }

  def getLineItemsForOrder(orderId: String): Action[AnyContent] = Action { implicit request =>
    val lineItems: Seq[GuLineItem] = Store.getDfpLineItemsReport().lineItems filter (_.orderId.toString == orderId)

    Cached(5.minutes){
      JsonComponent(Json.toJson(lineItems))
    }
  }

  def getCreativesListing(lineitemId: String, section: String): Action[AnyContent] = Action { implicit request: RequestHeader =>

    val validSections: List[String] = List("uk", "lifeandstyle", "sport", "science")

    val previewUrls: Seq[String] =
      (for {
        lineItemId <- Try(lineitemId.toLong).toOption
        validSection <- validSections.find(_ == section)
      } yield {
        dfpApi.getCreativeIds(lineItemId) flatMap (dfpApi.getPreviewUrl(lineItemId, _, s"https://theguardian.com/$validSection"))
      }) getOrElse Nil

    Cached(5.minutes) {
      JsonComponent(Json.toJson(previewUrls))
    }
  }

  def renderBrowserPerformanceDashboard(): Action[AnyContent] = Action { implicit request =>
    Ok(views.html.commercial.performance.browserDashboard())
  }

  def renderKeyValues(): Action[AnyContent] = Action { implicit request =>
    Ok(views.html.commercial.customTargetingKeyValues(Store.getDfpCustomTargetingKeyValues))
  }

  def renderKeyValuesCsv(key: String): Action[AnyContent] = Action { implicit request =>
    val csv: Option[String] = Store.getDfpCustomTargetingKeyValues.find(_.name == key).map { selectedKey =>

      selectedKey.values.map( targetValue => {
        s"${targetValue.id}, ${targetValue.name}, ${targetValue.displayName}"
      }).mkString("\n")
    }

    Ok(csv.getOrElse(s"No targeting found for key: $key"))
  }

  def renderInvalidItems(): Action[AnyContent] = Action { implicit request =>
    // If the invalid line items are run through the normal extractor, we can see if any of these
    // line items appear to be targeting Frontend.
    val invalidLineItems: Seq[GuLineItem] = Store.getDfpLineItemsReport().invalidLineItems
    val invalidItemsExtractor = DfpDataExtractor(invalidLineItems, Nil)

    val advertisers = advertiserAgent.get
    val orders = orderAgent.get
    val sonobiAdvertiserId = advertisers.find(_.name.toLowerCase =="sonobi").map(_.id).getOrElse(0L)
    val sonobiOrderIds = orders.filter(_.advertiserId == sonobiAdvertiserId).map(_.id)

    // Sort line items into groups where possible, and bucket everything else.
    val pageskins = invalidItemsExtractor.pageSkinSponsorships
    val topAboveNav = invalidItemsExtractor.topAboveNavSlotTakeovers
    val highMerch = invalidItemsExtractor.targetedHighMerchandisingLineItems.items

    val groupedItems = invalidLineItems.groupBy {
      case item if sonobiOrderIds.contains(item.orderId) => "sonobi"
      case _ => "unknown"
    }

    val sonobiItems = groupedItems.getOrElse("sonobi", Seq.empty)
    val invalidItemsMap = GuLineItem.asMap(invalidLineItems)

    val unidentifiedLineItems = invalidItemsMap.keySet -- pageskins.map(_.lineItemId) -- topAboveNav.map(_.id) -- highMerch.map(_.id) -- sonobiItems.map(_.id)

    Ok(views.html.commercial.invalidLineItems(
      pageskins,
      topAboveNav,
      highMerch,
      sonobiItems,
      unidentifiedLineItems.toSeq.map(invalidItemsMap)))
  }
}
