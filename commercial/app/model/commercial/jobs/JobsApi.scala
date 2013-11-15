package model.commercial.jobs

import scala.concurrent.Future
import common.{Logging, ExecutionContexts}
import org.joda.time.format.DateTimeFormat
import scala.xml.{XML, Elem}
import play.api.libs.ws.WS
import conf.CommercialConfiguration
import model.commercial.Utils.OptString

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
      url =>
        val xml = WS.url(url) withRequestTimeout 60000 get() map {
          response =>
            val body = response.body.replace(0x001b.toChar, ' ')
            XML.loadString(body)
        }

        xml onFailure {
          case e: Exception => log.error(s"Loading job ads failed: ${e.getMessage}")
        }

        xml
    } getOrElse {
      log.warn("No Jobs API config properties set")
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