package model.commercial.jobs

import common.ExecutionContexts
import model.commercial._

import scala.util.control.NonFatal

object JobsAgent extends MerchandiseAgent[Job] with ExecutionContexts {

  def jobsTargetedAt(segment: Segment): Seq[Job] = {
    def defaultJobs = available filter (_.industries.contains("Media"))
    getTargetedMerchandise(segment, defaultJobs) { job =>
      Keyword.idSuffixesIntersect(segment.context.keywords, job.keywordIdSuffixes)
    }
  }

  def specificJobs(jobIdStrings: Seq[String]): Seq[Job] = {
    val jobIds = jobIdStrings map (_.toInt)
    available filter (job => jobIds contains job.id)
  }

  def refresh(): Unit = {

    def populateKeywords(jobs: Seq[Job]) = jobs.map { job =>
      val jobKeywordIds = job.sectorIds.flatMap(Industries.forIndustry).distinct
      job.copy(keywordIdSuffixes = jobKeywordIds map Keyword.getIdSuffix)
    }

    JobsFeed.loadAds() map { freshJobs =>
      updateAvailableMerchandise(populateKeywords(freshJobs))
    } recover {
      case e: FeedSwitchOffException =>
        log.warn(e.getMessage)
        Nil
      case e: FeedMissingConfigurationException =>
        log.warn(e.getMessage)
        Nil
      case NonFatal(e) =>
        log.error(e.getMessage)
        Nil
    }
  }
}
