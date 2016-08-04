package controllers.admin

import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import jobs.VideoEncodingsJob
import model.NoCache
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.libs.ws.WSClient
import play.api.mvc._

class ContentPerformanceController(videoEncodingsJob: VideoEncodingsJob) extends Controller with AuthLogging with Logging with ExecutionContexts {

  val missingVideoEncodingDateTimeFormat = DateTimeFormat.forPattern("hh:mm::ss")

  def renderVideoEncodingsDashboard() = Action { implicit request =>

    val videoEncodingsReport = videoEncodingsJob.getReport("missing-encodings")


    videoEncodingsReport match {
      case Some(Nil) => NoCache(Ok(s"There are no reported encodings missing as of: ${missingVideoEncodingDateTimeFormat.print(DateTime.now())}" ))
      case Some(videoEncodings)=> NoCache(Ok( views.html.missingVideoEncodings( "PROD", videoEncodings) ) )
      case None => NoCache(Ok("Missing video encoding: report has not yet generated"))
    }
 }
}


