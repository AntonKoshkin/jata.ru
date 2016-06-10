var
	mobileOne	= $('#tablet').attr('data-mob-x1'),
	mobileTwo	= $('#tablet').attr('data-mob-x2'),
	mobileThree	= $('#tablet').attr('data-mob-x3'),
	tabletOne	= $('#tablet').attr('data-tab-x1'),
	tabletTwo	= $('#tablet').attr('data-tab-x2'),
	tabletThree	= $('#tablet').attr('data-tab-x3');

if (window.devicePixelRatio >= 3) {
	if ($('html').hasClass('mobile')) {
		$('#tablet').attr('data-original', mobileThree);
	} else {
		$('#tablet').attr('data-original', tabletThree);
	}
} else if (window.devicePixelRatio >= 2) {
	if ($('html').hasClass('mobile')) {
		$('#tablet').attr('data-original', mobileTwo);
	} else {
		$('#tablet').attr('data-original', tabletTwo);
	}
} else  {
	if ($('html').hasClass('mobile')) {
		$('#tablet').attr('data-original', mobileOne);
	} else {
		$('#tablet').attr('data-original', tabletOne);
	}
}

$('#tablet').lazyload({
	threshold	: 200,
	effect		: 'fadeIn',
});

// $.get("http://jata.ru/api/v1/accounts/view", function(data) {
// 	console.log(data);
// });