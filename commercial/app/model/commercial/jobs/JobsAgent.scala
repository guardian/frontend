package model.commercial.jobs

import common.ExecutionContexts
import model.commercial.AdAgent

object JobsAgent extends AdAgent[Job] with ExecutionContexts {

  def refresh() {
    for {
      jobs <- JobsApi.getJobs
    } updateCurrentAds(jobs)
  }
}
