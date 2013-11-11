package model.commercial.jobs

import common.{ExecutionContexts, Logging}
import model.commercial.AdAgent

object JobsAgent extends AdAgent[Job] with ExecutionContexts with Logging {

  def refresh() {
    for {
      jobs <- JobsApi.getCurrentJobs()
    } updateCurrentAds(jobs)
  }

}
