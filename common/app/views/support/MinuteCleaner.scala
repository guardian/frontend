package views.support

import org.jsoup.nodes.{Document, Element}
import scala.jdk.CollectionConverters._

case class TimestampCleaner(article: model.Article) extends HtmlCleaner {
  override def clean(document: Document): Document = {
    // US Minute articles use liveblog blocks but we don't want to show timestamps
    if (article.isTheMinute) document.getElementsByClass("published-time").asScala.foreach(_.remove)
    document
  }
}

case class MinuteCleaner(article: model.Article) extends HtmlCleaner {

  /**
    * Associate child classes (keys) with those to add to the parent (values).
    */
  val ParentClasses = Map(
    "element-video" -> "block--minute-article--embed block--minute-article--video",
    "element-tweet" -> "block--minute-article--embed block--minute-article--tweet",
    "block-title" -> "has-title",
    "quoted" -> "block--minute-article--quote",
    "element--inline" -> "block--minute-article--background-image block--minute-article--image",
    "element--thumbnail" -> "block--minute-article--bottom-image block--minute-article--image",
  )

  /**
    * Classes to strip from block children.
    */
  val strippable = Seq(
    "element--thumbnail",
    "caption--img",
    "fig--narrow-caption",
    "fig--has-shares",
  )

  override def clean(document: Document): Document = {
    if (article.isTheMinute) {
      document.getElementsByClass("block").asScala.foreach { block =>
        val allElements = block.getAllElements
        val heading = block.select("h2.block-title")
        val headingNumRegEx = "^([0-9]+)[.]{1}[ ]*"
        val headingHasNumber = heading.html().matches(s"$headingNumRegEx.*")

        // Add classes
        block.addClass("block--minute-article js-is-fixed-height")
        block.getElementsByTag("figcaption").addClass("caption__minute-article")

        // Add alternative layout on alternate rows
        if (block.elementSiblingIndex() % 2 == 1) block.addClass("block--minute-article--alt-layout")

        // Remove Classes
        block.removeClass("block")

        // Modify Heading
        if (heading.text() == "Summary" || heading.text() == "Key event") {
          heading.remove()
        } else {
          heading.html(
            regexCleaner(
              Option(heading.first()),
              headingNumRegEx,
              "<span class=\"block--minute-article--counter\">$1 </span>",
            ),
          )
        }

        // Add relevant classes
        ParentClasses.foldLeft(Set(): Set[String]) {
          case (classes, (childClass, parentClass)) =>
            if (allElements.asScala.exists(_.hasClass(childClass))) classes + parentClass
            else classes
        } foreach block.addClass

        // Check if the heading has a number and is an embed or quote
        if (
          (block.hasClass("block--minute-article--embed") || block
            .hasClass("block--minute-article--quote")) && headingHasNumber
        ) {
          block.addClass("block--minute-article--shorty")
        }

        // Remove Un-needed Classes
        allElements.asScala.foreach(el => strippable.foreach(el.removeClass))

        // Re-order Elements
        block.getElementsByClass("block-elements").asScala.headOption.map { outer =>
          block.getElementsByClass("block-title").asScala.headOption.map(t => outer.insertChildren(0, t))
          outer.getElementsByClass("element-image").asScala.headOption.map(outer.after)
        }

        // Inline (fullscreen) image mark-up
        // Move the picture element out of thumbnail anchor and responsive image
        block.getElementsByClass("element--inline").asScala.headOption.map { figure =>
          figure.getElementsByClass("u-responsive-ratio").asScala.headOption.map { outer =>
            {
              figure.insertChildren(0, outer)
              outer.getElementsByClass("gu-image").asScala.headOption.map(image => image.addClass("js-is-fixed-height"))
              outer.addClass("element--inline__image-wrapper")
            }
          }
          figure.getElementsByClass("article__img-container").asScala.headOption.map(container => container.remove())
        }

        // Remove Elements
        block.getElementsByClass("block-share").remove()
        block.getElementsByClass("inline-expand-image").remove()
      }
    }

    document
  }
}

object regexCleaner {
  def apply(heading: Option[Element], regEx: String, htmlToReplace: String): String =
    heading
      .map(_.html)
      .getOrElse("")
      .replaceFirst(regEx, htmlToReplace)
}
