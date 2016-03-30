package controllers.commercial

import model.{MetaData, GuardianContentTypes, Cached, StandalonePage}
import play.api.mvc.{Action, Controller}

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

// These are three new membership proposition variants for testing
case class StaticGuardianExplainPage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "guardian-explain",
    webTitle = "Guardian Explain",
    section = "global",
    contentType = GuardianContentTypes.Interactive,
    analyticsName = "guardian-explain",
    shouldGoogleIndex = false
  )
}

case class StaticGuardianExplorePage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "guardian-explore",
    webTitle = "Guardian Explore",
    section = "global",
    contentType = GuardianContentTypes.Interactive,
    analyticsName = "guardian-explore",
    shouldGoogleIndex = false
  )
}

case class StaticGuardianExperiencePage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "guardian-experience",
    webTitle = "Guardian Experience",
    section = "global",
    contentType = GuardianContentTypes.Interactive,
    analyticsName = "guardian-experience",
    shouldGoogleIndex = false
  )
}

object StaticPageController extends Controller {

  def renderSubscriberNumberPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.subscriberNumberPage(SubscriberNumberPage().metadata)))
  }

  // Membership Tests
  def renderGuardianExplainPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.guardianExplainPage(StaticGuardianExplainPage().metadata)))
  }

  def renderGuardianExplorePage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.guardianExplorePage(StaticGuardianExplorePage().metadata)))
  }

  def renderGuardianExperiencePage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.guardianExperiencePage(StaticGuardianExperiencePage().metadata)))
  }
}
