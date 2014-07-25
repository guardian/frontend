package model

// This should only be extended by objects that display 'fronts' of the site.
trait AdSuffixHandlingForFronts extends MetaData{
  val supportedCountries: List[String] = List("uk", "us", "au")

  override lazy val adUnitSuffix = {
    extractAdUnitSuffixFrom(id)
  }

  def extractAdUnitSuffixFrom(path: String) = {
    val frontSuffixList = List("front", "ng")
    path.split("/").toList match {
      case cc :: Nil  if supportedCountries contains cc => (cc :: frontSuffixList).mkString("/")
      case cc :: pathList if supportedCountries contains cc => (pathList ::: frontSuffixList).mkString("/")
      case pathList => (pathList ::: frontSuffixList).mkString("/")
    }
  }
}
