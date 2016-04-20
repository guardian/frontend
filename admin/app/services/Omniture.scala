package services.Omniture

import common.{Logging, ExecutionContexts}
import conf.OmnitureCredentials
import org.apache.commons.codec.binary.Base64
import org.joda.time.{DateTimeZone, DateTime}
import play.api.libs.json._
import play.api.libs.ws.{WSResponse, WS}
import scala.concurrent.{Promise, Future}
import scala.concurrent.duration._

case class OmnitureException(message: String) extends RuntimeException(message)

trait OmnitureResponse {
  def response: String
  val timeReceived = new DateTime(DateTimeZone.UTC)
}
case class OmnitureReportData(data: JsValue) extends OmnitureResponse {
  override val response = data.toString()
}
object OmnitureMethods {
  val QUEUE_OVERTIME  = "Report.QueueOvertime"
  val QUEUE_RANKED    = "Report.QueueRanked"
}

// dateGranularity is one of 'hour', 'day', 'week', 'month', 'quarter' or 'year'. Not supported by Ranked Reports (use None).
// dateTo and dateFrom are in the format '2014-12-25'.
case class OmnitureReportDescription(
  dateGranularity: Option[String],
  dateTo: String,
  dateFrom: String,
  metrics: Seq[OmnitureMetric],
  reportSuiteID: String = OmnitureReportDescription.reportSuiteNetwork,
  segment_id: Option[String] = None
)
object OmnitureReportDescription {

  implicit val writeMetric = Json.writes[OmnitureMetric]
  implicit val writeDescription = Json.writes[OmnitureReportDescription]

  val reportSuiteNetwork  = "guardiangu-network"  // Friendly name: Guardian Network
}

// A metric specifies the type of event data captured in the report,
// A metric 'id' is typically 'visitors', 'pageViews', 'visits', etc.
//
// Ranked and Overtime reports support one or more metrics per report,
// Trended reports support only one metric per report.
case class OmnitureMetric(id: String)

case class OmnitureSegment(
  id: String,
  name: String,
  folder: String,
  `class`: String,
  suite_enabled: Boolean,
  read_only: Boolean
)
object OmnitureSegment {
  implicit val reads = Json.reads[OmnitureSegment]
  implicit val writes = Json.writes[OmnitureSegment]
}

object Omniture extends ExecutionContexts with Logging {

  import OmnitureInternalMethods._
  import play.api.Play.current

  private object OmnitureInternalMethods {
    val GET_STATUS      = "Report.GetStatus"
    val GET_REPORT      = "Report.GetReport"
    val GET_SEGMENTS    = "ReportSuite.GetSegments"
  }
  sealed case class OmnitureError(override val response: String) extends OmnitureResponse
  sealed case class ReportId(id: Int)
  sealed case class OmnitureQueueOvertime(status: String, statusMsg: String, reportID: Int) extends OmnitureResponse {
    override val response = status
  }
  private object OmnitureQueueOvertime {
    implicit val jsonReads = Json.reads[OmnitureQueueOvertime]
  }
  sealed case class OmnitureGetStatus(status: String, queue_time: String, report_type: String, result_size: String, error_code: String, error_msg: String) extends OmnitureResponse {
    override val response = status
  }
  private object OmnitureGetStatus {
    implicit val jsonReads = Json.reads[OmnitureGetStatus]
  }
  sealed case class OmnitureHeader(userName: String, passwordDigest: String, nonce: String, created: String) {
    override def toString() = s"""UsernameToken Username="$userName", PasswordDigest="$passwordDigest", Nonce="$nonce", Created="$created" """
  }

  // A Report description is passed to Omniture so that it can generate an analytics report.
  // There are three kinds of report method:
  // - Overtime
  //  supports multiple metrics but only one preset element, 'datetime'. This means you must specify at least one metric,
  //  and no elements.
  //  supports hourly reporting (and up)
  // - Ranked
  //  ranks pages in relation to the metric. This means you must specify at least one metric, and at least one element.
  //  one number (per metric) for the entire reporting period
  //  only supports daily, weekly and monthly reporting
  //  does not support date granularity
  // - Trended
  //  movement of a single element and metric over time (e.g. visits to world news over time). This means you must specify
  //  precisely one metric and one element.
  //  supports hourly reporting (and up)
  def generateReport(reportDescription: OmnitureReportDescription, reportMethod: String): Future[OmnitureReportData] = {

    val body = Json.obj("reportDescription" -> Json.toJson(reportDescription))

    val queueReport: Future[OmnitureResponse] = postRequest(reportMethod, body).map { response =>
      response.status match {
        case 200 => Json.parse(response.body).validate[OmnitureQueueOvertime].asOpt.getOrElse(OmnitureError(response.body))
        case _ => throw OmnitureException(response.body)
      }
    }

    val waitReport: Future[ReportId] = queueReport.flatMap {
      case reportQueue: OmnitureQueueOvertime if reportQueue.status == "queued" => wait(reportQueue.reportID)
      case reportQueue: OmnitureQueueOvertime => Future.failed(OmnitureException(reportQueue.statusMsg))
      case error => Future.failed(OmnitureException(s"Unexpected response: ${error.toString}"))
    }

    waitReport.flatMap { getReportData }
  }

  private def postRequest(method: String, body: JsValue, apiVersion: String = "1.3"): Future[WSResponse] = {
    omnitureCredentials.map { credentials => {
      WS.url(s"https://api.omniture.com/admin/$apiVersion/rest/")
        .withHeaders(("X-WSSE", makeHeader(credentials).toString))
        .withQueryString(("method", method))
        .post(body)
      }
    }.getOrElse {
      Future.failed(OmnitureException("No Omniture credentials configured"))
    }
  }

  private lazy val omnitureCredentials = conf.AdminConfiguration.omnitureCredentials
  private def makeHeader(credentials: OmnitureCredentials): OmnitureHeader = {
    val createdDate = new DateTime(DateTimeZone.UTC)
    val created = createdDate.toString("yyyy-MM-dd'T'HH:mm:ss'Z'")

    val nonce = createdDate.getMillis.toString

    val message = nonce + created + credentials.secret
    val messageDigest = java.security.MessageDigest.getInstance("SHA-1")

    val base64password = Base64.encodeBase64String(messageDigest.digest(message.getBytes("UTF-8")))
    val base64nonce = Base64.encodeBase64String(nonce.toString.getBytes("UTF-8"))

    OmnitureHeader(credentials.userName, base64password, base64nonce, created)
  }

  private def wait(reportId: Int): Future[ReportId] = {
    val promise = Promise[ReportId]()
    waitForReport(reportId, 20, promise)
    promise.future
  }

  private def waitForReport(reportId: Int, attemptsLeft: Int, promise: Promise[ReportId]) {

    val body = Json.parse( s"""{"reportID" : $reportId}""").asInstanceOf[JsObject]

    akka.pattern.after(2.seconds, actorSystem.scheduler)(postRequest(GET_STATUS, body)).map { response =>

      val result = response.status match {
        case 200 => Json.parse(response.body).validate[OmnitureGetStatus].asOpt.orElse(Some(OmnitureError(response.body)))
        case _ => Some(OmnitureError(s"Omniture returned: ${response.status}, body:${response.body}"))
      }

      // There are three outcomes: success, failure or retry.
      result match {
        case Some(status: OmnitureGetStatus) if status.status == "done" => promise.success(ReportId(reportId))
        case Some(status: OmnitureGetStatus) if attemptsLeft == 0 => promise.failure(OmnitureException(s"Timed out.\n status: ${status.status}\n error_msg:${status.error_msg}"))
        case Some(error: OmnitureError) => promise.failure(OmnitureException(error.response))
        case None => promise.failure(OmnitureException(s"response was not understood: ${response.body}}"))
        case _ => waitForReport(reportId, attemptsLeft - 1, promise)
      }
    }
    .recover {
      case error: Throwable => promise.failure(error)
    }
  }

  private def getReportData(reportId: ReportId): Future[OmnitureReportData] = {

    val body = Json.parse( s"""{"reportID" : ${reportId.id}}""").asInstanceOf[JsObject]

    postRequest(GET_REPORT, body).map { response =>
      response.status match {
        case 200 => OmnitureReportData(Json.parse(response.body))
        case _ => throw OmnitureException(s"Omniture returned: ${response.status}, body:${response.body}")
      }
    }
  }

  def getSegmentIds(rsid : String): Future[Seq[OmnitureSegment]] = {

    val body = Json.parse(s"""{"rsid_list":["$rsid"]}""").asInstanceOf[JsObject]

    // Only version 1.4 has the latest segments for the report suites.
    postRequest(GET_SEGMENTS, body, "1.4").map { response =>
      response.status match {
        case 200 => {
          val segments = Json.parse(response.body).asInstanceOf[JsArray](0) \ "segments"
          segments.validate[Seq[OmnitureSegment]] match {
            case JsSuccess(segments, _) => segments
            case JsError(e) => throw OmnitureException(JsError.toJson(e).toString())
          }
        }
        case _ => throw OmnitureException(s"Omniture returned: ${response.status}, body:${response.body}")
      }
    }
  }
}
