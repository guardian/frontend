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

  val ARTICLE = "Article"
  val NETWORK_FRONT = "Network Front"
  val SECTION = "Section"
  val IMAGE_CONTENT = "ImageContent"
  val INTERACTIVE = "Interactive"
  val GALLERY = "Gallery"
  val VIDEO = "Video"
  val AUDIO = "Audio"
  val LIVEBLOG = "LiveBlog"
  val TAG_COMBINER = NETWORK_FRONT
}
