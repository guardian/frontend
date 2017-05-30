package views.support

import implicits.Strings

object URLEncode extends Strings {

  def apply(s: String): String = s.urlEncoded

}
