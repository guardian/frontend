package idapiclient.requests

case class DeletionBody(identityId: String, email: String, reason: Option[String])
