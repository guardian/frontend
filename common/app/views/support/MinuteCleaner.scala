package views.support

import org.jsoup.nodes.{ Element, Document }
import scala.collection.JavaConversions._

case class TimestampCleaner(article: model.Article) extends HtmlCleaner {
  override def clean(document: Document): Document = {
    // US Minute articles use liveblog blocks but we don't want to show timestamps
    if (article.isUSMinute) document.getElementsByClass("published-time").foreach(_.remove)
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
    "element--thumbnail" -> "block--minute-article--bottom-image block--minute-article--image"
  )

  /**
    * Classes to strip from block children.
    */
  val strippable = Seq(
    "element--thumbnail",
    "caption--img",
    "fig--narrow-caption",
    "fig--has-shares"
  )

  override def clean(document: Document): Document = {
    if (article.isUSMinute) {
      document.getElementsByClass("block").foreach { block =>
        val allElements = block.getAllElements
        val headings = block.select("h2.block-title")

        // Add classes
        block.addClass("block--minute-article js-is-fixed-height")
        block.getElementsByTag("figcaption").addClass("caption__minute-article")

        // Add alternative layout on alternate rows
        if (block.elementSiblingIndex() % 2 == 1) block.addClass("block--minute-article--alt-layout")

        // Remove Classes
        block.removeClass("block")

        headings.foreach(heading => {
          if (heading.text() == "Summary" || heading.text() == "Key event") {
            heading.remove()
          } else {
            val headingHtml = heading.html();
            headingHtml.replaceFirst("^([0-9]+)[.]*[ ]*", "<span class=\"block--minute-article--counter\">$1 </span>")
          }
        })

        ParentClasses.foldLeft(Set(): Set[String]) { case (classes, (childClass, parentClass)) =>
          if (allElements.exists(_.hasClass(childClass))) classes + parentClass
          else classes
        } foreach(block.addClass)

        allElements.foreach(el => strippable.foreach(el.removeClass))

        // Re-order Elements
        block.getElementsByClass("block-elements").headOption.map { outer =>
          block.getElementsByClass("block-title").headOption.map(t => outer.insertChildren(0, Seq(t)))
          outer.getElementsByClass("element-image").headOption.map(outer.after)
        }

        // Inline (fullscreen) image mark-up
        // Move the picture element out of thumbnail anchor and responsive image
        block.getElementsByClass("element--inline").headOption.map { figure =>
          figure.getElementsByClass("u-responsive-ratio").headOption.map { outer => {
            figure.insertChildren(0, Seq(outer))
            outer.getElementsByClass("gu-image").headOption.map(image => image.addClass("js-is-fixed-height"))
            outer.addClass("element--inline__image-wrapper")
          }}
          figure.getElementsByClass("article__img-container").headOption.map(container => container.remove())
        }

        // Remove Elements
        block.getElementsByClass("block-share").remove()
        block.getElementsByClass("inline-expand-image").remove()
      }
    }

    document
  }
}
