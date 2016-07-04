package common.commercial.hosted

import model.StandalonePage

trait HostedPage extends StandalonePage {

  def pageUrl: String
  def pageName: String
  def pageTitle: String
  def standfirst: String
  def logoUrl: String
}
