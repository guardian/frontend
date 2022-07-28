package commercial.test

import commercial.model.capi.LookupTest
import commercial.model.merchandise.{books, events, jobs}
import org.scalatest.Suites
import test.SingleServerSuite

class CommercialTestSuite
    extends Suites(
      new books.MagentoBestsellersFeedTest,
      new books.MagentoExceptionTest,
      new jobs.JobTest,
      new events.EventbriteMasterclassFeedParsingTest,
      new events.SingleEventbriteMasterclassParsingTest,
      new LookupTest,
      new books.BookTest,
    )
    with SingleServerSuite {}
