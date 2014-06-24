package model

trait AdSuffixHandlingForFronts extends MetaData{
  override lazy val adUnitSuffix = {
    val supportedCountries: List[String] = List("uk", "us", "au")

    val split = id.split("/").toList
    split match {
      case cc :: Nil  if supportedCountries contains cc => (cc :: "front" :: Nil).mkString("/")
      case cc :: restOfIt if supportedCountries contains cc => (restOfIt ::: "front" :: Nil).mkString("/")
      case whatever => (whatever ::: "front" :: Nil).mkString("/")
    }
  }
}
