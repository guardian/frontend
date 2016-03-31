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
    if (conf.switches.Switches.ABNextInSeries.isSwitchedOn) {
      val maybeSurveyId: Option[String] = Map(
        "experience" -> "7WNLHSS"
      ).get(seriesName)
      Cached(60) {
        maybeSurveyId
          .map(id => s"https://www.surveymonkey.co.uk/r/${id}")
          .map(url => Ok(views.html.surveys404TestNextInSeries(url, metaData))).getOrElse(NotFound)
      }
    } else {
      NotFound
    }
  }
}
