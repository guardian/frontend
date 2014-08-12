package com.gu.integration.test.util

import java.io.File

object FileUtil {

  def currentPath(): String = {
    new File(".").getCanonicalPath
  }
}
