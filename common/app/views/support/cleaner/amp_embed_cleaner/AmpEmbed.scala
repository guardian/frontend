package views.support.cleaner.amp_embed_cleaner

import org.jsoup.nodes.Element

/**
 * Created by mmcnamara on 04/04/17.
 */
  abstract class AmpEmbed {
    val ampTag: String = "amp-iframe"
    def returnAmpEmbed(): Element
  }
