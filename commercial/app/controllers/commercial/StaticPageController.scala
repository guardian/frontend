package controllers.commercial

import model.{MetaData, GuardianContentTypes, Cached, StandalonePage}
import play.api.mvc.{Action, Controller}

case class StaticSurveyPage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
  	id = "survey-simple",
  	webTitle = "Survey Simple",
    section = "global",
    contentType = GuardianContentTypes.Interactive,
    analyticsName = "survey-simple",
    shouldGoogleIndex = false
  )
}

object StaticPageController extends Controller {

  def renderSurveySimplePage() = Action { implicit request =>
    //Cached(60)(Ok(views.html.static.surveySimplePage(StaticSurveyPage())))
    Ok(views.html.static.surveySimplePage(StaticSurveyPage()))
  }
}