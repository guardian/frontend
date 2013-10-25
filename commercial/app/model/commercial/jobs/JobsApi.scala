package model.commercial.jobs

import scala.concurrent.Future
import common.{Logging, ExecutionContexts}
import org.joda.time.format.DateTimeFormat
import scala.xml.Elem
import play.api.libs.ws.WS
import conf.CommercialConfiguration

object JobsApi extends ExecutionContexts with Logging {

  private val dateFormat = DateTimeFormat.forPattern("dd/MM/yyyy HH:mm:ss")

  private def loadXml: Future[Elem] = {

    def buildUrl: Option[String] = {
      for {
        url <- CommercialConfiguration.jobsApi.url
        key <- CommercialConfiguration.jobsApi.key
      } yield s"$url?login=$key"
    }

    buildUrl map {
      WS.url(_) withRequestTimeout 60000 get() map {
        response => response.xml
      }
    } getOrElse {
      log.error("No Jobs API config properties set")
      Future(<jobs/>)
    }
  }

  private def getAllJobs(xml: => Future[Elem] = loadXml): Future[Seq[Job]] = {

    log.info("Loading job ads...")

    val jobs = xml map {
      jobs => (jobs \ "Job") map {
        job =>
          Job(
            (job \ "JobID").text.toInt,
            (job \ "AdType").text,
            dateFormat.parseDateTime((job \ "StartDateTime").text),
            dateFormat.parseDateTime((job \ "EndDateTime").text),
            (job \ "IsPremium").text.toBoolean,
            (job \ "PositionType").text,
            (job \ "JobTitle").text,
            (job \ "ShortJobDescription").text,
            (job \ "SalaryDescription").text,
            OptString((job \ "LocationDescription").text),
            OptString((job \ "RecruiterLogoURL").text),
            OptString((job \ "EmployerLogoURL").text),
            (job \ "JobListingURL").text,
            (job \ "ApplyURL").text,
            ((job \ "Sector" \ "Description") map (_.text)).distinct,
            (job \ "Location" \ "Description") map (_.text)
          )
      }
    }

    for (loadedJobs <- jobs) log.info(s"Loaded ${loadedJobs.size} job ads")

    jobs
  }

  def getCurrentJobs(xml: => Future[Elem] = loadXml): Future[Seq[Job]] = {
    getAllJobs(xml) map (_ filter (_.isCurrent))
  }

}

object OptString {
  def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
}
