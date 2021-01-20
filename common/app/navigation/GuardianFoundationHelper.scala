package navigation

import java.net.URI

object GuardianFoundationHelper {

  val foundationSectionIds = List(
    "the-guardian-foundation",
    "newswise",
    "gnmeducationcentre",
    "gnm-archive",
  )

  def sectionIdIsGuardianFoundation(id: String): Boolean = {
    foundationSectionIds.contains(id)
  }

  def tagIdIsGuardianFoundation(id: String): Boolean = {
    foundationSectionIds.contains(id.split('/').headOption.getOrElse(""))
  }

  def urlIsGuardianFoundation(url: String): Boolean = {
    val urlMetadata = new URI(url)
    foundationSectionIds.map(s => s"/${s}").exists(fragment => urlMetadata.getPath.startsWith(fragment))
  }

}
