package controllers.admin

import common.{Logging, ExecutionContexts}
import controllers.AuthLogging
import model.NoCache
import play.api.libs.json.{JsArray, Json}
import play.api.mvc._

object OmnitureReportController extends Controller with AuthLogging with Logging with ExecutionContexts {

  def getReport(reportName: String) = AuthActions.AuthActionTest { _ =>

    val report = jobs.OmnitureReportJob.getReportOrResult(reportName)

    report match {
      case Right(reportData) => NoCache(Ok(reportData.data))
      case Left(error) => NoCache(Ok(error.getMessage))
    }
  }

  def getSegments() = AuthActions.AuthActionTest.async { _ =>

    services.Omniture.Omniture.getSegmentIds().map { segments =>
      NoCache(Ok(JsArray(segments.map(Json.toJson(_)))))
    }
  }
}
