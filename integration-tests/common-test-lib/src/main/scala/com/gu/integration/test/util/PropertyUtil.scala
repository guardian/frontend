package com.gu.integration.test.util

object PropertyUtil {
  def setLocalConfProperty(pathValue: String) = {
    val localConfKey: String = "local.conf.loc"
    if (sys.props.get(localConfKey).isEmpty) {
      System.setProperty(localConfKey, pathValue)
    }
  }
}
