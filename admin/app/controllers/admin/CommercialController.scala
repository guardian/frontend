package controllers.admin

import common.dfp.LineItemReport
import common.{Edition, ExecutionContexts, Logging}
import conf.Configuration.environment
import conf.LiveContentApi.getResponse
import conf.{Configuration, LiveContentApi}
import controllers.AuthLogging
import dfp.DfpDataHydrator
import model._
import ophan.SurgingContentAgent
import play.api.libs.json.{JsString, JsValue, Json}
import play.api.mvc.Controller
import tools._
import services.FaciaContentConvert

case class CommercialPage() extends StandalonePage {
  override val metadata = MetaData.make(
    id = "commercial-templates",
    section = "admin",
    webTitle = "Commercial Templates",
    analyticsName = "Commercial Templates",
    javascriptConfigOverrides = Map(
      "keywordIds" -> JsString("live-better"),
      "adUnit" -> JsString("/59666047/theguardian.com/global-development/ng")))
}

object CommercialController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def renderCommercialMenu() = AuthActions.AuthActionTest { request =>
    NoCache(Ok(views.html.commercial.commercialMenu(environment.stage)))
  }

  def renderCommercial = AuthActions.AuthActionTest { implicit request =>
    NoCache(Ok(views.html.commercial.commercial(environment.stage)))
  }

  def renderFluidAds = AuthActions.AuthActionTest { implicit request =>
    NoCache(Ok(views.html.commercial.fluidAds(environment.stage)))
  }

  def renderSpecialAdUnits = AuthActions.AuthActionTest { implicit request =>
    val specialAdUnits = DfpDataHydrator().loadSpecialAdunits(Configuration.commercial.dfpAdUnitRoot)
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

  def renderCreativeTemplates = AuthActions.AuthActionTest { implicit request =>
    val templates = Store.getDfpCreativeTemplates
    NoCache(Ok(views.html.commercial.templates(environment.stage, templates)))
  }

  def sponsoredContainers = AuthActions.AuthActionTest.async { implicit request =>
    // get some example trails
    lazy val trailsFuture = getResponse(
      LiveContentApi.search(Edition(request))
        .pageSize(2)
    ).map { response  =>
      response.results.map { item =>
        FaciaContentConvert.contentToFaciaContent(item)
      }
    }
    trailsFuture map { trails =>
      NoCache(Ok(views.html.commercial.sponsoredContainers(environment.stage, CommercialPage(), trails)))
    }
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
}
