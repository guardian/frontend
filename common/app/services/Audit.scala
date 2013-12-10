package services

import common.Logging

object Audit extends Logging {

  def apply(message: String) {
    log.info(message)
  }
}
