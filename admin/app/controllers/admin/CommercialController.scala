package controllers.admin

import common.dfp.LineItemReport
import common.{Edition, ExecutionContexts, Logging}
import conf.Configuration.environment
import conf.LiveContentApi.getResponse
import conf.{Configuration, LiveContentApi}
import controllers.AuthLogging
import dfp.DfpDataHydrator
import model.{Content, NoCache, Page}
import ophan.SurgingContentAgent
import play.api.libs.json.{JsString, JsValue, Json}
import play.api.mvc.Controller
import tools._

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

  def renderCreativeTemplates = AuthActions.AuthActionTest.async { implicit request =>
    val templates = DfpDataHydrator().loadActiveUserDefinedCreativeTemplates()
    // get some example trails
    lazy val trailsFuture = getResponse(
      LiveContentApi.search(Edition(request))
        .pageSize(2)
    ).map { response  =>
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
    lazy val trailsFuture = getResponse(
      LiveContentApi.search(Edition(request))
        .pageSize(2)
    ).map { response  =>
      response.results.map {
        Content(_)
      }
    }
    trailsFuture map { trails =>
      object CommercialPage {
        def apply() = new Page("commercial-templates", "admin", "Commercial Templates", "Commercial Templates", None, None) {
          override def metaData: Map[String, JsValue] = super.metaData ++
            List(
              "keywordIds" -> JsString("live-better"),
              "adUnit" -> JsString("/59666047/theguardian.com/global-development/ng")
            )
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

  def renderCommercialRadiator() = AuthActions.AuthActionTest.async { implicit request =>
    for (adResponseConfidenceGraph <- CloudWatch.eventualAdResponseConfidenceGraph) yield {
      Ok(views.html.commercial.commercialRadiator("PROD", adResponseConfidenceGraph))
    }
  }
}
