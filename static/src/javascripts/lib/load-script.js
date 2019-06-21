// @flow
const loadScript = (src: string, props?: Object, text?: string): Promise<void> => {
    if (document.querySelector(`script[src="${src}"]`)) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const ref = document.scripts[0];
        const script = document.createElement('script');
        script.src = src;
        if (props) {
            Object.assign(script, props);
        }
        script.onload = resolve;
        script.onerror = () => {
            reject(new Error(`Failed to load script ${src}`));
        };
        if (text) {
            script.text = text;
        }
        if (ref.parentNode) {
            ref.parentNode.insertBefore(script, ref);
        }
    });
};


/*
* <script>
/* ----- Begin Step 1 ----- */
//Load the APS JavaScript Library
//!function(a9,a,p,s,t,A,g){if(a[a9])return;function q(c,r){a[a9]._Q.push([c,r])}a[a9]={init:function(){q("i",arguments)},fetchBids:function(){q("f",arguments)},setDisplayBids:function(){},targetingKeys:function(){return[]},_Q:[]};A=p.createElement(s);A.async=!0;A.src=t;g=p.getElementsByTagName(s)[0];g.parentNode.insertBefore(A,g)}
//("apstag",window,document,"script","//c.amazon-adsystem.com/aax2/apstag.js");


export { loadScript };
