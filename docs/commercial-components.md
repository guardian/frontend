
# Integration of commercial components

This informally outlines our expections of the intergration of commercial components in to the next version of http://www.theguardian.com.

## Background

R2, the system that runs the _current_ Guardian site, used a combination of microapps and XHR to insert blobs of HTML/CSS/JS in to every webpage.

This makes is hard to main an coherant direction over the code as each of these components generated it's own code and loaded what libraries it needed.

This fragments the codebase/ux/design, which raises the cost of maintenance, degrades the performance of the website, and slows the speed at which the team can operate.

Instead, the new site is built on a service-oriented architecture with a single, coherant presentation tier.

## Spec

As it currently stands most commercial components generate their own HTML. Instead of this they should generate structured data.

The divison of labour looks like this.

### API 

Each commercial component should provide an API.

The API should :-

- Contain any business logic required to generate the data for the component. 
- Provide an endpoint as JSON or XML over HTTP, authenticated or otherwise.
- Maintain a reasonable level of service - uptime, response time etc.

_Nb. I use the term 'API' very loosely. An API might be a CSV file that someone updates once a week and transfers to a webserver._

### Frontend

The next-gen frontend project will :-

- Collect and send to the compoent whatever information it needs to create an advert - Eg, user_id, section, user segment, entry point, referrer etc.
- Render that component in a standard template (ie. html/css/js)
- Use the ad server to target and load the component at an audience.

