package controllers.admin

import common.Logging
import conf.Configuration
import controllers.AuthLogging
import dfp.Sponsorship
import model.NoCache
import ophan.SurgingContentAgent
import play.api.libs.json.Json
import play.api.mvc.Controller
import tools.Store

object CommercialController extends Controller with Logging with AuthLogging {

  private def jsValueMaybe(json: Option[String]) = json map Json.parse

  def convertJsonToStringList(json: Option[String]) = {
    jsValueMaybe(json).fold(Seq[String]())(_.as[Seq[String]])
  }

  def convertJsonToSponsorshipList(json: Option[String]) = {
    jsValueMaybe(json).fold(Seq[Sponsorship]())(_.as[Seq[Sponsorship]])
  }

  def renderCommercial = AuthActions.AuthActionTest { implicit request =>
    NoCache(Ok(views.html.commercial.commercial(Configuration.environment.stage)))
  }

  def renderSponsorships = AuthActions.AuthActionTest { implicit request =>
    val sponsoredTags = Store.getDfpSponsoredTags()
    val advertisementTags = Store.getDfpAdvertisementTags()

    NoCache(Ok(views.html.commercial.sponsorships(Configuration.environment.stage, sponsoredTags, advertisementTags)))
  }

  def renderPageskins = AuthActions.AuthActionTest { implicit request =>
    val pageskinnedAdUnits = Store.getDfpPageSkinnedAdUnits()

    NoCache(Ok(views.html.commercial.pageskins(Configuration.environment.stage, pageskinnedAdUnits)))
  }

  def renderSurgingContent = AuthActions.AuthActionTest {implicit request =>
    val surging: Seq[(String, Int)] = SurgingContentAgent.getSurging.toSeq
    val sortedSurging: Seq[(String, Int)] = surging.sortBy(_._2).reverse

    NoCache(Ok(views.html.commercial.surgingpages(Configuration.environment.stage, sortedSurging)))
  }

  def renderInlineMerchandisingSponsorships = AuthActions.AuthActionTest { implicit request =>
    val sponsorships = Store.getDfpInlineMerchandisingSponsorships()
    NoCache(Ok(views.html.commercial.inlineMerchandisingSponsorships(Configuration.environment.stage, sponsorships)))
  }
}
