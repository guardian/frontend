package test

import java.util.{ List => JList }
import collection.JavaConversions._

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit

  implicit def listString2FirstNonEmpty(list: JList[String]) = new {
    lazy val firstNonEmpty: Option[String] = list find { !_.isEmpty }
  }

}