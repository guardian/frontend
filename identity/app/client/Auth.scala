package client


trait Auth {
  def parameters: Parameters = Iterable.empty
  def headers: Parameters = Iterable.empty
}

object Anonymous extends Auth
