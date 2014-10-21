package model

import common.`package`._

case class ShareOption(
  text: String,
  css: String,
  url: String
)

trait ShareOptions extends Content {

  def shareOptions(blockid: String): Seq[ShareOption] = {
    val shortBlockUrl = s"$shortUrl#$blockid".urlEncoded
    val longBlockUrl = s"$webUrl#$blockid".urlEncoded
    List(
      ShareOption("Facebook", "facebook", s"https://www.facebook.com/sharer/sharer.php?u=$longBlockUrl&ref=responsive"),
      ShareOption("Twitter", "twitter", s"https://twitter.com/intent/tweet?text=${webTitle.urlEncoded}&url=$shortBlockUrl"),
      ShareOption("Google plus", "gplus", s"https://plus.google.com/share?url=$shortBlockUrl")
    )
  }
}