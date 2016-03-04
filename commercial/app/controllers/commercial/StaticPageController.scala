package controllers.commercial

import model.{MetaData, GuardianContentTypes, Cached, StandalonePage}
import play.api.mvc.{Action, Controller}

case class StaticSurveySignupPage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
  	id = "survey-simple-sign-up",
  	webTitle = "Survey Simple Sign up",
    section = "global",
    contentType = GuardianContentTypes.Interactive,
    analyticsName = "survey-simple-sign-up",
    shouldGoogleIndex = false
  )
}

case class StaticSurveyMembershipPage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "survey-simple-membership",
    webTitle = "Survey Simple Membership",
    section = "global",
    contentType = GuardianContentTypes.Interactive,
    analyticsName = "survey-simple-membership",
    shouldGoogleIndex = false
  )
}

object StaticPageController extends Controller {

  def renderSurveySimpleSignupPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.surveySimplePageSignup(StaticSurveySignupPage())))
  }

  def renderSurveySimpleMembershipPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.surveySimplePageMembership(StaticSurveyMembershipPage())))
  }
}
