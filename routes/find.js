var express = require('express');
var router = express.Router();
var Horseman = require('node-horseman');

/* GET video/playlist. */
router.get(/.+\..+/, function(req, res, next) {
	url = req.originalUrl.substr(6);
	console.log(url);
	json = {}
	if(url.includes('youtube.com')) {
		base = url.match(/youtube.com\/([^\?]+)/)[0];
		kind = base.split('/')[1];
		if(kind == 'watch') {
			json.kind = 'video';
			json.id = url.match(/v=([^&]+)/)[0].substr(2);
		}
		else if(kind == 'playlist') {
			json.kind = 'playlist';
			json.id = url.match(/list=([^&]+)/)[0].substr(5);
		}
		json.url = url;
		res.json(json);
	}
	else if(url.includes('youtu.be')) {
		json.kind = 'video';
		tail = url.match(/youtu.be\/.+/)[0].substr(9);
		json.id = tail.match(/[^&]+/)[0];
		json.url = 'https://www.youtube.com/watch?v=' + tail;
		res.json(json);
	}
	else {
		var horseman = new Horseman();
		embeds = horseman
			.open(url)
			.evaluate(function(selector) {
				embeds = $("iframe[src*='youtube']").attr("src");
  				return embeds;
			})
			.then(function(embeds){
    			console.log('embeds ' + embeds);
    			split = embeds.match(/embed\/(.+)/)[0].split('/');
    			embed = split[1];
    			if(embed.includes('videoseries')) {
    				json.kind = 'playlist';
    				json.id = embed.match(/list=([^&]+)/)[0].substr(5);
    				json.url = "https://www.youtube.com/playlist?list=" + json.id;
    			}
    			else {
    				json.kind = 'video';
    				json.id = embed.split('?')[0];
    				json.url = "https://www.youtube.com/watch?v=" + embed;
    			}
    			res.json(json);
    			return horseman.close();
    		});
	}
});

module.exports = router;
