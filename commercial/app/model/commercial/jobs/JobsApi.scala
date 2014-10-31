package model.commercial.jobs

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Switches.JobFeedSwitch
import model.commercial.{FeedReader, FeedRequest, OptString}
import org.apache.commons.lang.StringEscapeUtils.unescapeHtml
import org.joda.time._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.xml.{XML, Elem}

object JobsApi extends ExecutionContexts with Logging {

  // url changes daily so cannot be val
  def url = {
    val feedDate = new LocalDateTime(DateTimeZone.UTC).toString("yyyy-MM-dd")
    val urlTemplate = CommercialConfiguration.getProperty("jobs.api.url.template")
    urlTemplate map (_ replace("yyyy-MM-dd", feedDate))
  }

  def parse(xml: Elem): Seq[Job] = {
    (xml \\ "Job").filterNot(job => (job \ "RecruiterLogoURL").isEmpty).map {
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
    FeedReader.readSeq[Job](FeedRequest("Jobs", JobFeedSwitch, url, responseEncoding = Some("utf-8"), timeout = 30.seconds)) { body =>
      parse(XML.loadString(body.dropWhile(_ != '<')))
    }
  }

}
