package controllers

import play.api.mvc.{Action, Controller}
import scala.concurrent.duration._

object SiteVerificationController extends Controller {

  // A list of accepted accounts. Note, the main guardian.com youtube account
  // is not present here, it was already verified using an alternative method (domain).
  private val acceptedGoogleAccounts = List(
    "367bc8736b2b40ff" // Owen Jones
  )

  def googleSiteVerify(account: String) = Action { implicit request =>
      if (acceptedGoogleAccounts.contains(account)) {
        model.Cached(7.days)(Ok(s"google-site-verification: google$account.html"))
      } else {
        model.Cached(5.minutes)(NotFound)
      }
  }
}
