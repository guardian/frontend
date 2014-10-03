package model.commercial.jobs

import common.ExecutionContexts
import model.commercial.{MerchandiseAgent, Segment}

object JobsAgent extends MerchandiseAgent[Job] with ExecutionContexts {

  def jobsTargetedAt(segment: Segment): Seq[Job] = {

    def defaultJobs = available filter (_.industries.contains("Media"))

    getTargetedMerchandise(segment, defaultJobs) {
      _.isTargetedAt(segment)
    }
  }
  
  def specificJobs(jobIdStrings: Seq[String]): Seq[Job] = {
    val jobIds = jobIdStrings map (_.toInt)
    available filter (job => jobIds contains job.id)
  }

  def refresh() {

    def populateKeywords(jobs: Seq[Job]) = jobs.map { job =>
      val jobKeywordIds = job.sectorIds.flatMap(Industries.forIndustry).distinct
      job.copy(keywordIds = jobKeywordIds)
    }

    for {freshJobs <- JobsApi.loadAds()} updateAvailableMerchandise(populateKeywords(freshJobs))
  }

}
