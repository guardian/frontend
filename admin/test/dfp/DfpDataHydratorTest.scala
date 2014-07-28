package dfp

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{Matchers, FlatSpec}
import common.ExecutionContexts
import conf.Configuration

class DfpDataHydratorTest extends FlatSpec with Matchers with ExecutionContexts {
  "hydrator" should "hydrate" in {
    val result = DfpDataHydrator.loadAdUnitsForApproval(Configuration.commercial.dfpAdUnitRoot)

    result.size should equal(55)
  }
}
