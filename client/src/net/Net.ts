export default class Net {

    public static process(url : string, callback? : Function) : void {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if(xhr.readyState === 4){
                if(xhr.status === 200){
                    if(!callback){
                        return;
                    }
                    callback(xhr.responseText);
                }else{
                    console.info("Failed to send request to long-pool host " + xhr.status);
                }
            }
        };
        xhr.send();
    }

}