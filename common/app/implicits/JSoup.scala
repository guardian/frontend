package implicits

import org.jsoup.nodes.Element

trait JSoup {
  implicit class Element2Parent(element: Element) {
    def parentTag(tagName: String): Option[Element] = {
      var ancestor: Option[Element] = Option(element.parent())
      while (ancestor.exists(_.tag.getName() != tagName)) {
        ancestor = ancestor flatMap { element => Option(element.parent()) }
      }

      ancestor filter { _.tag.getName == tagName }
    }
  }
}
