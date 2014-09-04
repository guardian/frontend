package common

import java.text.Normalizer

object StringEncodings {
  def asAscii(s: String) =
    Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("[^\\p{ASCII}]", "")
}
