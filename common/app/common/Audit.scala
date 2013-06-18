package common

object Audit extends Logging {

  def apply(message: String) {
    log.info(message)
  }
}
