package controllers.admin

import common.{ImplicitControllerExecutionContext, Logging}
import jobs.VideoEncodingsJob
import model.{ApplicationContext, NoCache}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.mvc._

class ContentPerformanceController(videoEncodingsJob: VideoEncodingsJob, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController with Logging with ImplicitControllerExecutionContext {

  val missingVideoEncodingDateTimeFormat = DateTimeFormat.forPattern("hh:mm::ss")

  def renderVideoEncodingsDashboard(): Action[AnyContent] = Action { implicit request =>

    val videoEncodingsReport = videoEncodingsJob.getReport("missing-encodings")


    videoEncodingsReport match {
      case Some(Nil) => NoCache(Ok(s"There are no reported encodings missing as of: ${missingVideoEncodingDateTimeFormat.print(DateTime.now())}" ))
      case Some(videoEncodings)=> NoCache(Ok(views.html.missingVideoEncodings(videoEncodings)))
      case None => NoCache(Ok("Missing video encoding: report has not yet generated"))
    }
 }
}


