define([
    'common/utils/config',
    'common/modules/experiments/ab',
], function (
    config,
    ab
) {
    // The Nielsen NetRatings tag. Also known as IMR worldwide.
    var imrWorldwideUrl = '//secure-dcr.imrworldwide.com/novms/js/2/ggcmb510.js';

    var guMetadata = {
      "books": "T5033A084-E9BF-453A-91D3-C558751D9A85",
      "business": "T5B109609-6223-45BA-B052-55F34A79D7AD",
      "commentisfree": "TA878EFC7-93C8-4352-905E-9E03883FD6BD",
      "artanddesign": "TE5076E6F-B85D-4B45-9536-F150EF3FC853",
      "culture": "TE5076E6F-B85D-4B45-9536-F150EF3FC853",
      "stage": "TE5076E6F-B85D-4B45-9536-F150EF3FC853",
      "education": "T4A01DB74-5B97-435A-89F0-C07EA2C739EC",
      "environment": "T2F34A388-A280-4C3F-AF43-FAF16EFCB7B1",
      "cities": "T2F34A388-A280-4C3F-AF43-FAF16EFCB7B1",
      "global-development": "T2F34A388-A280-4C3F-AF43-FAF16EFCB7B1",
      "sustainable-business": "T2F34A388-A280-4C3F-AF43-FAF16EFCB7B1",
      "fashion": "TCF345621-F34D-40B2-852C-6223C9C8F1E2",
      "film": "T878ECFA5-14A7-4038-9924-3696C93706FC",
      "law": "T1FA129DD-9B9E-49BB-98A4-AA7ED8523DFD",
      "lifeandstyle": "TCFE04250-E5F6-48C7-91DB-5CED6854818C",
      "media": "T1434DC6D-6585-4932-AE17-2864CD0AAE99",
      "money": "TB71E7F1E-F231-4F73-9CC8-BE8822ADD0C2",
      "music": "T78382DEE-CC9B-4B36-BD27-809007BFF300",
      "international": "T505182AA-1D71-49D8-8287-AA222CD05424",
      "au": "T505182AA-1D71-49D8-8287-AA222CD05424",
      "australia-news": "T505182AA-1D71-49D8-8287-AA222CD05424",
      "uk": "T505182AA-1D71-49D8-8287-AA222CD05424",
      "uk-news": "T505182AA-1D71-49D8-8287-AA222CD05424",
      "us": "T505182AA-1D71-49D8-8287-AA222CD05424",
      "us-news": "T505182AA-1D71-49D8-8287-AA222CD05424",
      "world": "T505182AA-1D71-49D8-8287-AA222CD05424",
      "politics": "T5B7468E3-CE04-40FD-9444-22FB872FE83E",
      "careers": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "culture-professionals-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "global-development-professionals-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "government-computing-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "guardian-professional": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "healthcare-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "higher-education-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "housing-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "local-government-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "local-leaders-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "public-leaders-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "small-business-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "social-care-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "teacher-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "voluntary-sector-network": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "women-in-leadership": "T3637DC6B-E43C-4E92-B22C-3F255CC573DA",
      "science": "TDAD6BC22-C97B-4151-956B-7F069B2C56E9",
      "society": "T7AF4A592-96FB-4255-B33F-352406F4C7D2",
      "sport": "TCC1AEBB6-7D1A-4F34-8256-EFC314E5D0C3",
      "football": "TCC1AEBB6-7D1A-4F34-8256-EFC314E5D0C3",
      "technology": "T29EF991A-3FEE-4215-9F03-58EACA8286B9",
      "travel": "TD1CEDC3E-2653-4CB6-A4FD-8A315DE07548",
      "tv-and-radio": "T66E48909-8FC9-49E8-A7E6-0D31C61805AD",
      "brand-only": "T0EE0F4F4-8D7C-4082-A2A4-82C84728DC59"
    }

    function onLoad() {
      var sectionFromMeta = config.page.section.toLowerCase();
      var subBrandApId = guMetadata[sectionFromMeta] || guMetadata["brand-only"];

      var sectionRef = (sectionFromMeta in guMetadata) ? sectionFromMeta : "The Guardian - brand only"

      var _nolggGlobalParams = {
        sfcode:"dcr",
        apid: subBrandApId,
        apn: "theguardian"
      };

      // Lets assume that the imrworldwide library is defining NOLCMB
      /*eslint-disable no-undef*/
      var nSdkInstance = NOLCMB.getInstance(_nolggGlobalParams.apid);
      nSdkInstance.ggInitialize(_nolggGlobalParams);

      var dcrStaticMetadata = {
        type: "static",
        assetid: config.page.pageId,
        section: sectionRef
      }

      nSdkInstance.ggPM("staticstart", dcrStaticMetadata);
    }

    return {
        shouldRun: config.switches.imrWorldwide && ab.getTestVariantId("NeilsenCheck") === "opt-in",
        url: imrWorldwideUrl,
        onLoad: onLoad
    };

});
