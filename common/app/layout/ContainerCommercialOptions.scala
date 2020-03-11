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

case class ContainerCommercialOptions(omitMPU: Boolean, adFree: Boolean)
