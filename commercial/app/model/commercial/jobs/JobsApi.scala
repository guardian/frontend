package model.commercial.jobs

import scala.concurrent.Future
import scala.xml.Elem
import conf.CommercialConfiguration
import model.commercial.Utils.OptString
import model.commercial.XmlAdsApi
import org.joda.time.format.DateTimeFormat

object JobsApi extends XmlAdsApi[Industries] {

  protected val adTypeName = "Jobs"

  override protected val characterEncoding = "utf-8"

  // url changes daily so cannot be val
  private def url = {
    val feedDate = DateTimeFormat.forPattern("yyyy-MM-dd").print(System.currentTimeMillis)
    val urlTemplate = CommercialConfiguration.getProperty("jobs.api.url.template")
    urlTemplate map (_ replace("yyyy-MM-dd", feedDate))
  }

  override protected val loadTimeout = 20000

  override def cleanResponseBody(body: String) = body.dropWhile(_ != '<')

  def parse(xml: Elem): Seq[Industries] = {
    (xml \ "Job") map {
      job =>
        Industries(
          (job \ "JobID").text.toInt,
          (job \ "JobTitle").text,
          (job \ "ShortJobDescription").text,
          (job \ "RecruiterName").text,
          OptString((job \ "RecruiterLogoURL").text),
          ((job \ "Sectors" \ "Sector") map (_.text.toInt)).toSeq
        )
    }
  }

  def getJobs: Future[Seq[Industries]] = loadAds(url)
}
