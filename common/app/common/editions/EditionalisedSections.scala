package common.editions

import common.Edition
import model.MetaData

object EditionalisedSections {

  val sections = Seq(
    "", // network front
    "commentisfree", "culture", "business", "money", "sport"
  )

  def isEditionalised(id: String) = sections.contains(id)


  private lazy val editionRegex = Edition.all.map(_.id.toLowerCase).mkString("|")
  private lazy val EditionalisedFront = s"""^($editionRegex)$$""".r

  private lazy val EditionalisedId = s"^($editionRegex)(/[\\w\\d-]+)$$".r

  def otherPagesFor(page: MetaData): Seq[EditionLink] = page.id match {
    case EditionalisedId(editionId, section) if isEditionalised(section.drop(1)) => Edition.others(editionId).map(EditionLink(_, section))
    case EditionalisedFront(editionId) => Edition.others(editionId).map(EditionLink(_, "/"))
    case _ => Nil
  }
}

case class EditionLink(edition: Edition, path: String)