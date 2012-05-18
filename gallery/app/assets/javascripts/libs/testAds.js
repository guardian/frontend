// psuedo markup of ads, experimental
guardian.ads = {
    'base': {
        '300': [
            {
                type: 'image',
                src: 'http://images.mpression.net/image/19982/soulmates_300.gif',
                width: 300,
                height: 50
            }
        ]
    },

    /* copied from base, for now */
    'median': {
        '300': [
            {
                type: 'image',
                src: 'http://images.mpression.net/image/19982/soulmates_300.gif',
                width: 300,
                height: 50
            }
        ]
    },

    'extended': {

        '300': [
            {
                type: 'image',
                src: 'http://s0.2mdn.net/2061777/PID_2017879_EN_expandable_bus_300x250_Emirates.gif',
                width: 300,
                height: 250
            },
            {
                type: 'iframe',
                src: 'http://optimized-by.rubiconproject.com/a/7845/13015/25941-15.html?',
                width: 300,
                height: 250
            }
        ],

        '728': [
            {
                type: 'image',
                src: 'http://s0.2mdn.net/2061777/PID_2017864_EN_standard_728_90_ny_bus.gif',
                width: 728,
                height: 90
            },
            {
                type: 'image',
                src: 'http://imageceu1.247realmedia.com/RealMedia/ads/Creatives/Guardian/responsibletravel.com_BT_March_Leader_DR/guardianBanner-728x90.jpg/1332516092',
                width: 728,
                height: 90
            }
        ]

    }
};

// process ads
function findAvailableAd(layoutMode) {
    var slotWidth = 300; // assume base
    
    // todo -- add median mode
    switch(layoutMode) {
        case "extended":
            slotWidth = 728;
            break;
    }

    var availableAds = guardian.ads[layoutMode][slotWidth];
    var numAvailableAds = availableAds.length;
    // pick a random one
    var index = Math.floor(Math.random() * numAvailableAds);
    var adToUse = availableAds[index];
    return adToUse;
}

function renderAd(ad) {
    var html = '';
    switch(ad.type) {
        case "image":
            html = '<img src="{0}" width="{1}" height="{2}" />'.format(ad.src, ad.width, ad.height);
            break;
        case "iframe":
            html = '<iframe src="{0}" width="{1}" height="{2}" frameborder="0"></iframe>'.format(ad.src, ad.width, ad.height);
            break;
    }

    var adSpot = document.getElementById('top-ad-placeholder');
    adSpot.innerHTML = html;
}

// experiment to show correctly-sized ads
var ad = findAvailableAd(detect.getLayoutMode());
var adHtml = renderAd(ad);