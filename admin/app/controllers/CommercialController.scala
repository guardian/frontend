package controllers.admin

import play.api.mvc.Controller
import common.Logging
import model.NoCache
import controllers.AuthLogging
import conf.Configuration
import tools.Store
import play.api.libs.json.Json
import dfp.Sponsorship

object CommercialController extends Controller with Logging with AuthLogging {

  private def jsValueMaybe(json: Option[String]) = json map Json.parse

  def convertJsonToStringList(json: Option[String]) = {
    jsValueMaybe(json).fold(Seq[String]())(_.as[Seq[String]])
  }

  def convertJsonToSponsorshipList(json: Option[String]) = {
    jsValueMaybe(json).fold(Seq[Sponsorship]())(_.as[Seq[Sponsorship]])
  }

  def renderCommercial = Authenticated { implicit request =>
    val sponsoredTags = convertJsonToSponsorshipList(Store.getDfpSponsoredTags()).sortBy(_.tags.head)
    val advertisementTags = convertJsonToSponsorshipList(Store.getDfpAdvertisementTags()).sortBy(_.tags.head)
    val pageskinnedAdUnits: Seq[String] = convertJsonToStringList(Store.getDfpPageSkinnedAdUnits()).sorted

    NoCache(Ok(views.html.commercial(Configuration.environment.stage, sponsoredTags, advertisementTags, pageskinnedAdUnits)))
  }

}
