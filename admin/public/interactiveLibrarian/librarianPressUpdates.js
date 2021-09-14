let eventSource;

// we define the event source - this will post events we receive to the
// worker (defined below)
self.addEventListener('message', function(e) {
    switch(e.data) {
        case "END":
            eventSource.close();
            self.close(); // this closes the worker
            break;

        default:
            eventSource = new EventSource(`/interactive-librarian/press-status-updates/${e.data}`);
            eventSource.addEventListener('message', function( event ) {
                console.log('event', event)
                postMessage(event.data);
            });

            eventSource.onerror = function(e) {
                console.log('error', e);
            };
    }
}, false);
