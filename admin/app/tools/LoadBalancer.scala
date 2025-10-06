package tools

import common.{Box, GuLogging}
import com.amazonaws.services.elasticloadbalancing.AmazonElasticLoadBalancingClient

import scala.jdk.CollectionConverters._

case class LoadBalancer(
    id: String,
    name: String,
    project: String,
    url: Option[String] = None,
    testPath: Option[String] = None,
    // Application load balancers (v2) have target groups, classic load balancers (v1) do not
    targetGroup: Option[String] = None,
)

object LoadBalancer extends GuLogging {

  import conf.Configuration.aws.credentials

  private val loadBalancers = Seq(
    LoadBalancer("frontend-PROD-router-ELB", "Router", "frontend-router"),
    LoadBalancer(
      "app/fronte-LoadB-xXnA5yhOxB7G/cf797b52302fc833",
      "Article",
      "frontend-article",
      testPath = Some("/uk-news/2014/jan/21/drax-protesters-convictions-quashed-police-spy-mark-kennedy"),
      targetGroup = Some("targetgroup/fronte-Targe-YYBO08CFBLH9/19192d72461d4042"),
    ),
    LoadBalancer(
      "app/fronte-LoadB-qTAetyigfHhb/f4371301ea282f8a",
      "Front",
      "frontend-facia",
      testPath = Some("/uk"),
      targetGroup = Some("targetgroup/fronte-Targe-RG4PYAXIXEAH/c4104696046f2543"),
    ),
    LoadBalancer(
      "app/fronte-LoadB-jjbgLSz4Ttk7/0e30c8ef528bd918",
      "Applications",
      "frontend-applications",
      testPath = Some("/books"),
      targetGroup = Some("targetgroup/fronte-Targe-J5GTY7IUW6U4/5fa6083486dbd785"),
    ),
    LoadBalancer(
      "app/fronte-LoadB-xmdWiUUHyRUS/122c59735e8374bb",
      "Discussion",
      "frontend-discussion",
      targetGroup = Some("targetgroup/fronte-Targe-JGOOGIGPNWQJ/187642c8eda54a4a"),
    ),
    LoadBalancer("frontend-PROD-identity-ELB", "Identity", "frontend-identity"),
    LoadBalancer(
      "app/fronte-LoadB-t2NTzJp2RZFf/4119950dc35e5cb4",
      "Sport",
      "frontend-sport",
      targetGroup = Some("targetgroup/fronte-Targe-LJMDWMGH5FPD/e777dd4276b0bf29"),
    ),
    LoadBalancer(
      "app/fronte-LoadB-4KxztKWTJxEu/faee39a2eecb4c1a",
      "Commercial",
      "frontend-commercial",
      targetGroup = Some("targetgroup/fronte-Targe-C8VZWOPZ3TTS/271f997aea40fb19"),
    ),
    LoadBalancer(
      "app/fronte-LoadB-NpLaks0rT7va/e5a6b5bea5119952",
      "Onward",
      "frontend-onward",
      targetGroup = Some("targetgroup/fronte-Targe-N0YDVRHJB7IM/99164208e6758b4e"),
    ),
    LoadBalancer(
      "app/fronte-LoadB-wSjta29AZxoG/32048dda4b467613",
      "Archive",
      "frontend-archive",
      targetGroup = Some("targetgroup/fronte-Targe-CVM11DC1XUEX/5980205ce24de6bf"),
    ),
    LoadBalancer(
      "app/fronte-LoadB-lVDfejahHxTX/5cfe31b29fa71749",
      "Rss",
      "frontend-rss",
      targetGroup = Some("targetgroup/fronte-Targe-1UWQX08K530W/4da53e8e56d13ab8"),
    ),
  )

  private val agent = Box(loadBalancers)

  def refresh(): Unit = {
    log.info("starting refresh LoadBalancer ELB DNS names")
    credentials.foreach { credentials =>
      val client = AmazonElasticLoadBalancingClient
        .builder()
        .withCredentials(credentials)
        .withRegion(conf.Configuration.aws.region)
        .build()
      val elbs = client.describeLoadBalancers().getLoadBalancerDescriptions
      client.shutdown()
      val newLoadBalancers = loadBalancers.map { lb =>
        lb.copy(url = elbs.asScala.find(_.getLoadBalancerName == lb.id).map(_.getDNSName))
      }
      agent.send(newLoadBalancers)
    }
    log.info("finished refresh LoadBalancer ELB DNS names")
  }

  def all: Seq[LoadBalancer] = agent()

  def apply(project: String): Option[LoadBalancer] = agent().find(_.project == project)
}
