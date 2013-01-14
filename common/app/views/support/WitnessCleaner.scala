package views.support

import org.jsoup.nodes.{ Element, Document }
import scala.collection.JavaConversions._

object WitnessCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val witnessEmbeds = document.getElementsByClass("element-witness")

    witnessEmbeds.foreach { embed: Element =>

      // remove witness brand and replace it with an icon at the top of the embed
      embed.getElementsByClass("guardian-witness-brand").foreach { brand: Element =>
        val icon = document.createElement("i")
        icon.attr("class", "i i-witness-logo")
        icon.attr("title", "Guardian Witness")
        brand.children().foreach(_.remove)
        brand.text("")
        brand.appendChild(icon)
        brand.remove()
        embed.prependChild(brand)
      }

      //clean source and time
      embed.getElementsByClass("metadata").foreach { metaData: Element =>
        metaData.getElementsByClass("source").foreach { source: Element =>

          source.getElementsByTag("time").foreach { time: Element =>
            time.addClass("js-timestamp")

            source.remove()

            metaData.getElementsByClass("author").foreach { author: Element =>

              val avatar = document.createElement("i")
              avatar.attr("class", "i i-default-witness-avatar")
              author.appendChild(time)
              metaData.prependChild(avatar)
            }
          }
        }
      }

    }
    document
  }
}
