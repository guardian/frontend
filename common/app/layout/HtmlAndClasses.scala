package layout

import cards.{CardType, ListItem, MediaList, Standard}
import model.pressed.CollectionConfig
import play.twirl.api.Html
import slices.{MobileShowMore, RestrictTo}
import scala.annotation.tailrec

case class HtmlAndClasses(index: Int, html: Html, classes: Seq[String])
