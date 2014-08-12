package com.gu.integration.test.util

import com.gu.automation.support.Config

/**
 * Simple wrapper for Config().getUserValue
 */
object UserConfig {

  def get(userKey: String): String ={
    Config().getUserValue(userKey)
  }
}
