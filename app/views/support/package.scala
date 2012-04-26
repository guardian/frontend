package views.support

import play.api.templates.Html
import org.apache.commons.lang.StringEscapeUtils._
import org.jsoup.Jsoup
import org.jboss.dna.common.text.Inflector
import common.{ Tag, Tags }
import scala.collection.JavaConversions._

object JavaScriptString {
  //we wrap the result in an Html so that play does not escape it as html
  //after we have gone to the trouble of escaping it as Javascript
  def apply(string: String): Html = Html(escapeJavaScript(string))
}

//annoyingly content api will sometimes have things surrounded by <p> tags and sometimes not.
//since you cannot nest <p> tags this causes all sorts of problems
object RemoveOuterParaHtml {
  def apply(text: String): Html = {
    val fragment = Jsoup.parseBodyFragment(text).body()
    if (!fragment.html().startsWith("<p>")) {
      Html(text)
    } else {
      Html(fragment.html.drop(3).dropRight(4))
    }
  }
}

//inline elements in the ContentApi are really spartan and
//need to be modified to work in our pages
object PictureTransformerHtml {
  def apply(bodyText: String): Html = {
    val body = Jsoup.parseBodyFragment(bodyText)
    val images = body.getElementsByAttributeValue("class", "gu-image")

    images.foreach { img =>
      val imgWidth = img.attr("width").toInt
      val wrapper = body.createElement("div")
      wrapper.attr("class", imgWidth match {
        case width if width <= 220 => "img-base"
        case width if width < 460 => "img-median"
        case width => "img-extended"
      })
      img.replaceWith(wrapper)
      wrapper.appendChild(img)
    }

    Html(body.body.html)
  }
}

object `package` {

  private object inflector extends Inflector

  implicit def tags2tagUtils(t: Tags) = new {
    def typeOrTone: Option[Tag] = t.types.find(_.id != "type/article").orElse(t.tones.headOption)
  }

  implicit def tags2inflector(t: Tag) = new {
    lazy val singularName: String = inflector.singularize(t.name)
    lazy val pluralName: String = inflector.pluralize(t.name)
  }

  implicit def hyphen2initCaps(s: String) = new {
    lazy val javaScriptVariableName: String = {
      val parts = s.split("-").toList
      (parts.headOption.toList ::: parts.tail.map { firstLetterUppercase }) mkString
    }
  }
  private def firstLetterUppercase(s: String) = s.head.toUpper + s.tail
}
