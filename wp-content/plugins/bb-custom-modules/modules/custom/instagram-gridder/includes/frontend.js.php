<?php if ( $settings->user_id && $settings->access_token ) { ?>
(function($) {
	$(function() {
		var feed = new Instafeed({
			get: 'user',
			userId: '<?php echo $settings->user_id; ?>',
			accessToken: '<?php echo $settings->access_token; ?>',
			sortBy: '<?php echo $settings->orderby <> '' ? $settings->orderby : 'none'; ?>',
			limit: <?php echo $settings->limit <> '' ? $settings->limit : '20'; ?>,
			target: 'instafeed-<?php echo $id; ?>',
			template: '<div class="instagram-item" style="background-image: url({{image}});"><a data-href="{{link}}" aria-label="View Photo"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="70px" height="70px"> <path fill-rule="evenodd"  fill="rgb(255, 255, 255)" d="M49.995,34.005 C49.995,42.272 43.261,49.015 35.005,49.015 C26.749,49.015 20.015,42.272 20.015,34.005 C20.015,25.737 26.749,18.995 35.005,18.995 C43.261,18.995 49.995,25.737 49.995,34.005 ZM53.001,33.988 C53.001,24.030 44.962,15.991 35.004,15.991 C25.046,15.991 17.007,24.030 17.007,33.988 C17.007,43.946 25.046,51.985 35.004,51.985 C44.962,51.985 53.001,43.946 53.001,33.988 ZM57.417,16.120 C57.417,13.843 55.586,12.013 53.309,12.013 C51.032,12.013 49.202,13.843 49.202,16.120 C49.202,18.397 51.032,20.228 53.309,20.228 C55.586,20.228 57.417,18.397 57.417,16.120 ZM35.004,3.018 C40.510,3.018 52.307,2.576 57.272,4.542 C58.993,5.230 60.271,6.066 61.598,7.393 C62.925,8.721 63.761,9.999 64.449,11.719 C66.415,16.684 65.973,28.481 65.973,33.987 C65.973,39.493 66.415,51.290 64.449,56.255 C63.761,57.975 62.925,59.253 61.598,60.581 C60.271,61.908 58.993,62.743 57.272,63.432 C52.307,65.398 40.510,64.955 35.004,64.955 C29.499,64.955 17.701,65.398 12.736,63.432 C11.016,62.743 9.738,61.908 8.411,60.581 C7.083,59.253 6.248,57.975 5.559,56.255 C3.593,51.290 4.036,39.493 4.036,33.987 C4.036,28.481 3.593,16.684 5.559,11.719 C6.248,9.999 7.083,8.721 8.411,7.393 C9.738,6.066 11.016,5.230 12.736,4.542 C17.701,2.576 29.499,3.018 35.004,3.018 ZM69.293,34.426 C69.293,29.693 69.338,25.005 69.070,20.273 C68.802,14.781 67.552,9.914 63.533,5.896 C59.515,1.878 54.649,0.628 49.157,0.360 C44.424,0.092 39.736,0.137 35.004,0.137 C30.271,0.137 25.583,0.092 20.851,0.360 C15.359,0.628 10.493,1.878 6.474,5.896 C2.456,9.914 1.206,14.781 0.938,20.273 C0.670,25.005 0.715,29.693 0.715,34.426 C0.715,39.158 0.670,43.846 0.938,48.579 C1.206,54.071 2.456,58.937 6.474,62.955 C10.493,66.973 15.359,68.223 20.851,68.491 C25.583,68.759 30.271,68.715 35.004,68.715 C39.736,68.715 44.424,68.759 49.157,68.491 C54.649,68.223 59.515,66.973 63.533,62.955 C67.552,58.937 68.802,54.071 69.070,48.579 C69.338,43.846 69.293,39.158 69.293,34.426 Z"/></svg></a><div class="instagram-content"><?php if ($settings->instagram_name <> '') { ?><div class="h3 title"><?php if ($settings->instagram_link <> '') { ?><a data-href="<?php echo $settings->instagram_link; ?>"><?php } ?><?php echo $settings->instagram_name; ?><?php if ($settings->instagram_link <> '') { ?></a><?php } ?></div><?php } ?><p class="caption">{{caption}}</p> <a data-href="{{link}}" class="btn">VIEW PHOTO</a></div><span class="icon-like"><i class="fa fa-heart-o" aria-hidden="true"></i> <span><strong>{{likes}} Likes</strong></span></span> <span class="icon-date"><i class="fa fa-calendar-o" aria-hidden="true"></i><span><strong>{{model.create_time_ago}}</strong></span></span></div>',
			resolution: 'standard_resolution',
			filter: function(image) {
				//var date = new Date(image.created_time*1000);
				//m = date.getMonth();
				//d = date.getDate();
				//y = date.getFullYear();
				//var month_names = new Array ( );
				//month_names[month_names.length] = "Jan";
				//month_names[month_names.length] = "Feb";
				//month_names[month_names.length] = "Mar";
				//month_names[month_names.length] = "Apr";
				//month_names[month_names.length] = "May";
				//month_names[month_names.length] = "Jun";
				//month_names[month_names.length] = "Jul";
				//month_names[month_names.length] = "Aug";
				//month_names[month_names.length] = "Sep";
				//month_names[month_names.length] = "Oct";
				//month_names[month_names.length] = "Nov";
				//month_names[month_names.length] = "Dec";
				//var thetime = month_names[m] + ' ' + d + ' ' + y;
				//image.created_time = thetime;
				//return true; //{{model.created_time}}
			
				//momentjs required
				var imageDate = new Date(image.created_time*1000);
				var timeAgo = moment(imageDate).fromNow();
				image.create_time_ago = timeAgo;
				return true; //{{model.created_time_ago}}
				
			},
			after: function () {
				size_li = $('#instafeed-<?php echo $id; ?> > div').size();
				loadper = 5;
				x=7;
				$('#instafeed-<?php echo $id; ?> > div:lt('+x+')').addClass('show');
				$('#loadMore-<?php echo $id; ?>').click(function () {
					x= (x+loadper <= size_li) ? x+loadper : size_li;
					$('#instafeed-<?php echo $id; ?> > div:lt('+x+')').addClass('show');
					size_li_displayed = $('#instafeed-<?php echo $id; ?> > div.show').size();
					if ( size_li == size_li_displayed) {
						$(this).addClass('hide');
					}
				});
				$("#instafeed-<?php echo $id; ?> .instagram-item a").on('click', function(e) {
					e.preventDefault();
					var left  = ($(window).width()/2)-(800/2), top = ($(window).height()/2)-(800/2);
					window.open ($(this).attr("data-href"), "popupWindow", "width=800, height=800, top="+top+", left="+left).focus();
				});
			},
		});
		feed.run();
		if ($('.instafeed-<?php echo $id; ?>:empty')) {
			feed.run();
		}
	});
})(jQuery);
<?php } ?>