package model

import com.gu.openplatform.contentapi.model.MediaEncoding

case class Encoding(format: String, url: String)

object Encoding {

  val typeMapping = Map(
    "mp4" -> "video/mp4"
  )

  def apply(delegate: MediaEncoding): Encoding = {
    val format = typeMapping.get(delegate.format).getOrElse(delegate.format)
    Encoding(format, delegate.file)
  }
}