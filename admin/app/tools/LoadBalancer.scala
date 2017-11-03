package tools

import common.Logging
import com.amazonaws.services.elasticloadbalancing.AmazonElasticLoadBalancingClient
import com.gu.Box

import scala.collection.JavaConversions._

case class LoadBalancer(id: String,
                        name: String,
                        project: String,
                        url: Option[String] = None,
                        testPath: Option[String] = None)

object LoadBalancer extends Logging {

  import conf.Configuration.aws.credentials

    private val loadBalancers = Seq(
      LoadBalancer("frontend-PROD-router-ELB", "Router", "frontend-router"),
      LoadBalancer(
        "frontend-PROD-article-ELB", "Article", "frontend-article",
        testPath = Some("/uk-news/2014/jan/21/drax-protesters-convictions-quashed-police-spy-mark-kennedy")
      ),
      LoadBalancer("frontend-PROD-facia-ELB", "Front", "frontend-facia", testPath = Some("/uk")),
      LoadBalancer("frontend-PROD-applications-ELB", "Applications", "frontend-applications", testPath = Some("/books")),
      LoadBalancer("frontend-PROD-discussion-ELB", "Discussion", "frontend-discussion"),
      LoadBalancer("frontend-PROD-identity-ELB", "Identity", "frontend-identity"),
      LoadBalancer("frontend-PROD-sport-ELB", "Sport", "frontend-sport"),
      LoadBalancer("frontend-PROD-commercial-ELB", "Commercial", "frontend-commercial"),
      LoadBalancer("frontend-PROD-onward-ELB", "Onward", "frontend-onward"),
      LoadBalancer("frontend-PROD-diagnostics-ELB", "Diagnostics", "frontend-diagnostics" ),
      LoadBalancer("frontend-PROD-archive-ELB", "Archive", "frontend-archive"),
      LoadBalancer("frontend-PROD-rss-ELB", "Rss", "frontend-rss")
    )


  private val agent =  Box(loadBalancers)

  def refresh() {
    log.info("starting refresh LoadBalancer ELB DNS names")
    credentials.foreach{ credentials =>
      val client = AmazonElasticLoadBalancingClient
        .builder()
        .withCredentials(credentials)
        .withRegion(conf.Configuration.aws.region)
        .build()
      val elbs = client.describeLoadBalancers().getLoadBalancerDescriptions
      client.shutdown()
      val newLoadBalancers = loadBalancers.map{ lb =>
        lb.copy(url = elbs.find(_.getLoadBalancerName == lb.id).map(_.getDNSName))
      }
      agent.send(newLoadBalancers)
    }
    log.info("finished refresh LoadBalancer ELB DNS names")
  }

  def all: Seq[LoadBalancer] = agent()

  def apply(project: String): Option[LoadBalancer] = agent().find(_.project == project)
}
