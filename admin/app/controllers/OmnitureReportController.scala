package controllers.admin

import common.{Logging, ExecutionContexts}
import controllers.AuthLogging
import model.NoCache
import play.api.mvc._

object OmnitureReportController extends Controller with AuthLogging with Logging with ExecutionContexts {

  def getReport(reportName: String)() = AuthActions.AuthActionTest { request =>

    val report = jobs.OmnitureReportJob.getReportOrResult(reportName)

    report match {
      case Right(reportData) => NoCache(Ok(reportData.data))
      case Left(error) => NoCache(Ok(error.getMessage))
    }
  }
}
