/** This is not used anymore, logic is now built into React component - can be deleted - by Lung
 * Equal height - by Lewi Hussey
 */

let matchHeight = function () {

    let initialized = false;
    let untilFound = intervalTrigger();

    function init() {
        eventListeners();
        // 
        setInterval(()=>{
            if(initialized){
                window.clearInterval(untilFound);
            }
        }, 1000);
    }

    function intervalTrigger() {
        return window.setInterval( function() {
            matchHeight();
        }, 1000 );
    }

    function eventListeners(){
        $(window).on('resize', function() {
            matchHeight();
        });
    }

    function matchHeight(){
        $(document).ready(function(){
            // 
            let groupName = $('.card');
            if(groupName.length > 0){
                initialized = true;
            }
            // 
            let groupHeights = [];

            groupName.css('min-height', 'auto');

            groupName.each(function() {
                groupHeights.push($(this).outerHeight());
                // 
            });

            let maxHeight = Math.max.apply(null, groupHeights);
            groupName.css('min-height', maxHeight);
        });
    };

    return {
        init: init
    };

} ();

$(document).ready(function() {
    matchHeight.init();
    //TODO: fix on load height match
});