package model.commercial.jobs

import common.{ExecutionContexts, AkkaAgent}
import model.commercial.{MerchandiseAgent, Segment}

object JobsAgent extends ExecutionContexts {

  private lazy val agent = AkkaAgent[Seq[Job]](Nil)

  private def defaultJobs = agent() filter (_.industries.contains("Media"))

  def jobsTargetedAt(segment: Segment): Seq[Job] = {
    MerchandiseAgent.getTargetedMerchandise(segment, agent(), defaultJobs) {
      _.isTargetedAt(segment)
    }
  }
  
  def specificJobs(jobIdStrings: Seq[String]): Seq[Job] = {
    val jobIds = jobIdStrings map (_.toInt)
    agent() filter (job => jobIds contains job.id)
  }

  def refresh() {

    def populateKeywords(jobs: Seq[Job]) = jobs.map { job =>
      val jobKeywordIds = job.sectorIds.flatMap(Industries.forIndustry).distinct
      job.copy(keywordIds = jobKeywordIds)
    }

    for {freshJobs <- JobsApi.loadAds()} {
      MerchandiseAgent.updateAvailableMerchandise(agent, populateKeywords(freshJobs))
    }
  }

}
