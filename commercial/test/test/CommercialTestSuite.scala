package commercial.test

import commercial.model.capi.LookupTest
import org.scalatest.Suites
import test.SingleServerSuite

class CommercialTestSuite
    extends Suites(
      new LookupTest,
    )
    with SingleServerSuite {}
