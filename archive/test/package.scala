package test

import java.util.{ List => JList }
import org.scalatest.Suites
import collection.JavaConversions._

object `package` {

  implicit class ListString2FirstNonEmpty(list: JList[String]) {
    lazy val firstNonEmpty: Option[String] = list find { !_.isEmpty }
  }
}

class ArchiveTestSuite extends Suites (
  new ArchiveControllerTest ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}
