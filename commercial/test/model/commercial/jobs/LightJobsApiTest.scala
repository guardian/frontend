package model.commercial.jobs

import common.ExecutionContexts
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.xml.XML

class LightJobsApiTest extends FlatSpec with Matchers with ExecutionContexts {

  "parse" should "parse all jobs in XML feed" in {
    val jobs = LightJobsApi.parse(XML.loadString(LightFixtures.xml))

    jobs should be(LightFixtures.jobs)
  }

}
