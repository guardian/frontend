package model.commercial.jobs

import conf.{CommercialConfiguration, Switches}
import model.commercial.{OptString, XmlAdsApi}
import org.apache.commons.lang.StringEscapeUtils.unescapeHtml
import org.joda.time.format.DateTimeFormat

import scala.xml.Elem

object JobsApi extends XmlAdsApi[Job] {

  protected val switch = Switches.JobFeedSwitch

  protected val adTypeName = "Jobs"

  override protected val characterEncoding = "utf-8"

  // url changes daily so cannot be val
  protected def url = {
    val feedDate = DateTimeFormat.forPattern("yyyy-MM-dd").withZoneUTC().print(System.currentTimeMillis)
    val urlTemplate = CommercialConfiguration.getProperty("jobs.api.url.template")
    urlTemplate map (_ replace("yyyy-MM-dd", feedDate))
  }

  override protected val loadTimeout = 30000

  override def cleanResponseBody(body: String) = body.dropWhile(_ != '<')

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
}
