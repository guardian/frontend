package model.commercial.jobs

import scala.concurrent.Future
import common.{Logging, ExecutionContexts}
import scala.xml.{XML, Elem}
import play.api.libs.ws.WS
import conf.CommercialConfiguration

object LightJobsApi extends ExecutionContexts with Logging {

  private def loadXml: Future[Elem] = {

    def buildUrl: Option[String] = {
      for {
        url <- CommercialConfiguration.jobsApi.lightFeedUrl
      } yield s"$url"
    }

    buildUrl map {
      url =>
        val xml = WS.url(url) withRequestTimeout 10000 get() map {
          response =>
            val body = response.body dropWhile (_ != '<')
            XML.loadString(body)
        }

        xml onFailure {
          case e: Exception => log.error(s"Loading job ads failed: ${e.getMessage}")
        }

        xml
    } getOrElse {
      log.error("No Jobs API config properties set")
      Future(<jobs/>)
    }
  }

  def getCurrentJobs(xml: => Future[Elem] = loadXml): Future[Seq[LightJob]] = {

    log.info("Loading job ads...")

    val jobs = xml map {
      jobs => (jobs \ "Job") map {
        job =>
          LightJob(
            (job \ "JobID").text.toInt,
            (job \ "JobTitle").text,
            (job \ "ShortJobDescription").text,
            (job \ "RecruiterName").text,
            OptString((job \ "RecruiterLogoURL").text),
            ((job \ "Sectors" \ "Sector") map (_.text.toInt)).toSet
          )
      }
    }

    for (loadedJobs <- jobs) log.info(s"Loaded ${loadedJobs.size} job ads")

    jobs
  }

}
