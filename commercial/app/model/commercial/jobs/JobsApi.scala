package model.commercial.jobs

import scala.concurrent.Future
import org.joda.time.format.DateTimeFormat
import scala.xml.Elem
import conf.CommercialConfiguration
import model.commercial.Utils.OptString
import model.commercial.XmlAdsApi

object JobsApi extends XmlAdsApi[Job] {

  protected val adTypeName = "Jobs"

  private lazy val optUrl = CommercialConfiguration.getProperty("jobs.api.url")
  private lazy val optKey = CommercialConfiguration.getProperty("jobs.api.key")

  override protected val loadTimeout = 60000

  private val dateFormat = DateTimeFormat.forPattern("dd/MM/yyyy HH:mm:ss")

  override def cleanResponseBody(body: String) = body.replace(0x001b.toChar, ' ')

  private def loadJobs: Future[Seq[Job]] = loadAds {
    for {
      url <- optUrl
      key <- optKey
    } yield s"$url?login=$key"
  }

  def parse(xml: Elem): Seq[Job] = {
    (xml \ "Job") map {
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

  def getCurrentJobs(allJobs: Future[Seq[Job]] = loadJobs): Future[Seq[Job]] = {
    allJobs map (_ filter (_.isCurrent))
  }
}
