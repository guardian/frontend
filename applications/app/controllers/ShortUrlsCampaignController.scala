package controllers

import play.api.mvc.{Action, Controller}

object ShortUrlsCampaignController extends Controller {

  def fetchCampaignAndRedirect(s: String, campaignCode: String) = Action { implicit request =>

    Ok("TODO")

  }

}
