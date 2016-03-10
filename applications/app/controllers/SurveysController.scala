package controllers

import model._
import play.api.mvc.{Controller, Action}

object SurveysController extends Controller {
  val metaData = MetaData.make(
    id = "surveys-404-test-next-in-series",
    section = "",
    analyticsName = "surveys-404-test-next-in-series",
    webTitle = "You’ve found our ‘Remind me’ prototype"
  )
  def render404TestNextInSeries(seriesName: String) = Action { implicit request =>
    val maybeSurveyId: Option[String] = Map(
      "experience" -> "guardian-reminder-experience",
      "alanis"-> "guardian-reminder-alanis",
      "blind-date" -> "guardian-reminder-blinddate",
      "what-im-really-thinking" -> "guardian-reminder-whatimreallythinking",
      "yotam" -> "guardian-reminder-yotam"
    ).get(seriesName)
    maybeSurveyId
      .map(id => s"https://www.surveymonkey.co.uk/r/${id}")
      .map(url => Ok(views.html.surveys404TestNextInSeries(url, metaData))).getOrElse(NotFound)
  }
}
