@()
{
    "name":"The Guardian",
    "short_name":"The Guardian",
    "icons":[
    {
        "type": "image/png",
        "sizes": "152x152",
        "src": "@{JavaScript(Static("images/favicons/152x152.png").path)}"
    },
    {
        "type": "image/png",
        "sizes": "114x114",
        "src": "@{JavaScript(Static("images/favicons/114x114.png").path)}"
    }
    ],
    "start_url": "/uk?INTCMP=webapp",
    "display": "browser",
    "orientation": "portrait",
    "gcm_sender_id":"660236028602",
    "gcm_user_visible_only":true,
    "permissisons" : [
     "gcm"
     ]
}
