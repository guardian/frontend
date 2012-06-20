package common

import com.googlecode.htmlcompressor.compressor.HtmlCompressor
import play.api.templates.Html

object Compressed extends Logging {

  val compressor = new HtmlCompressor()
  compressor.setCompressJavaScript(true)
  compressor.setCompressCss(true)

  def apply(block: Html): Html = {
    val originalBody = block.body
    val compressedBody = compressor.compress(originalBody)

    //not a perfect size measurement, but it gives an idea
    log.trace("%s -> %s : %.2f percent" format (originalBody.length, compressedBody.length,
      compressedBody.length.toDouble / originalBody.length.toDouble * 100))

    Html(compressedBody)
  }
}
