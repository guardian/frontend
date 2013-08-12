package client


trait Auth {
  def parameters: Parameters
  def headers: Parameters
}

object Anonymous extends Auth {
  override def parameters: Parameters = Iterable.empty
  override def headers: Parameters = Iterable.empty
}
