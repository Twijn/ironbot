const { request } = require('undici');

const config = require("../../config.json");

class Authentication {

    /**
     * Returns a token from a OAuth code
     * @param {string} code 
     * @returns {Promise<{token_type:string,access_token:string,expires_in:number,refresh_token:string,scope:string}>}
     */
    getToken(code) {
        return new Promise(async (resolve, reject) => {
            const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: config.discord.clientId,
                    client_secret: config.discord.clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `${config.web.host}auth/discord`,
                    scope: 'identify',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
    
            const oauthData = await tokenResponseData.body.json();
            if (oauthData.hasOwnProperty("error")) {
                reject(oauthData);
            } else {
                resolve(oauthData)
            }
        });
    }
    
    /**
     * Returns a user from the user's access token
     * @param {string} accessToken 
     * @param {string} tokenType 
     * @returns {Promise<{id:string,username:string,avatar:string,discriminator:string,public_flags:number,flags:number,banner:string,accent_color:number,global_name:string,avatar_decoration_data:string,banner_color:string,mfa_enabled:boolean,locale:string}>}
     */
    getUser(accessToken, tokenType = "Bearer") {
        return new Promise(async (resolve, reject) => {
            const userResult = await request('https://discord.com/api/users/@me', {
                method: 'GET',
                headers: {
                    authorization: `${tokenType} ${accessToken}`,
                },
            });
            const oauthData = await userResult.body.json();
            if (oauthData.hasOwnProperty("error")) {
                reject(oauthData);
            } else {
                resolve(oauthData)
            }
        });
    }
    
}

module.exports = Authentication;
