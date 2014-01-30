self.addEventListener('message', function(e){

var data = e.data;
switch (data.cmd) {
	case 'start':
	    weevil_main();
            break;
        case 'stop':
            self.close(); // Terminates the worker.
            break;
}
	WEEVIL_MAIN_FUNCTION

}, false);
