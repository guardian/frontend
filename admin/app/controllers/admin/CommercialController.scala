package controllers.admin

import common.{Edition, ExecutionContexts, Logging}
import conf.Configuration.environment
import conf.{Configuration, LiveContentApi}
import controllers.AuthLogging
import dfp.{GuLineItem, DfpDataHydrator, LineItemReport}
import model.{Content, NoCache, Page}
import ophan.SurgingContentAgent
import play.api.libs.json.{JsString, JsValue, Json}
import play.api.mvc.Controller
import tools.Store

object CommercialController extends Controller with Logging with AuthLogging with ExecutionContexts {
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

  def renderSponsorships = AuthActions.AuthActionTest { implicit request =>
    val sponsoredTags = Store.getDfpSponsoredTags()
    val advertisementTags = Store.getDfpAdFeatureTags()
    val foundationSupportedTags = Store.getDfpFoundationSupportedTags()

    NoCache(Ok(views.html.commercial.sponsorships(environment.stage, sponsoredTags, advertisementTags, foundationSupportedTags)))
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

  def renderCreativeTemplates = AuthActions.AuthActionTest.async { implicit request =>
    val templates = DfpDataHydrator().loadActiveUserDefinedCreativeTemplates()
    // get some example trails
    lazy val trailsFuture = LiveContentApi.search(Edition(request))
      .pageSize(2)
      .response.map { response  =>
        response.results.map {
          Content(_)
        }
    }
    trailsFuture map { trails =>
      NoCache(Ok(views.html.commercial.templates(environment.stage, templates, trails)))
    }
  }

  def sponsoredContainers = AuthActions.AuthActionTest.async { implicit request =>
    // get some example trails
    lazy val trailsFuture = LiveContentApi.search(Edition(request))
      .pageSize(2)
      .response.map { response  =>
      response.results.map {
        Content(_)
      }
    }
    trailsFuture map { trails =>
      object CommercialPage {
        def apply() = new Page("commercial-templates", "admin", "Commercial Templates", "Commercial Templates", None, None) {
          override def metaData: Map[String, JsValue] = super.metaData ++ List("keywordIds" -> JsString("live-better"))
        }
      }
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

}
