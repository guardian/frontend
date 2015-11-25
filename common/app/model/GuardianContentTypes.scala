package model

object GuardianContentTypes {

  // Hi there!
  // If you are reading this, you're probably trying to create a new Content Type.
  // Please note that we send the content types to DFP for ad tracking.
  // However, DFP will only recognise the content types in the PREDEFINED LIST.
  //
  // In DFP, this list is here:
  // Inventory > Customised targeting > ct
  //
  // Please get Ad Ops to add it to the list BEFORE adding a new content type here.
  // cheers,
  // ken lim (8 July 2014)

  val Article = "Article"
  val NetworkFront = "Network Front"
  val Section = "Section"
  /**
   * ImageContent example:
   * http://www.theguardian.com/commentisfree/picture/2015/oct/12/steve-bell-david-cameron-tom-watson-cartoon
   */
  val ImageContent = "ImageContent"
  val Interactive = "Interactive"
  val Gallery = "Gallery"
  val Video = "Video"
  val Audio = "Audio"
  val LiveBlog = "LiveBlog"
  val TagIndex = "Index"
  val Crossword = "Crossword"
}

// Eventually, replace list above with one of these
sealed trait ContentType {
  val name: String
}

case object ArticleType extends ContentType {
  override val name: String = "Article"
}

case object SectionFrontType extends ContentType {
  override val name: String = "Section"
}
