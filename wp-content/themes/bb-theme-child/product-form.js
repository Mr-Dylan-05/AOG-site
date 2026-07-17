var pj = jQuery;
pj(document).on('focus', '.product-input-container input, .product-input-container textarea', function(){	
	console.log('focus success');
	var parent_element = pj(this).parent().parent();
	pj('.nf-field-label', parent_element).addClass('selected_has_input');
});

pj(document).on('focusout', '.product-input-container input, .product-input-container textarea', function(){
	console.log('focus out');
	var parent_element = pj(this).parent().parent();
	if(pj(this).val() == ''){
		pj('.nf-field-label', parent_element).removeClass('selected_has_input');
	}
});
//Show popup and close function 		
pj('.cta-enquire-btn a.fl-button').on('click', function(e){
	e.preventDefault();
	pj('.products-modal-popup-container').addClass('show-modal');
})

pj(document).on('keyup', function(key){
	if(key.keyCode == 27){
	   close_modal_form();
	}
});

pj(document).on('click', 'span#product-modal-close-btn', function(key){
	close_modal_form();
});

function close_modal_form(){
	pj('.products-modal-popup-container').removeClass('show-modal'); 
}

//Default Ad On Group Product base on page
pj(window).load(() => {
	//nth_child_post data from php 	
	var selected_default_option = nth_child_post;
	console.log(selected_default_option);
// 	setTimeout(function(){
// 		pj('.products-modal-popup-container select > option',document).removeAttr('selected');
// 		pj('.products-modal-popup-container select > option:'+selected_default_option, document).attr('selected', 'selected');
// 	},1500);
});