package views.support

import org.jsoup.nodes.{ Element, Document }
import scala.collection.JavaConversions._
import conf.CommonSwitches._

object WitnessCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val witnessEmbeds = document.getElementsByClass("element-witness")

    witnessEmbeds.foreach { embed: Element =>

      if (embed.hasClass("element-witness-video")) {
        if (WitnessVideoSwitch.isSwitchedOff) {
          //video embeds rely on 3rd party plugins, so we want to be able to kill them off
          embed.remove()
        } else {
          //remove height from video iframe
          embed.getElementsByClass("element-witness--main").foreach { main =>
            main.getElementsByTag("iframe").foreach(_.attr("height", ""))
          }
        }
      }

      // remove witness brand and replace it with an icon at the top of the embed
      embed.getElementsByClass("element-witness--brand").foreach { brand: Element =>
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
      embed.getElementsByClass("element-witness--metadata").foreach { metaData: Element =>
        metaData.getElementsByClass("element-witness--source").foreach { source: Element =>

          source.getElementsByTag("time").foreach { time: Element =>
            time.addClass("js-timestamp")

            source.remove()

            metaData.getElementsByClass("element-witness--author").foreach { author: Element =>

              author.appendChild(time)

              val avatar = author.getElementsByTag("img").headOption
              avatar.foreach { img =>
                img.attr("width", "32px")
                img.attr("height", "32px")
                img.addClass("witness-avatar")
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
