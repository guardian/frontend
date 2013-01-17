package views.support

import org.jsoup.nodes.{ Element, Document }
import scala.collection.JavaConversions._

object WitnessCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val witnessEmbeds = document.getElementsByClass("element-witness")

    witnessEmbeds.foreach { embed: Element =>

      //remove height from video iframe
      if (embed.hasClass("element-witness-video")) {
        embed.getElementsByClass("main").foreach { main =>
          main.getElementsByTag("iframe").foreach(_.attr("height", ""))
        }
      }

      // remove witness brand and replace it with an icon at the top of the embed
      embed.getElementsByClass("guardian-witness-brand").foreach { brand: Element =>
        val icon = document.createElement("i")
        icon.attr("class", "i i-witness-logo")
        icon.attr("title", "Guardian Witness")
        icon.html("&nbsp;")
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

              author.appendChild(time)

              val avatar = author.getElementsByTag("img").headOption
              avatar.foreach { img =>
                img.attr("width", "32px")
                img.attr("height", "32px")
                img.addClass("witness-avatar")
                //img.remove()
                //metaData.prependChild(img)
              }

              if (!avatar.isDefined) {
                val defaultAvatar = document.createElement("i")
                defaultAvatar.attr("class", "i i-default-witness-avatar witness-avatar")
                author.prependChild(defaultAvatar)
              }
            }
          }
        }
      }

    }
    document
  }
}
