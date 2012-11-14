define(['common', 'reqwest'], function (Common, reqwest) {
 
    // fire some test adverts here & see what comes back
    window.document.write = function(a) {
        console.log(a);
    }   
    
    var DocWrite = function (config) {

        var config = config;

        this.getPageUrl = function(){
            return config.page.pageId + '/oas.html'
        }

        this.getKeywords = function() {
            return config.page.keywords.split(',').map(function(keyword){
                return 'k=' + encodeURIComponent(keyword.toLowerCase())
            }).join('&')
        } 
    
        this.getPageType = function() {
            return config.page.contentType.toLowerCase();
        }

        this.getCategory = function() {
            return config.page.section.toLowerCase();
        }

        this.constructUrl = function() {
            
            return config.page.oasUrl + 
               'adstream_mjx.ads/' + 
                this.getPageUrl() + '/' +
                Math.random().toString().substring(2,11) + '@Top2,Bottom2' +
                '?' + this.getKeywords() + 
                '&pt=' + this.getPageType() + 
                '&ct=' + this.getPageType();
        }
    
        this.load = function() { 
            reqwest({
                url: this.constructUrl(),
                type: 'jsonp',
                success: function (json) {
                    eval(json);
                     //common.mediator.emit('modules:related:loaded', [js]);
                },
                error: function () {
                    //common.mediator('module:error', 'Failed to load related', 'document-write.js');
                }
            });
        }
        // TODO - call - OAS_RICH('Bottom2') - on success

    }

    return DocWrite;
    
});

 /* 
    OAS_version = 11;   
    if ((navigator.userAgent.indexOf('Mozilla/3') != -1) || (navigator.userAgent.indexOf('Mozilla/4.0 WebTV') != -1))  
        OAS_version = 10; 
    
    if (OAS_version >= 11) 
        document.write('<scr' + 'ipt language="JavaScript1.1" src="' + OAS_url + 'adstream_mjx.ads/' + OAS_sitepage + '/1' + OAS_rns + '@' + OAS_listpos + '?' + OAS_query + '"><\/script>');
*/

/*
    document.write('');  
    function OAS_AD(pos) { 
        if (OAS_version >= 11)  {
            OAS_RICH(pos);
            //console.log('OAS_RICH RAN');
        }else{ 
            OAS_NORMAL(pos);
            //console.log('OAS_NORMAL RAN');
        }
    }  


/*
<SCRIPT LANGUAGE=JavaScript>
<!--
OAS_AD('Top2');
//-->  
</SCRIPT>
*/

/*
    function OAS_NORMAL(pos) {
        document.write('<A HREF="' + OAS_url + 'click_nx.ads/' + OAS_sitepage + '/1' + OAS_rns + '@' + OAS_listpos + '!' + pos + '?' + OAS_query + '" TARGET=' + OAS_target + '>'); 
        document.write('<IMG SRC="' + OAS_url + 'adstream_nx.ads/' + OAS_sitepage + '/1' + OAS_rns + '@' + OAS_listpos + '!' + pos + '?' + OAS_query + '" BORDER=0></A>'); 
    }

    OAS_NORMAL()

    return true
})

*/

