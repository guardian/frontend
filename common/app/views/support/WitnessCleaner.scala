package views.support

import org.jsoup.nodes.{ Element, Document }
import scala.collection.JavaConversions._
import conf.CommonSwitches._

object WitnessCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {

    document.getElementsByClass("element-witness-video").foreach { embed: Element =>
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

    document.getElementsByClass("element-witness--brand").foreach { brand: Element =>
      val icon = document.createElement("i")
      icon.attr("class", "i i-witness-logo")
      icon.attr("title", "Guardian Witness")
      icon.html("&nbsp;")
      brand.children().foreach(_.remove)
      brand.text("")
      brand.appendChild(icon)
    }
    document
  }
}
