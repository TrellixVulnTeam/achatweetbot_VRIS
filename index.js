const Twit = require('twit');
const Tesseract = require('tesseract.js');
require('dotenv').config();

//Setar keys do bot
const Bot = new Twit({
    consumer_key : process.env.API_KEY,
    consumer_secret : process.env.API_SECRET_KEY,
    access_token : process.env.ACCESS_TOKEN,
    access_token_secret : process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000,
});
const botid = 1442867949602283522;

let reply = Bot.stream('statuses/filter', {track: '@achartweetbot'});

reply.on('tweet', function (tweet) {
    //Confere se nao eh o proprio bot que esta mandando a mensagem
    if(tweet.user.id != botid && Array.isArray(tweet.entities.media) && tweet.entities.media){

        //Achar imagem console.log(tweet.entities.media[0].media_url_https);
        let imageurl = tweet.entities.media[0].media_url_https;
        
        //Filtros de string: deixar apenas o @
        let oguser = tweet.text.replace("@achartweetbot ",""); //Filtro do @
        oguser = oguser.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') //Filtro do link
        console.log(oguser);
            
        //OCR na imagem
        Tesseract.recognize(
            imageurl,
            'por+eng',
        ).then(({ data: { text } }) => {
            //Pesquisar tweet
            console.log(text);
            Bot.get('search/tweets', { q: `"${text}" (from:${oguser})`, count: 1 }, function(err, data, response) {
                console.log(data);
                //Bloco if para verificar se o tweet for encontrado
                if (Array.isArray(data.statuses) && data.statuses.length) {
                    let ogtweet = data.statuses[0].id_str;
                    //Postar o tweet
                    Bot.post('statuses/update', { 
                        status: `@${tweet.user.screen_name} https://twitter.com/TwitterDev/statuses/${ogtweet}`,
                        in_reply_to_status_id : tweet.id_str,
                        }, 
                        function(err, data, response) {
                        })                
                } else {
                    Bot.post('statuses/update', { 
                        status: `@${tweet.user.screen_name} Tweet não encontrado, você está inserindo os dados corretamente? O bot só encontra tweets de até 7 dias atrás.`,
                        in_reply_to_status_id : tweet.id_str,
                        }, 
                        function(err, data, response) {
                        })     
                    }
            })
            })
        
}});




