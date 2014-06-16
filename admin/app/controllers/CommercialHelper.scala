package controllers.admin

import play.api.mvc.Controller
import common.Logging
import conf.Configuration
import model.NoCache
import controllers.AuthLogging
import tools.Store
import play.api.libs.json.{JsValue, Json}


object CommercialHelper extends Controller with Logging with AuthLogging {

  def convertJsonToStringList(json: Option[String]) = {
    val jsValueMaybe: Option[JsValue] = json.map(Json.parse(_))
    jsValueMaybe.fold(Seq[String]())(_.as[Seq[String]])
  }

  def targets() = Authenticated { request =>
    val sponsoredTags = convertJsonToStringList(Store.getDfpSponsoredTags())
    val advertisementTags = convertJsonToStringList(Store.getDfpAdvertisementTags())
    val pageskinnedAdUnits: Seq[String] = convertJsonToStringList(Store.getDfpPageSkinnedAdUnits())

    NoCache(Ok(views.html.commercial.targets("PROD", sponsoredTags, advertisementTags, pageskinnedAdUnits)))
  }

  def activeLineItems() = Authenticated { request =>
    NoCache(Ok(views.html.commercial.pageskins("PROD")))
  }
}
