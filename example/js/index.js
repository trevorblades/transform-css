$(document).ready(function(){
	
	var fish = new Fishsticss();
	
	/* In/out */
	var input = $('textarea#input'),
		output = $('textarea#output');
	
	/* Settings */
	var settings = {
		'comments': true,
		'variables': false,
		'convert': 'less'
	};
	
	var refreshOutput = function() {
		output.val(fish.scrub(input.val(), settings));
	};
	
	/* Setting the settings */
	$('#menu a').on('click',function(e){
		e.preventDefault();
		var state = $(this).find('span').text() === 'On' ? 'Off' : 'On';
		if ($(e.target).is('li')) {
			$(this).find('ul li.selected').removeClass('selected');
			$(e.target).addClass('selected');
		}
		$(this).toggleClass('on').find('span').text(state);
		$('#menu>li>a').each(function(){
			if ($(this).find('ul').length) {
				var value = $(this).find('ul li.selected').data('value');
				if (value === 'false') {
					value = false;
				}
				settings[$(this).attr('href').slice(1)] = value;
			}else{
				settings[$(this).attr('href').slice(1)] = $(this).attr('class') === 'on' ? true : false;
			}
		});
		refreshOutput();
	});
	
	input.on('keyup',function(){
		refreshOutput();
	});
	
	output.on('focus',function(){
		$(this).select();
	}).on('mouseup',function(e){
		e.preventDefault();
		$(this).select();
	});
	
	refreshOutput();
	
});