package model.commercial.jobs

import scala.concurrent.Future
import scala.xml.Elem
import conf.CommercialConfiguration
import model.commercial.Utils.OptString
import model.commercial.XmlAdsApi

object LightJobsApi extends XmlAdsApi[LightJob] {

  val adTypeName = "Jobs"

  override protected val loadTimeout = 10000

  override def cleanResponseBody(body: String) = body.dropWhile(_ != '<')

  def parse(xml: Elem): Seq[LightJob] = {
    (xml \ "Job") map {
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

  def getCurrentJobs: Future[Seq[LightJob]] = loadAds {
    for {url <- CommercialConfiguration.jobsApi.lightFeedUrl} yield s"$url"
  }
}
