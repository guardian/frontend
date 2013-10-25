package model.commercial.jobs

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import model.commercial.Keyword
import common.ExecutionContexts

class JobsAgentTest extends FlatSpec with Matchers with ExecutionContexts {

  "tagWithKeywords" should "give jobs associated with given keywords" in {
    val untaggedJobs = Fixtures.untaggedJobs
    def lookUp(jobApiTag: String) = {
      Future(Seq(Keyword("id1", "name1"), Keyword("id2", "name2"), Keyword("id3", "name3")))
    }

    val jobs = JobsAgent.tagWithKeywords(untaggedJobs, lookUp)

    val result = Await.result(jobs, 1.second)
    result.size should be(Fixtures.jobs.size)
    result(0).keywords should be(Fixtures.jobs(0).keywords)
    result should be(Fixtures.jobs)
  }

}
