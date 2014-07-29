package controllers.admin

import play.api.mvc.Controller
import common.Logging
import model.{AdReports, NoCache}
import controllers.AuthLogging
import conf.Configuration
import tools.Store
import play.api.libs.json.Json
import dfp.{DfpDataHydrator, SponsorshipReport, Sponsorship}
import implicits.Dates
import org.joda.time.DateTime
import ophan.SurgingContentAgent
import scala.util.{Failure, Success, Try}

object CommercialAdUnitController extends Controller with Logging with AuthLogging {

  def renderToApprove = Authenticated { implicit request =>
    val adunits = DfpDataHydrator.loadAdUnitsForApproval(Configuration.commercial.dfpAdUnitRoot)

    NoCache(Ok(views.html.commercial.adunitsforapproval(Configuration.environment.stage,
      Configuration.commercial.dfpAccountId, adunits.take(200), adunits.size)))
  }

  def approve = Authenticated { implicit request =>
    val adUnitIds = request.body.asFormUrlEncoded.map { pair => pair.keys}.getOrElse(Nil)

    val result = DfpDataHydrator.approveTheseAdUnits(adUnitIds)
    result match {
      case Success(message) => NoCache(Ok(message))
      case Failure(e) => NoCache(InternalServerError(e.getMessage))
    }
  }
}