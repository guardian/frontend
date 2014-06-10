package model.commercial.jobs

import common.{Logging, ExecutionContexts}
import model.commercial.AdAgent

object JobsAgent extends AdAgent[Job] with ExecutionContexts with Logging {

  override def defaultAds = currentAds filter (_.industries.contains("Media"))

  def refresh() {
    for {jobs <- JobsApi.loadAds()} {
      updateCurrentAds(populateKeywords(jobs))
    }
  }

  private def populateKeywords(jobs: Seq[Job]) = jobs.map {
    job =>
      val jobKeywordIds = job.sectorIds.flatMap(Industries.forIndustry).distinct
      job.copy(keywordIds = jobKeywordIds)
  }
}
