export default class UUID {
    generate() {
        const hex = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const model = "xxxx4xxx";
        var str = "";
        for (var i = 0; i < model.length; i++) {
            var rnd = Math.floor(Math.random() * hex.length);
            str += model[i] == "x" ? hex[rnd] : model[i];
        }
        return str.toLowerCase();
    }
}