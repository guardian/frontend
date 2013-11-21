package conf

import com.gu.management.{HttpRequest, HtmlManagementPage}

class DemoPage(val applicationName: String) extends HtmlManagementPage {

  val path = "/management/commercial/demo"

  def title = "Commercial Test Harness"

  private def jsonDomain = {
    Configuration.environment.stage match {
      case "dev" => "localhost:9000"
      case "code" => "code.api.nextgen.guardianapps.co.uk"
      case _ => "api.nextgen.guardianapps.co.uk"
    }
  }

  def body(request: HttpRequest) =

        <link rel="stylesheet" type="text/css" href="http://aws-frontend-static.s3.amazonaws.com/CODE/frontend-static/stylesheets/head.default.610e3a410982a293a4573a1018691888.css"/>
        <link rel="stylesheet" type="text/css" href="http://aws-frontend-static.s3.amazonaws.com/CODE/frontend-static/stylesheets/global.a4a4e7fe5b05d4ea80d69dfdc2efa73b.css"/>
        <link href='//fonts.googleapis.com/css?family=Merriweather' rel='stylesheet' type='text/css'/>
        <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>

        <style>
          <![CDATA[
        body {
        max-width: 1300px;
        margin: 0 auto;
        }
        h1 {
        font-family: Merriweather, serif;
  }
  .components {
  list-style-type: none;
  }
  .components li {
  overflow: hidden;
  }

  .component {
  float: left;
  margin-right: 8px;
  }

  .component--small {
  width: 30%;
  }

  .component--large {
  width: 60%;
  }
  ]]>
        </style>



        <script>
      { scala.xml.Unparsed(
      """jQuery(function() {
          var guCommercial = {

            className: 'commercial',

            breakpoints: [300, 400, 500, 600],

            components: function() {

              return {
                masterclasses: 'http://%s/commercial/masterclasses.json',
                travel:        'http://%s/commercial/travel/offers.json?k='+document.querySelector('.travel-keywords').value+'&amp;seg=repeat',
                jobs:          'http://%s/commercial/jobs.json?s='+document.querySelector('.jobs-keywords').value,
                soulmates:     'http://%s/commercial/soulmates/mixed.json'
              }
            },

            applyBreakpointClassnames: function() {
              var self = this,
              $nodes = $('.'+this.className);

              $nodes.each(function(i, el) {
                var width = el.offsetWidth;
                el.className = el.className.replace(/(commercial--w\d{1,3})\s?/g, '');
                self.breakpoints.forEach(function(breakpointWidth) {
                  if (width >= breakpointWidth) {
                    $(el).addClass(self.className+'--w' + breakpointWidth);
                  }
                });

                el.setAttribute('data-width', width);
              });
            },

            debounce: function(fn, delay) {
              var timer = null;
              return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                  fn.apply(context, args);
                }, delay);
              };
            },

            load: function(endpoint, targetSelector) {
              var self = this;
              $.ajax({
                url:  endpoint,
                dataType: 'jsonp',
                success: function(response) {
                  $(targetSelector).html(response.html);
                  self.applyBreakpointClassnames();
                }
              });
            },

            loadComponents: function() {
              var self = this,
              components = this.components();

              Object.keys(components).forEach(function(key) {
                var componentType = key,
                endpoint      = components[key];

                self.load(endpoint, '.'+componentType);
              });
            },

            init: function() {
              var self = this;

              $(window).on('resize', this.debounce(function() {
                self.applyBreakpointClassnames();
              }, 100));

              $(document).on('change', 'input', function(e) {
                self.loadComponents();
              });

              this.loadComponents();
            }
          };

          guCommercial.init();
      })"""
      .format(jsonDomain, jsonDomain, jsonDomain, jsonDomain))}
        </script>

        <h1>Commercial Components Test Harness</h1>


        <ul class="components">
          <li>
            <h2>
              Travel
              <input type="text" value="canada" class="travel-keywords"/>
            </h2>
            <div class="travel component component--small"></div>
            <div class="travel component component--large"></div>
          </li>
          <li>
            <h2>
              Jobs
              <input type="text" value="society" class="jobs-keywords"/>
            </h2>
            <div class="jobs component component--small"></div>
            <div class="jobs component component--large"></div>
          </li>
          <li>
            <h2>Masterclasses</h2>
            <div class="masterclasses component component--small"></div>
            <div class="masterclasses component component--large"></div>
          </li>
          <li>
            <h2>Soulmates</h2>
            <div class="soulmates component component--small"></div>
            <div class="soulmates component component--large"></div>
          </li>
        </ul>


}
