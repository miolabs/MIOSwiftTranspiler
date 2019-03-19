class ViewController extends UIViewController{
static readonly $infoAddress = '0x7fe224024128'
viewDidLoad($info0x7fe2240242d8){
let _this = this;

super.viewDidLoad({}, );
/*derived_to_base_expr*/_this.view[0].backgroundColor = _injectIntoOptional(UIColor.red);
}
initNibNameOptionalBundleOptional($info0x7fe225b01b00, nibNameOrNil, nibBundleOrNil){
let _this = this;

super.initNibNameOptionalBundleOptional({}, nibNameOrNil, nibBundleOrNil);
return ;
}
initCoderNSCoder($info0x7fe225b02f10, aDecoder){
let _this = this;

super.initCoderNSCoder({}, aDecoder);
return ;
}
static readonly initCoderNSCoder$failable = true

init$vars() {
if(super.init$vars)super.init$vars()
}
}

class AppDelegate extends UIResponder implements UIApplicationDelegate{
static readonly $infoAddress = '0x7fe224027a18'

_window$internal
_window$get() { return this._window$internal }
get _window() { return this._window$get() }
_window$set($newValue) {
let $oldValue = this._window$internal
this._window$internal = $newValue
}
set _window($newValue) { this._window$set($newValue) }
;





applicationDidFinishLaunchingWithOptions($info0x7fe224028088, application, launchOptions){
let _this = this;

_this._window = _injectIntoOptional(_create(UIWindow, 'initFrameCGRect', {}, UIScreen.main.bounds));

const vc = _create(ViewController, 'init', {}, );

;

;
_this._window[0].rootViewController = _injectIntoOptional(/*derived_to_base_expr*/vc);
_this._window[0].makeKeyAndVisible({}, );
return true;
}
applicationWillResignActive($info0x7fe224028a18, application){
let _this = this;

}
applicationDidEnterBackground($info0x7fe224028cb8, application){
let _this = this;

}
applicationWillEnterForeground($info0x7fe224028f58, application){
let _this = this;

}
applicationDidBecomeActive($info0x7fe2240291f8, application){
let _this = this;

}
applicationWillTerminate($info0x7fe224029498, application){
let _this = this;

}
init($info0x7fe22452e2a0){
let _this = this;

super.init({}, );
return ;
}

init$vars() {
if(super.init$vars)super.init$vars()
this._window$internal = Optional.none
}
}
if(typeof UIApplicationDelegate$implementation != 'undefined') _mixin(AppDelegate, UIApplicationDelegate$implementation, false)