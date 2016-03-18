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

case class SubscriberNumberPage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "subscriber-number-page",
    webTitle = "Subscriber number form",
    section = "global",
    contentType = GuardianContentTypes.NetworkFront,
    analyticsName = "subscriber-number-page",
    shouldGoogleIndex = false
  )
}

object StaticPageController extends Controller {

  def renderSurveySimpleSignupPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.surveySimplePage(StaticSurveySignupPage().metadata)))
  }

  def renderSurveySimpleMembershipPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.surveySimplePage(StaticSurveyMembershipPage().metadata)))
  }

  def renderSubscriberNumberPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.subscriberNumberPage(SubscriberNumberPage().metadata)))
  }
}
