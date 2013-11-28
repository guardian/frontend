# Integration of commercial components

This informally outlines our expectations of the integration of commercial components in to the next version of http://www.theguardian.com.

## Background

R2, the system that runs the current Guardian site, used a combination of micro-apps and XHR to insert blobs of HTML/CSS/JS in to every webpage.

This makes is hard to main an coherent direction over the code as each of these components generated it's own code and loaded what libraries it needed.

This fragments the codebase/ux/design, raises the cost of maintenance, can degrade the performance of the website, and slows the speed at which the team can operate.

Instead, the new site (aka. next-gen) is built on a service-oriented architecture with a single, coherent presentation tier.

## Spec

As it currently stands most commercial components generate their own HTML. 

Instead of this they should generate structured data.

The division of labour looks like this.

### API 

Each commercial component should provide an API.

The API should :-

- Contain any business logic required to generate the data for the component. 
- Provide an endpoint as JSON or XML over HTTP, authenticated or otherwise.
- Maintain a reasonable level of service - uptime, response time etc.

_Nb. I use the term 'API' very loosely. An API might be a CSV file that someone updates once a week and transfers to a web server._

### Frontend

The next-gen project will :-

- Collect and send to the component whatever information it needs to create an advert - Eg, user_id, section, user segment, entry point, referrer etc.
- Render that component in a standard template (Ie. manage the html/css/js)
- Target that component at an audience.

This allows the commercial teams to specialise in the data the drives the component and the frontend team to specialise in the delivery of that to the user.
