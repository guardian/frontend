package model

object IpsosTags {

  /*
   *
   * https://www.theguardian.com/technology/motoring doesn't generate a section ID
   *
   * /uk/tv-and-radio not loading in dev-build
   *  */

  val tags = Map(
  )

  // Default to top level `guardian` tag if key is not found
  def getScriptTag(id: String): String = {
    if (tags.contains(id)) return tags(id) else return "guardian"
  }

}
