package model.commercial.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}

object JobsAgent extends ExecutionContexts with Logging {

  private lazy val agent = AkkaAgent[Seq[Job]](Nil)

  def allJobs: Seq[Job] = agent()

  def refresh() {
    // TODO tag with keywords
    JobsApi.getAllJobs() map agent.send
  }

}
