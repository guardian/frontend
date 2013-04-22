package test

import java.util.{ List => JList }
import collection.JavaConversions._

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit

  object Fake extends FakeApp

  implicit class ListString2FirstNonEmpty(list: JList[String]) {
    lazy val firstNonEmpty: Option[String] = list find { !_.isEmpty }
  }

}