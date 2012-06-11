package common

import play.api.templates.Html
import com.googlecode.htmlcompressor.compressor.HtmlCompressor

object Compressed {

  val compressor = new HtmlCompressor()
  compressor.setCompressJavaScript(true)
  compressor.setCompressCss(true)

  def apply(block: Html): Html = Html(compressor.compress(block.body))
}
