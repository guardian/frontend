package controllers.admin

import common.Logging
import controllers.AuthLogging
import dfp._
import model.NoCache
import play.api.libs.json.Json
import play.api.mvc.Controller
import tools.Store

object CommercialHelper extends Controller with Logging with AuthLogging {

  private def jsValueMaybe(json: Option[String]) = json map Json.parse

  def convertJsonToStringList(json: Option[String]) = {
    jsValueMaybe(json).fold(Seq[String]())(_.as[Seq[String]])
  }

  def convertJsonToSponsorshipList(json: Option[String]) = {
    jsValueMaybe(json).fold(Seq[Sponsorship]())(_.as[Seq[Sponsorship]])
  }

  def targets() = Authenticated { request =>
    val sponsoredTags = convertJsonToSponsorshipList(Store.getDfpSponsoredTags()).sortBy(_.tags.head)
    val advertisementTags = convertJsonToSponsorshipList(Store.getDfpAdvertisementTags()).sortBy(_.tags.head)
    val pageskinnedAdUnits: Seq[String] = convertJsonToStringList(Store.getDfpPageSkinnedAdUnits()).sorted

    NoCache(Ok(views.html.commercialReports.targets("PROD", sponsoredTags, advertisementTags, pageskinnedAdUnits)))
  }

  def activeLineItems() = Authenticated { request =>
    NoCache(Ok(views.html.commercialReports.lineitems("PROD")))
  }
}
