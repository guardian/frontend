package controllers

import model.Cached.{WithoutRevalidationResult, RevalidatableResult}
import play.api.mvc.{Action, Controller}
import scala.concurrent.duration._

class SiteVerificationController extends Controller {

  // A list of accepted accounts.
  private val acceptedGoogleAccounts = List(
    "f2ddac7ca1547968", // Main Guardian channel - https://www.youtube.com/user/TheGuardian
    "bbb4e09fa25b64ba"  // Used by:
      // Football channel - https://www.youtube.com/user/GuardianFootball
      // Owen Jones channel - https://www.youtube.com/channel/UCSYCo8uRGF39qDCxF870K5Q
      // Music channel - https://www.youtube.com/user/GuardianMusic
      // Culture & arts channel - https://www.youtube.com/user/GuardianCultureArts
      // Science & technology channel - https://www.youtube.com/user/gdntech
  )

  def googleSiteVerify(account: String) = Action { implicit request =>
      if (acceptedGoogleAccounts.contains(account)) {
        model.Cached(7.days)(RevalidatableResult.Ok(s"google-site-verification: google$account.html"))
      } else {
        model.Cached(5.minutes)(WithoutRevalidationResult(NotFound))
      }
  }
}
