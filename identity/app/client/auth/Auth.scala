package client.auth

import client.Parameters

trait Auth {
  def parameters: Parameters
}

object Anonymous extends Auth {
  override def parameters: Parameters = Iterable.empty
}
