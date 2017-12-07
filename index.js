var express = require('express');
var WebSocketServer = require('coffeecat-ws');

/**
 * @typedef {{container: string, path: string}} Container
 * @typedef {{name: string, port: number, listen: string|boolean, websockets?: boolean, ssl?: boolean}} AppletProtocol
 * @typedef {{applet: Container, errorTemplate: string, protocols: AppletProtocol[]}} AppletConfig
 * @typedef {{dotfiles?: string, etag?: boolean, extensions?: string[], fallthrough?: boolean, immutable?: boolean, index?: boolean | string | string[], lastModified?: boolean, maxAge?: number | string, redirect?: boolean, setHeaders?: (res: Response, path: string, stat: any) => any}} ServeStaticOptions
 */


class Applet {
    /**
     * Creates a new applet
     * @param {AppletConfig} config 
     * @param {WebSocketServer} webSocketServer 
     */
    constructor(config, webSocketServer) {
        this.__config = config;
        this.__wss = webSocketServer;
        this.__app = express();
    }

    /** @type {Express} */
    get app() {
        return this.__app;
    }

    /** @type {AppletConfig} */
    get configuration() {
        return this.__configuration;
    }

    /** @type {WebSocketServer} */
    get wss() {
        return this.__webSocketServer;
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
        this.app.use(sessionEngine.apply(sessionEngine, args));
    }
}

module.exports = Applet;
