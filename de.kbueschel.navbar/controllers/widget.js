var LTAG = '[de.kbueschel.navbar]',
    
    ANIMATION_DURATION_SCROLL_NAV_BAR = 150,
    
    OS_API_LEVEL = OS_ANDROID ? Ti.Platform.Android.API_LEVEL : undefined,
    OS_PRE_KITKAT = OS_API_LEVEL < 19,
    OS_PRE_LOLLIPOP = OS_API_LEVEL < 21,
    
    OS_STATUS_BAR_HEIGHT = (function() {
        
        var statusBarHeight = 0,
            defaultUnit = Ti.App.Properties.getString('ti.ui.defaultunit', 'system'),
            useDIP = (defaultUnit === 'dp' || defaultUnit === 'dip');
        
        
        if (OS_ANDROID) {
            
            statusBarHeight = Math.round((25 * Ti.Platform.displayCaps.dpi) / 160);
            
            useDIP && (statusBarHeight = require('alloy/measurement').pxToDP(statusBarHeight));
        }
        else if (OS_IOS) {
            
            statusBarHeight = (useDIP ? 20 : (20 * Ti.Platform.displayCaps.logicalDensityFactor));
        }
        
        return statusBarHeight;
        
    })(),
    
    OS_NAVIGATION_BAR_HEIGHT = (function() {
        
        var navigationBarHeight = 0,
            defaultUnit = Ti.App.Properties.getString('ti.ui.defaultunit', 'system'),
            abx;
        
        if (OS_IOS) {
            
            navigationBarHeight = 44;
        }
        else if (OS_ANDROID) {
            
            if (OS_PRE_LOLLIPOP) {
                
                navigationBarHeight = 56;
            }
            else {
                
                abx = require('com.alcoapps.actionbarextras');
                
                navigationBarHeight = abx.getActionbarHeight();
                
                (defaultUnit === 'dp' || defaultUnit === 'dip') && (navigationBarHeight = require('alloy/measurement').pxToDP(navigationBarHeight));
            }
        }
        
        return navigationBarHeight;
        
    })(),
    
    OS_META_BAR_HEIGHT = OS_STATUS_BAR_HEIGHT + OS_NAVIGATION_BAR_HEIGHT,
    
    NAV_BAR_HEIGHT = OS_PRE_KITKAT ? OS_NAVIGATION_BAR_HEIGHT : OS_META_BAR_HEIGHT,
    NAV_BAR_HIDDEN_TOP = -NAV_BAR_HEIGHT,
    
    DEFAULT_THRESHOLD = NAV_BAR_HEIGHT;


/**
 * SEF function to organize otherwise inline code
 *
 * @private
 * @param  {Object} args arguments passed to the controller
 * @returns void
 */
(function constructor(args) {
    
    'use strict';
    

    $._backgroundColor = args.backgroundColor || '#ffffff';
    $._threshold = args.threshold || DEFAULT_THRESHOLD;
    $._isBarInOriginState = true;
    
    
    _applyProperties(_.extend({
        
        height: NAV_BAR_HEIGHT
        
    }, _.omit(args, 'id', '__parentSymbol', '__itemTemplate', '$model', 'scrolling', 'threshold')));
    
    
    Object.defineProperties($, {
        
        backgroundColor: {
            
            get: function() {
                
                return $._backgroundColor;
            },
            
            set: function(color) {
                
                if (color) {
                    
                    $._backgroundColor = color;
                    
                    $.widget.setBackgroundColor($._backgroundColor);
                }
            }
        },
        
        threshold: {
            
            get: function() {
                
                return $._threshold;
            },
            
            set: function(newThreshold) {
                
                $._threshold = Number(newThreshold);
            }
        },
        
        isInOriginState: {
            
            get: function() {
                
                return $._isBarInOriginState;
            }
        }
    });
    
    
    // PUBLIC INTERFACE
    $.cleanup = cleanup;
    
})($.args);


/**
 * Cleans up the controller and view
 *
 * @public
 * @method cleanup
 * @returns void
 */
function cleanup() {
    
    Ti.API.debug(LTAG, 'Cleaning up...');
    
    
    $.removeListener();
    $.destroy();
    $.off();
    
    return;
    
} // END cleanup()


/**
 * Applies properties to underleying views
 *
 * @private
 * @param {object} props
 * @returns void
 */
function _applyProperties(props) {
    
    _.isObject(props) && $.widget.applyProperties(props);
    
} // END _applyProperties()


/**
 * Adds listener for view with scroll-ability
 *
 * @private
 * @param {Ti.UI.ListView/Ti.UI.TableView/Ti.UI.ScrolLView/Ti.UI.ScrollableView} scrollableView
 * @returns void
 */
function _setViewWithScrollAbility(scrollableView) {
    
    scrollableView && $.addListener(scrollableView, 'scroll', _onScroll);
    
} // END _setViewWithScrollAbility()


/**
 *
 *
 * @private
 * @param {object} event
 * @returns void
 */
function _onScroll(event) {
    
    var offset = _.isNumber(event.y) ? event.y : event.contentOffset.y,
        opacity;
    
    if (offset >= $._threshold) {
        
        opacity = 1 * (offset / ($._threshold * 1.5));
        
        $.widget.opacity = opacity;
        
        $._isBarInOriginState = false;
        
        (opacity > 0.9 && opacity <= 1.2) && $.trigger('show');
    }
    else if (!$._isBarInOriginState) {
        
        $.widget.opacity = 0;
        
        $._isBarInOriginState = true;
        
        $.trigger('hide');
    }
    
    return;
    
} // END _onScroll()


// PUBLIC INTERFACE
exports.setViewWithScrollAbility = _setViewWithScrollAbility;

exports.show = function() {
    
    $.widget.animate({
        
        top: 0,
        backgroundColor: $._backgroundColor,
        duration: ANIMATION_DURATION_SCROLL_NAV_BAR
    });
    
}; // END show()

exports.hide = function() {
    
    $.widget.animate({
        
        top: NAV_BAR_HIDDEN_TOP,
        backgroundColor: 'transparent',
        duration: ANIMATION_DURATION_SCROLL_NAV_BAR
    });
    
}; // END hide()
