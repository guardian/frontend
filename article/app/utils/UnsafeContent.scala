package utils

import common.GuLogging

object UnsafeContent extends GuLogging {
  def isVidme(content: String): Boolean = {
    content.contains("vid.me") // todo make case insensitive
  }
}
