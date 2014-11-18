package common.editions

import common.Edition
import play.api.mvc.RequestHeader

object EditionalisedSections {

  private val sections = Seq(
    "", // network front
    "business",
    "commentisfree",
    "culture",
    "money",
    "sport",
    "sustainable-business",
    "technology"
  )

  def isEditionalised(id: String) = sections.contains(id)


  private lazy val editionRegex = Edition.all.map(_.id.toLowerCase).mkString("|")
  private lazy val EditionalisedFront = s"""^/($editionRegex)$$""".r

  private lazy val EditionalisedId = s"^/($editionRegex)(/[\\w\\d-]+)$$".r

  def otherPagesFor(request: RequestHeader): Seq[EditionLink] = request.path match {
    case EditionalisedId(editionId, section) if isEditionalised(section.drop(1)) => Edition.others(editionId).map(EditionLink(_, section))
    case EditionalisedFront(editionId) => Edition.others(editionId).map(EditionLink(_, "/"))
    case _ => Nil
  }
}

case class EditionLink(edition: Edition, path: String)
