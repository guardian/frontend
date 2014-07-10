package controllers.admin

import play.api.mvc.Controller
import common.Logging
import model.{AdReports, NoCache}
import controllers.AuthLogging
import conf.Configuration
import tools.Store
import play.api.libs.json.Json
import dfp.{SponsorshipReport, Sponsorship}
import implicits.Dates
import org.joda.time.DateTime
import ophan.SurgingContentAgent

object CommercialController extends Controller with Logging with AuthLogging {

  private def jsValueMaybe(json: Option[String]) = json map Json.parse

  def convertJsonToStringList(json: Option[String]) = {
    jsValueMaybe(json).fold(Seq[String]())(_.as[Seq[String]])
  }

  def convertJsonToSponsorshipList(json: Option[String]) = {
    jsValueMaybe(json).fold(Seq[Sponsorship]())(_.as[Seq[Sponsorship]])
  }

  def renderCommercial = Authenticated { implicit request =>
    NoCache(Ok(views.html.commercial.commercial(Configuration.environment.stage)))
  }

  def renderSponsorships = Authenticated { implicit request =>
    val sponsoredTags = Store.getDfpSponsoredTags()
    val advertisementTags = Store.getDfpAdvertisementTags()

    NoCache(Ok(views.html.commercial.sponsorships(Configuration.environment.stage, sponsoredTags, advertisementTags)))
  }

  def renderPageskins = Authenticated { implicit request =>
    val pageskinnedAdUnits = Store.getDfpPageSkinnedAdUnits()

    NoCache(Ok(views.html.commercial.pageskins(Configuration.environment.stage, pageskinnedAdUnits)))
  }

  def renderSurgingContent = Authenticated {implicit request =>
    val surging: Seq[(String, Int)] = SurgingContentAgent.getSurging.toSeq
    val sortedSurging: Seq[(String, Int)] = surging.sortBy(_._2).reverse

    NoCache(Ok(views.html.commercial.surgingpages(Configuration.environment.stage, sortedSurging)))
  }


}
