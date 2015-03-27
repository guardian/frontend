package common

case class HttpStatusException(status: Int, statusText: String) extends Exception {
  override val getMessage: String = s"Bad response: HTTP $status: $statusText"
}
