package model.commercial.jobs

import scala.concurrent.{Await, Future}
import common.ExecutionContexts
import scala.concurrent.duration._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.xml.XML

class LightJobsApiTest extends FlatSpec with Matchers with ExecutionContexts {

  "getCurrentJobs" should "load all unexpired jobs from XML feed" in {
    val jobs = LightJobsApi.getCurrentJobs(Future {
      XML.loadString(LightFixtures.xml)
    })

    Await.result(jobs, atMost = 1.seconds) should be(LightFixtures.jobs)
  }

}
