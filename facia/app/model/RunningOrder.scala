package model

import common.{Edition, ExecutionContexts}
import scala.concurrent.Future
import conf.ContentApi

class RunningOrder(val articles: List[String], val edition: Edition)
{

  def query(): Future[Trail] = ContentApi.search(edition)
    .ids(articles.mkString(","))
    .response map { r =>
    r.results.headOption.map(new Content(_)).get
  }

}
