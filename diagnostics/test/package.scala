package test

import org.scalatest.Suites

class DiagnosticsTestSuite
    extends Suites(
    )
    with SingleServerSuite {
  override lazy val port: Int = 19007
}
