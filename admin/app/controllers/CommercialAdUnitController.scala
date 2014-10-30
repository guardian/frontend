package controllers.admin

import play.api.mvc.Controller
import common.Logging
import model.NoCache
import controllers.AuthLogging
import conf.Configuration
import dfp.{DfpDataHydrator}
import scala.util.{Failure, Success}

object CommercialAdUnitController extends Controller with Logging with AuthLogging {

  def renderToApprove = AuthActions.AuthActionTest { implicit request =>
    val adunits = DfpDataHydrator().loadAdUnitsForApproval(Configuration.commercial.dfpAdUnitRoot)

    NoCache(Ok(views.html.commercial.adunitsforapproval(Configuration.environment.stage,
      Configuration.commercial.dfpAccountId, adunits.take(200), adunits.size)))
  }

  def approve = AuthActions.AuthActionTest { implicit request =>
    val adUnitIds = request.body.asFormUrlEncoded.map { pair => pair.keys}.getOrElse(Nil)

    val result = DfpDataHydrator().approveTheseAdUnits(adUnitIds)
    result match {
      case Success(message) => Redirect(routes.CommercialAdUnitController.renderToApprove).flashing(
        "success" -> s"$message")

      case Failure(e) => Redirect(routes.CommercialAdUnitController.renderToApprove).flashing(
        "failure" -> s"$e")
    }
  }
}