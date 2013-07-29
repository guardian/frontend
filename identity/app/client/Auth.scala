package client


trait Auth {
  def parameters: Parameters
}

object Anonymous extends Auth {
  override def parameters: Parameters = Iterable.empty
}
