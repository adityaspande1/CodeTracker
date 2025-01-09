/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const githubAuth_1 = __webpack_require__(2);
const workSpaceTracker_1 = __webpack_require__(3);
function activate(context) {
    const outputChannel = vscode.window.createOutputChannel('CodeTracker');
    console.log('CodeTracker extension is now active!');
    // Register "Hello World" command
    registerHelloWorldCommand(context);
    // Register GitHub Authentication command
    registerGitHubAuthCommand(context);
    // Initialize and track workspace changes
    initializeWorkSpaceTracking(outputChannel);
}
function registerHelloWorldCommand(context) {
    const disposable = vscode.commands.registerCommand('codetracker.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from CodeTracker!');
    });
    context.subscriptions.push(disposable);
}
function registerGitHubAuthCommand(context) {
    const disposable = vscode.commands.registerCommand('codetracker.authenticate', async () => {
        const userResponse = await vscode.window.showInformationMessage('Allow CodeTracker to Authenticate with GitHub', 'Yes', 'No');
        if (userResponse === 'Yes') {
            try {
                const session = await (0, githubAuth_1.githubAuthenticate)();
                console.log('GitHub Session:', session);
                vscode.window.showInformationMessage('GitHub Authentication Successful!');
            }
            catch (error) {
                vscode.window.showErrorMessage(`GitHub Authentication failed: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('Authentication canceled.');
        }
    });
    context.subscriptions.push(disposable);
}
function initializeWorkSpaceTracking(outputChannel) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showInformationMessage('No workspace folders found.');
        return;
    }
    const workspaceTracker = new workSpaceTracker_1.WorkSpaceTracker(outputChannel);
    workspaceTracker.getTrackedChanges();
    vscode.window.showInformationMessage(`Workspace folders initialized. Tracking changes for: ${workspaceFolders
        .map(folder => folder.uri.fsPath)
        .join(', ')}`);
}
function deactivate() {
    console.log('CodeTracker extension has been deactivated.');
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.githubAuthenticate = githubAuthenticate;
const vscode_1 = __webpack_require__(1);
async function githubAuthenticate() {
    const session = await vscode_1.authentication.getSession('github', ['repo'], { createIfNone: true });
    if (!session) {
        vscode_1.window.showErrorMessage("Github authentication failed");
        return;
    }
    vscode_1.window.showInformationMessage("Github authenticated successfully with  " + session.account.label);
    console.log("session", session);
    return session;
}


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkSpaceTracker = void 0;
// src/services/fileTracker.ts
const vscode = __importStar(__webpack_require__(1));
const events_1 = __webpack_require__(4);
const path = __importStar(__webpack_require__(5));
class WorkSpaceTracker extends events_1.EventEmitter {
    watcher = null;
    ignorePatterns = [];
    workSpaceChanges = new Map();
    logChannel;
    constructor(logChannel) {
        super();
        this.logChannel = logChannel;
        this.setupWatcher();
    }
    setupWatcher() {
        this.logChannel.appendLine('FileTracker: Initializing file watcher...');
        this.ignorePatterns = vscode.workspace
            .getConfiguration('filetracker')
            .get('ignore') || [];
        this.watcher = vscode.workspace.createFileSystemWatcher('**/*', false, // This will include Creation
        false, // This includes Change
        false // Include deletion
        );
        this.watcher.onDidCreate((uri) => this.trackChange(uri, 'created'));
        this.watcher.onDidChange((uri) => this.trackChange(uri, 'modified'));
        this.watcher.onDidDelete((uri) => this.trackChange(uri, 'deleted'));
        this.logChannel.appendLine('FileTracker: File watcher initialized.');
    }
    trackChange(uri, type) {
        const relativePath = vscode.workspace.asRelativePath(uri);
        // Check if file matches ignore patterns
        const isIgnored = this.ignorePatterns.some((pattern) => new RegExp(pattern).test(relativePath));
        if (isIgnored) {
            this.logChannel.appendLine(`FileTracker: Ignored file ${relativePath}.`);
            return;
        }
        const validExtensions = ['js', 'ts', 'html', 'css', 'json', 'md', 'java', 'py'];
        const extension = path.extname(uri.fsPath).substring(1);
        if (validExtensions.includes(extension)) {
            const change = {
                uri,
                type,
                time: new Date(),
            };
            this.workSpaceChanges.set(uri.fsPath, change);
            this.emit('fileChange', change);
            this.logChannel.appendLine(`FileTracker: ${type.toUpperCase()} detected in ${relativePath}`);
        }
    }
    getTrackedChanges() {
        return Array.from(this.workSpaceChanges.values());
    }
    clearChanges() {
        this.workSpaceChanges.clear();
        this.logChannel.appendLine('FileTracker: Cleared all tracked changes.');
    }
    updateIgnorePatterns(patterns) {
        this.ignorePatterns = patterns;
        this.logChannel.appendLine(`FileTracker: Updated ignore patterns to: ${patterns.join(', ')}`);
    }
    dispose() {
        this.watcher?.dispose();
        this.logChannel.appendLine('FileTracker: Disposed file watcher.');
    }
}
exports.WorkSpaceTracker = WorkSpaceTracker;


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("events");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map