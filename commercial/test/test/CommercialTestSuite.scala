package commercial.test

import commercial.model.capi.LookupTest
import commercial.model.merchandise.{events, jobs}
import org.scalatest.Suites
import test.SingleServerSuite

class CommercialTestSuite
    extends Suites(
      new jobs.JobTest,
      new events.EventbriteMasterclassFeedParsingTest,
      new events.SingleEventbriteMasterclassParsingTest,
      new LookupTest,
    )
    with SingleServerSuite {}
