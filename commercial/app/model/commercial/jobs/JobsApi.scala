package model.commercial.jobs

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Switches.JobFeedSwitch
import model.commercial._
import org.apache.commons.lang.StringEscapeUtils.unescapeHtml
import org.joda.time._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.xml.{Elem, XML}

object JobsApi extends ExecutionContexts with Logging {

  // url changes daily so cannot be val
  protected def url = {

    /*
     * Using offset time because this appears to be how the URL is constructed.
     * With UTC time we lose the feed for an hour at midnight every day.
     */
    val feedDate = new LocalDateTime(DateTimeZone.forOffsetHours(-1)).toString("yyyy-MM-dd")

    val urlTemplate = CommercialConfiguration.getProperty("jobs.api.url.template")
    urlTemplate map (_ replace("yyyy-MM-dd", feedDate))
  }

  def parse(xml: Elem): Seq[Job] = {
    (xml \ "Job").filterNot(job => (job \ "RecruiterLogoURL").isEmpty).map {
      job =>
        Job(
          (job \ "JobID").text.toInt,
          (job \ "JobTitle").text,
          unescapeHtml((job \ "ShortJobDescription").text),
          OptString((job \ "LocationDescription").text),
          (job \ "RecruiterName").text,
          OptString((job \ "RecruiterPageUrl").text),
          (job \ "RecruiterLogoURL").text,
          ((job \ "Sectors" \ "Sector") map (_.text.toInt)).toSeq,
          (job \ "SalaryDescription").text
        )
    }
  }

  def loadAds(): Future[Seq[Job]] = {
    url map { u =>
      val result = FeedReader.read(FeedRequest(JobFeedSwitch, u, responseEncoding = Some("utf-8"), timeout = 30.seconds)) { body =>
        val xml = XML.loadString(body.dropWhile(_ != '<'))
        parse(xml)
      }
      result map {
        case Left(FeedReadWarning(message)) =>
          log.warn(s"Reading Jobs feed failed: $message")
          Nil
        case Left(FeedReadException(message)) =>
          log.error(s"Reading Jobs feed failed: $message")
          Nil
        case Right(jobs) => jobs
        case other =>
          log.error(s"Something unexpected has happened: $other")
          Nil
      }
    } getOrElse {
      log.warn("Reading Jobs feed failed: missing URL")
      Future.successful(Nil)
    }
  }
}
