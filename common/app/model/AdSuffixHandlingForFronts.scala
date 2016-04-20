package model

// This should only be extended by objects that display 'fronts' of the site.
object AdSuffixHandlingForFronts {
  private val supportedCountries: List[String] = List("uk", "us", "au")

  def extractAdUnitSuffixFrom(id: String, section: String) = {
    val frontSuffixList = List("front")
    val tagPageSuffixList = List("subsection")

    id.split("/").toList match {
      case cc :: Nil  if supportedCountries contains cc => (cc :: frontSuffixList).mkString("/")
      case cc :: bitsAfterTheEdition if supportedCountries.contains(cc) &&
        bitsAfterTheEdition == List(section) => (section :: frontSuffixList).mkString("/")
      case nonEditionalisedPath if nonEditionalisedPath == List(section) => (section :: frontSuffixList).mkString("/")
      case _  => (section :: tagPageSuffixList).mkString("/")
    }
  }
}
