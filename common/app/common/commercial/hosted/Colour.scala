package common.commercial.hosted

import java.awt.Color

case class Colour(hexCode: String) {

  val isLight = {
    val rgb = Integer.parseInt(hexCode.stripPrefix("#"), 16)
    val c = new Color(rgb)
    // the conversion in java.awt.Color uses HSB colour space, whereas we want HSL here
    // see http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    val min = Math.min(Math.min(c.getRed, c.getGreen), c.getBlue)
    val max = Math.max(Math.max(c.getRed, c.getGreen), c.getBlue)
    val lightness = (min + max).toDouble / 510
    lightness > 0.5
  }

  val isDark = !isLight
}
