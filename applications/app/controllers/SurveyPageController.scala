package controllers

import model.Cached
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, Controller}


object SurveyPageController extends Controller {

  def renderSimpleSurveyPage() = Action { implicit request =>
      Cached(60)(RevalidatableResult.Ok(views.html.survey.simpleSurveyPage()))
   }

  def renderFormStackSurvey() = Action { implicit request =>
      Cached(60)(RevalidatableResult.Ok(views.html.survey.formstackSurvey()))
   }
}
