package controllers

import common.ImplicitControllerExecutionContext
import conf.Configuration
import model.{ApplicationContext, Cached, NoCache}
import model.Cached.RevalidatableResult
import play.api.libs.ws.WSClient
import play.api.mvc.{BaseController, ControllerComponents}
import staticpages.StaticPages

import scala.concurrent.duration._

class SurveyPageController(
  wsClient: WSClient,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext {

  val defaultCacheDuration: Duration = 15.minutes

  def renderFormStackSurvey(formName: String) = Action.async { implicit request =>
      wsClient.url(s"https://${Configuration.Survey.formStackAccountName}.formstack.com/forms/$formName")
        .head
        .map { headResponse =>
          headResponse.status match {
            case 200 =>
              Cached(defaultCacheDuration)(RevalidatableResult.Ok(
                views.html.survey.formstackSurvey(formName, StaticPages.simpleSurveyStaticPageForId(request.path))))
            case _ =>
              NoCache(NotFound)}}}

  def thankYou() = Action { implicit request =>
    Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.survey.thankyou(StaticPages.simpleSurveyStaticPageForId(request.path))))
  }

  def quickSurvey() = Action { implicit request =>
    Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.survey.quickSurvey(StaticPages.simpleSurveyStaticPageForId(request.path))))
  }
}
