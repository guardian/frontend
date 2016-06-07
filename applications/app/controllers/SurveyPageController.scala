package controllers

import common.ExecutionContexts
import model.{NoCache, Cached}
import model.Cached.RevalidatableResult
import play.api.libs.ws.WS
import play.api.mvc.{Action, Controller}


object SurveyPageController extends Controller with ExecutionContexts {

  import play.api.Play.current

  def renderSimpleSurveyPage() = Action { implicit request =>
      Cached(60)(RevalidatableResult.Ok(views.html.survey.simpleSurveyPage()))
   }

  def renderFormStackSurvey(formName: String) = Action.async { implicit request =>
      WS.url(s"https://guardiannewsampampmedia.formstack.com/forms/$formName")
        .head
        .map { headResponse =>
          headResponse.status match {
            case 200 =>
              Cached(60)(RevalidatableResult.Ok(views.html.survey.formstackSurvey(formName)))
            case _ =>
              NoCache(NotFound)}}}
}
