package controllers

import common._
import model._
import play.api.mvc.{Action, Controller}
import model.MetaData

class emailLandingPage() extends MetaData {
  lazy val id: String = "email-landing-page"
  lazy val section: String = ""
  lazy val analyticsName: String = id
  lazy val webTitle: String = "Email Landing Page"
}

case class EmailPage (interactive: Interactive, related: RelatedContent)

object EmailController extends Controller with ExecutionContexts {

  def renderPage() = Action { implicit request =>
    val emailLandingHtml = views.html.emailLanding(new emailLandingPage())
    Ok(emailLandingHtml)
  }

}
