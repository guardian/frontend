package controllers

import model.Cached.RevalidatableResult
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
        "experience" -> "PRVF9GK",
        "alanis" -> "PR8ZKDF",
        "oliver-burkeman" -> "PR9GC3V"
      ).get(seriesName)
        maybeSurveyId
          .map(id => s"https://www.surveymonkey.co.uk/r/${id}")
          .map(url => Cached(60)(RevalidatableResult.Ok(views.html.surveys404TestNextInSeries(url, metaData)))).getOrElse(Cached.withoutRevalidation(60)(NotFound))
    } else {
      NotFound
    }
  }
}
