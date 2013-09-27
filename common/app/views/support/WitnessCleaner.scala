package views.support

import conf.Switches.WitnessVideoSwitch
import org.jsoup.nodes.{ Element, Document }
import scala.collection.JavaConversions._

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
      val witnessLogo = document.createElement("span")
      witnessLogo.attr("class", "witness-logo")
      witnessLogo.html("Guardian <span class='witness-logo__witness'>Witness</span>")
      brand.children().foreach(_.remove)
      brand.text("")
      brand.appendChild(witnessLogo)
    }
    document
  }
}
