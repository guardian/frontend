package idapiclient.requests

case class PasswordUpdate(password: Option[String] = None, newPassword: String)
