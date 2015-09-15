package model.commercial.jobs

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.switches.Switches.JobFeedSwitch
import model.commercial.{FeedMissingConfigurationException, FeedReader, FeedRequest}
import org.joda.time._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.xml.{Elem, XML}

object JobsFeed extends ExecutionContexts with Logging {

  // url changes daily so cannot be val
  def maybeUrl = {

    /*
     * Using offset time because this appears to be how the URL is constructed.
     * With UTC time we lose the feed for 2 hours at midnight every day.
     */
    val feedDate = new DateTime(DateTimeZone.forOffsetHours(-2)).toString("yyyy-MM-dd")

    val urlTemplate = CommercialConfiguration.getProperty("jobs.api.url.template")
    urlTemplate map (_ replace("yyyy-MM-dd", feedDate))
  }

  def parse(xml: Elem): Seq[Job] = for {
    jobXml <- xml \\ "Job"
    if (jobXml \ "RecruiterLogoURL").nonEmpty
    if (jobXml \ "RecruiterName").text != "THE GUARDIAN MASTERCLASSES"
  } yield Job(jobXml)

  def loadAds(): Future[Seq[Job]] = {
    maybeUrl map { url =>
    val request = FeedRequest(
      feedName = "Jobs",
      switch = JobFeedSwitch,
      url,
      responseEncoding = Some("utf-8"),
      timeout = 30.seconds
    )
    FeedReader.readSeq[Job](request) { body =>
      parse(XML.loadString(body.dropWhile(_ != '<')))
    }
    } getOrElse {
      log.warn(s"Missing URL for Jobs feed")
      Future.failed(FeedMissingConfigurationException("Jobs"))
    }
  }

}
