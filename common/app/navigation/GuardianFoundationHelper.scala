package navigation

object GuardianFoundationHelper {

  val foundationSectionIds = List(
    "the-guardian-foundation",
    "newswise",
    "gnmeducationcentre",
    "gnm-archive"
  )

  def sectionIdIsGuardianFoundation(id: String): Boolean = {
    foundationSectionIds.contains(id)
  }

  def tagIdIsGuardianFoundation(id: String): Boolean = {
    foundationSectionIds.contains(id.split('/').headOption.getOrElse(""))

  }
  
}
