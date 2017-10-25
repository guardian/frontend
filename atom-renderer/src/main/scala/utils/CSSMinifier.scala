package com.gu.contentatom.renderer
package utils

object CSSMinifier {
  def apply: String => String = { css: String =>
    css.replaceAll("\\n", "").replaceAll("  ", "")
  }
}