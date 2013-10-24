package model.commercial.jobs

import scala.concurrent.{Await, Future}
import common.ExecutionContexts
import scala.concurrent.duration._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.xml.XML

class JobsApiTest extends FlatSpec with Matchers with ExecutionContexts {

  "getAllJobs" should "load all jobs from XML feed" in {
    val jobs = JobsApi.getAllJobs(Future {
      XML.loadString(Fixtures.xml)
    })

    Await.result(jobs, atMost = 1.seconds) should be(Fixtures.untaggedJobs)
  }

}
