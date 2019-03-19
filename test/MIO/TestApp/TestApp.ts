class ViewController extends UIViewController{
static readonly $infoAddress = '0x7fc50908a728'
viewDidLoad($info0x7fc50908a8d8){
let _this = this;

super.viewDidLoad({}, );
/*derived_to_base_expr*/_this.view[0].backgroundColor = _injectIntoOptional(UIColor.red);
}
init1($info0x7fc5092b0f00, nibNameOrNil, nibBundleOrNil){
let _this = this;

super.init1({}, nibNameOrNil, nibBundleOrNil);
return ;
}
init2($info0x7fc5092b2310, aDecoder){
let _this = this;

super.init2({}, aDecoder);
return ;
}
static readonly init2$failable = true

init$vars() {
if(super.init$vars)super.init$vars()
}
}

class AppDelegate extends UIResponder implements UIApplicationDelegate{
static readonly $infoAddress = '0x7fc50908e018'

_window$internal
_window$get() { return this._window$internal }
get _window() { return this._window$get() }
_window$set($newValue) {
let $oldValue = this._window$internal
this._window$internal = $newValue
}
set _window($newValue) { this._window$set($newValue) }
;





application($info0x7fc50908e688, application, launchOptions){
let _this = this;

_this._window = _injectIntoOptional(_create(UIWindow, 'init3', {}, UIScreen.main.bounds));

const vc = _create(ViewController, 'init', {}, );

;

;
_this._window[0].rootViewController = _injectIntoOptional(/*derived_to_base_expr*/vc);
_this._window[0].makeKeyAndVisible({}, );
return true;
}
applicationWillResignActive($info0x7fc50908f018, application){
let _this = this;

}
applicationDidEnterBackground($info0x7fc50908f2b8, application){
let _this = this;

}
applicationWillEnterForeground($info0x7fc50908f558, application){
let _this = this;

}
applicationDidBecomeActive($info0x7fc50908f7f8, application){
let _this = this;

}
applicationWillTerminate($info0x7fc50908fa98, application){
let _this = this;

}
init($info0x7fc5098752a0){
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