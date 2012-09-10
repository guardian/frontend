package controllers.front

import model.TrailblockDescription
import controllers.FrontPage

//Responsible for holding the definition of the two editions
class Front {

  val uk = new FrontEdition("UK", Seq(
    TrailblockDescription("", "Top stories", 5),
    TrailblockDescription("sport", "Sport", 5),
    TrailblockDescription("commentisfree", "Comment is free", 3),
    TrailblockDescription("culture", "Culture", 1),
    TrailblockDescription("business", "Business", 1),
    TrailblockDescription("lifeandstyle", "Life and style", 1),
    TrailblockDescription("money", "Money", 1)
  ))

  val us = new FrontEdition("US", Seq(
    TrailblockDescription("", "Top stories", 5),
    TrailblockDescription("sport", "Sports", 5),
    TrailblockDescription("commentisfree", "Comment is free", 3),
    TrailblockDescription("culture", "Culture", 1),
    TrailblockDescription("business", "Business", 1),
    TrailblockDescription("lifeandstyle", "Life and style", 1),
    TrailblockDescription("money", "Money", 1)
  ))

  def refresh() {
    uk.refresh()
    us.refresh()
  }

  def shutdown() {
    uk.shutDown()
    us.shutDown()
  }

  def apply(edition: String): FrontPage = edition match {
    case "US" => FrontPage(us())
    case anythingElse => FrontPage(uk())
  }
}

object Front extends Front