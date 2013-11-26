package model.commercial.jobs

import common.{ExecutionContexts, Logging}
import model.commercial.AdAgent
import scala.concurrent.Future
import scala.util.Try
import play.api.Play
import services.S3
import scala.xml.XML
import play.api.Play.current

object JobsAgent extends AdAgent[Job] with ExecutionContexts with Logging {

  def refresh() {

    val currentJobs =
      if (Play.isDev) {
        val jobAdData = Try(S3.get("DEV/commercial/job-ads.xml")) getOrElse None
        Future {
          jobAdData.map {
            content =>
              val xml = XML.loadString(content)
              JobsApi.parse(xml)
          }.getOrElse(Nil)
        }
      }
      else JobsApi.getCurrentJobs()

    for {
      jobs <- currentJobs
    } updateCurrentAds(jobs)
  }

}
