# Archiving

The Guardian has not typically not made a clean break from the past when upgrading its CMSs or redesigning the website. Each new
system/design/strategy has created a debris of things left behind.

Colloquially, this is called 'the archive' - resources we published at some point in the past and want to keep accessible, but whose
systems we need to turn off.

We want to archive this content for safe keeping and remove the technical systems used to create it.

This outlines the archival procedure for The Guardian website.

# How

Essentially, archiving parts of the website boils down to,

- Making a copy of the HTML representation of the resource.
- Transferring it to S3.
- Enabling a public route to the resource in order to preserve the URL.

This freezes the document in time and removes our ability to update it.

## Procedure

`wget` is a good tool to cache an HTML page locally,

```
wget -x -P target/cache/ http://www.theguardian.com/artanddesign/2012...
```

This will create a local copy of the file under a path than corresponds to the path of the URL.

```
target/
├── cache
│   └── www.theguardian.com
│       └── artanddesign
│           └── 2012
│               └── sep
│                   └── 20
│                       └── feature-photojournalist-emilio-morenatti
```


That can then be transfered to our S3 bucket,

```
s3cmd put -m text/html \
  --add-header 'Cache-Control: max-age=60' \
  --acl-public \
  --recursive \
  target/cache/www.theguardian.com/ s3://aws-frontend-archive/www.theguardian.com/
```

## Testing

You can test a document is being served by S3 from the presence of `x-amz-*` headers in the HTTP response.

```
# Through the frontend
curl -I http://www.theguardian.com/sudoku/page/0,,2294974,00.html

# Directly to S3
curl -I http://aws-frontend-archive.s3.amazonaws.com/www.theguardian.com/media/page/2007/oct/02/6
```

Yields,

```
...
via:HTTP/1.1 proxy434
x-amz-id-2:bHUYdpKrbynfFsUeBbC4JGN873kiZpdxqucgRiDZWruvJE87QppaIM/eFG80QCRd
x-amz-request-id:3792D3242A961E47
X-Gu-Cache-Control:max-age=259200
...
```

## Page dependencies

For all practical purposes the static assets (aka. page furniture) live on a separate domain to the HTML content.

We don't archive any the page dependencies (Eg. CSS, JavaScript etc.) as it more often than not breaks the page, especially when CSS and JavaScript are
used.

The static asset servers can be archived at a later date, and the host names retained.

# Take down notices

An archived document is frozen in time and can no longer be updated by a CMS.

Should you receive a legal take down notice then you can use the frontend admin tool (Development tools > Press-a-page
(R2) > Specify url and check 'Takedown').

Should it be urgent you may wish to HTTP 410 the route (in Nginx or CDN) until the S3 cache expires (by default this appears to be about 3 days).

# From beyond the grave

Once traffic is redirected away from R2 it will no longer be publicly accessible. However, it's still possible to retrieve documents from
the R2 DocRoot should the need arise.

For example,

```
wget -x -P target/cache --header='Host:www.theguardian.com' xxx.xxx.xxx.xxx/developmentcompetition/gsk/page/0,,2263431,00.html
```

Where _xxx.xxx.xxx.xxx_ is the IP address of the R2 backend (available in our Varnish configuration) or via `dig`.

## S3

- The archive bucket exists under the frontend AWS account.
- The S3 bucket is called 'aws-frontend-archive'.
- The default cache time of each resource in the bucket is 3 days.
- It is not backed up but a copy of each document remains on the R2 DocRoot should it be needed.
