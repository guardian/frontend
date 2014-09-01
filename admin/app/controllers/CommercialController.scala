package controllers.admin

import common.Logging
import conf.Configuration
import controllers.AuthLogging
import dfp.DfpDataHydrator
import model.NoCache
import ophan.SurgingContentAgent
import play.api.mvc.Controller
import tools.Store

object CommercialController extends Controller with Logging with AuthLogging {

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

  def renderSurgingContent = AuthActions.AuthActionTest { implicit request =>
    val surging = SurgingContentAgent.getSurging
    NoCache(Ok(views.html.commercial.surgingpages(Configuration.environment.stage, surging)))
  }

  def renderInlineMerchandisingTargetedTags = AuthActions.AuthActionTest { implicit request =>
    val report = Store.getDfpInlineMerchandisingTargetedTagsReport()
    NoCache(Ok(views.html.commercial.inlineMerchandisingTargetedTags(Configuration.environment.stage, report)))
  }

  def renderCreativeTemplates = AuthActions.AuthActionTest { implicit request =>
    val templates = DfpDataHydrator.loadActiveUserDefinedCreativeTemplates()
    NoCache(Ok(views.html.commercial.templates(Configuration.environment.stage, templates)))
  }
}
