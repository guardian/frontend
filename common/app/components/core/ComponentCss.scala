package components.core

import common.Assets.AssetLoader
import model.ApplicationContext

object ComponentCss {

  def load(cssFilename: String)(implicit context: ApplicationContext): Css =
    Css(AssetLoader.load(s"assets/inline-stylesheets/$cssFilename.css"))
}
