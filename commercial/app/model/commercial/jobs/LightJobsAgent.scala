package model.commercial.jobs

import common.{ExecutionContexts, Logging}
import model.commercial.AdAgent

object LightJobsAgent extends AdAgent[LightJob] with ExecutionContexts with Logging {

  def refresh() {
    for {
      jobs <- LightJobsApi.getCurrentJobs
    } updateCurrentAds(jobs)
  }

}
