package integration.commercial

import integration.SingleWebDriver
import org.scalatest.Suites

class CommercialTestSuite extends Suites(new AdsTest) with SingleWebDriver
