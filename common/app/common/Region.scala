package common
import conf.Switches.IndiaRegionSwitch
import play.api.mvc.RequestHeader

// A region is a 'light' edition.
// It is like an edition, but only has a custom front page.
// It does not have custom Navigation (or anything else custom)
// all other properties will be as for the default edition (i.e. the UK edition)
sealed abstract case class Region(id: String, name: String)

object Region {

  // while we have a switch in   here this needs to be a `def` and not a `val`
  def all: Seq[Region] = if (IndiaRegionSwitch.isSwitchedOn) Seq(In) else Nil

  def others(request: RequestHeader): Seq[Region] = this(request).map{r => Nil}.getOrElse(all)

  def apply(request: RequestHeader): Option[Region] = {
    val editionId = Edition.editionId(request)
    all.find(_.id equalsIgnoreCase editionId)
  }
}

object In extends Region(
  id = "IN",
  name = "India"
)
