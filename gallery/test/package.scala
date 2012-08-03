package test

import conf.Configuration
import java.util.{ List => JList }
import collection.JavaConversions._

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit(Configuration)

  implicit def listString2FirstNonEmpty(list: JList[String]) = new {
    lazy val firstNonEmpty: Option[String] = list find { !_.isEmpty }
  }

}