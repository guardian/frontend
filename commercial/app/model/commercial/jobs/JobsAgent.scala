package model.commercial.jobs

import common.ExecutionContexts
import model.commercial._

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

    for {freshJobs <- JobsApi.loadAds()} updateAvailableMerchandise(populateKeywords(freshJobs))
  }

}
