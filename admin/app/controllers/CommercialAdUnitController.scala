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

object CommercialAdUnitController extends Controller with Logging with AuthLogging {

  def renderToApprove = Authenticated { implicit request =>
    val adunits = DfpDataHydrator.loadAdUnitsForApproval(Configuration.commercial.dfpAdUnitRoot)

    NoCache(Ok(views.html.commercial.adunitsforapproval(Configuration.environment.stage, Configuration.commercial.dfpAccountId, adunits)))
  }
}
