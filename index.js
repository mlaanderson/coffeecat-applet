const EventEmitter = require('events');
var express = require('express');

/**
 * @typedef {{container: string, path: string}} Container
 * @typedef {{name: string, port: number, listen: string|boolean, websockets?: boolean, ssl?: boolean}} AppletProtocol
 * @typedef {{applet: Container, errorTemplate: string, protocols: AppletProtocol[]}} AppletConfig
 * @typedef {{dotfiles?: string, etag?: boolean, extensions?: string[], fallthrough?: boolean, immutable?: boolean, index?: boolean | string | string[], lastModified?: boolean, maxAge?: number | string, redirect?: boolean, setHeaders?: (res: Response, path: string, stat: any) => any}} ServeStaticOptions
 */


class Applet extends EventEmitter {
    /**
     * Creates a new applet
     * @param {AppletConfig} config 
     */
    constructor(config) {
        super();
        this.__config = config;
        this.__app = express();
        this.__session = false;
    }

    /** @type {Express} */
    get app() {
        return this.__app;
    }

    /** @type {AppletConfig} */
    get configuration() {
        return this.__config;
    }

    /**
     * Allows the applet to intercept an upgrade and add a session 
     * to the request.
     * @param {net.Request} req 
     * @param {net.Socket} socket 
     * @param {Buffer} head 
     */
    upgrade(req, socket, head) {
        if (this.__session) {
            this.__session(req, 
            // this is a fake http.Response object with just
            // enough functionality for a session to be created
            {
                write: function() {},
                end: function() {},
                getHeader: function() { return null; },
                setHeader: function() {}
            }, () => {
                // only emit the upgrade after the session has
                // been added to the request
                this.emit('upgrade', req, socket, head);
            });
        } else {
            this.emit('upgrade', req, socket, head);
        }
    }

    /**
     * 
     * @param {string} engine the view engine to use for templates
     */
    setViewEngine(engine) {
        this.app.set('view engine', engine);
    }

    /**
     * 
     * @param {string} root the directory path to search for templates
     */
    setViewPath(root) {
        this.app.set('views', root);
    }

    /**
     * 
     * @param {string} root 
     * @param {ServeStaticOptions} [config]
     */
    setStaticContentPath(root, config) {
        this.app.use(express.static(root, config));
    }

    /**
     * 
     * @param {string} engine 
     * @param {*} args 
     */
    setSession(engine, ...args) {
        let sessionEngine = require(engine);
        this.__session = sessionEngine.apply(sessionEngine, args)
        this.app.use(this.__session);
    }
}

module.exports = Applet;
