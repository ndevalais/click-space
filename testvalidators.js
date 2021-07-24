const validator = new (require("fastest-validator"))();



const schema = {mail: { type: "string", max: 10 }};
const check = validator.compile(schema)

console.log(!!check({ mail: "tian.p@solunika.com.ar" }));
