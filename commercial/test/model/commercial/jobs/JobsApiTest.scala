package model.commercial.jobs

import common.ExecutionContexts
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.xml.XML

class JobsApiTest extends FlatSpec with Matchers with ExecutionContexts {

  "parse" should "parse all jobs in XML feed" in {
    val jobs = JobsApi.parse(XML.loadString(Fixtures.xml))

    jobs should be(Fixtures.jobs)
  }

}
