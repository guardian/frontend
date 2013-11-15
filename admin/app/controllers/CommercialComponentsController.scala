package controllers.admin

import conf.Configuration
import play.api.mvc.{ Action, Controller }

object CommercialComponentsController extends Controller {

  def renderCommercialComponents() = Authenticated { request =>
    Ok(views.html.commercial_components(Configuration.environment.stage))
  }
}
