package commercial.model.merchandise.jobs

import commercial.model.merchandise.Job
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.xml.XML

class JobsFeedTest extends AnyFlatSpec with Matchers {

  "parse" should "parse all jobs in XML feed" in {
    val jobs = JobsFeed.parse(XML.loadString(Fixtures.xml))

    jobs should be(Fixtures.jobs)
  }

  "parsed Jobs" should "figure out their industries" in {
    val jobs: Seq[Job] = JobsFeed.parse(XML.loadString(Fixtures.xml))

    jobs.head.mainIndustry should be(Some("Finance & Accounting"))
  }

}
