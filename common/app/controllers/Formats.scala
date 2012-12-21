package controllers

import play.api.mvc.RequestHeader

trait Formats {

  /*
   * Key/value of paging param name to default value
   */
  def validFormats: Seq[String]

  /**
   * Confirm it's a valid format
   */
  protected def checkFormat(format: String): Option[String] = {
    validFormats.find(_ == format)
  }

}
