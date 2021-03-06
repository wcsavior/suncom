var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var puremvc;
(function (puremvc) {
    var Controller = (function () {
        function Controller() {
            this.$commands = {};
            if (Controller.inst !== null) {
                throw Error(Controller.SINGLETON_MSG);
            }
            Controller.inst = this;
        }
        Controller.prototype.executeCommand = function (name, args) {
            var cls = this.$commands[name];
            var command = new cls();
            if (args === void 0) {
                command.execute.call(command);
            }
            else if (args instanceof Array) {
                command.execute.apply(command, args);
            }
            else {
                command.execute.call(command, args);
            }
        };
        Controller.prototype.registerCommand = function (name, cls) {
            if (this.hasCommand(name) === true) {
                throw Error("Register Duplicate Command " + name);
            }
            this.$commands[name] = cls;
            View.inst.registerObserver(name, this.executeCommand, this);
        };
        Controller.prototype.removeCommand = function (name) {
            if (this.hasCommand(name) === false) {
                throw Error("Remove Non-Existent Command " + name);
            }
            delete this.$commands[name];
            View.inst.removeObserver(name, this.executeCommand, this);
        };
        Controller.prototype.retrieveCommand = function (name) {
            return this.$commands[name] || null;
        };
        Controller.prototype.hasCommand = function (name) {
            return this.retrieveCommand(name) != null;
        };
        Controller.SINGLETON_MSG = "Controller singleton already constructed!";
        Controller.inst = null;
        return Controller;
    }());
    puremvc.Controller = Controller;
    var Facade = (function () {
        function Facade() {
            this.$view = new View();
            this.$model = new Model();
            this.$controller = new Controller();
            if (Facade.inst !== null) {
                throw Error(Facade.SINGLETON_MSG);
            }
            Facade.inst = this;
            this.$initializeFacade();
        }
        Facade.getInstance = function () {
            if (Facade.inst === null) {
                Facade.inst = new Facade();
            }
            return Facade.inst;
        };
        Facade.prototype.$initializeFacade = function () {
            this.$initMsgQ();
            this.$initializeModel();
            this.$initializeView();
            this.$initializeController();
        };
        Facade.prototype.$initMsgQ = function () {
        };
        Facade.prototype.$initializeModel = function () {
        };
        Facade.prototype.$initializeView = function () {
        };
        Facade.prototype.$initializeController = function () {
        };
        Facade.prototype.$regMMICmd = function (msgQMod, prefix) {
            this.$regMsgQCmd(msgQMod, prefix);
            suncore.Mutex.mmiMsgQMap[msgQMod] = true;
        };
        Facade.prototype.$regMsgQCmd = function (msgQMod, prefix) {
            suncore.Mutex.checkPrefix = true;
            suncore.Mutex.msgQMap[prefix] = msgQMod;
            suncore.Mutex.msgQCmd[msgQMod] = prefix;
        };
        Facade.prototype.registerObserver = function (name, method, caller, receiveOnce, priority) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            var observer = this.$view.registerObserver(name, method, caller, receiveOnce, priority);
            suncore.Mutex.deactive();
            return observer;
        };
        Facade.prototype.removeObserver = function (name, method, caller) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            this.$view.removeObserver(name, method, caller);
            suncore.Mutex.deactive();
        };
        Facade.prototype.hasObserver = function (name, method, caller) {
            suncore.Mutex.deactive();
            return this.$view.hasObserver(name, method, caller);
        };
        Facade.prototype.registerCommand = function (name, cls) {
            suncore.Mutex.deactive();
            this.$controller.registerCommand(name, cls);
        };
        Facade.prototype.removeCommand = function (name) {
            suncore.Mutex.deactive();
            this.$controller.removeCommand(name);
        };
        Facade.prototype.hasCommand = function (name) {
            suncore.Mutex.deactive();
            return this.$controller.hasCommand(name);
        };
        Facade.prototype.registerProxy = function (proxy) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            this.$model.registerProxy(proxy);
            suncore.Mutex.deactive();
        };
        Facade.prototype.removeProxy = function (name) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            this.$model.removeProxy(name);
            suncore.Mutex.deactive();
        };
        Facade.prototype.retrieveProxy = function (name) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            var proxy = this.$model.retrieveProxy(name);
            suncore.Mutex.deactive();
            return proxy;
        };
        Facade.prototype.hasProxy = function (name) {
            suncore.Mutex.deactive();
            return this.$model.hasProxy(name);
        };
        Facade.prototype.registerMediator = function (mediator) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            this.$view.registerMediator(mediator);
            suncore.Mutex.deactive();
        };
        Facade.prototype.removeMediator = function (name) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            this.$view.removeMediator(name);
            suncore.Mutex.deactive();
        };
        Facade.prototype.retrieveMediator = function (name) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            var mediator = this.$view.retrieveMediator(name);
            suncore.Mutex.deactive();
            return mediator;
        };
        Facade.prototype.hasMediator = function (name) {
            suncore.Mutex.deactive();
            return this.$view.hasMediator(name);
        };
        Facade.prototype.sendNotification = function (name, args, cancelable) {
            suncore.Mutex.active(suncore.MsgQModEnum.MMI);
            this.$view.notifyObservers(name, args, cancelable);
            suncore.Mutex.deactive();
        };
        Facade.prototype.notifyCancel = function () {
            suncore.Mutex.deactive();
            this.$view.notifyCancel();
        };
        Facade.SINGLETON_MSG = "Facade singleton already constructed!";
        Facade.inst = null;
        return Facade;
    }());
    puremvc.Facade = Facade;
    var Model = (function () {
        function Model() {
            this.$proxies = {};
            if (Model.inst !== null) {
                throw Error(Model.SINGLETON_MSG);
            }
            Model.inst = this;
        }
        Model.prototype.registerProxy = function (proxy) {
            var name = proxy.getProxyName();
            if (name === null) {
                throw Error("Register Invalid Proxy");
            }
            if (this.hasProxy(name) === true) {
                throw Error("Register Duplicate Proxy " + name);
            }
            if (suncore.Mutex.enableMMIAction() === false) {
                throw Error("\u975EMMI\u6A21\u5757\u7981\u7528\u63A5\u53E3");
            }
            this.$proxies[name] = proxy;
            proxy.onRegister();
        };
        Model.prototype.removeProxy = function (name) {
            if (name === void 0) {
                throw Error("Remove Invalid Proxy");
            }
            var proxy = this.retrieveProxy(name);
            if (proxy === null) {
                throw Error("Remove Non-Existent Proxy " + name);
            }
            if (suncore.Mutex.enableMMIAction() === false) {
                throw Error("\u975EMMI\u6A21\u5757\u7981\u7528\u63A5\u53E3");
            }
            delete this.$proxies[name];
            proxy.onRemove();
        };
        Model.prototype.retrieveProxy = function (name) {
            if (suncore.Mutex.enableMMIAction() === false) {
                throw Error("\u975EMMI\u6A21\u5757\u7981\u7528\u63A5\u53E3");
            }
            return this.$proxies[name] || null;
        };
        Model.prototype.hasProxy = function (name) {
            if (suncore.Mutex.enableMMIAction() === false) {
                throw Error("\u975EMMI\u6A21\u5757\u7981\u7528\u63A5\u53E3");
            }
            return this.retrieveProxy(name) != null;
        };
        Model.SINGLETON_MSG = "Model singleton already constructed!";
        Model.inst = null;
        return Model;
    }());
    puremvc.Model = Model;
    var Notifier = (function () {
        function Notifier(msgQMod) {
            this.$msgQMod = suncore.MsgQModEnum.MMI;
            this.$facade = Facade.getInstance();
            if (msgQMod !== void 0) {
                this.$msgQMod = msgQMod;
            }
        }
        Object.defineProperty(Notifier.prototype, "facade", {
            get: function () {
                suncore.Mutex.active(this.$msgQMod);
                return this.$facade;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "msgQMod", {
            get: function () {
                return this.$msgQMod;
            },
            enumerable: true,
            configurable: true
        });
        return Notifier;
    }());
    puremvc.Notifier = Notifier;
    var Proxy = (function (_super) {
        __extends(Proxy, _super);
        function Proxy(name, data) {
            var _this = _super.call(this) || this;
            if (name === void 0) {
                throw Error("Invalid Proxy Name");
            }
            _this.$proxyName = name;
            if (data !== void 0) {
                _this.$data = data;
            }
            return _this;
        }
        Proxy.prototype.getProxyName = function () {
            return this.$proxyName || null;
        };
        Proxy.prototype.onRegister = function () {
        };
        Proxy.prototype.onRemove = function () {
        };
        return Proxy;
    }(Notifier));
    puremvc.Proxy = Proxy;
    var SimpleCommand = (function (_super) {
        __extends(SimpleCommand, _super);
        function SimpleCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return SimpleCommand;
    }(Notifier));
    puremvc.SimpleCommand = SimpleCommand;
    var View = (function () {
        function View() {
            this.$mediators = {};
            this.$observers = {};
            this.$isCanceled = false;
            this.$onceObservers = [];
            if (View.inst !== null) {
                throw Error(View.SINGLETON_MSG);
            }
            View.inst = this;
        }
        View.prototype.registerObserver = function (name, method, caller, receiveOnce, priority) {
            if (receiveOnce === void 0) { receiveOnce = false; }
            if (priority === void 0) { priority = 1; }
            if (name === void 0) {
                throw Error("Register Invalid Observer");
            }
            if (method === void 0) {
                throw Error("Register Invalid Observer Method");
            }
            var observers = this.$observers[name];
            if (observers === void 0) {
                observers = this.$observers[name] = [false];
            }
            else if (observers[0] === true) {
                observers = this.$observers[name] = observers.concat();
                observers[0] = false;
            }
            var index = -1;
            for (var i = 1; i < observers.length; i++) {
                var observer_1 = observers[i];
                if (observer_1.method === method && observer_1.caller === caller) {
                    return null;
                }
                if (index === -1 && observer_1.priority < priority) {
                    index = i;
                }
            }
            suncore.Mutex.create(name, caller);
            var observer = {
                name: name,
                caller: caller,
                method: method,
                priority: priority,
                receiveOnce: receiveOnce
            };
            if (index < 0) {
                observers.push(observer);
            }
            else {
                observers.splice(index, 0, observer);
            }
            return observer;
        };
        View.prototype.removeObserver = function (name, method, caller) {
            if (name === void 0) {
                throw Error("Remove Invalid Observer");
            }
            if (method === void 0) {
                throw Error("Remove Invalid Observer Method");
            }
            var observers = this.$observers[name];
            if (observers === void 0) {
                return;
            }
            if (observers[0] === true) {
                observers = this.$observers[name] = observers.concat();
                observers[0] = false;
            }
            for (var i = 1; i < observers.length; i++) {
                var observer = observers[i];
                if (observer.method === method && observer.caller === caller) {
                    observers.splice(i, 1);
                    suncore.Mutex.release(name, caller);
                    break;
                }
            }
            if (observers.length === 1) {
                delete this.$observers[name];
            }
        };
        View.prototype.hasObserver = function (name, method, caller) {
            if (name === void 0) {
                throw Error("Remove Invalid Observer");
            }
            if (method === void 0) {
                throw Error("Remove Invalid Observer Method");
            }
            var observers = this.$observers[name];
            if (observers === void 0) {
                return false;
            }
            for (var i = 1; i < observers.length; i++) {
                var observer = observers[i];
                if (observer.method === method && observer.caller === caller) {
                    return true;
                }
            }
            return false;
        };
        View.prototype.notifyCancel = function () {
            this.$isCanceled = true;
        };
        View.prototype.notifyObservers = function (name, args, cancelable) {
            if (cancelable === void 0) { cancelable = false; }
            if (name === void 0) {
                throw Error("Notify Invalid Command");
            }
            var observers = this.$observers[name];
            if (observers === void 0) {
                return;
            }
            observers[0] = true;
            suncore.Mutex.lock(name);
            var isCanceled = this.$isCanceled;
            this.$isCanceled = false;
            for (var i = 1; i < observers.length; i++) {
                var observer = observers[i];
                if (observer.receiveOnce === true) {
                    this.$onceObservers.push(observer);
                }
                if (observer.caller === Controller.inst) {
                    observer.method.call(observer.caller, name, args);
                }
                else if (args === void 0) {
                    observer.method.call(observer.caller);
                }
                else if (args instanceof Array) {
                    observer.method.apply(observer.caller, args);
                }
                else {
                    observer.method.call(observer.caller, args);
                }
                if (cancelable === true && this.$isCanceled) {
                    break;
                }
            }
            this.$isCanceled = isCanceled;
            observers[0] = false;
            suncore.Mutex.unlock(name);
            while (this.$onceObservers.length > 0) {
                var observer = this.$onceObservers.pop();
                this.removeObserver(observer.name, observer.method, observer.caller);
            }
        };
        View.prototype.registerMediator = function (mediator) {
            var name = mediator.getMediatorName();
            if (name === null) {
                throw Error("Register Invalid Mediator");
            }
            if (this.hasMediator(name) === true) {
                throw Error("Register Duplicate Mediator " + name);
            }
            if (suncore.Mutex.enableMMIAction() === false) {
                throw Error("\u975EMMI\u6A21\u5757\u7981\u7528\u63A5\u53E3");
            }
            this.$mediators[name] = mediator;
            mediator.listNotificationInterests();
            mediator.onRegister();
        };
        View.prototype.removeMediator = function (name) {
            if (name === void 0) {
                throw Error("Remove Invalid Mediator");
            }
            var mediator = this.retrieveMediator(name);
            if (mediator === null) {
                throw Error("Remove Non-Existent Mediator " + name);
            }
            if (suncore.Mutex.enableMMIAction() === false) {
                throw Error("\u975EMMI\u6A21\u5757\u7981\u7528\u63A5\u53E3");
            }
            delete this.$mediators[name];
            mediator.removeNotificationInterests();
            mediator.onRemove();
        };
        View.prototype.retrieveMediator = function (name) {
            if (suncore.Mutex.enableMMIAction() === false) {
                throw Error("\u975EMMI\u6A21\u5757\u7981\u7528\u63A5\u53E3");
            }
            return this.$mediators[name] || null;
        };
        View.prototype.hasMediator = function (name) {
            if (suncore.Mutex.enableMMIAction() === false) {
                throw Error("\u975EMMI\u6A21\u5757\u7981\u7528\u63A5\u53E3");
            }
            return this.retrieveMediator(name) != null;
        };
        View.SINGLETON_MSG = "View singleton already constructed!";
        View.inst = null;
        return View;
    }());
    puremvc.View = View;
    var MacroCommand = (function (_super) {
        __extends(MacroCommand, _super);
        function MacroCommand() {
            var _this = _super.call(this) || this;
            _this.$commands = [];
            _this.initializeMacroCommand();
            return _this;
        }
        MacroCommand.prototype.addSubCommand = function (cls) {
            this.$commands.push(cls);
        };
        MacroCommand.prototype.execute = function () {
            for (var i = 0; i < this.$commands.length; i++) {
                var cls = this.$commands[i];
                var command = new cls();
                command.execute.apply(command, arguments);
            }
        };
        return MacroCommand;
    }(Notifier));
    puremvc.MacroCommand = MacroCommand;
    var Mediator = (function (_super) {
        __extends(Mediator, _super);
        function Mediator(name, viewComponent) {
            var _this = _super.call(this) || this;
            _this.$notificationInterests = [];
            if (name === void 0) {
                throw Error("Invalid Mediator Name");
            }
            _this.$mediatorName = name;
            if (viewComponent !== void 0) {
                _this.$viewComponent = viewComponent;
            }
            return _this;
        }
        Mediator.prototype.onRegister = function () {
        };
        Mediator.prototype.onRemove = function () {
        };
        Mediator.prototype.getMediatorName = function () {
            return this.$mediatorName || null;
        };
        Mediator.prototype.getViewComponent = function () {
            return this.$viewComponent || null;
        };
        Mediator.prototype.listNotificationInterests = function () {
        };
        Mediator.prototype.removeNotificationInterests = function () {
            for (var i = 0; i < this.$notificationInterests.length; i++) {
                var observer = this.$notificationInterests[i];
                this.facade.removeObserver(observer.name, observer.method, observer.caller);
            }
        };
        Mediator.prototype.handleNotification = function (name, method) {
            var observer = this.facade.registerObserver(name, method, this);
            observer && this.$notificationInterests.push(observer);
        };
        return Mediator;
    }(Notifier));
    puremvc.Mediator = Mediator;
})(puremvc || (puremvc = {}));
