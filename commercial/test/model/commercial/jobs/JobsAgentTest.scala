package model.commercial.jobs

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.concurrent.Future
import model.commercial.Keyword
import common.ExecutionContexts

class JobsAgentTest extends FlatSpec with Matchers with ExecutionContexts {

  private def lookUp(jobApiTag: String) = {
    Future(Seq(Keyword("id1", "name1"), Keyword("id2", "name2"), Keyword("id3", "name3")))
  }

  private def stripKeywords(job: Job) = job.copy(keywords = Set())

  "tagWithKeywords" should "give jobs associated with given keywords" in {
    val untaggedJobs = Fixtures.untaggedJobs

    val jobs = JobsAgent.tagWithKeywords(untaggedJobs, lookUp)

    jobs should be(Fixtures.jobs)
  }

  "unchangedJobsAndUntaggedNewJobs" should "partition jobs into those that are already tagged and those that need tagging" in {
    val (unchangedJobs, newUntaggedJobs) =
      JobsAgent.unchangedJobsAndNewUntaggedJobs(newJobs = Fixtures.untaggedJobsLoad2, currJobs = Fixtures.jobs)

    unchangedJobs should be(Seq(Fixtures.jobsLoad2(1), Fixtures.jobsLoad2(2)))
    newUntaggedJobs should be(Seq(stripKeywords(Fixtures.jobsLoad2(0)), stripKeywords(Fixtures.jobsLoad2(3))))
  }

}
