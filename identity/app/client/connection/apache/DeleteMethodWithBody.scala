package client.connection.apache

import org.apache.commons.httpclient.methods.EntityEnclosingMethod

class DeleteMethodWithBody(uri: String) extends EntityEnclosingMethod(uri) {
  def getName: String = "DELETE"
}
