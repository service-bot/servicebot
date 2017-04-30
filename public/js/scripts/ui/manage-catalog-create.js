'use strict';

/**
 * @author Vampeo Inc.
 */
(function() {
    $(function() {

    	//*************** script starts **********************
    	var backBtn = $('#create-catalog-item-back-button')
    	var nextBtn = $('#create-catalog-item-next-button')
    	var addPropertyBtn = $('#create-catalog-add-item-button')
    	var createBtn = $('#create-catalog-item-button')
    	var currentStep = nextBtn.data('step')
    	var totalSteps = 3
    	adjustHeight()

    	$("#catalog-create-step-1").animate({"left":"0px", "opacity":"100"}).addClass("front")
		$(window).on('resize', function(){
			adjustHeight();
		})

    	nextBtn.on('click', function(){
    		stepNext(function(){
    			nextBtn.attr('data-step', currentStep)
    		})
    	})
    	backBtn.on('click', function(){
    		stepBack(function(){
    			nextBtn.attr('data-step', currentStep)
    		})
    	})
    	addPropertyBtn.on('click', function(e){
    		e.preventDefault()
    		addProperty()
    		adjustHeight()
		})

		dependencyCheck()
    	//*************** core functions **********************
		function dependencyCheck(){

    		//this will be moved somewhere else, just checking on a click to toggle advanced fields
            $(".advanced-btn").unbind().on('click', function () {
                var advancedProp = $(this).data('advanced-prop-id')
                if(!$('#'+advancedProp).is(':visible'))
                    $('#'+advancedProp).show().css("display", "flex")
				else
                    $('#'+advancedProp).hide().css("display", "none")
                adjustHeight()
            })

            //Dependencies - hide and show depending on other input value
            $(".dependency").on('change', function () {
                switch($(this).context.type){
                    case "checkbox": var val = $(this).context.checked; break;
                    case "radio": var val = $(this).context.checked; break;
                    case "select-one": var val = $(this).context.value; break;
                    default: break;
                }
                var dependencyValue = $(this).context.dataset.dependencyValue
                var dependency = $(this).context.dataset.dependency
                if(val == dependencyValue){
                    switch($(this).context.type){
                        case "checkbox":
                            if($('#'+dependency).data('default-val')==true)
                            	$('#'+dependency)[0].checked = true
                            else
                                $('#'+dependency)[0].checked = false

                            break
                        default:
                            $('#'+dependency).val($('#'+dependency).data('default-val')).change()
                            break
                    }
					$('.'+dependency+'_group').hide().attr("data-show", "0")
                }else{
                    $('.'+dependency+'_group').show().attr("data-show", "1")
                }
            })
            toggleByDataShow()
		}

		function toggleByDataShow(){
            //find all form-group and show or hide it depending on the data-show="true/false"
            $(".form-group").each(function(){
                if($(this).attr('data-show')==false)
                    $(this).hide()
                else
                    $(this).show()
            })
		}

		function stepNext(callback){
			$("#catalog-create-step-" + currentStep).animate({"left":"-300px", "opacity":"0"}, function(){
    			$("#catalog-create-step-" + currentStep).show(0).removeClass("front")
    			$(".step-button[data-step='"+currentStep+"']").removeClass("btn-info active")
    			currentStep+=1
    			$("#catalog-create-step-" + currentStep).show(0).animate({"left":"0px", "opacity":"100"}).addClass("front")
    			$("button[data-step='"+currentStep+"']").addClass("btn-info active")
    			if(currentStep==totalSteps){
    				nextBtn.hide()
    				createBtn.show()
    				review()
    			}
    			if(currentStep>1){
    				backBtn.show()
    			}
    			adjustHeight()
    			callback()
    		})
		}

		function stepBack(callback){
			$("#catalog-create-step-" + currentStep).animate({"left":"300px", "opacity":"0"}, function(){
    			$(".step-button[data-step='"+currentStep+"']").removeClass("btn-info active")
    			$("#catalog-create-step-" + currentStep).show(0).removeClass("front")
    			currentStep-=1
    			$("#catalog-create-step-" + currentStep).animate({"left":"0px", "opacity":"100"}).addClass("front")
    			$("button[data-step='"+currentStep+"']").addClass("btn-info active")
    			if(currentStep!=totalSteps){
    				nextBtn.show()
    				createBtn.hide()
    			}
    			if(currentStep<=1){
    				backBtn.hide()
    			}
    			adjustHeight()
    			callback()
    		})
		}

    	var odd = true
    	var customPropID = 1
    	function addProperty(){
    		if(!odd){
    			var color='#f5f5f5'
    			odd = true
    		}else{
    			var color='#ffffff'
    			odd = false
    		}
    		var property = 
    		'<div id="custom-prop-'+customPropID+'" class="catalog-item-property row p-b-20 p-t-10" style="background-color: '+color+'"><div class="col-xs-12">'+
            	'<div id="basic-prop-'+customPropID+'" class="row basic-prop">' +
					'<div class="col-xs-6 col-md-3 form-group">'+
						'<label class="bmd-label-floating">Property Name</label>'+
						'<input class="form-control custom-property-input" type="text" data-display-name="Property Name" name="prop-'+customPropID+'-name">' +
					'</div>' +
					'<div class="col-xs-6 col-md-3 form-group">'+
						'<label class="bmd-label-floating">Property Default Value</label>'+
						'<input class="form-control custom-property-input" type="text" data-display-name="Property Default Value" name="prop-'+customPropID+'-default-value">' +
					'</div>' +
					'<div class="col-xs-6 col-md-2 form-group">'+
						'<div class="switch switch-primary"><label>'+
						'<input id="prop-'+customPropID+'-locked" class="dependency" type="checkbox" data-display-name="Property Private" name="prop-'+customPropID+'-locked" data-dependency="prop-'+customPropID+'-prompted" data-dependency-value="0" data-dependency-action="hide">Private</label></div>' +
					'</div>' +
					'<div class="col-xs-6 col-md-2 form-group prop-'+customPropID+'-prompted_group" data-show="0">'+
						'<div class="switch switch-primary"><label>'+
						'<input id="prop-'+customPropID+'-prompted" class="dependency" type="checkbox" data-display-name="Property Prompted" name="prop-'+customPropID+'-prompted" data-dependency="prop-'+customPropID+'-required" data-dependency-value="0" data-dependency-action="hide" data-default-val="1" checked>Prompted</label></div>' +
					'</div>' +
					'<div class="col-xs-6 col-md-2 form-group prop-'+customPropID+'-required_group" data-show="0">'+
						'<div class="switch switch-primary"><label>'+
						'<input id="prop-'+customPropID+'-required" type="checkbox" data-display-name="Property Required" name="prop-'+customPropID+'-required" data-default-val="0">Required</label></div>' +
					'</div><span class="btn btn-rounded advanced-btn" data-advanced-prop-id="advanced-prop-'+customPropID+'"><i class="fa fa-caret-down"></i></span> '+
					'<div class="clearfix"></div>' +
				'</div>' +
				'<div id="advanced-prop-'+customPropID+'" class="row advanced-prop">' +
					'<div class="col-xs-6 col-md-3 form-group">'+
						'<label class="bmd-label-floating">Property Label</label>'+
						'<input class="form-control custom-property-input" type="text" data-display-name="Property Label" name="prop-'+customPropID+'-label">' +
					'</div>' +
					'<div class="col-xs-6 col-md-3 form-group">'+
						'<label class="bmd-label-floating">Property Type</label>'+
						'<select class="form-control" data-display-name="Property Field Type" name="prop-'+customPropID+'-type">'+
							'<option value="text">Text Box</option>'+
							'<option value="dropdown">Dropdown</option>'+
							'<option value="checkboxes">Check Boxes</option></select>' +
					'</div>' +
					'<div class="col-xs-12 col-md-6 form-group">'+
						'<label class="bmd-label-floating">Values (comma seperated)</label>'+
						'<input class="form-control custom-property-input" type="text" data-display-name="Property Values" name="prop-'+customPropID+'-values">' +
					'</div>' +
				'</div>'+
    		'</div></div> '
			$("#catalog-property-container").append(property)
			$('.catalog-item-property').bootstrapMaterialDesign()
            dependencyCheck()
			customPropID += 1
    	}

    	function review(){
    		$("#review-content").empty()
            var odd=true
    		$('#catalog-create-container').find('.catalog-item-property').each(function(){
                var currentPropReviewItem = $(this)
                var newContainerID = "review-content-"+$(this).attr('id')
                $('#review-content').append('<div id="'+newContainerID+'" class="review-content-prop-item"><h4 class="review-content-prop-item-title">'+$(this).attr('id').replace(/-/g, " ")+'</h4></div>')
                findInput(currentPropReviewItem, newContainerID) //finds and outputs the input values
            })
    	}

        function findInput(element, containerID){
            //element is the current property item's container
            //containerID is the new review container to right
            $(element).find(':input').each(function(){
                switch($(this).context.type){
                    case "text":
                        $('#'+containerID).append($(this).context.value ? ('<div><span class="label">' + $(this).context.dataset.displayName  + ':</span> <span class="value">' + $(this).context.value) + '</span></div>' : ('<div><span class="label">'+ $(this).context.dataset.displayName + ':</span><span class="value">' + "NULL </span></div>"))
                        break
                    case "textarea":
                        $('#'+containerID).append($(this).context.value ? ('<div><span class="label">' + $(this).context.dataset.displayName  + ':</span> <span class="value">' + $(this).context.value) + '</span></div>' : ('<div><span class="label">'+ $(this).context.dataset.displayName + ':</span><span class="value">' + "NULL </span></div>"))
                        break
                    case "radio":
                        if($(this).context.checked)
                            $('#'+containerID).append(('<div><span class="label">' + $(this).context.dataset.displayName + ': ' + $(this).context.offsetParent.textContent) + ':</span> <span class="value">' + $(this).context.checked + '</span></div>')
                        break
                    case "checkbox":
                        $('#'+containerID).append(('<div><span class="label">' + $(this).context.dataset.displayName + ':</span> <span class="value">' + $(this).context.checked) + '</span></div>')
                        break
                    case "select-one":
                        $('#'+containerID).append(('<div><span class="label">' + $(this).context.dataset.displayName + ':</span> <span class="value">' + $(this).context.value)  + '</span></div>')
                    default:
                        break
                }
            })
        }

    	//*************** helper functions **********************
    	function adjustHeight(){
    		$('#catalog-create-container').height($("#catalog-create-step-" + currentStep).height() + 80)
    	}
    })
})()