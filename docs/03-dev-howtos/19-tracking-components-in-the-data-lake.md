# Tracking components in the Data Lake

There are several ways to track views and interactions with components.

You will need access to Athena, which is how we query the Data Lake. You can request this by raising a pull request in [Janus](https://github.com/guardian/janus),
giving yourself `dataLakeQuerying` permission in [`Access.scala`](https://github.com/guardian/janus/blob/master/app/data/Access.scala). You will need approval
from someone in the data tech team (`data.technology`).

## Rendered components

The Ophan client automatically tracks rendering of components that have a `data-component` attribute. 

Add `data-component="component-name"` to the element you'd like to track. To avoid race conditions, it is best to
add this attribute only to server-rendered HTML.

### Query in Athena:

```sql
select page_view_id
, rendered_components
from pageview
where received_date between date '2018-06-01' and date '2018-06-02'
and cardinality(rendered_components) > 0
and contains(rendered_components, 'component-name')
order by page_view_id desc
```

## Component clicks

Ophan can track click interactions on specific components. 

Add `data-component="component-name"` to the element you'd like to track. Then add `data-link-name="link-name"` to the link for which clicks will be tracked.

## Custom component interactions

Components that are rendered on the client can be tracked by making an request to Ophan
in your JavaScript:

```js
import ophan from 'ophan/ng'

ophan.record({
  component: 'component name',
  value: 'foo'
})
```

The value property is optional.

You can use this request to track any type of interaction you like.

### Query in Athena

```sql
with dataset as (
  select page_view_id
  , interactions
  from pageview
  where received_date between date '2018-06-01' and date '2018-06-02'
  and cardinality(interactions) > 0
)
select page_view_id
, unnested_interactions
from dataset
cross join unnest(interactions) as t(unnested_interactions)
where unnested_interactions.component='component-name'
order by page_view_id desc
limit 100;
```

## Lazy components

Use [`common/modules/analytics/register`] to record the beginning and end time of a component's processing. The total execution time for the
component will be passed to Ophan.

### Query in Athena

```sql
with dataset as (
  select page_view_id
  , lazy_components
  from pageview
  where received_date between date '2018-06-04' and date '2018-06-05'
  and cardinality(lazy_components) > 0
)
select page_view_id
, components
from dataset
cross join unnest(lazy_components) as t(components)
where components.name='component-name'
```
