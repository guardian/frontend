videojs-persistvolume
========================

A plugin for Video.js that saves user's volume setting using [localStorage](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage#localStorage), but falls back to cookies if necessary.

###Usage
Include the plugin:

```
<script src="videojs.persistvolume.js"></script>
```

Add persistVolume to plugins object with one option, namespace.

    plugins: {
	    persistVolume: {
		    namespace: 'So-Viral-So-Hot'
	    }
    }

