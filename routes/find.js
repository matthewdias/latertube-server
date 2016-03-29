var express = require('express');
var router = express.Router();
var Horseman = require('node-horseman');

/* GET video/playlist. */
router.get(/.+\..+/, function(req, res, next) {
	url = req.originalUrl.substr(6);
	console.log(url);
	json = [];
	j = {};
	if(url.includes('youtube.com')) {
		base = url.match(/youtube.com\/([^\?]+)/)[0];
		kind = base.split('/')[1];
		if(kind == 'watch') {
			j.kind = 'video';
			j.id = url.match(/v=([^&]+)/)[0].substr(2);
		}
		else if(kind == 'playlist') {
			j.kind = 'playlist';
			j.id = url.match(/list=([^&]+)/)[0].substr(5);
		}
		j.url = url;
		json.push(j);
		res.json(json);
	}
	else if(url.includes('youtu.be')) {
		j.kind = 'video';
		tail = url.match(/youtu.be\/.+/)[0].substr(9);
		j.id = tail.match(/[^&]+/)[0];
		j.url = 'https://www.youtube.com/watch?v=' + tail;
		json.push(j);
		res.json(json);
	}
	else {
		var horseman = new Horseman();
		horseman
			.open(url)
			.evaluate(function(selector) {
				em = [];
				$("iframe[src*='youtube']").each(function() {
					em.push(this.getAttribute("src"));
				});
  				return em;
			})
			.then(function(embeds){
				if(embeds) {
    				console.log('embeds ' + embeds);
    				for (embed in embeds) {
    					console.log('embed ' + embeds[embed]);
    					j = {};
    					split = embeds[embed].match(/embed\/(.+)/)[0].split('/');
    					e = split[1];
    					if(e.includes('videoseries')) {
    						j.kind = 'playlist';
    						j.id = e.match(/list=([^&]+)/)[0].substr(5);
    						j.url = "https://www.youtube.com/playlist?list=" + j.id;
    					}
    					else {
    						j.kind = 'video';
    						j.id = e.split('?')[0];
    						j.url = "https://www.youtube.com/watch?v=" + e;
    					}
    					json.push(j);
    				}
    				res.json(json);
    			}
    			else res.sendStatus(400);
    			horseman.close();
    		});
	}
});

module.exports = router;
