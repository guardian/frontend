package views.helpers

object environment {
  def urlBase(env: String) =
    env match {
      case "prod" => "http://theguardian.com/"
      case "code" => "http://m.code.dev-theguardian.com/"
      case _ => "/"
    }
}
