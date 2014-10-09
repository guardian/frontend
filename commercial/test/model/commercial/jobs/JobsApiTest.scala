package model.commercial.jobs

import common.ExecutionContexts
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.ConfiguredTestSuite
import scala.xml.XML

@DoNotDiscover class JobsApiTest extends FlatSpec with Matchers with ExecutionContexts with ConfiguredTestSuite {

  "parse" should "parse all jobs in XML feed" in {
    val jobs = JobsApi.parse(XML.loadString(Fixtures.xml))

    jobs should be(Fixtures.jobs)
  }

  "parsed Jobs" should "figure out their industries" in {
    val jobs: Seq[Job] = JobsApi.parse(XML.loadString(Fixtures.xml))

    jobs.head.mainIndustry should be(Some("Finance & Accounting"))
  }

}
