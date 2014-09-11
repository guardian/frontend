package model

// This should only be extended by objects that display 'fronts' of the site.
trait AdSuffixHandlingForFronts extends MetaData{
  val supportedCountries: List[String] = List("uk", "us", "au")

  override lazy val adUnitSuffix = {
    extractAdUnitSuffixFrom(id)
  }

  def extractAdUnitSuffixFrom(path: String) = {
    val frontSuffixList = List("front")
    val tagPageSuffixList = List("subsection")

    path.split("/").toList match {
      case cc :: Nil  if supportedCountries contains cc => (cc :: frontSuffixList).mkString("/")
      case cc :: bitsAfterTheEdition if supportedCountries.contains(cc) &&
        bitsAfterTheEdition == List(section) => (section :: frontSuffixList).mkString("/")
      case nonEditionalisedPath if nonEditionalisedPath == List(section) => (section :: frontSuffixList).mkString("/")
      case _  => (section :: tagPageSuffixList).mkString("/")
    }
  }
}
