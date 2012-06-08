package views.support

import org.jsoup.Jsoup
import org.jboss.dna.common.text.Inflector
import play.api.libs.json.Writes
import play.api.libs.json.Json._
import play.api.templates.Html
import scala.collection.JavaConversions._
import common._
import org.jsoup.nodes.Document

object JSON {
  //we wrap the result in an Html so that play does not escape it as html
  //after we have gone to the trouble of escaping it as Javascript
  def apply[T](json: T)(implicit tjs: Writes[T]): Html = Html(stringify(toJson(json)))
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

object JavaScriptVariableName {
  def apply(s: String): String = {
    val parts = s.split("-").toList
    (parts.headOption.toList ::: parts.tail.map { firstLetterUppercase }) mkString
  }
  private def firstLetterUppercase(s: String) = s.head.toUpper + s.tail
}

case class RowInfo(rowNum: Int, isLast: Boolean = false) {
  lazy val isFirst = rowNum == 1
  lazy val isEven = rowNum % 2 == 0
  lazy val isOdd = !isEven
  lazy val rowClass = rowNum match {
    case 1 => "first " + _rowClass
    case _ if isLast => "last " + _rowClass
    case _ => _rowClass
  }
  private lazy val _rowClass = if (isEven) "even" else "odd"

  def indexIsInSameCarousel(carouselWidth: Int, candidate: Int): Boolean = {
    val tolerance = (carouselWidth - 1) / 2 // Your problem if carouselWidth % 2 == 0
    val carousel = (rowNum - tolerance) to (rowNum + tolerance)
    carousel contains candidate
  }
}

trait HtmlCleaner {
  def clean(d: Document): Document
}

case class PictureCleaner(imageHolder: Images) extends HtmlCleaner {
  def clean(body: Document): Document = {
    val apiImages = imageHolder.images
    val images = body.getElementsByAttributeValue("class", "gu-image")

    images.foreach { img =>

      val imgUrl = img.attr("src")
      val imageFromApi: Option[Image] = apiImages.find(_.url == Some(imgUrl))

      val imgWidth = img.attr("width").toInt
      val wrapper = body.createElement("div")
      wrapper.attr("class", imgWidth match {
        case width if width <= 220 => "img-base"
        case width if width < 460 => "img-median"
        case width => "img-extended"
      })

      img.replaceWith(wrapper)
      wrapper.appendChild(img)

      //The content API is not getting the captions correctly.
      //this has been bought to their attention and will be fixed soon,
      //but in the meantime we are only adding captions if the image is larger than 54
      imageFromApi filter (_.width > 54) foreach { i: Image =>
        i.caption foreach { c =>
          val caption = body.createElement("p")
          caption.attr("class", "caption")
          caption.text(c)
          wrapper.appendChild(caption)
        }
      }
    }

    body
  }
}

object InBodyLinkCleaner extends HtmlCleaner {
  def clean(body: Document): Document = {
    val links = body.getElementsByTag("a")

    links.foreach { link =>
      link.attr("href", InBodyLink(link.attr("href")))
      link.attr("data-link-name", "in body link")
    }
    body
  }
}

object `package` extends Formats {

  private object inflector extends Inflector

  def withJsoup(html: String)(cleaners: HtmlCleaner*): Html = {
    val cleanedHtml = cleaners.foldLeft(Jsoup.parseBodyFragment(html)) { case (html, cleaner) => cleaner.clean(html) }
    Html(cleanedHtml.body.html)
  }

  implicit def tags2tagUtils(t: Tags) = new {
    def typeOrTone: Option[Tag] = t.types.find(_.id != "type/article").orElse(t.tones.headOption)
  }

  implicit def tags2inflector(t: Tag) = new {
    lazy val singularName: String = inflector.singularize(t.name)
    lazy val pluralName: String = inflector.pluralize(t.name)
  }

  implicit def seq2zipWithRowInfo[A](seq: Seq[A]) = new {
    def zipWithRowInfo = seq.zipWithIndex.map {
      case (item, index) => (item, RowInfo(index + 1, seq.length == index + 1))
    }
  }
}
