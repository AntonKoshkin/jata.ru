$(window).load(function() {
	$grid = $('.gallery').masonry({
		animationOptions	: {
			queue		: false,
			duration	: 300,
		},
		columnWidth			: '.gallery__item',
		fitWidth				: true,
		gutter				: 5,
		isAnimated			: true,
		isInitLayout		: true,
		isResizable			: true,
		itemSelector		: '.gallery__item',
		percentPosition	: true,
		// resize				: false,
		singleMode			: true,
	});
});

$(window).resize(function(event) {
	$('.gallery__item').css('margin-bottom', '5px');
});


// $grid.on( 'layoutComplete',
//   function( event, laidOutItems ) {
//     console.log( 'Masonry layout completed on ' +
//       laidOutItems.length + ' items' );
//   }
// );



$('.gallery__bg, .gallery__modal').click(function(){
	$('.gallery__bg').hide();
	$('.gallery__modal').hide();
});

$(document).on('click', '.gallery__item', function(){
	var url = $(this).attr('data-url');
	$('.gallery__bg').show();
	$('.gallery__modal')
		.html('<img src=\''+url+'\'</img>')
		.show();
});