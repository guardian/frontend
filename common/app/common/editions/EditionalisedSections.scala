package common.editions

// TODO once Content API has the data this becomes an agent that gets refreshed with the latest data
object EditionalisedSections {

  val sections = Seq(
    "", // network front
    "commentisfree", "culture", "business", "money", "sport"
  )

  def isEditionalised(id: String) = sections.contains(id)
}
