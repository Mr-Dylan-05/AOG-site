<?php if ( $settings->user_id && $settings->access_token ) { ?>
(function($) {
	$(function() {
		
		var feed = new Instafeed({
			get: 'user',
			userId: '<?php echo $settings->user_id; ?>',
			accessToken: '<?php echo $settings->access_token; ?>',
			sortBy: '<?php echo $settings->orderby <> '' ? $settings->orderby : 'none'; ?>',
			limit: <?php echo $settings->limit <> '' ? $settings->limit : '12'; ?>,
			target: 'instafeed-<?php echo $id; ?>',
			template: '<div class="instagram-item"><div class="instagram-photo" style="background-image: url({{image}});"></div><div class="instagram-content"><div class="instagram-title"><?php if ($settings->instagram_logo <> '') { ?><a data-href="<?php echo $settings->instagram_link; ?>" class="instagram-logo" style="background-image: url(<?php echo $settings->instagram_logo_src ?>); " aria-label="View Instagram"></a><?php } ?><?php if ($settings->instagram_name <> '') { ?><div class="instagram-name h5"><?php if ($settings->instagram_link <> '') { ?><a data-href="<?php echo $settings->instagram_link; ?>"><?php } ?><?php echo $settings->instagram_name; ?><?php if ($settings->instagram_link <> '') { ?></a><?php } ?></div><?php } ?></div><div class="instagram-meta"><span class="icon-date"><i class="fa fa-clock-o" aria-hidden="true"></i> {{model.created_time}}</span> <span class="icon-like"><i class="fa fa-heart-o" aria-hidden="true"></i> <a data-href="{{link}}">{{likes}} Likes</a></span></div><p class="instagram-caption">{{model.short_caption}}</p> <a data-href="{{link}}" class="instagram-btn btn btn-sm btn-outline btn-primary">VIEW PHOTO</a></div></div>',
			resolution: 'standard_resolution',
			filter: function(image) {
				var date = new Date(image.created_time*1000);
				m = date.getMonth();
				d = date.getDate();
				y = date.getFullYear();
				var month_names = new Array ( );
				month_names[month_names.length] = "January";
				month_names[month_names.length] = "February";
				month_names[month_names.length] = "March";
				month_names[month_names.length] = "April";
				month_names[month_names.length] = "May";
				month_names[month_names.length] = "June";
				month_names[month_names.length] = "July";
				month_names[month_names.length] = "August";
				month_names[month_names.length] = "September";
				month_names[month_names.length] = "October";
				month_names[month_names.length] = "November";
				month_names[month_names.length] = "December";
				var thetime = month_names[m] + ' ' + d + ' ' + y;
				image.created_time = thetime;
				//{{model.created_time}}

				var excerpt = 150;
				if (image.caption && image.caption.text) {
					var caption = image.caption.text;
					var count = caption.length; 
					if ( count > excerpt ) {
						image.short_caption = image.caption.text.slice(0, excerpt)+'...';
					} else {
						image.short_caption = image.caption.text;
					}
				} else {
					image.short_caption = "";
				}
				//{{model.short_caption}}
				
				//momentjs required
				//var imageDate = new Date(image.created_time*1000);
				//var timeAgo = moment(imageDate).fromNow();
				//image.create_time_ago = timeAgo;
				//{{model.created_time_ago}}
				return true;
			},
			after: function () {
				var owlInstaCarousel = $("#instafeed-<?php echo $id; ?>");
				function instaCarousel() {
					owlInstaCarousel.owlCarousel({
						items: <?php echo $settings->column <> '' ? $settings->column : '4'; ?>,
						navText: ['',''],
						loop: false,
						dots: true,
						nav: false,
						autoHeight: true,
						responsive : {
							0 : {
								items: 1,
								slideBy: 1,
								margin: 10,
							},
							567 : {
								items: 2,
								slideBy: 2,
								margin: 10,
							},
							992 : {
								items: 3,
								slideBy: 3,
								margin: 20,
							},
							1280 : {
								items: <?php echo $settings->column <> '' ? $settings->column : '4'; ?>,
								slideBy: 4,
								margin: 20,
							},
							1500 : {
								items: <?php echo $settings->column <> '' ? $settings->column : '4'; ?>,
								slideBy: 4,
								margin: 30,
							},
						}
					});
				}
				instaCarousel();
				$("#instafeed-<?php echo $id; ?> .instagram-item a").on('click', function(e) {
					e.preventDefault();
					var left  = ($(window).width()/2)-(800/2), top = ($(window).height()/2)-(800/2);
					window.open ($(this).attr("data-href"), "popupWindow", "width=800, height=800, top="+top+", left="+left).focus();
				});
			},
		});
		feed.run();
	});
})(jQuery);
<?php } ?>