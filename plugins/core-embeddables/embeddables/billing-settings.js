import React from "react";
import {Fetcher} from "servicebot-base-form";
class ManagementEmbed extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading:true,
            selectedServer: "node"
        }
        this.changeServer = this.changeServer.bind(this);

    }
    async componentDidMount(){
        let secretKey = (await Fetcher(`/api/v1/system-options/secret`)).secret;
        this.setState({secretKey, loading:false});
    }
    changeServer(e) {
        const selectedServer = e.currentTarget.value;
        this.setState({selectedServer});
    }
    render() {
        if(this.state.loading){
            return <p>LOADING</p>;
        }
        let server;
        switch (this.state.selectedServer) {
            case "node":
                server = `function generateJWT(email, key) {
    var crypto = require('crypto');
    var hmac = crypto.createHmac('sha256', key); 

    var payload = {
        "email": email
    };
    var header = {
        "alg": "HS256",
        "typ": "JWT"
    };
    function cleanBase64(string) {
        return string.replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_")
    }

    function base64encode(object) { 
        return cleanBase64(Buffer.from(JSON.stringify(object)).toString("base64"));
    }

    var data = base64encode(header) + "." + base64encode(payload);
    hmac.update(data);
    return data + "." + cleanBase64(hmac.digest('base64'));
}
var SECRET_KEY = "${this.state.secretKey}"; //keep this key safe!
var userToken = generateJWT(user.email, SECRET_KEY);`;
                break;
            case "php":
                server = `function generateJWT($email, $secret) {
    function cleanBase64($string) {
        return str_replace("/", "_", str_replace("+", "-", str_replace("=", "", $string)));
    };
    function base64encode($object) {
        return cleanBase64(base64_encode(json_encode($object)));
    };
    $header = new stdClass();
    $header->alg = "HS256";
    $header->typ = "JWT";
    $payload = new stdClass();
    $payload->email = $email;
    $data = base64encode($header) . "." . base64encode($payload);
    return $data . "." . cleanBase64(base64_encode(pack('H*', hash_hmac('sha256', // hash function
    $data,
    $secret
    ))));
}
$SECRET_KEY = "${this.state.secretKey}";
$userToken = generateJWT($user->email, $SECRET_KEY);
`;
                break;
            case "ruby":
                server = `require "openssl"
require "base64"
require "json"

def generateJWT(email, secret)
  def clearPadding(string)
    string.gsub! "=", ""
    return string
  end

  def encodeClear(obj)
    return clearPadding(Base64.urlsafe_encode64(JSON.generate(obj)))
  end

  header = {:alg => "HS256", :typ => "JWT"}
  payload = {:email => email}
  data = encodeClear(header) + "." + encodeClear(payload)
  return data + "." + clearPadding(Base64.urlsafe_encode64(OpenSSL::HMAC.digest('sha256', secret, data)))
end

SECRET_KEY = "${this.state.secretKey}" #Keep this key safe!
userToken = generateJWT(user[:email], SECRET_KEY)
`;
                break;
            case "other":
                server = `Generate a JSON Web Token using the following specifications:
    - Algorithm: HS256
    - HMAC Secret: ${this.state.secretKey}
    - Payload should contain a customer email address, for example: {"email" : "customer-email@example.com"}`;
                break;
            default:
                break;
        }
        let clientCode = `<div id="servicebot-management-form"></div>
<script src="https://js.stripe.com/v3/"></script>
<script src="https://servicebot.io/js/servicebot-embed.js" type="text/javascript"></script>
<script  type="text/javascript">
    Servicebot.init({
        url : "${window.location.origin}",
        selector : document.getElementById('servicebot-management-form'),
        type : "manage",
        token: "INSERT_TOKEN_HERE",
        handleResponse: (response) => {
            //determine what to do on certain events...
        }
    })
</script>`;
        return (<div>
            <h3>Server-side</h3>
            <span>In order to embed the management so users can add cards, cancel, and resubscribe, you need to generate a token which
        will authenticate your users and be used by the client-side javascript.</span>
            <br/>
            <span>Server-side language or framework</span>
            <select onChange={this.changeServer} value={this.state.selectedServer}>
                <option value="node">NodeJS</option>
                <option value="php">PHP</option>
                <option value="ruby">Rails/Ruby</option>
                <option value="other">Other</option>

            </select>
            <pre>{server}</pre>
            <span>
            <strong>DO NOT EXPOSE THE SECRET KEY TO THE PUBLIC</strong>,
            make sure not to commit it into version control or send under insecure channels or expose to client</span>
            <br/>
            <h3>Client-side</h3>
            <span>With the token generated on the server, use this HTML on the client...(with the proper token)</span>
            <pre>{clientCode}</pre>
        </div>)
    }
}

export default {component : ManagementEmbed, name: "Billing Settings", description: "EMbed to be good"}