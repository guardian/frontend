package controllers

import common.ExecutionContexts
import conf.Configuration
import model.{Cached, NoCache}
import model.Cached.RevalidatableResult
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Controller}
import staticpages.StaticPages
import scala.concurrent.duration._


class SurveyPageController(wsClient: WSClient) extends Controller with ExecutionContexts {

  val defaultCacheDuration: Duration = 15.minutes

  def renderCustomEmail404Page() = Action { implicit request =>
      Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.survey.customEmail404(StaticPages.simpleSurveyStaticPageForId(request.path))))
   }

  def renderMyDigestExplainerPage() = Action { implicit request =>
      Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.survey.myDigestExplainer(StaticPages.simpleSurveyStaticPageForId(request.path))))
   }

  def renderMyDigest404Page() = Action { implicit request =>
      Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.survey.myDigest404(StaticPages.simpleSurveyStaticPageForId(request.path))))
   }

  def renderWeekendReading404Page() = Action { implicit request =>
      Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.survey.weekendReading404(StaticPages.simpleSurveyStaticPageForId(request.path))))
   }

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
