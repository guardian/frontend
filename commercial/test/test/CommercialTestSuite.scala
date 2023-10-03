package commercial.test

import commercial.model.capi.LookupTest
import commercial.model.merchandise.jobs
import org.scalatest.Suites
import test.SingleServerSuite

class CommercialTestSuite
    extends Suites(
      new jobs.JobTest,
      new LookupTest,
    )
    with SingleServerSuite {}
