package test

import java.util.{ List => JList }
import controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, Suites}

import collection.JavaConversions._

object `package` {

  implicit class ListString2FirstNonEmpty(list: JList[String]) {
    lazy val firstNonEmpty: Option[String] = list find { !_.isEmpty }
  }
}

class ArchiveTestSuite extends Suites (
  new ArchiveControllerTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {

  override lazy val port: Int = new HealthCheck(wsClient).testPort
}
