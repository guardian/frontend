package controllers.commercial

import model.Cached
import play.api.mvc.{Action, Controller}

object StaticPageController extends Controller {

  def renderAdFreeSurveyPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.adFreeSurveyPage()))
  }
}
