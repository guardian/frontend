package layout

import common.{Edition, LinkTo}
import conf.switches.Switches
import model.PressedPage
import model.facia.PressedCollection
import model.meta.{ItemList, ListItem}
import model.pressed.{CollectionConfig, PressedContent}
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import services.CollectionConfigWithId
import slices.{MostPopular, _}
import views.support.CutOut

import scala.Function._
import scala.annotation.tailrec

case class CollectionEssentials(
  items: Seq[PressedContent],
  treats: Seq[PressedContent],
  displayName: Option[String],
  href: Option[String],
  lastUpdated: Option[String],
  showMoreLimit: Option[Int]
)

object CollectionEssentials {
  /* FAPI Integration */

  def fromPressedCollection(collection: PressedCollection): CollectionEssentials = CollectionEssentials(
    collection.curatedPlusBackfillDeduplicated,
    collection.treats,
    Option(collection.displayName),
    collection.href,
    collection.lastUpdated.map(_.toString),
    if (collection.curated.isEmpty) Some(9) else None
  )

  def fromFaciaContent(trails: Seq[PressedContent]): CollectionEssentials = CollectionEssentials(
    trails,
    Nil,
    None,
    None,
    None,
    None
  )

  val empty = CollectionEssentials(Nil, Nil, None, None, None, None)
}