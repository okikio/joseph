let shrinkRay = require('@magento/shrink-ray');
let debug = require('debug')('okikio:server');
let cookieParser = require('cookie-parser');
let mcache = require('memory-cache');
let express = require('express');
let logger = require('morgan');
let helmet = require('helmet');
let http = require('http');
let path = require('path');
let app = express();
let server, port;

// List of routes
let { routes } = require("./config.min");
let { engine } = require("./engine.min");

// Cache times
let day = (1000 * 60 * 60 * 24).toString();
let week = (1000 * 60 * 60 * 24 * 7).toString();

// Cache Function [glitch.com/edit/#!/server-side-cache-express?path=server.js:8:0]
let cache = (duration) => {
    return (req, res, next) => {
        let barba = req.header("x-barba");
        let key = `__express__${barba ? '__barba__' : ''}${req.originalUrl || req.url}`;
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = body => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body);
            };
            next();
        }
    }
};

// A quick function to render webpage get requests
let render = (page = "index", data) => {
    return (req, res, next) => {
        res.render(page, { barba: req.header("x-barba"), data: data });
    };
};

// A quick get request function
let get = (route = "/", fn, dur = day) => {
    app.get(route, cache(dur), render(fn));
};

// Normalize a port into a number, string, or false.
let normalizePort = val => {
    let port = parseInt(val, 10);
    if (isNaN(port)) { return val; } // Named pipe
    if (port >= 0) { return port; } // Port number
    return false;
};

// Get port from environment and store in Express.
port = normalizePort(process.env.PORT || '3000');

// Protect server
app.use(helmet());

// Compress/GZIP/Brotil Server
app.use(shrinkRay());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));
app.use(express.static(path.join(__dirname, 'config.js'), { maxAge: day }));
app.use((req, res, next) => {
    if (req.originalUrl == '/favicon.ico') { res.status(204).json({ nope: true }); }
    else { next(); }
});

// View engine setup
app.engine("html", engine);
app.set('views', path.join(__dirname, './public'));
app.set('view engine', 'html');
app.set('view cache', true);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes and the pages to render
for (let i in routes)
    get(i, routes[i]);

// Catch error and forward to error handler
app.use(function(req, res, next) {
    next(createError(Number(404)));
});

// Error handler
app.use(function(err, req, res, next) {
    // Render the error page
    res.status(err.status || 500);
    res.send("There was an error: " + (err.status || 500));
});

// Set port
app.set('port', port);

// Create HTTP server.
server = http.createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(port);

// Event listener for HTTP server "error" event.
server.on('error', err => {
    if (err.syscall !== 'listen') { throw err; }
    let bind = typeof port === 'string' ?
        'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (err.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw err;
    }
});

// Event listener for HTTP server "listening" event.
server.on('listening', () => {
    let addr = server.address();
    let bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
});
