package model.commercial.jobs

import common.{Logging, ExecutionContexts}
import model.commercial.AdAgent

object JobsAgent extends AdAgent[Industries] with ExecutionContexts with Logging {

  def refresh() {
    for {jobs <- JobsApi.getJobs} {
        updateCurrentAds(populateKeywords(jobs))
    }
  }

  private def populateKeywords(jobs: Seq[Industries]) = jobs.map{ job =>
    val jobKeywords = job.sectorIds.flatMap(Industries.forIndustry).distinct
    job.copy(keywords = jobKeywords)
  }
}
