package controllers.admin

import common.dfp.{GuCreativeTemplate, LineItemReport}
import common.{ExecutionContexts, Logging}
import conf.Configuration
import conf.Configuration.environment
import controllers.AuthLogging
import dfp.{CreativeTemplateAgent, DfpApi}
import model._
import ophan.SurgingContentAgent
import play.api.libs.json.{JsString, Json}
import play.api.mvc.Controller
import tools._

case class CommercialPage() extends StandalonePage {
  override val metadata = MetaData.make(
    id = "commercial-templates",
    section = Some(SectionSummary.fromId("admin")),
    webTitle = "Commercial Templates",
    analyticsName = "Commercial Templates",
    javascriptConfigOverrides = Map(
      "keywordIds" -> JsString("live-better"),
      "adUnit" -> JsString("/59666047/theguardian.com/global-development/ng")))
}

class CommercialController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def renderCommercialMenu() = AuthActions.AuthActionTest { implicit request =>
    NoCache(Ok(views.html.commercial.commercialMenu(environment.stage)))
  }

  def renderFluidAds = AuthActions.AuthActionTest { implicit request =>
    NoCache(Ok(views.html.commercial.fluidAds(environment.stage)))
  }

  def renderSpecialAdUnits = AuthActions.AuthActionTest { implicit request =>
    val specialAdUnits = DfpApi.readSpecialAdUnits(Configuration.commercial.dfpAdUnitGuRoot)
    Ok(views.html.commercial.specialAdUnits(environment.stage, specialAdUnits))
  }

  def renderPaidForTags = AuthActions.AuthActionTest { implicit request =>
    NoCache(Ok(views.html.commercial.paidForTags(environment.stage, Store.getDfpPaidForTags())))
  }

  def renderPageskins = AuthActions.AuthActionTest { implicit request =>
    val pageskinnedAdUnits = Store.getDfpPageSkinnedAdUnits()

    NoCache(Ok(views.html.commercial.pageskins(environment.stage, pageskinnedAdUnits)))
  }

  def renderSurgingContent = AuthActions.AuthActionTest { implicit request =>
    val surging = SurgingContentAgent.getSurging
    NoCache(Ok(views.html.commercial.surgingpages(environment.stage, surging)))
  }

  def renderInlineMerchandisingTargetedTags = AuthActions.AuthActionTest { implicit request =>
    val report = Store.getDfpInlineMerchandisingTargetedTagsReport()
    NoCache(Ok(views.html.commercial.inlineMerchandisingTargetedTags(environment.stage, report)))
  }

  def renderHighMerchandisingTargetedTags = AuthActions.AuthActionTest { implicit request =>
    val report = Store.getDfpHighMerchandisingTargetedTagsReport()
    NoCache(Ok(views.html.commercial.highMerchandisingTargetedTags(environment.stage, report)))
  }

  def renderCreativeTemplates = AuthActions.AuthActionTest { implicit request =>
    val emptyTemplates = CreativeTemplateAgent.get
    val creatives = Store.getDfpTemplateCreatives
    val templates = emptyTemplates.foldLeft(Seq.empty[GuCreativeTemplate]) { (soFar, template) =>
      soFar :+ template.copy(creatives = creatives.filter(_.templateId.get == template.id).sortBy(_.name))
    }.sortBy(_.name)
    NoCache(Ok(views.html.commercial.templates(environment.stage, templates)))
  }

  def renderAdTests = AuthActions.AuthActionTest { implicit request =>
    val report = Store.getDfpLineItemsReport() flatMap (Json.parse(_).asOpt[LineItemReport])

    val lineItemsByAdTest =
      report.map(_.lineItems).getOrElse(Nil)
        .filter(_.targeting.hasAdTestTargetting)
        .groupBy(_.targeting.adTestValue.get)

    val (hasNumericTestValue, hasStringTestValue) =
      lineItemsByAdTest partition { case (testValue, _) =>
      def isNumber(s: String) = s forall Character.isDigit
        isNumber(testValue)
    }

    val sortedGroups = {
      hasNumericTestValue.toSeq.sortBy { case (testValue, _) => testValue.toInt} ++
        hasStringTestValue.toSeq.sortBy { case (testValue, _) => testValue}
    }

    NoCache(Ok(views.html.commercial.adTests(
      environment.stage, report.map(_.timestamp), sortedGroups
    )))
  }

  def renderCommercialRadiator() = AuthActions.AuthActionTest.async { implicit request =>
    for (adResponseConfidenceGraph <- CloudWatch.eventualAdResponseConfidenceGraph) yield {
      Ok(views.html.commercial.commercialRadiator("PROD", adResponseConfidenceGraph))
    }
  }

  def renderKeyValues() = AuthActions.AuthActionTest { implicit request =>
    Ok(views.html.commercial.customTargetingKeyValues("PROD", Store.getDfpCustomTargetingKeyValues))
  }

  def renderKeyValuesCsv(key: String) = AuthActions.AuthActionTest { implicit request =>
    val csv: Option[String] = Store.getDfpCustomTargetingKeyValues.find(_.name == key).map { selectedKey =>

      selectedKey.values.map( targetValue => {
        s"${targetValue.id}, ${targetValue.name}, ${targetValue.displayName}"
      }).mkString("\n")
    }

    Ok(csv.getOrElse(s"No targeting found for key: $key"))
  }
}
